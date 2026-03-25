import { UserProfile, University, UniversityAddress } from "@/types/global";

const COOKIE_NAMES = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  USER_PROFILE: "user",
  UNIVERSITY: "university",
  ADDRESS_ID: "addressId",
} as const;

/**
 * Cookie helper functions for global state persistence
 */
export const CookieHelper = {
  /**
   * Read token from cookies (client-side only)
   */
  getAccessToken: (): string | null => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${COOKIE_NAMES.ACCESS_TOKEN}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  },

  getRefreshToken: (): string | null => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${COOKIE_NAMES.REFRESH_TOKEN}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  },

  /**
   * Get university object from cookies
   */
  getUniversity: (): University | null => {
    if (typeof document === "undefined") return null;
    try {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${COOKIE_NAMES.UNIVERSITY}=`);
      if (parts.length === 2) {
        const cookieValue = parts.pop()?.split(";").shift();
        if (cookieValue) {
          return JSON.parse(decodeURIComponent(cookieValue));
        }
      }
    } catch (error) {
      console.error("Failed to parse university from cookie:", error);
    }
    return null;
  },

  /**
   * Set complete university object to cookies (30-day expiry)
   */
  setUniversity: (university: University): void => {
    if (typeof document === "undefined") return;
    const date = new Date();
    date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    const encodedUniversity = encodeURIComponent(JSON.stringify(university));
    document.cookie = `${COOKIE_NAMES.UNIVERSITY}=${encodedUniversity}; ${expires}; path=/`;
  },

  /**
   * Get address ID from cookies
   */
  getAddressId: (): string | null => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${COOKIE_NAMES.ADDRESS_ID}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  },

  /**
   * Set address ID to cookies (30-day expiry)
   */
  setAddressId: (addressId: string): void => {
    if (typeof document === "undefined") return;
    const date = new Date();
    date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${COOKIE_NAMES.ADDRESS_ID}=${addressId}; ${expires}; path=/`;
  },

  /**
   * Get user profile from cookies
   */
  getUserProfile: (): UserProfile | null => {
    if (typeof document === "undefined") return null;
    try {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${COOKIE_NAMES.USER_PROFILE}=`);
      if (parts.length === 2) {
        const cookieValue = parts.pop()?.split(";").shift();
        if (cookieValue) {
          return JSON.parse(decodeURIComponent(cookieValue));
        }
      }
    } catch (error) {
      console.error("Failed to parse user profile from cookie:", error);
    }
    return null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return CookieHelper.getAccessToken() !== null;
  },

  /**
   * Check if university is set
   */
  hasUniversity: (): boolean => {
    return CookieHelper.getUniversity() !== null;
  },

  /**
   * Clear all auth cookies
   */
  clearAuth: (): void => {
    if (typeof document === "undefined") return;
    document.cookie = `${COOKIE_NAMES.ACCESS_TOKEN}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `${COOKIE_NAMES.REFRESH_TOKEN}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `${COOKIE_NAMES.USER_PROFILE}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  },

  /**
   * Clear university cookies (for logout)
   */
  clearUniversity: (): void => {
    if (typeof document === "undefined") return;
    document.cookie = `${COOKIE_NAMES.UNIVERSITY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `${COOKIE_NAMES.ADDRESS_ID}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  },

  /**
   * Clear all cookies
   */
  clearAll: (): void => {
    CookieHelper.clearAuth();
    // Intentionally NOT clearing university so guests retain context
  },
};

/**
 * LocalStorage helper for non-sensitive temporary data
 */
export const StorageHelper = {
  /**
   * Get pending university selection (temporary, before user logs in)
   */
  getPendingUniversity: (): University | null => {
    if (typeof localStorage === "undefined") return null;
    try {
      const value = localStorage.getItem("pending_university");
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  },

  /**
   * Set pending university selection
   */
  setPendingUniversity: (university: University | null): void => {
    if (typeof localStorage === "undefined") return;
    if (university) {
      localStorage.setItem("pending_university", JSON.stringify(university));
    } else {
      localStorage.removeItem("pending_university");
    }
  },

  /**
   * Get pending address selection (temporary)
   */
  getPendingAddress: (): UniversityAddress | null => {
    if (typeof localStorage === "undefined") return null;
    try {
      const value = localStorage.getItem("pending_address");
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  },

  /**
   * Set pending address selection
   */
  setPendingAddress: (address: UniversityAddress | null): void => {
    if (typeof localStorage === "undefined") return;
    if (address) {
      localStorage.setItem("pending_address", JSON.stringify(address));
    } else {
      localStorage.removeItem("pending_address");
    }
  },

  /**
   * Clear all localStorage
   */
  clearAll: (): void => {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem("pending_university");
    localStorage.removeItem("pending_address");
  },
};
