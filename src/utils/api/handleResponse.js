import { logout } from '../actions/logout';

export async function handleResponse(response, url, accessToken = null) {
  if (!response.ok) {
    console.error(`API request failed for ${url}:`, response.status);

    if (accessToken && response.status === 401) {
      await logout();
    }

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const errorBody = isJson ? await response.json() : await response.text();

    console.error('Error response:', response.status, errorBody);

    // Sentry.captureException(new Error(`API request failed for ${url}: ${response.status}`), {
    //   environment: process.env.NEXT_PUBLIC_APP_MODE,
    //   tags: {
    //     endpoint: url,
    //     status: response.status,
    //     type: 'api_error',
    //   },
    //   extra: {
    //     url,
    //     status: response.status,
    //     statusText: response.statusText,
    //     body: errorBody,
    //   },
    // });

    if (response.status >= 500) {
      throw {
        status: response.status,
        success: false,
        message: (isJson && errorBody.message) || 'Something went wrong',
        errorDescription: `API Error: ${response.status} ${response.statusText}`,
      };
    } else {
      return isJson && errorBody;
    }
  }

  const contentType = response.headers.get('content-type');
  return contentType?.includes('application/json') ? await response.json() : await response.text();
}
