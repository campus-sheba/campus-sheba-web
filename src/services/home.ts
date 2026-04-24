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
}): Promise<BannerResolveItem[]> {
  const params = new URLSearchParams();
  params.set("displayType", opts.displayType);
  params.set("platform", opts.platform ?? "web_app");
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
