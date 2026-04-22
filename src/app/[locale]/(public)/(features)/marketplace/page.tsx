import type { Metadata } from "next";
import CampusMartHomeTemplate from "@/modules/marketplace/templates/CampusMartHomeTemplate";
import { fetchMarketplaceHomeFeed, getMarketplaceUniversityId } from "@/services/marketplace";
import type { BuySellCategory } from "@/types/buy-sell";

export const metadata: Metadata = {
  title: "Campus Mart",
  description: "Official campus shops and retail products — not preloved listings.",
};

export default async function MarketplacePage() {
  const universityId = await getMarketplaceUniversityId();
  const feed = await fetchMarketplaceHomeFeed(universityId ?? undefined);

  return (
    <CampusMartHomeTemplate
      universityId={universityId}
      categories={feed.categories as BuySellCategory[]}
      shops={feed.featuredShops}
      featured={feed.featuredProducts}
      newArrivals={feed.latestProducts}
    />
  );
}
