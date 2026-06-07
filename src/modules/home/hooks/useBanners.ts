import { useEffect, useState } from "react";
import { resolveBanners } from "@/services/banner";
import type { Banner, BannerResolveQuery } from "@/types/banner";

export type UseBannersResult = {
  banners: Banner[];
  isLoading: boolean;
  error: string | null;
  /** True once every rendered banner image has fired `onLoad` (avoids CLS). */
  allImagesLoaded: boolean;
  /** Pass to each banner <Image onLoad>. */
  handleImageLoad: () => void;
};

/**
 * Canonical banner hook — resolves active campaigns for a surface via
 * `GET /banners/resolve` (scope fallback + platform + placement + date window
 * applied server-side). Backs {@link useHomeBanners} and {@link useModuleBanners}.
 *
 * Returns an empty list (not an error) when no campaign matches, so callers can
 * simply hide the strip. Tracks image-load progress for a shimmer→content swap.
 */
export function useBanners(query: BannerResolveQuery): UseBannersResult {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);

  const { displayType, platform, type, placement, universityId, categoryId, limit } =
    query;

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setImagesLoaded(0);
        setAllImagesLoaded(false);
        const data = await resolveBanners({
          displayType,
          platform,
          type,
          placement,
          universityId,
          categoryId,
          limit,
        });
        if (!cancelled) setBanners(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [displayType, platform, type, placement, universityId, categoryId, limit]);

  useEffect(() => {
    if (!isLoading && banners.length > 0 && imagesLoaded >= banners.length) {
      setAllImagesLoaded(true);
    }
  }, [imagesLoaded, banners.length, isLoading]);

  return {
    banners,
    isLoading,
    error,
    allImagesLoaded,
    handleImageLoad: () => setImagesLoaded((prev) => prev + 1),
  };
}
