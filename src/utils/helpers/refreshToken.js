import { authenticationEndpoints } from '../endpoints/endpoints';

// Helper function to refresh access token
export async function refreshAccessToken(refreshToken) {
  try {
    const response = await fetch(`${process.env.BASE_URL}${authenticationEndpoints.refreshToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();
    // FROM HERE IT's NOT WORKING
    if (data.accessToken) {
      const { accessToken, refreshToken, user } = data;
      const { name, id, personId, mobile, profilePic, email, patientUniqueId } = user;
      return {
        accessToken,
        refreshToken,
        user: { name, id, personId, mobile, profilePic, email, patientUniqueId },
      };
    }
    return null;
  } catch {
    return null;
  }
}
