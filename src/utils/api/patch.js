'use server';
import { cookies } from 'next/headers';
import { handleResponse } from './handleResponse';

async function patch(url, body = {}, options = {}) {
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
      method: 'PATCH',
      next: { revalidate: 0 },
      headers: finalHeaders,
      body: finalBody,
      ...restOptions,
    });

    return await handleResponse(response, url, accessToken);
  } catch (error) {
    console.error(`API PATCH request failed for ${url}:`, error);
    return error;
  }
}

export async function patchPublic(url, body = {}) {
  const cookieStore = await cookies();
  const timeZone = cookieStore?.get('timeZone')?.value;
  const headers = {
    Accept: 'application/json',
    timeZone,
  };
  return patch(url, body, { headers });
}

export async function patchPrivate(url, body = {}) {
  const cookieStore = await cookies();
  const token = cookieStore?.get('accessToken')?.value;
  const timeZone = cookieStore?.get('timeZone')?.value;

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    timeZone,
  };

  return patch(url, body, { headers });
}
