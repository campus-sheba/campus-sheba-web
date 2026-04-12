import type { Metadata } from "next";
import CampusMartHomeTemplate from "@/modules/marketplace/templates/CampusMartHomeTemplate";
import {
  fetchCampusMartCategories,
  fetchCampusMartNewArrivals,
  fetchMarketplaceFeaturedProducts,
  fetchMartRetailShops,
  getMarketplaceUniversityId,
} from "@/services/marketplace";

export const metadata: Metadata = {
  title: "Campus Mart",
  description: "Official campus shops and retail products — not preloved listings.",
};

export default async function MarketplacePage() {
  const universityId = await getMarketplaceUniversityId();

  const [categories, shopsRes, featuredRes, newArrivals] = await Promise.all([
    fetchCampusMartCategories(universityId ?? undefined),
    fetchMartRetailShops(universityId ?? undefined, 1, 12),
    fetchMarketplaceFeaturedProducts(universityId ?? undefined, 1, 14),
    fetchCampusMartNewArrivals(universityId ?? undefined, 16),
  ]);

  return (
    <CampusMartHomeTemplate
      universityId={universityId}
      categories={categories}
      shops={shopsRes.data}
      featured={featuredRes.data}
      newArrivals={newArrivals}
    />
  );
}
