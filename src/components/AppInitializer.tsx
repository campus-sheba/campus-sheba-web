"use client";

import { useEffect } from "react";
import { useAppState } from "@/contexts/AppStateContext";
import { CookieHelper } from "@/lib/appStateHelper";

/**
 * This component runs on app initialization to check:
 * 1. If user has token - if yes, no need to ask for anything, auto-login
 * 2. If user has university ID - if yes, use that
 * 3. If neither - force university selector
 *
 * This should be placed at the top level of your app layout
 */
export function AppInitializer() {
  const { dispatch } = useAppState();

  useEffect(() => {
    const initializeApp = () => {
      const token = CookieHelper.getAccessToken();
      const university = CookieHelper.getUniversity();
      // 1) Registered user with token: do not force university popup.
      if (token) {
        if (university) {
          dispatch({ type: "SET_UNIVERSITY", payload: university });
        }
        dispatch({ type: "CLOSE_UNIVERSITY_SELECTOR" });
        return;
      }

      // 2) Guest user with university cookie: use it and keep popup closed.
      if (university) {
        dispatch({ type: "SET_UNIVERSITY", payload: university });
        dispatch({ type: "CLOSE_UNIVERSITY_SELECTOR" });
        return;
      }

      // 3) Guest user without university cookie: always show mandatory popup.
      dispatch({ type: "OPEN_UNIVERSITY_SELECTOR", payload: { isMandatory: true } });
    };

    initializeApp();
  }, [dispatch]);

  return null;
}

/**
 * Alternative: Hook-based initializer for use in components
 */
export function useAppInitialization() {
  const { dispatch } = useAppState();

  useEffect(() => {
    const token = CookieHelper.getAccessToken();
    const university = CookieHelper.getUniversity();

    if (!token && !university) {
      dispatch({ type: "OPEN_UNIVERSITY_SELECTOR", payload: { isMandatory: true } });
    }
  }, [dispatch]);
}
