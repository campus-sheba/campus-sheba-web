import { useBanners, type UseBannersResult } from "./useBanners";

/**
 * Banners for a single module surface (placement) — e.g. "book", "buy_sell",
 * "blood", "campus_map", "transport", "food". Thin wrapper over {@link useBanners}.
 *
 * Resolves with the backend's university → global fallback; if a campus has no
 * module banner it simply returns an empty list (the caller decides whether to
 * hide the strip). Pass `categoryId` to opt into the university-category tier.
 */
export function useModuleBanners(
  placement: string,
  universityId?: string,
  opts: { categoryId?: string; limit?: number } = {},
): UseBannersResult {
  return useBanners({
    placement,
    universityId,
    categoryId: opts.categoryId,
    limit: opts.limit,
  });
}
