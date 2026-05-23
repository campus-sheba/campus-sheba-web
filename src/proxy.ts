import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "./i18n/routing";
import { authenticationEndpoints } from "./utils/endpoints/endpoints";
import { parseRefreshTokens } from "./utils/auth/refreshTokens";

const intlMiddleware = createIntlMiddleware(routing);

/**
 * URL prefixes (locale-stripped) that require an authenticated session.
 * These mirror the `app/[locale]/(protected)` route group; route groups don't
 * appear in the URL, so they're enumerated here for the edge/proxy layer.
 */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/profile",
  "/settings",
  "/wallet",
  "/cart",
  "/checkout",
  "/campus-coins",
  "/refer-and-earn",
  "/my-addresses",
  "/my-blood-donor",
  "/my-blood-requests",
  "/my-book-borrowed",
  "/my-book-donations",
  "/my-book-lent",
  "/my-books",
  "/my-buy-sell",
  "/my-library",
  "/my-lost-found",
  "/my-orders",
  "/my-parcels",
  "/my-shop",
];

/** Protected pages that live under an otherwise-public prefix. */
const PROTECTED_EXACT_PREFIXES = ["/marketplace/shop/create"];

/** Pages that only make sense for signed-out visitors. */
const AUTH_ONLY_PREFIXES = ["/login", "/signup"];

const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;

const refreshedCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: THIRTY_DAYS_SECONDS,
};

/**
 * Decode a JWT's `exp` without external deps (jwt-decode isn't installed and we
 * want this to stay edge/proxy-runtime safe). We only read the expiry — signature
 * verification stays server-side at the API; this is a cheap "is it worth sending"
 * gate so we can attempt a silent refresh before hitting a protected page.
 */
function isAccessTokenLive(token: string | undefined): boolean {
  if (!token) return false;

  const segments = token.split(".");
  if (segments.length < 2) return false;

  try {
    let payload = segments[1].replace(/-/g, "+").replace(/_/g, "/");
    payload += "=".repeat((4 - (payload.length % 4)) % 4);

    const json =
      typeof atob === "function"
        ? atob(payload)
        : Buffer.from(payload, "base64").toString("utf-8");

    const decoded = JSON.parse(json) as { exp?: number };
    if (typeof decoded.exp !== "number") return false;

    // 10s skew so we refresh slightly early rather than send a dead token.
    return decoded.exp * 1000 > Date.now() + 10_000;
  } catch {
    return false;
  }
}

/**
 * Exchange a refresh token for a fresh access/refresh pair. Returns the new
 * tokens on success so the caller can write them onto the response cookies.
 */
const REFRESH_TIMEOUT_MS = 4000;

async function attemptRefresh(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string } | null> {
  const url = authenticationEndpoints.refresh;
  if (!url || url.includes("undefined")) return null;

  // Middleware blocks the user's navigation while this runs, so a slow or hung
  // auth API must never stall the page. Cap the round-trip and fail fast — the
  // client API layer can still recover via its own 401 handling.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REFRESH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${refreshToken}`,
        "x-refresh-token": refreshToken,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) return null;

    return parseRefreshTokens(await response.json());
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function clearAuthCookies(response: NextResponse): void {
  response.cookies.delete("accessToken");
  response.cookies.delete("refreshToken");
  response.cookies.delete("user");
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  const pathnameIsMissingLocale = routing.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
  );
  const locale = pathnameIsMissingLocale
    ? routing.defaultLocale
    : pathname.split("/")[1];
  // Strip the leading `/<locale>` so route matching is locale-agnostic.
  const cleanPathname = pathnameIsMissingLocale
    ? pathname
    : pathname.replace(/^\/[^/]+/, "") || "/";

  const isProtected =
    PROTECTED_PREFIXES.some((prefix) => matchesPrefix(cleanPathname, prefix)) ||
    PROTECTED_EXACT_PREFIXES.some((prefix) => matchesPrefix(cleanPathname, prefix));
  const isAuthOnly = AUTH_ONLY_PREFIXES.some((prefix) =>
    matchesPrefix(cleanPathname, prefix),
  );

  let isAuthenticated = isAccessTokenLive(accessToken);
  let refreshedTokens: { accessToken: string; refreshToken: string } | null = null;
  let refreshFailed = false;

  // Only spend a network round-trip on the silent refresh where the answer
  // actually changes behaviour: protected routes (need a live session or we
  // bounce to login) and auth-only routes (need to know if we should bounce a
  // signed-in user home). Public-page navigations and server-action POSTs to
  // public routes skip it entirely — they were paying 10–25s for nothing.
  if ((isProtected || isAuthOnly) && !isAuthenticated && refreshToken) {
    refreshedTokens = await attemptRefresh(refreshToken);
    if (refreshedTokens) {
      isAuthenticated = true;
      // Make the fresh tokens visible to downstream handlers (RSC fetches,
      // server actions) in THIS request, not just the next browser hit — this
      // prevents a second refresh cascade when their authed API calls would
      // otherwise see the dead token and 401.
      request.cookies.set("accessToken", refreshedTokens.accessToken);
      request.cookies.set("refreshToken", refreshedTokens.refreshToken);
    } else {
      refreshFailed = true;
    }
  }

  // ── Protected route, no valid session → redirect to login with callbackUrl ──
  if (isProtected && !isAuthenticated) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = `/${locale}/login`;
    loginUrl.search = "";
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);

    const redirect = NextResponse.redirect(loginUrl);
    clearAuthCookies(redirect);
    return redirect;
  }

  // ── Signed-in user hitting login/signup → send home ─────────────────────────
  if (isAuthOnly && isAuthenticated) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = `/${locale}`;
    homeUrl.search = "";

    const redirect = NextResponse.redirect(homeUrl);
    if (refreshedTokens) {
      redirect.cookies.set("accessToken", refreshedTokens.accessToken, refreshedCookieOptions);
      redirect.cookies.set("refreshToken", refreshedTokens.refreshToken, refreshedCookieOptions);
    }
    return redirect;
  }

  // ── Otherwise continue with i18n, carrying any refresh side-effects ──────────
  const response = intlMiddleware(request);

  if (refreshedTokens) {
    response.cookies.set("accessToken", refreshedTokens.accessToken, refreshedCookieOptions);
    response.cookies.set("refreshToken", refreshedTokens.refreshToken, refreshedCookieOptions);
  } else if (refreshFailed) {
    // Refresh token is stale/invalid — clear the dead session so the client
    // (AppStateProvider cookie sync) flips to logged-out UI without a reload.
    clearAuthCookies(response);
  }

  return response;
}

export default proxy;

export const config = {
  matcher: ["/((?!api|health|_next|.*\\..*).*)"],
};
