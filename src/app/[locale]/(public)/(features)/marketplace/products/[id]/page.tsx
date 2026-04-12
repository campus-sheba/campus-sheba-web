import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MarketplaceProductDetailTemplate from "@/modules/marketplace/templates/MarketplaceProductDetailTemplate";
import { fetchMarketplaceProductById } from "@/services/marketplace";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchMarketplaceProductById(id);
  if (!product) return { title: "Product" };
  return { title: product.title, description: product.description };
}

export default async function MarketplaceProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = await fetchMarketplaceProductById(id);
  if (!product) notFound();

  return <MarketplaceProductDetailTemplate product={product} />;
}
