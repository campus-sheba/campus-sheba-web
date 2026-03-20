"use client";

import { ReactNode } from "react";
import { AppStateProvider, useAppState } from "@/contexts/AppStateContext";
import { AppInitializer } from "@/components/AppInitializer";
import AuthModal from "@/components/modals/AuthModal";
import UniversitySelectorModal from "@/components/modals/UniversitySelectorModal";

/**
 * Client-side providers and modals wrapper
 * This component is responsible for:
 * 1. Providing global state (AppStateProvider)
 * 2. Initializing app state on mount (AppInitializer)
 * 3. Rendering global modals (AuthModal, UniversitySelectorModal)
 */
function LayoutContent({ children, locale }: { children: ReactNode; locale: string }) {
  const { state, dispatch } = useAppState();

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
  locale,
}: {
  children: ReactNode;
  locale: string;
}) {
  return (
    <AppStateProvider>
      <LayoutContent locale={locale}>{children}</LayoutContent>
    </AppStateProvider>
  );
}
