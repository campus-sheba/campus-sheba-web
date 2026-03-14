import 'server-only';

import { cookies } from 'next/headers';
import { handleResponse } from './handleResponse';
import type { ApiBody, ApiRequestOptions, HttpMethod } from './types';

export const mergeHeaders = (...sources: Array<HeadersInit | undefined>): Headers => {
    const headers = new Headers();

    for (const source of sources) {
        if (!source) continue;

        new Headers(source).forEach((value, key) => {
            headers.set(key, value);
        });
    }

    return headers;
};

const isFormData = (value: ApiBody | undefined): value is FormData =>
    typeof FormData !== 'undefined' && value instanceof FormData;

export async function request<T = unknown>(
    method: HttpMethod,
    url: string,
    body?: ApiBody,
    options: ApiRequestOptions = {},
): Promise<T> {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    const { headers: optionHeaders, next = { revalidate: 0 }, ...restOptions } = options;

    const shouldSendBody = method !== 'GET' && body !== undefined;
    const formData = isFormData(body);

    const headers = mergeHeaders(
        shouldSendBody && !formData ? { 'Content-Type': 'application/json' } : undefined,
        optionHeaders,
    );

    const finalBody: BodyInit | undefined = shouldSendBody
        ? formData
            ? body
            : JSON.stringify(body)
        : undefined;

    const response = await fetch(url, {
        method,
        next,
        headers,
        body: finalBody,
        ...restOptions,
    });

    return handleResponse<T>(response, url, accessToken);
}