import { jwtDecode } from 'jwt-decode';

export async function verifyToken(token) {
  if (!token) {
    return false;
  }
  try {
    const decoded = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp > currentTime) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}
