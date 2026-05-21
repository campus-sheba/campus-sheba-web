import { AuthMe, UserRole } from "./auth";

/**
 * University entity - matches API response structure
 */
export type University = {
  _id: string;
  name: string;
  shortName: string;
  description: string;
  establishedYear: number;
  website: string;
  contactEmail: string;
  contactPhone: string;
  coverPhoto: string;
  logo: string;
  address: string;
  isPublic: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

/**
 * Address/Location within a university
 */
export type UniversityAddress = {
  id: string;
  universityId: string;
  name: string;
  type: "hall" | "landmark" | "hub"; // "Hall", "Landmark", "Student Hub"
  coordinates?: {
    lat: number;
    lng: number;
  };
};

/**
 * User profile with extended information
 */
export type UserProfile = AuthMe & {
  university?: University | null;
  address?: UniversityAddress | null;
  avatar?: string;
  department?: string | { _id: string; name?: string };
  semester?: string;
};

/**
 * Global application state structure
 */
export type AppState = {
  // Authentication state
  auth: {
    token: string | null;
    refreshToken: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
  };

  // User profile state
  user: {
    profile: UserProfile | null;
    isLoading: boolean;
  };

  // University/campus state
  university: {
    selected: University | null;
    isLoading: boolean;
  };

  // Address state
  address: {
    selected: UniversityAddress | null;
    isLoading: boolean;
  };

  // UI state for modals
  modals: {
    authModal: {
      isOpen: boolean;
      defaultTab?: "login" | "signup";
    };
    universitySelector: {
      isOpen: boolean;
      isMandatory?: boolean; // Force user to select
    };
  };
};

/**
 * Actions that can be dispatched to update state
 */
export type AppStateAction =
  | { type: "SET_AUTH_TOKEN"; payload: { token: string; refreshToken: string } }
  | { type: "SET_AUTH_LOADING"; payload: boolean }
  | { type: "CLEAR_AUTH" }
  | { type: "SET_USER_PROFILE"; payload: UserProfile }
  | { type: "SET_USER_LOADING"; payload: boolean }
  | { type: "CLEAR_USER" }
  | { type: "SET_UNIVERSITY"; payload: University }
  | { type: "SET_UNIVERSITY_LOADING"; payload: boolean }
  | { type: "CLEAR_UNIVERSITY" }
  | { type: "SET_ADDRESS"; payload: UniversityAddress }
  | { type: "SET_ADDRESS_LOADING"; payload: boolean }
  | { type: "CLEAR_ADDRESS" }
  | { type: "OPEN_AUTH_MODAL"; payload?: { defaultTab?: "login" | "signup" } }
  | { type: "CLOSE_AUTH_MODAL" }
  | { type: "OPEN_UNIVERSITY_SELECTOR"; payload?: { isMandatory?: boolean } }
  | { type: "CLOSE_UNIVERSITY_SELECTOR" }
  | { type: "RESET_STATE" };

/**
 * Context value type
 */
export type AppStateContextValue = {
  state: AppState;
  dispatch: (action: AppStateAction) => void;
  // Convenience methods
  login: (profile: UserProfile, token: string, refreshToken: string) => void;
  logout: () => void;
  selectUniversity: (university: University) => void;
  selectAddress: (address: UniversityAddress) => void;
  refreshUserProfile: () => Promise<void>;
};
