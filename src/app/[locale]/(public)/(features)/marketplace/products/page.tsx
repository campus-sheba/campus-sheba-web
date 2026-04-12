import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import CampusMartProductsTemplate from "@/modules/marketplace/templates/CampusMartProductsTemplate";
import { fetchMarketplaceProducts, getMarketplaceUniversityId } from "@/services/marketplace";

export const metadata: Metadata = {
  title: "Products — Campus Mart",
  description: "Browse retail products from campus shops.",
};

type Search = Promise<{ categoryId?: string; featured?: string; sort?: string }>;

export default async function MarketplaceProductsPage({ searchParams }: { searchParams: Search }) {
  const universityId = await getMarketplaceUniversityId();
  const sp = await searchParams;
  const isFeatured = sp.featured === "1" || sp.featured === "true";
  const sortNewest = sp.sort === "newest";

  const { data } = await fetchMarketplaceProducts(universityId ?? undefined, {
    page: 1,
    limit: 60,
    categoryId: sp.categoryId,
    isFeatured: isFeatured ? true : undefined,
    sortBy: sortNewest ? "newest" : undefined,
    sortOrder: sortNewest ? "desc" : undefined,
  });

  const t = await getTranslations("common.campusMart");
  let filterSummary: string | undefined;
  if (sp.categoryId) filterSummary = t("filterByCategory");
  else if (isFeatured) filterSummary = t("filterFeatured");
  else if (sortNewest) filterSummary = t("filterNewest");

  return (
    <CampusMartProductsTemplate
      universityId={universityId}
      products={data}
      filterSummary={filterSummary}
    />
  );
}
