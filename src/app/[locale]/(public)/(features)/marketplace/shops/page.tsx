import type { Metadata } from "next";
import CampusMartShopsTemplate from "@/modules/marketplace/templates/CampusMartShopsTemplate";
import { fetchMartRetailShops, getMarketplaceUniversityId } from "@/services/marketplace";

export const metadata: Metadata = {
  title: "Stores — Campus Mart",
  description: "Browse official campus stores and outlets.",
};

export default async function MarketplaceShopsPage() {
  const universityId = await getMarketplaceUniversityId();
  const { data } = await fetchMartRetailShops(universityId ?? undefined, 1, 60);

  return <CampusMartShopsTemplate universityId={universityId} shops={data} />;
}
