"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useAppState } from "@/contexts/AppStateContext";
import { clearAuthCookies } from "@/services/auth";
import { CookieHelper } from "@/lib/appStateHelper";

export default function ProtectedSessionExpired() {
  const t = useTranslations("common.protected");
  const { dispatch } = useAppState();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    void (async () => {
      try {
        await clearAuthCookies();
      } catch (e) {
        console.error(e);
      }
      CookieHelper.clearAuth();
      dispatch({ type: "CLEAR_AUTH" });
      dispatch({ type: "SET_AUTH_LOADING", payload: false });
      dispatch({ type: "OPEN_AUTH_MODAL", payload: { defaultTab: "login" } });
    })();
  }, [dispatch]);

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
