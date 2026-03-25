'use server';

import { cookies } from 'next/headers';
import { mergeHeaders, request } from './request';
import type { ApiRequestOptions } from './types';

export async function get<T = unknown>(
  url: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  return request<T>('GET', url, undefined, options);
}

export async function getPublic<T = unknown>(
  url: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const cookieStore = await cookies();
  const timeZone = cookieStore.get('timeZone')?.value;
  const token = cookieStore.get('accessToken')?.value;

  const headers = mergeHeaders(
    { Accept: 'application/json' },
    timeZone ? { timeZone } : undefined,
    options.headers,
  );

  let finalUrl = url;
  
  // Implicitly pass university purely for GUESTS on public listing APIs
  if (!token) {
    const universityCookie = cookieStore.get('university')?.value;
    if (universityCookie) {
      try {
        const university = JSON.parse(decodeURIComponent(universityCookie));
        if (university?._id) {
          const urlObj = new URL(finalUrl.startsWith('http') ? finalUrl : `${process.env.BASE_URL || ''}${finalUrl}`);
          // Don't override if caller already manually passed it
          if (!urlObj.searchParams.has('university')) {
            urlObj.searchParams.set('university', university._id);
            finalUrl = urlObj.toString();
          }
        }
      } catch (e) {
        // Safe fail — cookie was corrupted or unparseable
      }
    }
  }

  return get<T>(finalUrl, { ...options, headers });
}

export async function getPrivate<T = unknown>(
  url: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { privateRequest } = await import('./privateRequest');
  return privateRequest<T>('GET', url, undefined, options);
}

export async function getThirdParty<T = unknown>(
  url: string,
  token: string,
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

  return get<T>(url, { ...options, headers });
}