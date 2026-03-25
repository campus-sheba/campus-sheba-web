'use server';

import { cookies } from 'next/headers';
import { mergeHeaders, request } from './request';
import type { ApiBody, ApiRequestOptions, HttpMethod } from './types';

const BASE = process.env.BASE_URL || process.env.NEXT_PUBLIC_API_URL;
const THIRTY_DAYS = 60 * 60 * 24 * 30;

/**
 * Attempts to refresh tokens using the stored refreshToken cookie.
 * On success: writes new accessToken + refreshToken cookies and returns the new access token.
 * On failure: returns null (caller should redirect to login).
 */
async function attemptTokenRefresh(): Promise<string | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${refreshToken}`,
        'x-refresh-token': refreshToken,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) return null;

    const json = await res.json();
    const tokens = json?.data as { accessToken?: string; refreshToken?: string } | undefined;
    if (!tokens?.accessToken || !tokens?.refreshToken) return null;

    const cookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: THIRTY_DAYS,
    };

    cookieStore.set('accessToken', tokens.accessToken, cookieOpts);
    cookieStore.set('refreshToken', tokens.refreshToken, cookieOpts);

    return tokens.accessToken;
  } catch {
    return null;
  }
}

/**
 * Checks if an error message indicates a 401 Unauthorised response.
 */
function isUnauthorized(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes('(401)') ||
    msg.includes('unauthorized') ||
    msg.includes('unauthenticated') ||
    msg.includes('jwt expired') ||
    msg.includes('invalid token') ||
    msg.includes('token expired')
  );
}

/**
 * Core private request wrapper.
 * - Attaches accessToken from cookies to Authorization header.
 * - On 401: silently refreshes the token and retries ONCE.
 * - On second 401 after refresh: re-throws so callers / AuthGuard can redirect.
 */
export async function privateRequest<T = unknown>(
  method: HttpMethod,
  url: string,
  body?: ApiBody,
  options: ApiRequestOptions = {},
): Promise<T> {
  const cookieStore = await cookies();
  const timeZone = cookieStore.get('timeZone')?.value;

  const buildHeaders = (token?: string) =>
    mergeHeaders(
      { Accept: 'application/json' },
      token ? { Authorization: `Bearer ${token}` } : undefined,
      timeZone ? { timeZone } : undefined,
      options.headers,
    );

  // ── First attempt ────────────────────────────────────────────────────────
  const firstToken = cookieStore.get('accessToken')?.value;
  try {
    return await request<T>(method, url, body, { ...options, headers: buildHeaders(firstToken) });
  } catch (firstError) {
    if (!isUnauthorized(firstError)) throw firstError;
  }

  // ── Token may be expired — attempt silent refresh ────────────────────────
  const newToken = await attemptTokenRefresh();

  if (!newToken) {
    // Refresh itself failed — session is truly dead; throw a clear error
    throw new Error('SESSION_EXPIRED');
  }

  // ── Retry once with fresh token ──────────────────────────────────────────
  return request<T>(method, url, body, { ...options, headers: buildHeaders(newToken) });
}
