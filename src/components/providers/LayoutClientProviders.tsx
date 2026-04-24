"use client";

import { ReactNode } from "react";
import { AppStateProvider } from "@/contexts/AppStateContext";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { GlobalModals } from "@/components/providers/GlobalModals";
import { AppInitializer } from "@/components/AppInitializer";
import { useAuthModalFromUrl } from "@/hooks/useAuthModalFromUrl";
import { useNotificationBootstrap } from "@/hooks/useNotificationBootstrap";

/**
 * Runs side-effects that require AppState to be mounted:
 *  - cookie → state bootstrap (AppInitializer)
 *  - `?auth=login|signup` URL param → auth modal
 *  - web-push notification bootstrap
 */
function AppStateBootstrap() {
  useAuthModalFromUrl();
  useNotificationBootstrap();
  return <AppInitializer />;
}

/**
 * Client-only provider stack composed at the top of every locale tree.
 *
 * Order matters: SessionProvider issues the anon `session_uuid` before anything
 * downstream might read it; AppStateProvider owns auth/user/university/address
 * state and wires cookie-polling sync so server actions (login, logout, auto-login
 * via ?token=) propagate without a reload; GlobalModals render once at the root.
 */
export function LayoutClientProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AppStateProvider>
        <AppStateBootstrap />
        {children}
        <GlobalModals />
      </AppStateProvider>
    </SessionProvider>
  );
}
