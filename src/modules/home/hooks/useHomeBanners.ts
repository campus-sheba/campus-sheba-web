import { useBanners, type UseBannersResult } from "./useBanners";

/**
 * Home hero carousel banners — `placement=home` (also matches legacy records
 * with no placement). Thin wrapper over {@link useBanners}.
 */
export function useHomeBanners(universityId?: string): UseBannersResult {
  return useBanners({ placement: "home", universityId, limit: 10 });
}
