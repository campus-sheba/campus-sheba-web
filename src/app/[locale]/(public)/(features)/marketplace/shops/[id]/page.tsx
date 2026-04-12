import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MarketplaceShopDetailTemplate from "@/modules/marketplace/templates/MarketplaceShopDetailTemplate";
import {
  fetchMarketplaceProductsByShop,
  fetchMarketplaceShopById,
  getMarketplaceUniversityId,
} from "@/services/marketplace";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const universityId = await getMarketplaceUniversityId();
  const shop = await fetchMarketplaceShopById(id, universityId ?? undefined);
  if (!shop) return { title: "Shop" };
  return { title: shop.name, description: shop.description };
}

export default async function MarketplaceShopDetailPage({ params }: Props) {
  const { id } = await params;
  const universityId = await getMarketplaceUniversityId();
  const shop = await fetchMarketplaceShopById(id, universityId ?? undefined);
  if (!shop) notFound();

  const { data: products } = await fetchMarketplaceProductsByShop(id, universityId ?? undefined, 1, 24);

  return <MarketplaceShopDetailTemplate shop={shop} products={products} />;
}
