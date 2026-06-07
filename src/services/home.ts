"use server";

import { getPublic } from "@/utils/api/get";
import { homeEndpoints, landingPageEndpoints } from "@/utils/endpoints/endpoints";
import type { UniversityFeature } from "@/components/siteSettings/navbar/navbar.constants";
import type { HomeBootstrap, HomeFeed, HomePlatform } from "@/types/home";

// Banner resolution lives in `@/services/banner` (resolveBanners + helpers).
// This module owns the server-driven home feed (SDUI) and campus features.

// ───────────────────────── Server-driven home (SDUI) ──────────────────────
// Both endpoints use OPTIONAL auth. `getPublic` forwards the access token when
// present (logged-in → campus from JWT) and auto-injects `?university=` from
// the cookie otherwise (guest), exactly matching the contract.

function unwrapData<T>(response: unknown): T | null {
  if (!response || typeof response !== "object") return null;
  const r = response as Record<string, unknown>;
  if (r.data && typeof r.data === "object") return r.data as T;
  return null;
}

/**
 * GET /user/home/bootstrap — app-launch shell.
 * Pass `versionCode` to receive an `appUpdate` verdict (else it is null).
 */
export async function fetchHomeBootstrapAction(
  opts: { platform?: HomePlatform; versionCode?: string; universityId?: string } = {},
) {
  try {
    const q = new URLSearchParams();
    q.set("platform", opts.platform ?? "web_app");
    if (opts.versionCode) q.set("versionCode", opts.versionCode);
    const res = await getPublic<unknown>(`${homeEndpoints.bootstrap}?${q.toString()}`, {
      universityId: opts.universityId,
    });
    return { success: true as const, data: unwrapData<HomeBootstrap>(res) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load home bootstrap";
    return { success: false as const, message, data: null as HomeBootstrap | null };
  }
}

/**
 * GET /user/home/feed — the scrollable home screen (ordered shelves).
 * Forgiving by design: a valid request returns 200; partial failures surface
 * in `data.failedSections`, not the HTTP status. Always render `data.sections`.
 */
export async function fetchHomeFeedAction(
  opts: { platform?: HomePlatform; universityId?: string } = {},
) {
  try {
    const q = new URLSearchParams();
    q.set("platform", opts.platform ?? "web_app");
    const res = await getPublic<unknown>(`${homeEndpoints.feed}?${q.toString()}`, {
      universityId: opts.universityId,
    });
    return { success: true as const, data: unwrapData<HomeFeed>(res) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load home feed";
    return { success: false as const, message, data: null as HomeFeed | null };
  }
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
