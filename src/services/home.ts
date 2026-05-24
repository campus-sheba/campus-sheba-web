"use server";

import { getPublic } from "@/utils/api/get";
import { landingPageEndpoints } from "@/utils/endpoints/endpoints";
import type { UniversityFeature } from "@/components/siteSettings/navbar/navbar.constants";

export type BannerResolveItem = {
  _id: string;
  title: string;
  description?: string;
  photo?: { url: string; key?: string };
  link?: string;
  displayType?: string;
  platform?: string;
};

export async function fetchBannersResolve(opts: {
  displayType: "popup" | "banner";
  platform?: string;
  universityId?: string;
  /** Module surface to resolve banners for (e.g. "home", "book", "blood"). */
  placement?: string;
}): Promise<BannerResolveItem[]> {
  const params = new URLSearchParams();
  params.set("displayType", opts.displayType);
  params.set("platform", opts.platform ?? "web_app");
  if (opts.placement) params.set("placement", opts.placement);
  if (opts.universityId) params.set("university", opts.universityId);
  try {
    const res = await getPublic<{ data?: BannerResolveItem[] }>(
      landingPageEndpoints.bannersResolve(params.toString()),
      { universityId: opts.universityId, includeUniversity: false },
    );
    return Array.isArray(res.data) ? res.data : [];
  } catch {
    return [];
  }
}

export interface Banner {
  _id: string;
  title: string;
  description: string;
  photo?: { url: string };
  link?: string;
}

export async function fetchHomeBannersByUniversity(universityId: string): Promise<Banner[]> {
  if (!universityId) return [];
  const response = await getPublic<{ data?: Banner[] }>(
    landingPageEndpoints.heroBannerByUniversity(universityId),
    { universityId },
  );
  return response.data ?? [];
}

/**
 * Banners for a specific module surface (placement), e.g. "book", "buy_sell",
 * "blood", "campus_map", "transport". Uses the resolve endpoint so it inherits
 * the university → global fallback, active-window (start/end) scheduling, and
 * platform targeting. Placement keeps each module's banners isolated (and off
 * the Home feed). Returns the shared {@link Banner} shape used by the banner UIs.
 */
export async function fetchModuleBanners(
  placement: string,
  universityId?: string,
): Promise<Banner[]> {
  if (!placement) return [];
  const items = await fetchBannersResolve({
    displayType: "banner",
    platform: "web_app",
    placement,
    universityId,
  });
  return items.map((item) => ({
    _id: item._id,
    title: item.title ?? "",
    description: item.description ?? "",
    photo: item.photo,
    link: item.link,
  }));
}

/** Promotional banners for feature hubs (e.g. home, mart, food). Falls back to empty if type unsupported. */
export async function fetchBannersByUniversityAndType(
  universityId: string,
  bannerType: "home" | "mart" | "food" | string = "home",
): Promise<Banner[]> {
  if (!universityId) return [];
  try {
    const response = await getPublic<{ data?: Banner[] }>(
      landingPageEndpoints.heroBannerByUniversityAndType(universityId, bannerType),
      { universityId },
    );
    const rows = response.data ?? [];
    if (rows.length > 0) return rows;
  } catch {
    /* type may not exist on API */
  }
  if (bannerType !== "home") {
    return fetchHomeBannersByUniversity(universityId);
  }
  return [];
}

export async function fetchUniversityFeatures(universityId: string): Promise<UniversityFeature[]> {
  if (!universityId) return [];
  const response = await getPublic<{ data?: Array<{ feature?: UniversityFeature }> }>(
    landingPageEndpoints.universityFeatures(universityId),
    { universityId },
  );
  return (response.data ?? [])
    .map((item) => item.feature)
    .filter((feature): feature is UniversityFeature => Boolean(feature));
}
