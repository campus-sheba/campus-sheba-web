import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FoodShopMenuTemplate from "@/modules/food/templates/FoodShopMenuTemplate";
import {
  fetchFoodShopMenus,
  getMarketplaceUniversityId,
} from "@/services/marketplace";

type Props = {
  params: Promise<{ shopId: string }>;
  searchParams?: Promise<{
    categoryId?: string;
    searchKey?: string;
    isVegetarian?: string;
    isVegan?: string;
    spicyLevel?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shopId } = await params;
  const universityId = await getMarketplaceUniversityId();
  const data = await fetchFoodShopMenus(shopId, universityId ?? undefined, { limit: 1 });
  if (!data.shop) return { title: "Food Shop" };
  return {
    title: `${data.shop.name} — Menu`,
    description: data.shop.description
      ? String(data.shop.description).slice(0, 160)
      : `Browse the menu at ${data.shop.name} on Campus Sheba.`,
  };
}

export default async function FoodShopMenuPage({ params, searchParams }: Props) {
  const { shopId } = await params;
  const sp = (await searchParams) ?? {};
  const universityId = await getMarketplaceUniversityId();

  const categoryId = sp.categoryId?.trim() || undefined;
  const searchKey = sp.searchKey?.trim() || undefined;
  const isVegetarian = sp.isVegetarian === "true" ? true : undefined;
  const isVegan = sp.isVegan === "true" ? true : undefined;
  const spicyLevel = sp.spicyLevel?.trim() || undefined;
  const minPrice = sp.minPrice ? Number(sp.minPrice) : undefined;
  const maxPrice = sp.maxPrice ? Number(sp.maxPrice) : undefined;
  const page = sp.page ? Number(sp.page) : 1;

  const data = await fetchFoodShopMenus(shopId, universityId ?? undefined, {
    page,
    limit: 20,
    category: categoryId,
    searchKey,
    isVegetarian,
    isVegan,
    spicyLevel,
    minPrice,
    maxPrice,
  });

  if (!data.shop) notFound();

  return (
    <FoodShopMenuTemplate
      shop={data.shop}
      menus={data.menus}
      total={data.total}
      activeCategoryId={categoryId}
      activeSearch={searchKey}
    />
  );
}
