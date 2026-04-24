"use client";

import { ReactNode, useEffect } from "react";

const SESSION_KEY = "session_uuid";

function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Issues an anonymous per-browser session UUID and persists it in localStorage.
 * Attached to analytics / guest-side APIs so unauthenticated flows (cart, wishlist, etc.)
 * can be traced across requests without exposing PII.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const existing = window.localStorage.getItem(SESSION_KEY);
    if (!existing) {
      window.localStorage.setItem(SESSION_KEY, generateUUID());
    }
  }, []);

  return <>{children}</>;
}

export function getSessionUuid(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(SESSION_KEY);
}
