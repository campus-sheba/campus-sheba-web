import Cookies from 'js-cookie';

export function clearAllCookies() {
  const allCookies = Cookies.get(); // Get all cookies as an object
  Object.keys(allCookies).forEach(cookieName => {
    Cookies.remove(cookieName); // Remove each cookie
  });
}
