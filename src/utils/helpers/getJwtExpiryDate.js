// utils/helpers/getJwtExpiryDate.ts
import { jwtDecode } from 'jwt-decode';

export function getJwtExpiryDate(token) {
  const decoded = jwtDecode(token);
  return new Date(decoded.exp * 1000);
}
