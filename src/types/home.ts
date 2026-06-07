// Home Feed (SDUI) — shared types for the app-launch shell + server-driven feed.
// Powers `GET /user/home/bootstrap` and `GET /user/home/feed` (see HOME_FEED API doc).
// Both endpoints use OPTIONAL auth: logged-in → campus from JWT; guest → ?university=.

/** Surface requesting the layout. Admins maintain separate layouts per platform. */
export type HomePlatform = "mobile_app" | "web_app";

// ───────────────────────────── Bootstrap ──────────────────────────────────

/** App-version verdict — only present when `?versionCode` was sent; else null. */
export type AppUpdate = {
  forceUpdate: boolean;
  skipUpdate: boolean;
};

/** Feature flag enabled for a campus — drives which tabs/modules the client shows. */
export type HomeFeatureFlag = {
  _id: string;
  university: string;
  isEnabled: boolean;
  assignedBy?: string;
  assignedAt?: string;
  feature: {
    _id: string;
    key: string;
    name: string;
    isActive: boolean;
  };
};

/** On-launch splash / onboarding screen. */
export type HomeSplash = {
  _id: string;
  title: string;
  description?: string;
  mediaUrl?: string;
  link?: string | null;
  isActive: boolean;
};

/** Popup banner surfaced on launch (scope precedence + platform filtered). */
export type HomePopup = {
  _id: string;
  type: string;
  displayType: string;
  scope: string;
  title: string;
  description?: string;
  photo?: { url: string; key?: string; size?: number };
  link?: string | null;
  redirectionType?: string;
  priority?: number;
  isDismissible: boolean;
  isActive: boolean;
};

/** SOS / quick-dial entry — tap dials `phone`. */
export type EmergencyQuickDial = {
  _id: string;
  name: string;
  category: string;
  phone: string;
  position: number;
  isCritical: boolean;
};

export type HomeQuickActions = {
  emergencyQuickDial: EmergencyQuickDial[];
  activeBloodRequests: number;
};

/** Payload of `GET /user/home/bootstrap` (under the `data` envelope). */
export type HomeBootstrap = {
  schemaVersion: number;
  university: string;
  platform: HomePlatform;
  generatedAt: string;
  /** Null unless `?versionCode` was sent. */
  appUpdate: AppUpdate | null;
  features: HomeFeatureFlag[];
  splash: HomeSplash[];
  popups: HomePopup[];
  quickActions: HomeQuickActions;
  notifications: { unread: number };
};

// ─────────────────────────────── Feed ─────────────────────────────────────

/** Layout hint the client renders generically. Unknown values → fall back to carousel/list. */
export type HomeSectionType =
  | "hero"
  | "carousel"
  | "grid"
  | "list"
  | "category_chips"
  | "quick_actions"
  | "map"
  | "banner";

/** "See all" deep-link into a module's own paginated endpoint. */
export type HomeSeeAll = {
  label: string;
  /** App/API path. */
  deeplink: string;
  /** Web route (preferred on web_app). */
  web?: string;
};

/** Uniform shelf item — one card component renders every module. */
export type CardItem = {
  /** Entity id (or tile/code for quick_actions/bus). */
  id: string;
  /** Owning module. */
  module: string;
  title: string;
  /** Shop/owner/category/type — may be null. */
  subtitle?: string | null;
  /** First photo URL — may be null. */
  image?: string | null;
  /** Number or null (free/n-a). */
  price?: number | null;
  /** "Featured"/"Popular"/"LIVE"/type — may be null. */
  badge?: string | null;
  rating?: number | null;
  /** Navigation target (stable identifier; parse trailing id to route yourself). */
  deeplink: string;
  /** Module-specific extras, present on banner/bus/blood. */
  raw?: Record<string, unknown>;
};

/** One shelf in the server-driven feed. */
export type HomeFeedSection = {
  key: string;
  type: HomeSectionType;
  module: string;
  title?: string | null;
  subtitle?: string | null;
  seeAll: HomeSeeAll | null;
  meta: Record<string, unknown>;
  items: CardItem[];
};

/** Payload of `GET /user/home/feed` (under the `data` envelope). */
export type HomeFeed = {
  schemaVersion: number;
  university: string;
  platform: HomePlatform;
  generatedAt: string;
  /** Ordered shelves — render whatever you receive. */
  sections: HomeFeedSection[];
  /** Keys of shelves dropped due to slow/failing modules (resilience signal). */
  failedSections: string[];
};
