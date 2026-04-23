import type { Metadata } from "next";
import CampusFoodHomeTemplate from "@/modules/food/templates/CampusFoodHomeTemplate";
import type { BuySellCategory } from "@/types/buy-sell";
import {
  fetchFoodHomeFeed,
  fetchFoodOutletShops,
  fetchMarketplaceFoods,
  getMarketplaceUniversityId,
} from "@/services/marketplace";

export const metadata: Metadata = {
  title: "Food",
  description: "Food from approved campus food outlets.",
};

type PageProps = {
  searchParams?: Promise<{
    categoryId?: string;
    search?: string;
    isVegetarian?: string;
    isVegan?: string;
    spicyLevel?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
};

export default async function CampusFoodPage({ searchParams }: PageProps) {
  const universityId = await getMarketplaceUniversityId();
  const sp = (await searchParams) ?? {};

  const categoryId = sp.categoryId?.trim() || undefined;
  const search = sp.search?.trim() || undefined;
  const isVegetarian = sp.isVegetarian === "true" ? true : undefined;
  const isVegan = sp.isVegan === "true" ? true : undefined;
  const spicyLevel = sp.spicyLevel?.trim() || undefined;
  const minPrice = sp.minPrice ? Number(sp.minPrice) : undefined;
  const maxPrice = sp.maxPrice ? Number(sp.maxPrice) : undefined;

  const hasFilters = !!(categoryId || search || isVegetarian || isVegan || spicyLevel || minPrice || maxPrice);

  if (hasFilters) {
    const [foodsRes, homeFeed] = await Promise.all([
      fetchMarketplaceFoods(universityId ?? undefined, {
        page: 1,
        limit: 48,
        searchKey: search,
        category: categoryId,
        isVegetarian,
        isVegan,
        spicyLevel,
        minPrice,
        maxPrice,
      }),
      fetchFoodHomeFeed(universityId ?? undefined),
    ]);

    return (
      <CampusFoodHomeTemplate
        universityId={universityId}
        foodShops={homeFeed.featuredShops}
        categories={homeFeed.categories as BuySellCategory[]}
        foods={foodsRes.data}
        popularFoods={[]}
        activeCategoryId={categoryId}
        activeSearch={search}
        total={foodsRes.total}
      />
    );
  }

  const [homeFeed, outletsRes] = await Promise.all([
    fetchFoodHomeFeed(universityId ?? undefined),
    fetchFoodOutletShops(universityId ?? undefined, 1, 16),
  ]);

  return (
    <CampusFoodHomeTemplate
      universityId={universityId}
      foodShops={outletsRes.data.length > 0 ? outletsRes.data : homeFeed.featuredShops}
      categories={homeFeed.categories as BuySellCategory[]}
      foods={homeFeed.latestFoods}
      popularFoods={homeFeed.popularFoods}
      total={homeFeed.latestFoods.length}
    />
  );
}
