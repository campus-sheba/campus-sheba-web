"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AppStateProvider, useAppState } from "@/contexts/AppStateContext";
import { AppInitializer } from "@/components/AppInitializer";
import AuthModal from "@/components/modals/AuthModal";
import UniversitySelectorModal from "@/components/modals/UniversitySelectorModal";
import { useNotificationBootstrap } from "@/hooks/useNotificationBootstrap";

/**
 * Client-side providers and modals wrapper
 * This component is responsible for:
 * 1. Providing global state (AppStateProvider)
 * 2. Initializing app state on mount (AppInitializer)
 * 3. Rendering global modals (AuthModal, UniversitySelectorModal)
 */
function LayoutContent({ children }: { children: ReactNode }) {
  const { state, dispatch } = useAppState();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useNotificationBootstrap();

  useEffect(() => {
    const authParam = searchParams.get("auth");
    if (authParam !== "login" && authParam !== "signup") return;

    dispatch({ type: "OPEN_AUTH_MODAL", payload: { defaultTab: authParam } });

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("auth");
    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }, [dispatch, pathname, router, searchParams]);

  return (
    <>
      <AppInitializer />
      {children}

      {/* Global Modals */}
      <AuthModal
        isOpen={state.modals.authModal.isOpen}
        defaultTab={state.modals.authModal.defaultTab}
        onClose={() => dispatch({ type: "CLOSE_AUTH_MODAL" })}
      />

      <UniversitySelectorModal
        isOpen={state.modals.universitySelector.isOpen}
        isMandatory={state.modals.universitySelector.isMandatory}
      />
    </>
  );
}

export function LayoutClientProviders({
  children,
  locale: _locale,
}: {
  children: ReactNode;
  locale: string;
}) {
  return (
    <AppStateProvider>
      <LayoutContent>{children}</LayoutContent>
    </AppStateProvider>
  );
}
