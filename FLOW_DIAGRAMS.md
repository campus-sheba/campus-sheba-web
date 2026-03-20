# Campus Sheba Global State - Visual Flows

## 1. App Initialization Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    App Loads (Page Refresh)                 │
└─────────────────────────────────────────────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │ AppStateProvider  │
                    │  initializes      │
                    │  (useEffect)      │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
        ┌─────▼────┐   ┌────▼─────┐   ┌───▼───────┐
        │ Read      │   │ Read      │   │ Read      │
        │accessToken│   │refreshTok │   │ user      │
        │cookie     │   │cookie     │   │ cookie    │
        └─────┬────┘   └────┬─────┘   └───┬───────┘
              │             │             │
              └─────────────┼─────────────┘
                            │
             ┌──────────────▼──────────────┐
             │  Check: "Is user logged in"?    │
             └──────────────┬──────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
      ┌───▼────┐        ┌───▼────┐      ┌────▼────┐
      │  YES   │        │  NO    │      │  NO     │
      │(token) │        │(no tok)│      │(no tok)+│
      └───┬────┘        └───┬────┘      │(no univ)│
          │                 │           └────┬────┘
          │                 │                │
    ┌─────▼────────┐   ┌────▼─────┐   ┌─────▼──────┐
    │Restore from  │   │ Check:    │   │SHOW:      │
    │cookies to    │   │ "University"  │ MANDATORY │
    │global state  │   │ in cookie?"   │ University│
    │             │   └────┬─────┘   │ Selector  │
    └─────┬────────┘        │        │ Modal     │
          │            ┌────┴────┐   └─────┬──────┘
          │            │         │         │
          │       ┌────▼───┐ ┌──▼────┐ ┌──▼────┐
          │       │  YES   │ │  NO   │ │        │
          │       │(use it)│ │(skip) │ │        │
          │       └────┬───┘ └──┬────┘ │        │
          │            │        │      │        │
          └────────────┼────────┼──────┼────────┘
                       │        │      │
                ┌──────▼────────▼──────▼──┐
                │  State Initialized ✓    │
                │  App Ready to Render    │
                └─────────────────────────┘
```

## 2. New User Journey

```
┌──────────────────────────────────────────────────────────────┐
│ Fresh User Visits campussheba.com (No Token, No University)  │
└──────────────────────────────────────────────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │ MANDATORY:        │
                    │ University Modal  │
                    │ Auto-Opens        │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │ User Picks:       │
                    │ - University      │
                    │ - Address/Hall    │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │ Store to:         │
                    │  localStorage     │
                    │  (temp storage)   │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │ Modal Closes      │
                    │ User can browse   │
                    │ (no auth needed)  │
                    └────────┬─────────┘
                             │
                    ┌────────▼──────────────┐
                    │ User clicks:          │
                    │ "Get Started Free" or │
                    │ "Sign Up"             │
                    └────────┬──────────────┘
                             │
                    ┌────────▼──────────────┐
                    │ AuthModal Opens       │
                    │ (Signup Tab)          │
                    │ 3 Steps:              │
                    │ 1. Phone number       │
                    │ 2. OTP verification   │
                    │ 3. Name + PIN         │
                    └────────┬──────────────┘
                             │
                    ┌────────▼──────────────┐
                    │ Signup Success!       │
                    │ API Returns:          │
                    │ - accessToken         │
                    │ - refreshToken        │
                    │ - user profile        │
                    └────────┬──────────────┘
                             │
                    ┌────────▼──────────────┐
                    │ Store to Cookies:     │
                    │ - accessToken         │
                    │ - refreshToken        │
                    │ - user profile        │
                    │ - university_id       │
                    │ (from localStorage)   │
                    └────────┬──────────────┘
                             │
                    ┌────────▼──────────────┐
                    │ Update Global State   │
                    │  - isAuthenticated: ✓ │
                    │  - profile loaded     │
                    │  - university set     │
                    └────────┬──────────────┘
                             │
                    ┌────────▼──────────────┐
                    │ AuthModal Closes      │
                    │ Navbar shows:         │
                    │ - Profile Icon        │
                    │ - Wallet Points       │
                    │ - Address in Header   │
                    └────────┬──────────────┘
                             │
                    ┌────────▼──────────────┐
                    │ User is NOW:          │
                    │  ✓ Logged In          │
                    │  ✓ University Set     │
                    │  ✓ Address Set        │
                    │  ✓ Can Access All     │
                    │    Services           │
                    └──────────────────────┘
```

## 3. Returning User Journey

```
┌────────────────────────────────────────────────────────────┐
│ Returning User (Has Token in Cookie)                        │
└────────────────────────────────────────────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │ Page Loads        │
                    │(Same URL)         │
                    └────────┬─────────┘
                             │
                    ┌────────▼────────────────┐
                    │ AppStateProvider        │
                    │ useEffect:              │
                    │ - Read token cookie     │
                    │ - Read user cookie      │
                    │ - Read university_id    │
                    │   cookie                │
                    └────────┬────────────────┘
                             │
              ┌──────────────▼──────────────┐
              │ Restore ALL to Global State │
              │ INSTANT (cookies loaded)    │
              └──────────────┬───────────────┘
                             │
                    ┌────────▼──────────────┐
                    │ App Renders with:     │
                    │ ✓ User Profile Loaded │
                    │ ✓ University Set      │
                    │ ✓ Address Set         │
                    │ ✓ Logger In           │
                    │ NO modals shown       │
                    │ NO prompts            │
                    └────────┬──────────────┘
                             │
                    ┌────────▼──────────────┐
                    │ Navbar Shows:         │
                    │ ✓ Profile Icon        │
                    │ ✓ Wallet Points       │
                    │ ✓ User Address        │
                    │ in Header             │
                    │ READY TO USE          │
                    └──────────────────────┘
                             │
                    ┌────────▼──────────────┐
                    │ BONUS: Fast Load!     │
                    │ No loading spinners   │
                    │ No API calls needed   │
                    │ Data in cookies ✓     │
                    └──────────────────────┘
```

## 4. Component Interaction Diagram

```
LayoutClientProviders
 ├─ AppStateProvider (Context)
 │   ├─ state reducer
 │   ├─ useAppState() hook
 │   └─ dispatch actions
 │
 ├─ AppInitializer
 │   ├─ Checks: token, university
 │   ├─ Fires: OPEN_UNIVERSITY_SELECTOR
 │   └─ Runs once per session
 │
 ├─ Layout Content
 │   ├─ Navbar (uses useAppState)
 │   │   ├─ isLoggedIn = state.auth.isAuthenticated
 │   │   ├─ onClick: dispatch(OPEN_AUTH_MODAL)
 │   │   └─ onClick: dispatch(OPEN_UNIVERSITY_SELECTOR)
 │   │
 │   ├─ Page Content
 │   │   └─ Any component can useAppState()
 │   │
 │   ├─ Footer
 │   │
 │   └─ AuthModal (global, rendered here)
 │       ├─ Login Tab
 │       ├─ Signup Tab (3 steps)
 │       └─ onSuccess: call login()
 │
 └─ UniversitySelectorModal (global, rendered here)
     ├─ University Grid
     ├─ Location Grid
     ├─ Skip/Continue buttons
     └─ onSave: call selectUniversity()
```

## 5. State Update Flow

```
    User Action (Click Button)
            │
            ▼
    ┌───────────────────┐
    │ dispatch(action)  │
    │                   │
    │ e.g., LOGIN:      │
    │ {                 │
    │   token: "...",   │
    │   refresh: "..",  │
    │ }                 │
    └────────┬──────────┘
             │
             ▼
    ┌──────────────────────┐
    │ Reducer Processes:   │
    │ Returns new state    │
    └────────┬─────────────┘
             │
             ▼
    ┌──────────────────────┐
    │ Context Re-provides  │
    │ Updated State        │
    └────────┬─────────────┘
             │
             ▼
    ┌──────────────────────┐
    │ Components rerenders │
    │ with new state       │
    │                      │
    │ useAppState() hook   │
    │ returns new values   │
    └────────┬─────────────┘
             │
             ▼
    ┌──────────────────────┐
    │ ALSO: Side effects   │
    │ (if needed):         │
    │                      │
    │ - Save to cookies    │
    │ - Call API           │
    │ - Show/hide modals   │
    └──────────────────────┘
```

## 6. Cookie Lifecycle

```
┌─────────────────────────────────────────────────────────┐
│                   Browser Storage                       │
├─────────────────────────────────────────────────────────┤
│  Cookies:                 localStorage:                 │
│  ─────────────────────    ──────────────────────       │
│  accessToken     [1-7d]   pending_university [temp]    │
│  refreshToken    [30d]    pending_address [temp]       │
│  user (profile)  [30d]    university_selector_shown    │
│  universityId    [logout] [temp]                       │
│  addressId       [logout]                              │
│  timeZone        [session]                             │
└─────────────────────────────────────────────────────────┘

On Login:
  ✓ Set: accessToken, refreshToken, user (profile)
  ✓ Clear: localStorage temps

On Logout:
  ✗ Delete: accessToken, refreshToken, user
  ✗ Delete: universityId, addressId
  ✓ Clear: localStorage temps

On University Select (not logged in):
  ✓ Set: pending_university in localStorage
  ✓ Set: university_selector_shown = true

On Signup:
  ✓ Transfer: pending_university → cookies
  ✓ Clear: localStorage temps
```

---

**Key Insight**: The entire user state (auth, profile, university, address) persists across page reloads via cookies. No API calls needed to "re-login" - everything restores from cookies automatically.
