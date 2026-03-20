# Campus Sheba Global State Architecture

## Overview

This document describes the enterprise-grade global state management system for Campus Sheba. It handles authentication, user profiles, university selection, and addresses in a centralized, persistent manner using cookies and context API.

## Key Features

- **Persistent Authentication**: Tokens (accessToken, refreshToken) stored in HTTP-only cookies
- **User Profile Caching**: User data cached in cookies and synced with global state
- **University/Address Selection**: Campus and location data persisted and validated on app load
- **Modal-Based Auth**: Login and signup moved from dedicated pages to reusable modals
- **Mandatory University Selection**: First-time users or logged-in users without university are forced to select one
- **Zero Bounce Experience**: Returning users skip university selection if already set

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Browser/Application                    │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐   │
│  │          AppStateProvider (Context)              │   │
│  │                                                  │   │
│  │  Manages:                                        │   │
│  │  - auth (token, isAuthenticated)                │   │
│  │  - user (profile info)                          │   │
│  │  - university (selected campus)                 │   │
│  │  - address (selected location)                  │   │
│  │  - modals (auth, university selector)           │   │
│  └──────────────────────────────────────────────────┘   │
│           ▲                     ▲                         │
│           │                     │                         │
│  ┌────────┴──────┐   ┌─────────┴──────────┐             │
│  │  Cookies      │   │   localStorage    │             │
│  │  (Persistent) │   │   (Temporary)      │             │
│  └───────────────┘   └────────────────────┘             │
└─────────────────────────────────────────────────────────┘

Components:
├── AppStateContext.tsx (State management + hooks)
├── AppInitializer.tsx (First-load logic)
├── LayoutClientProviders.tsx (Provider setup)
├── modals/
│   ├── AuthModal.tsx (Login/Signup)
│   └── UniversitySelectorModal.tsx (Campus picker)
└── helpers/
    └── appStateHelper.ts (Cookie/Storage utils)
```

## State Structure

```typescript
AppState = {
  auth: {
    token: string | null;              // JWT access token
    refreshToken: string | null;       // Refresh token for token renewal
    isLoading: boolean;                // Loading during auth check
    isAuthenticated: boolean;          // Computed: token !== null
  };
  user: {
    profile: UserProfile | null;       // User details + university + address
    isLoading: boolean;
  };
  university: {
    selected: University | null;       // { id, name, short, slug }
    isLoading: boolean;
  };
  address: {
    selected: UniversityAddress | null; // { id, universityId, name, type }
    isLoading: boolean;
  };
  modals: {
    authModal: {
      isOpen: boolean;
      defaultTab?: "login" | "signup";
    };
    universitySelector: {
      isOpen: boolean;
      isMandatory?: boolean;  // Force selection before browsing
    };
  };
}
```

## User Flows

### Flow 1: Brand New User (No Token, No University)

```
1. App loads → AppInitializer runs
2. Check: Has token? NO
3. Check: Has university_id in cookie? NO
4. Action: Show mandatory UniversitySelectorModal
5. User selects university → Auto-store in localStorage
6. Modal closes → User can browse
7. User clicks "Get Started" → AuthModal opens (login/signup)
8. After login → Token stored in cookies
9. University from localStorage → Transferred to user profile in cookies
```

### Flow 2: Returning User (Has Token + University)

```
1. App loads → AppInitializer runs
2. Check: Has token? YES
3. AppStateProvider: Restore token + user profile from cookies
4. Check: Has university? YES
5. Auto-load university + address
6. NavBar shows profile icon
7. App is ready for browsing
```

### Flow 3: Returning User (Has Token But No University)

```
1. App loads → AppInitializer runs
2. Restore token + user profile from cookies
3. Check: Has university? NO
4. Action: Show MANDATORY UniversitySelectorModal (isMandatory=true)
5. User selects university
6. University stored in user profile/cookies
7. Can now browse
```

### Flow 4: Logged In User Navigates to Login/Signup Page

```
1. User is already logged in (state.auth.isAuthenticated = true)
2. Clicking "Log In" or "Sign Up" button → Opens AuthModal (handled by navbar)
3. User can logout via profile page
4. Logout action → Clear auth cookies + localStorage
```

## Usage Guide

### 1. Using Global State in Components

```tsx
"use client";

import { useAppState } from "@/contexts/AppStateContext";

export function MyComponent() {
  const { state, dispatch, login, logout } = useAppState();

  // Check authentication
  if (!state.auth.isAuthenticated) {
    return <div>Please log in</div>;
  }

  // Access user profile
  const { phone, university } = state.user.profile || {};

  // Open auth modal
  const handleLoginClick = () => {
    dispatch({ type: "OPEN_AUTH_MODAL", payload: { defaultTab: "login" } });
  };

  // Logout
  const handleLogout = () => {
    logout();
  };

  return (
    <div>
      <p>Welcome, {phone}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
```

### 2. Opening Auth Modal

From any component:

```tsx
const { dispatch } = useAppState();

// Open login tab
dispatch({ 
  type: "OPEN_AUTH_MODAL", 
  payload: { defaultTab: "login" } 
});

// Open signup tab
dispatch({ 
  type: "OPEN_AUTH_MODAL", 
  payload: { defaultTab: "signup" } 
});
```

### 3. Handling University Selection

```tsx
const { selectUniversity, selectAddress } = useAppState();

// When user selects a university
const university = { id: "1", name: "DU", short: "DU", slug: "du" };
selectUniversity(university);

// When user selects an address/location
const address = { 
  id: "hall-1", 
  universityId: "1", 
  name: "Shahidullah Hall",
  type: "hall" 
};
selectAddress(address);
```

### 4. Reading from Cookies in Server/Actions

If you're in a server action or API route and need to read cookies:

```typescript
// Server-side: Use next/headers
import { cookies } from 'next/headers';

export async function getAuthToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  return token;
}
```

### 5. Custom Hooks for Specific Use Cases

Create custom hooks that leverage the global state:

```tsx
// hooks/useAuthGuard.ts
import { useAppState } from "@/contexts/AppStateContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAuthGuard() {
  const { state } = useAppState();
  const router = useRouter();

  useEffect(() => {
    if (!state.auth.isAuthenticated) {
      router.push("/");
    }
  }, [state.auth.isAuthenticated, router]);

  return state.auth.isAuthenticated;
}

// Usage in protected components
export function ProtectedPage() {
  const isAuth = useAuthGuard();
  if (!isAuth) return null;
  return <div>Protected content here</div>;
}
```

## Cookie Management

### Cookies Used

| Cookie Name | Purpose | Storage | Expiry |
|-------------|---------|---------|--------|
| `accessToken` | JWT for API auth | HTTP-only | 1-7 days |
| `refreshToken` | Refresh JWT | HTTP-only | 30 days |
| `user` | Cached user profile | Regular | 30 days |
| `universityId` | Selected university ID | Regular | On logout |
| `addressId` | Selected address ID | Regular | On logout |

### Helper Functions

```tsx
import { CookieHelper, StorageHelper } from "@/lib/appStateHelper";

// Reading
CookieHelper.getAccessToken();           // → JWT string
CookieHelper.getUserProfile();           // → UserProfile object
CookieHelper.getUniversityId();          // → University ID
CookieHelper.isAuthenticated();          // → boolean
CookieHelper.hasUniversity();            // → boolean

// Writing (via context - recommended)
// Use dispatch() or login() function instead

// Clearing
CookieHelper.clearAll();                 // Clear auth + university
CookieHelper.clearAuth();                // Clear auth only
CookieHelper.clearUniversity();          // Clear university only

// LocalStorage (temporary, not recommended for sensitive data)
StorageHelper.getPendingUniversity();
StorageHelper.setPendingUniversity(univ);
StorageHelper.getUniversitySelectorShown();
StorageHelper.setUniversitySelectorShown(true);
```

## Migration Guide: From Old to New System

### Before (Old Login Page)

```tsx
// pages/login.tsx
import { useRouter } from "@/i18n/navigation";
import { loginAction } from "./actions";

export default function LoginPage() {
  const router = useRouter();
  
  const handleSubmit = async (e) => {
    const result = await loginAction({ phone, pin });
    if (result.success) {
      router.push("/profile");
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### After (Modal-Based)

```tsx
// Any component
import { useAppState } from "@/contexts/AppStateContext";

export function LoginButton() {
  const { dispatch } = useAppState();

  return (
    <button 
      onClick={() => dispatch({ 
        type: "OPEN_AUTH_MODAL", 
        payload: { defaultTab: "login" } 
      })}
    >
      Log In
    </button>
  );
}
// Auth modal automatically renders in LayoutClientProviders
```

## Best Practices

1. **Don't Manually Modify Cookies**: Always use the context API's `dispatch()` or helper functions

2. **Check `isLoading` States**: Especially for async operations
   ```tsx
   if (state.auth.isLoading) return <Spinner />;
   ```

3. **Use Custom Hooks for Complex Logic**: Encapsulate state access in hooks
   ```tsx
   export const useUserProfile = () => {
     const { state } = useAppState();
     return state.user.profile;
   };
   ```

4. **Dispatch Actions Early**: Initialize university selection on app load via AppInitializer

5. **Clear State on Logout**: The `logout()` function handles this automatically

6. **Type Safety**: Always import types from `@/types/global.ts`

## Troubleshooting

### Issue: Auth modal doesn't open
- Check: Is `LayoutClientProviders` wrapping your layout?
- Check: Is `AppInitializer` being rendered?
- Solution: Verify layout.tsx imports and uses `<LayoutClientProviders>`

### Issue: User profile not updating
- Check: Is `loginAction` calling `getMe()` to persist profile?
- Solution: Ensure API response includes full user profile

### Issue: University selector appears multiple times
- Check: Is `StorageHelper.setUniversitySelectorShown(true)` being called?
- Solution: Verify AppInitializer logic runs only once

### Issue: Cookies not persisting
- Check: Are cookies being set with correct path and domain?
- Check: Is browser private/incognito mode?
- Solution: Check cookie settings in API responses

## API Integration Checklist

- [ ] Login endpoint returns `accessToken`, `refreshToken`, and user profile
- [ ] User profile includes `university` and `address` objects
- [ ] Any 401 response triggers token refresh or logout
- [ ] University selector modal calls endpoint to fetch university list
- [ ] Profile update endpoint syncs to global state
- [ ] Logout endpoint clears cookies server-side

## Future Enhancements

- Token refresh logic (currently manual)
- Automatic re-sync when tab becomes active
- Offline support with service workers
- Analytics tracking of authentication flow
- Multi-university support (switching between campuses)
- Guest browsing with anonymous university selection

## File References

- **Types**: [src/types/global.ts](src/types/global.ts)
- **Context**: [src/contexts/AppStateContext.tsx](src/contexts/AppStateContext.tsx)
- **Helpers**: [src/lib/appStateHelper.ts](src/lib/appStateHelper.ts)
- **Modals**: [src/components/modals/](src/components/modals/)
- **Initializer**: [src/components/AppInitializer.tsx](src/components/AppInitializer.tsx)
- **Providers**: [src/components/providers/LayoutClientProviders.tsx](src/components/providers/LayoutClientProviders.tsx)
- **Layout**: [src/app/[locale]/layout.tsx](src/app/[locale]/layout.tsx)
