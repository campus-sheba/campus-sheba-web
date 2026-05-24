"use client";

import { createContext, useContext, useReducer, useCallback, ReactNode, useEffect, useRef, useState } from "react";
import { AppState, AppStateAction, AppStateContextValue, UserProfile, University, UniversityAddress } from "@/types/global";
import { CookieHelper, StorageHelper } from "@/lib/appStateHelper";
import {
  CLIENT_LOGOUT_EVENT,
  SESSION_EXPIRED_EVENT,
  emitClientLogout,
} from "@/lib/sessionSync";
import { checkSessionAction } from "@/services/auth";

const INITIAL_STATE: AppState = {
  auth: {
    token: null,
    refreshToken: null,
    isLoading: true,
    isAuthenticated: false,
  },
  user: {
    profile: null,
    isLoading: false,
  },
  university: {
    selected: null,
    isLoading: false,
  },
  address: {
    selected: null,
    isLoading: false,
  },
  modals: {
    authModal: {
      isOpen: false,
    },
    universitySelector: {
      isOpen: false,
    },
  },
};

/**
 * Global state reducer
 */
function appStateReducer(state: AppState, action: AppStateAction): AppState {
  switch (action.type) {
    case "SET_AUTH_TOKEN":
      return {
        ...state,
        auth: {
          ...state.auth,
          token: action.payload.token,
          refreshToken: action.payload.refreshToken,
          isAuthenticated: true,
        },
      };

    case "SET_AUTH_LOADING":
      return {
        ...state,
        auth: {
          ...state.auth,
          isLoading: action.payload,
        },
      };

    case "CLEAR_AUTH":
      return {
        ...state,
        auth: {
          token: null,
          refreshToken: null,
          isLoading: false,
          isAuthenticated: false,
        },
        user: {
          profile: null,
          isLoading: false,
        },
      };

    case "SET_USER_PROFILE":
      return {
        ...state,
        user: {
          profile: action.payload,
          isLoading: false,
        },
      };

    case "SET_USER_LOADING":
      return {
        ...state,
        user: {
          ...state.user,
          isLoading: action.payload,
        },
      };

    case "CLEAR_USER":
      return {
        ...state,
        user: {
          profile: null,
          isLoading: false,
        },
      };

    case "SET_UNIVERSITY":
      return {
        ...state,
        university: {
          selected: action.payload,
          isLoading: false,
        },
      };

    case "SET_UNIVERSITY_LOADING":
      return {
        ...state,
        university: {
          ...state.university,
          isLoading: action.payload,
        },
      };

    case "CLEAR_UNIVERSITY":
      return {
        ...state,
        university: {
          selected: null,
          isLoading: false,
        },
      };

    case "SET_ADDRESS":
      return {
        ...state,
        address: {
          selected: action.payload,
          isLoading: false,
        },
      };

    case "SET_ADDRESS_LOADING":
      return {
        ...state,
        address: {
          ...state.address,
          isLoading: action.payload,
        },
      };

    case "CLEAR_ADDRESS":
      return {
        ...state,
        address: {
          selected: null,
          isLoading: false,
        },
      };

    case "OPEN_AUTH_MODAL":
      return {
        ...state,
        modals: {
          ...state.modals,
          authModal: {
            isOpen: true,
            defaultTab: action.payload?.defaultTab,
          },
        },
      };

    case "CLOSE_AUTH_MODAL":
      return {
        ...state,
        modals: {
          ...state.modals,
          authModal: {
            isOpen: false,
          },
        },
      };

    case "OPEN_UNIVERSITY_SELECTOR":
      return {
        ...state,
        modals: {
          ...state.modals,
          universitySelector: {
            isOpen: true,
            isMandatory: action.payload?.isMandatory,
          },
        },
      };

    case "CLOSE_UNIVERSITY_SELECTOR":
      return {
        ...state,
        modals: {
          ...state.modals,
          universitySelector: {
            isOpen: false,
          },
        },
      };

    case "RESET_STATE":
      return INITIAL_STATE;

    default:
      return state;
  }
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

export interface AppStateProviderProps {
  children: ReactNode;
}

/**
 * Global state provider
 */
export function AppStateProvider({ children }: AppStateProviderProps) {
  const [state, dispatch] = useReducer(appStateReducer, INITIAL_STATE);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize state from cookies on mount
  useEffect(() => {
    const initializeState = () => {
      try {
        // Check for existing token
        const token = CookieHelper.getAccessToken();
        const refreshToken = CookieHelper.getRefreshToken();
        const userProfile = CookieHelper.getUserProfile();
        const university = CookieHelper.getUniversity();

        if (token && refreshToken) {
          dispatch({
            type: "SET_AUTH_TOKEN",
            payload: { token, refreshToken },
          });

          if (userProfile) {
            dispatch({
              type: "SET_USER_PROFILE",
              payload: userProfile,
            });
          }
        } else if (userProfile) {
          // Tokens are httpOnly and may be unreadable on client; user cookie indicates an active session.
          dispatch({
            type: "SET_AUTH_TOKEN",
            payload: { token: "session", refreshToken: "session" },
          });
          dispatch({
            type: "SET_USER_PROFILE",
            payload: userProfile,
          });
        }

        if (university) {
          dispatch({
            type: "SET_UNIVERSITY",
            payload: university,
          });
        }

        // Finish loading
        dispatch({ type: "SET_AUTH_LOADING", payload: false });
      } catch (error) {
        console.error("Failed to initialize app state:", error);
        dispatch({ type: "SET_AUTH_LOADING", payload: false });
      }

      setIsInitialized(true);
    };

    initializeState();
  }, []);

  const login = useCallback(
    (profile: UserProfile, token: string, refreshToken: string) => {
      dispatch({
        type: "SET_AUTH_TOKEN",
        payload: { token, refreshToken },
      });
      dispatch({
        type: "SET_USER_PROFILE",
        payload: profile,
      });
      dispatch({ type: "CLOSE_AUTH_MODAL" });
    },
    []
  );

  const logout = useCallback(() => {
    CookieHelper.clearAll();
    dispatch({ type: "CLEAR_AUTH" });
    dispatch({ type: "SET_AUTH_LOADING", payload: false });
    StorageHelper.clearAll();
  }, []);

  const clearAuthState = useCallback(() => {
    CookieHelper.clearAuth();
    dispatch({ type: "CLEAR_AUTH" });
    dispatch({ type: "SET_AUTH_LOADING", payload: false });
  }, []);

  useEffect(() => {
    const handleLogoutEvent = () => logout();
    const handleSessionExpired = () => clearAuthState();

    window.addEventListener(CLIENT_LOGOUT_EVENT, handleLogoutEvent);
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => {
      window.removeEventListener(CLIENT_LOGOUT_EVENT, handleLogoutEvent);
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    };
  }, [logout, clearAuthState]);

  /**
   * Cookie-polling sync: httpOnly auth cookies can be set or cleared by server actions
   * (login, logout, refresh, auto-login via token). Mirror the non-httpOnly `user`
   * cookie into reducer state so UI responds without a full page reload.
   */
  const lastUserCookieRef = useRef<string | null>(null);
  useEffect(() => {
    const syncFromCookie = () => {
      if (typeof document === "undefined") return;
      const value = `; ${document.cookie}`;
      const parts = value.split(`; user=`);
      const raw = parts.length === 2 ? (parts.pop()?.split(";").shift() ?? null) : null;

      if (raw === lastUserCookieRef.current) return;
      lastUserCookieRef.current = raw;

      if (!raw) {
        clearAuthState();
        return;
      }

      const profile = CookieHelper.getUserProfile();
      if (profile) {
        dispatch({ type: "SET_AUTH_TOKEN", payload: { token: "session", refreshToken: "session" } });
        dispatch({ type: "SET_USER_PROFILE", payload: profile });
      }
    };

    syncFromCookie();
    const id = window.setInterval(syncFromCookie, 400);
    const onVisible = () => {
      if (document.visibilityState === "visible") syncFromCookie();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", syncFromCookie);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", syncFromCookie);
    };
  }, [clearAuthState]);

  /** Server session probe so navbar updates as soon as tokens expire (not only on protected routes). */
  const sessionProbeRunning = useRef(false);
  useEffect(() => {
    if (!state.auth.isAuthenticated) return;

    const probe = async () => {
      if (sessionProbeRunning.current) return;
      sessionProbeRunning.current = true;
      try {
        const { authenticated } = await checkSessionAction();
        if (!authenticated) {
          emitClientLogout();
        }
      } finally {
        sessionProbeRunning.current = false;
      }
    };

    void probe();
    const interval = window.setInterval(() => void probe(), 45_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") void probe();
    };
    const onFocus = () => void probe();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
    };
  }, [state.auth.isAuthenticated]);

  const selectUniversity = useCallback((university: University) => {
    dispatch({
      type: "SET_UNIVERSITY",
      payload: university,
    });

    CookieHelper.setUniversity(university);

    // Save to localStorage temporarily (if not logged in)
    if (!state.auth.isAuthenticated) {
      StorageHelper.setPendingUniversity(university);
    }
  }, [state.auth.isAuthenticated]);

  const selectAddress = useCallback((address: UniversityAddress) => {
    dispatch({
      type: "SET_ADDRESS",
      payload: address,
    });

    if (!state.auth.isAuthenticated) {
      StorageHelper.setPendingAddress(address);
    }
  }, [state.auth.isAuthenticated]);

  const refreshUserProfile = useCallback(async () => {
    dispatch({ type: "SET_USER_LOADING", payload: true });
    try {
      const profile = CookieHelper.getUserProfile();
      if (profile) {
        dispatch({
          type: "SET_USER_PROFILE",
          payload: profile,
        });
      }
    } catch (error) {
      console.error("Failed to refresh user profile:", error);
    } finally {
      dispatch({ type: "SET_USER_LOADING", payload: false });
    }
  }, []);

  const value: AppStateContextValue = {
    state,
    dispatch,
    login,
    logout,
    selectUniversity,
    selectAddress,
    refreshUserProfile,
  };

  // Don't render children until initialization is complete
  if (!isInitialized) {
    return null;
  }

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

/**
 * Hook to use global app state
 */
export function useAppState(): AppStateContextValue {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return context;
}
