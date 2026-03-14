'use server';

import { cookies } from 'next/headers';
import { handleResponse } from './handleResponse';

async function deleteRequest(url, options = {}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore?.get('accessToken')?.value;

  try {
    const { headers: optionHeaders, ...restOptions } = options;

    const response = await fetch(url, {
      method: 'DELETE',
      next: { revalidate: 0 },
      headers: {
        ...(optionHeaders || {}),
      },
      ...restOptions,
    });

    return await handleResponse(response, url, accessToken);
  } catch (error) {
    console.error(`API DELETE request failed for ${url}:`, error);
    return error;
  }
}

export async function deletePublic(url) {
  return deleteRequest(url);
}

export async function deletePrivate(url) {
  const cookieStore = await cookies();
  const token = cookieStore?.get('accessToken')?.value;

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  };

  return deleteRequest(url, { headers });
}
