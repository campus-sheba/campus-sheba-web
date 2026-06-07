"use server";

// Banner module service — wraps the public `GET /banners/resolve` endpoint
// (BANNER_PUBLIC_API.md §6.1), the canonical runtime source for every banner
// surface (hero sliders, module strips, launch popups). Resolve applies scope
// fallback (university-category → university → global), platform + placement
// filtering and the active (start/end) date window server-side, so clients only
// pass context and render the ordered result.

import { getPublic } from "@/utils/api/get";
import { landingPageEndpoints } from "@/utils/endpoints/endpoints";
import type {
  Banner,
  BannerResolveQuery,
  BannerResolveResponse,
} from "@/types/banner";

const DEFAULT_PLATFORM = "web_app";

/**
 * Resolve active campaigns for a surface. Returns the ordered `data` array
 * (already priority-sorted by the backend). Never throws — on error it returns
 * an empty list so a missing campaign simply hides the strip.
 */
export async function resolveBanners(query: BannerResolveQuery): Promise<Banner[]> {
  const params = new URLSearchParams();
  params.set("displayType", query.displayType ?? "banner");
  params.set("platform", query.platform ?? DEFAULT_PLATFORM);
  if (query.type) params.set("type", query.type);
  if (query.placement) params.set("placement", query.placement);
  if (query.universityId) params.set("university", query.universityId);
  // Category only takes effect alongside a university (uni-category tier).
  if (query.categoryId && query.universityId) {
    params.set("category", query.categoryId);
  }
  if (query.limit) params.set("limit", String(query.limit));

  try {
    const res = await getPublic<BannerResolveResponse>(
      landingPageEndpoints.bannersResolve(params.toString()),
      // We set `university` explicitly above; resolve never reads the JWT, so
      // disable the cookie auto-injection to keep the query deterministic.
      { universityId: query.universityId, includeUniversity: false },
    );
    return Array.isArray(res?.data) ? res.data : [];
  } catch {
    return [];
  }
}

/**
 * Banners for a single module surface (placement) — e.g. "home", "book",
 * "buy_sell", "blood", "food". Thin wrapper over {@link resolveBanners} kept for
 * call-site readability; inherits the university → global fallback.
 */
export async function fetchModuleBanners(
  placement: string,
  universityId?: string,
  opts: { categoryId?: string; type?: BannerResolveQuery["type"]; limit?: number } = {},
): Promise<Banner[]> {
  if (!placement) return [];
  return resolveBanners({
    displayType: "banner",
    platform: DEFAULT_PLATFORM,
    placement,
    universityId,
    categoryId: opts.categoryId,
    type: opts.type,
    limit: opts.limit,
  });
}

/** Home hero carousel — `placement=home` (also matches legacy home records). */
export async function fetchHomeBanners(universityId?: string): Promise<Banner[]> {
  return fetchModuleBanners("home", universityId, { limit: 10 });
}

/** Launch popups for a campus — `displayType=popup` (§6.1 use case D). */
export async function fetchPopupBanners(
  universityId?: string,
  opts: { placement?: string; limit?: number } = {},
): Promise<Banner[]> {
  return resolveBanners({
    displayType: "popup",
    platform: DEFAULT_PLATFORM,
    placement: opts.placement,
    universityId,
    limit: opts.limit ?? 3,
  });
}
