"use client";

import { useAppState } from "@/contexts/AppStateContext";
import AuthModal from "@/components/modals/AuthModal";
import UniversitySelectorModal from "@/components/modals/UniversitySelectorModal";
import PopupBannerModal from "@/components/modals/PopupBannerModal";

/**
 * App-wide modals rendered at the root so they overlay any page.
 * Reads open/close state from AppStateContext; each modal owns its own logic.
 */
export function GlobalModals() {
  const { state, dispatch } = useAppState();

  return (
    <>
      <AuthModal
        isOpen={state.modals.authModal.isOpen}
        defaultTab={state.modals.authModal.defaultTab}
        onClose={() => dispatch({ type: "CLOSE_AUTH_MODAL" })}
      />

      <UniversitySelectorModal
        isOpen={state.modals.universitySelector.isOpen}
        isMandatory={state.modals.universitySelector.isMandatory}
      />

      <PopupBannerModal />
    </>
  );
}
