// Banner module — shared types for the public/student banner APIs.
// Mirrors the "Banner object reference" in BANNER_PUBLIC_API.md (§4–§5).
// Banners power hero sliders, inline promo strips, module sliders and launch
// popups. The canonical runtime endpoint is `GET /banners/resolve` (§6.1),
// which applies scope fallback, platform + placement filtering and the active
// (start/end) date window server-side.

/** Where the campaign is rendered. */
export type BannerDisplayType = "banner" | "popup";

/** Client the campaign targets. */
export type BannerPlatform = "mobile_app" | "web_app";

/** Campaign family. */
export type BannerType = "home" | "category";

/** How the media is rendered. */
export type BannerContentType = "image" | "gif" | "youtube_video";

/** Computed server-side targeting tier (read-only for clients). */
export type BannerScope = "global" | "university" | "university-category";

/**
 * Navigation contract (§5.6). Prefer `redirectionType` + `referenceIds` over the
 * raw `link`/`webLink`. Unknown/`none` values fall back to `webLink`/`link`.
 */
export type BannerRedirectionType =
  // Module home
  | "module_home"
  | "module_book"
  | "module_product"
  | "module_food"
  | "module_parcel"
  | "module_skill"
  | "module_buy_sell"
  | "module_campus_mart"
  | "module_lost_found"
  | "module_blood"
  | "module_tuition"
  | "module_job"
  | "module_rider_ops"
  // Entity detail
  | "product_details"
  | "book_details"
  | "food_details"
  | "buy_sell_details"
  | "skill_details"
  | "parcel_details"
  | "lost_found_details"
  | "order_details"
  | "shop_details"
  // Listing / filter
  | "shop_wise_product"
  | "category_wise_product"
  | "brand_wise_product"
  | "category_page"
  | "category_list"
  | "feature_page"
  | "offer_page"
  // External
  | "web_link"
  // No action
  | "none";

/** Media descriptor — always present on read (§4). */
export type BannerPhoto = {
  /** CDN/public URL to display. */
  url: string;
  /** Cloudinary public_id (admin delete/replace). */
  key?: string;
  /** File size in bytes. */
  size?: number;
};

/**
 * Full banner document returned by list, get-by-id and resolve endpoints.
 * Most fields are optional because the resolve endpoint trims the payload and
 * popups/sliders only populate the fields they need.
 */
export type Banner = {
  _id: string;
  type?: BannerType;
  displayType?: BannerDisplayType;
  scope?: BannerScope;
  placement?: string;
  /** Legacy single target (first of `platforms[]`). */
  platform?: BannerPlatform;
  platforms?: BannerPlatform[];
  contentType?: BannerContentType;
  /** null for global scope. */
  university?: string | null;
  /** set for university-category scope. */
  category?: string | null;
  isActive?: boolean;
  photo?: BannerPhoto;
  /** Optional alt media (GIF / YouTube URL). */
  mediaUrl?: string | null;
  title?: string;
  description?: string;
  startDate?: string | null;
  endDate?: string | null;
  priority?: number;
  /** In-app route hint (mobile). */
  link?: string | null;
  /** Explicit web URL. */
  webLink?: string | null;
  /** Structured navigation (§5.6). */
  redirectionType?: BannerRedirectionType | string;
  /** Entity IDs for detail redirects. */
  referenceIds?: string[];
  // Popup-only behaviour (client-enforced — see §8.3)
  isDismissible?: boolean;
  /** Max impressions per user; client persists the count. */
  frequencyCapPerUser?: number;
  /** Suppress after the first dismiss within a session. */
  showOncePerSession?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

/** Query parameters accepted by `GET /banners/resolve` (§6.1). */
export type BannerResolveQuery = {
  displayType?: BannerDisplayType;
  platform?: BannerPlatform;
  type?: BannerType;
  /** Module surface key (defaults to "home" server-side). */
  placement?: string;
  /** Campus MongoDB id. */
  universityId?: string;
  /** Category MongoDB id (requires `universityId` for the uni-category tier). */
  categoryId?: string;
  /** Max items, 1–50 (default 10). */
  limit?: number;
};

/** Envelope returned by resolve (§2). */
export type BannerResolveResponse = {
  data: Banner[];
  total?: number;
  limit?: number;
  appliedFallbackOrder?: string[];
};
