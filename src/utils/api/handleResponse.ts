const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getErrorMessage = (data: unknown, fallback: string): string => {
  if (typeof data === 'string' && data.trim()) return data;

  if (isRecord(data)) {
    if (typeof data.message === 'string' && data.message.trim()) return data.message;
    if (typeof data.error === 'string' && data.error.trim()) return data.error;
  }

  return fallback;
};

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return (await response.json()) as T;
  }

  return (await response.text()) as T;
}

export async function handleResponse<T = unknown>(
  response: Response,
  url: string,
  _accessToken?: string,
): Promise<T> {
  const data = await parseResponse<unknown>(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(data, `Request failed (${response.status}) for ${url}`));
  }

  return data as T;
}