import { authenticationEndpoints } from '../endpoints/endpoints';

// Helper function to refresh access token
export async function refreshAccessToken(refreshToken) {
  try {
    const response = await fetch(authenticationEndpoints.refresh, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refreshToken}`,
        'x-refresh-token': refreshToken,
      },
    });

    const data = await response.json();
    const payload = data?.data;

    if (payload?.accessToken) {
      const { accessToken, refreshToken } = payload;
      return {
        accessToken,
        refreshToken,
      };
    }

    return null;
  } catch {
    return null;
  }
}
