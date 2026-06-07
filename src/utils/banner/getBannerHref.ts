// Shared banner-tap handler for the web client — implements the redirection
// matrix in BANNER_PUBLIC_API.md §9. Use ONE resolver for every banner surface
// (home hero, module sliders, launch popups) so navigation stays consistent.
//
// Contract: prefer `redirectionType` + `referenceIds`; fall back to `webLink`
// then `link` when the type is `none`/`web_link`/unknown. Returns `null` when a
// banner is non-interactive so callers can render a plain (non-clickable) slide.

import type { Banner, BannerRedirectionType } from "@/types/banner";

export type BannerHref = {
  /** Resolved destination, or null when the banner has no action. */
  href: string | null;
  /** True when the href should open via a native anchor / new tab (off-site). */
  isExternal: boolean;
};

const NON_INTERACTIVE: BannerHref = { href: null, isExternal: false };

/** Module-home redirection types → web route. */
const MODULE_ROUTES: Partial<Record<BannerRedirectionType, string>> = {
  module_home: "/",
  module_food: "/food",
  module_book: "/books",
  module_product: "/marketplace/products",
  module_buy_sell: "/buy-sell",
  module_campus_mart: "/marketplace",
  module_parcel: "/parcel",
  module_lost_found: "/lost-found",
  module_blood: "/blood-bank",
  module_skill: "/explore",
};

/** Entity-detail redirection types → `(id) => route`. */
const DETAIL_ROUTES: Partial<Record<BannerRedirectionType, (id: string) => string>> = {
  product_details: (id) => `/marketplace/products/${id}`,
  book_details: (id) => `/books/${id}`,
  food_details: (id) => `/food/${id}`,
  buy_sell_details: (id) => `/buy-sell/${id}`,
  lost_found_details: (id) => `/lost-found/${id}`,
  parcel_details: (id) => `/parcel/${id}`,
  shop_details: (id) => `/marketplace/shops/${id}`,
  shop_wise_product: (id) => `/marketplace/shops/${id}`,
  category_wise_product: (id) => `/marketplace/products?category=${id}`,
};

function isHttp(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

/** Fall back to the explicit web URL, then the mobile route hint. */
function fallbackHref(banner: Banner): BannerHref {
  const web = banner.webLink?.trim();
  if (web) return { href: web, isExternal: isHttp(web) };
  const link = banner.link?.trim();
  if (link) return { href: link, isExternal: isHttp(link) };
  return NON_INTERACTIVE;
}

/**
 * Resolve a banner's web destination. Pure — safe to call during render.
 */
export function getBannerHref(banner: Banner | null | undefined): BannerHref {
  if (!banner) return NON_INTERACTIVE;

  const type = banner.redirectionType as BannerRedirectionType | undefined;
  const refId = banner.referenceIds?.[0];

  // Explicit no-action.
  if (type === "none") return fallbackHref(banner);

  // External link — always defer to webLink/link.
  if (type === "web_link") return fallbackHref(banner);

  // Module home routes.
  if (type && MODULE_ROUTES[type]) {
    return { href: MODULE_ROUTES[type]!, isExternal: false };
  }

  // Entity-detail routes (need referenceIds[0]).
  if (type && DETAIL_ROUTES[type] && refId) {
    return { href: DETAIL_ROUTES[type]!(refId), isExternal: false };
  }

  // Unknown / unhandled type → fall back to raw links.
  return fallbackHref(banner);
}

/** Convenience: whether a banner is tappable at all. */
export function isBannerInteractive(banner: Banner | null | undefined): boolean {
  return getBannerHref(banner).href !== null;
}
