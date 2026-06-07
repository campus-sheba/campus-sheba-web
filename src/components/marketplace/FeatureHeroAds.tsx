"use client";

import { useModuleBanners } from "@/modules/home/hooks/useModuleBanners";
import BannerLink from "@/components/banner/BannerLink";
import BannerMedia from "@/components/banner/BannerMedia";

/**
 * Hero banner grid (1 large + 1 small) used on feature landings. Banners are
 * scoped to a module surface via `placement` (e.g. "book", "buy_sell",
 * "blood"); defaults to "home" so existing call sites keep working. Each tile
 * navigates per its `redirectionType` (BANNER_PUBLIC_API.md §9).
 */
export default function FeatureHeroAds({
  universityId,
  placement = "home",
}: {
  universityId?: string;
  placement?: string;
}) {
  const { banners, isLoading, error } = useModuleBanners(placement, universityId);

  if (!universityId) return null;
  if (error) return null;
  if (isLoading && banners.length === 0) {
    return <div className="h-[240px] animate-pulse rounded-2xl bg-gray-100" />;
  }

  const ads = banners.slice(0, 4);
  if (ads.length === 0) return null;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <BannerLink
        banner={ads[0]}
        className="relative block h-[260px] overflow-hidden rounded border border-gray-200 bg-gray-50 lg:col-span-2"
      >
        <BannerMedia banner={ads[0]} priority sizes="(max-width: 1024px) 100vw, 66vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />
      </BannerLink>

      <div className="grid sm:grid-cols-1">
        {ads.slice(1, 2).map((b) => (
          <BannerLink
            key={b._id}
            banner={b}
            className="relative block h-[260px] overflow-hidden rounded border border-gray-200 bg-gray-50"
          >
            <BannerMedia banner={b} sizes="(max-width: 1024px) 50vw, 33vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />
          </BannerLink>
        ))}
      </div>
    </div>
  );
}
