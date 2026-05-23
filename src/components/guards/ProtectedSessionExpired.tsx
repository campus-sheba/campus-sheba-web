"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

import { useRouter, usePathname } from "@/i18n/navigation";
import { useAppState } from "@/contexts/AppStateContext";
import { clearAuthCookies } from "@/services/auth";
import { emitClientLogout } from "@/lib/sessionSync";

/**
 * Rendered by `AuthGuard` when a session dies mid-visit (the server `getMe()`
 * re-check failed even after a silent refresh). It clears the dead session,
 * notifies AppState so the navbar flips to logged-out, then sends the user to
 * the dedicated login page with a `callbackUrl` so they return where they were.
 */
export default function ProtectedSessionExpired() {
  const t = useTranslations("common.protected");
  const { dispatch } = useAppState();
  const router = useRouter();
  const pathname = usePathname();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    void (async () => {
      try {
        await clearAuthCookies();
      } catch (error) {
        console.error(error);
      }
      emitClientLogout();
      dispatch({ type: "SET_AUTH_LOADING", payload: false });

      const callbackUrl = pathname || "/";
      router.replace(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    })();
  }, [dispatch, router, pathname]);

  return (
    <div
      className="min-h-[40vh] flex flex-col items-center justify-center gap-2 px-4 text-center"
      aria-live="polite"
    >
      <p className="text-sm font-medium text-neutral-800">{t("sessionExpiredTitle")}</p>
      <p className="text-sm text-neutral-500 max-w-md">{t("sessionExpiredHint")}</p>
    </div>
  );
}
