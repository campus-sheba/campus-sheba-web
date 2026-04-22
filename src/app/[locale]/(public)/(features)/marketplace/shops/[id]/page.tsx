import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MarketplaceShopDetailTemplate from "@/modules/marketplace/templates/MarketplaceShopDetailTemplate";
import {
  fetchMarketplaceShopById,
  fetchMarketplaceShopWithProducts,
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

  const { shop, products } = await fetchMarketplaceShopWithProducts(id, universityId ?? undefined, 1, 24);

  // Fall back to separate shop fetch if combined endpoint didn't return shop data
  const resolvedShop = shop ?? (await fetchMarketplaceShopById(id, universityId ?? undefined));
  if (!resolvedShop) notFound();

  return <MarketplaceShopDetailTemplate shop={resolvedShop} products={products} />;
}
