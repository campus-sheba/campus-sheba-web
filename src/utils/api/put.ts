'use server';

import { cookies } from 'next/headers';
import { mergeHeaders, request } from './request';
import type { ApiBody, ApiRequestOptions } from './types';

export async function put<T = unknown>(
  url: string,
  body: ApiBody = {},
  options: ApiRequestOptions = {},
): Promise<T> {
  return request<T>('PUT', url, body, options);
}

export async function putPublic<T = unknown>(
  url: string,
  body: ApiBody = {},
  options: ApiRequestOptions = {},
): Promise<T> {
  const cookieStore = await cookies();
  const timeZone = cookieStore.get('timeZone')?.value;

  const headers = mergeHeaders(
    { Accept: 'application/json' },
    timeZone ? { timeZone } : undefined,
    options.headers,
  );

  return put<T>(url, body, { ...options, headers });
}

export async function putPrivate<T = unknown>(
  url: string,
  body: ApiBody = {},
  options: ApiRequestOptions = {},
): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  const timeZone = cookieStore.get('timeZone')?.value;

  const headers = mergeHeaders(
    { Accept: 'application/json' },
    token ? { Authorization: `Bearer ${token}` } : undefined,
    timeZone ? { timeZone } : undefined,
    options.headers,
  );

  return put<T>(url, body, { ...options, headers });
}

export async function putThirdParty<T = unknown>(
  url: string,
  token: string,
  body: ApiBody = {},
  options: ApiRequestOptions = {},
): Promise<T> {
  if (!token) {
    throw new Error('Token is required for third-party API calls');
  }

  const headers = mergeHeaders(
    {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    options.headers,
  );

  return put<T>(url, body, { ...options, headers });
}