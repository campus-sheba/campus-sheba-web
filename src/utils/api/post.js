'use server';

import { cookies } from 'next/headers';
import { handleResponse } from './handleResponse';

async function post(url, body = {}, options = {}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore?.get('accessToken')?.value;

  try {
    const isFormData = body instanceof FormData;
    const finalBody = isFormData ? body : JSON.stringify(body);

    const { headers: optionHeaders, ...restOptions } = options;

    const finalHeaders = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(optionHeaders || {}),
    };

    const response = await fetch(url, {
      method: 'POST',
      next: { revalidate: 0 },
      headers: finalHeaders,
      body: finalBody,
      ...restOptions,
    });

    return await handleResponse(response, url, accessToken);
  } catch (error) {
    console.error(`API POST request failed for ${url}:`, error);
    return error;
  }
}

export async function postPublic(url, body = {}) {
  const cookieStore = await cookies();
  const timeZone = cookieStore?.get('timeZone')?.value;
  const headers = {
    Accept: 'application/json',
    timeZone,
  };
  return post(url, body, { headers });
}

export async function postPrivate(url, body = {}) {
  const cookieStore = await cookies();
  const token = cookieStore?.get('accessToken')?.value;
  const timeZone = cookieStore?.get('timeZone')?.value;

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    timeZone,
  };

  return post(url, body, { headers });
}

export async function postThirdParty(url, token, body = {}) {
  if (!token) {
    throw new Error('Token is required for third-party API calls');
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  };

  return post(url, body, { headers });
}
