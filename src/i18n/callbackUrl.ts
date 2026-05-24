import { routing } from "./routing";

/**
 * Strip a leading locale segment so paths work with next-intl's router
 * (which adds the locale automatically). Handles legacy callbackUrl values
 * that still include `/en/...` from middleware redirects.
 */
export function normalizeCallbackPath(path: string | null | undefined): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/";
  }

  for (const locale of routing.locales) {
    if (path === `/${locale}`) return "/";
    if (path.startsWith(`/${locale}/`)) {
      const stripped = path.slice(`/${locale}`.length);
      return stripped.startsWith("/") ? stripped : `/${stripped}`;
    }
  }

  return path;
}
