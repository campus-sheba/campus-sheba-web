"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAppState } from "@/contexts/AppStateContext";

/**
 * Opens the auth modal when the URL has `?auth=login` or `?auth=signup`,
 * then strips the param so the back button doesn't re-open it.
 */
export function useAuthModalFromUrl() {
  const { dispatch } = useAppState();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const authParam = searchParams.get("auth");
    if (authParam !== "login" && authParam !== "signup") return;

    dispatch({ type: "OPEN_AUTH_MODAL", payload: { defaultTab: authParam } });

    const next = new URLSearchParams(searchParams.toString());
    next.delete("auth");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [dispatch, pathname, router, searchParams]);
}
