import { useEffect, useState } from "react";
import { fetchHomeBannersByUniversity, type Banner } from "@/services/home";

type UseHomeBannersResult = {
  banners: Banner[];
  isLoading: boolean;
  error: string | null;
  allImagesLoaded: boolean;
  handleImageLoad: () => void;
};

export function useHomeBanners(universityId?: string): UseHomeBannersResult {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);

  useEffect(() => {
    const fetchBanners = async () => {
      if (!universityId) {
        setBanners([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        setImagesLoaded(0);
        setAllImagesLoaded(false);
        const data = await fetchHomeBannersByUniversity(universityId);
        setBanners(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    };
    void fetchBanners();
  }, [universityId]);

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
