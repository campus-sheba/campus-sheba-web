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

  const headers = mergeHeaders(
    { Accept: 'application/json' },
    timeZone ? { timeZone } : undefined,
    options.headers,
  );

  return get<T>(url, { ...options, headers });
}

export async function getPrivate<T = unknown>(
  url: string,
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

  console.log('GET Request to:', url, 'with headers:', headers);

  return get<T>(url, { ...options, headers });
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