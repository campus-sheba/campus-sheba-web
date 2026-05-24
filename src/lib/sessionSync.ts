import { CookieHelper } from "@/lib/appStateHelper";

export const SESSION_EXPIRED_EVENT = "campus-sheba:session-expired";
export const CLIENT_LOGOUT_EVENT = "client-logout";

export function isSessionExpiredMessage(message: string): boolean {
  const msg = message.toLowerCase();
  return (
    msg === "session_expired" ||
    msg.includes("(401)") ||
    msg.includes("(403)") ||
    msg.includes("unauthorized") ||
    msg.includes("unauthenticated") ||
    msg.includes("forbidden") ||
    msg.includes("jwt expired") ||
    msg.includes("invalid token") ||
    msg.includes("token expired") ||
    msg.includes("session expired") ||
    msg.includes("invalid session")
  );
}

/** Clears client-readable auth cookies and notifies AppStateProvider immediately. */
export function emitClientLogout(): void {
  if (typeof window === "undefined") return;
  CookieHelper.clearAuth();
  window.dispatchEvent(new Event(CLIENT_LOGOUT_EVENT));
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}
