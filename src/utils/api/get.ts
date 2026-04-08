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
    token ? { Authorization: `Bearer ${token}` } : undefined,
    timeZone ? { timeZone } : undefined,
    options.headers,
  );

  let finalUrl = url;
  const explicitUniversityId = options.universityId;
  const includeUniversity = options.includeUniversity !== false;
  const universityCookie = cookieStore.get('university')?.value;
  const fallbackUniversityId = cookieStore.get('universityId')?.value;

  let resolvedUniversityId = explicitUniversityId || fallbackUniversityId;
  if (!resolvedUniversityId && universityCookie) {
    try {
      const university = JSON.parse(decodeURIComponent(universityCookie));
      resolvedUniversityId = university?._id;
    } catch {
      resolvedUniversityId = undefined;
    }
  }

  if (includeUniversity && resolvedUniversityId) {
    const urlObj = new URL(finalUrl.startsWith('http') ? finalUrl : `${process.env.BASE_URL || ''}${finalUrl}`);
    if (!urlObj.searchParams.has('university')) {
      urlObj.searchParams.set('university', resolvedUniversityId);
      finalUrl = urlObj.toString();
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