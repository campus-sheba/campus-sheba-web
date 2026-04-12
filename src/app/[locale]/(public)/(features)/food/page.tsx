import type { Metadata } from "next";
import CampusFoodHomeTemplate from "@/modules/food/templates/CampusFoodHomeTemplate";
import type { MarketplaceFood } from "@/types/marketplace";
import {
  fetchFoodBrowseCategories,
  fetchFoodOutletShops,
  fetchMarketplaceFoods,
  getMarketplaceUniversityId,
} from "@/services/marketplace";

export const metadata: Metadata = {
  title: "Food",
  description: "Food from approved campus food outlets.",
};

function foodMatchesCategory(food: MarketplaceFood, categoryId: string): boolean {
  const raw = food.categoryId ?? food.category;
  if (typeof raw === "string") return raw === categoryId;
  if (raw && typeof raw === "object" && "_id" in (raw as object)) {
    return (raw as { _id?: string })._id === categoryId;
  }
  return false;
}

type PageProps = {
  searchParams?: Promise<{ categoryId?: string }>;
};

export default async function CampusFoodPage({ searchParams }: PageProps) {
  const universityId = await getMarketplaceUniversityId();
  const sp = (await searchParams) ?? {};
  const categoryId = sp.categoryId?.trim();

  const [foodsRes, outletsRes, foodCategories] = await Promise.all([
    fetchMarketplaceFoods(universityId ?? undefined, 1, 48),
    fetchFoodOutletShops(universityId ?? undefined, 1, 16),
    fetchFoodBrowseCategories(),
  ]);

  let foods = foodsRes.data;
  if (categoryId) {
    const filtered = foods.filter((f) => foodMatchesCategory(f, categoryId));
    if (filtered.length > 0) foods = filtered;
  }

  return (
    <CampusFoodHomeTemplate
      universityId={universityId}
      foodShops={outletsRes.data}
      categories={foodCategories}
      foods={foods}
      activeCategoryId={categoryId}
    />
  );
}
