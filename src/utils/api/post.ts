'use server';

import { cookies } from 'next/headers';
import { mergeHeaders, request } from './request';
import type { ApiBody, ApiRequestOptions } from './types';

export async function post<T = unknown>(
  url: string,
  body: ApiBody = {},
  options: ApiRequestOptions = {},
): Promise<T> {
  return request<T>('POST', url, body, options);
}

export async function postPublic<T = unknown>(
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

  return post<T>(url, body, { ...options, headers });
}

export async function postPrivate<T = unknown>(
  url: string,
  body: ApiBody = {},
  options: ApiRequestOptions = {},
): Promise<T> {
  const { privateRequest } = await import('./privateRequest');
  return privateRequest<T>('POST', url, body, options);
}

export async function postThirdParty<T = unknown>(
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

  return post<T>(url, body, { ...options, headers });
}