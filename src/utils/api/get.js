'use server';

import { cookies } from 'next/headers';
import { handleResponse } from './handleResponse';

async function get(url, options = {}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore?.get('accessToken')?.value;

  try {
    const response = await fetch(url, {
      method: 'GET',
      next: { revalidate: 0 },
      ...options,
    });

    return await handleResponse(response, url, accessToken);
  } catch (error) {
    console.error(`API request failed for ${url}:`, error);
    return {
      status: 503,
      success: false,
      message: 'Could not connect to the server.',
      errorDescription: error?.message || 'Unknown network error',
    };
  }
}

export async function getPublic(url) {
  const cookieStore = await cookies();
  const timeZone = cookieStore?.get('timeZone')?.value;
  const headers = new Headers({
    Accept: 'application/json',
    timeZone,
  });
  // console.info('REQ_HEADER', headers);
  return get(url, { headers });
}

export async function getPrivate(url) {
  const cookieStore = await cookies();
  const token = cookieStore?.get('accessToken')?.value;
  const timeZone = cookieStore?.get('timeZone')?.value;
  const headers = new Headers({
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    timeZone,
  });
  // console.info('PRV_REQ_HEADER', headers);
  return get(url, { headers });
}

export async function getThirdParty(url, token) {
  const headers = token
    ? new Headers({
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      })
    : undefined;

  return get(url, { headers });
}
