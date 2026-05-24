import { useEffect, useState } from "react";
import { fetchModuleBanners, type Banner } from "@/services/home";

type UseModuleBannersResult = {
  banners: Banner[];
  isLoading: boolean;
  error: string | null;
  allImagesLoaded: boolean;
  handleImageLoad: () => void;
};

/**
 * Banners for a single module surface (placement) — e.g. "book", "buy_sell",
 * "blood", "campus_map", "transport". Mirrors {@link useHomeBanners} so banner
 * UIs can swap to per-module targeting without other changes. Resolves with the
 * backend's university → global fallback; if a campus has no module banner it
 * simply returns an empty list (the caller decides whether to hide the strip).
 */
export function useModuleBanners(
  placement: string,
  universityId?: string,
): UseModuleBannersResult {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!placement) {
        setBanners([]);
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        setError(null);
        setImagesLoaded(0);
        setAllImagesLoaded(false);
        const data = await fetchModuleBanners(placement, universityId);
        setBanners(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    };
    void run();
  }, [placement, universityId]);

  useEffect(() => {
    if (!isLoading && banners.length > 0 && imagesLoaded === banners.length) {
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
