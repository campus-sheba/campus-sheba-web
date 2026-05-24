"use client";

import Image from "next/image";
import { useModuleBanners } from "@/modules/home/hooks/useModuleBanners";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";

/**
 * Hero banner grid (1 large + 1 small) used on feature landings. Banners are
 * scoped to a module surface via `placement` (e.g. "book", "buy_sell",
 * "blood"); defaults to "home" so existing call sites keep working.
 */
export default function FeatureHeroAds({
  universityId,
  placement = "home",
}: {
  universityId?: string;
  placement?: string;
}) {
  const { banners, isLoading, error } = useModuleBanners(
    placement,
    universityId,
  );

  console.log("banners", banners);

  if (!universityId) return null;
  if (error) return null;
  if (isLoading && banners.length === 0) {
    return <div className="h-[240px] animate-pulse rounded-2xl bg-gray-100" />;
  }

  const ads = (banners ?? []).slice(0, 4);
  if (ads.length === 0) return null;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="relative h-[260px] overflow-hidden rounded border border-gray-200 bg-gray-50 lg:col-span-2">
        <Image
          src={ads[0]?.photo?.url || "/placeholder.jpg"}
          alt={ads[0]?.title || "Banner"}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 66vw"
          unoptimized={shouldUnoptimizeRemoteImage(ads[0]?.photo?.url || "")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />
      </div>

      <div className="grid sm:grid-cols-1">
        {ads.slice(1, 2).map((b) => (
          <div
            key={b._id}
            className="relative h-[260px] overflow-hidden rounded border border-gray-200 bg-gray-50"
          >
            <Image
              src={b.photo?.url || "/placeholder.jpg"}
              alt={b.title || "Banner"}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 50vw, 33vw"
              unoptimized={shouldUnoptimizeRemoteImage(b.photo?.url || "")}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />
          </div>
        ))}
      </div>
    </div>
  );
}
