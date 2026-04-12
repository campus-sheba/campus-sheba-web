import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CampusFoodDetailTemplate from "@/modules/food/templates/CampusFoodDetailTemplate";
import { fetchMarketplaceFoodById } from "@/services/marketplace";

type Props = { params: Promise<{ id: string }> };

function titleFromFood(f: { title?: string; name?: string }): string {
  return f.title || f.name || "Food";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const food = await fetchMarketplaceFoodById(id);
  if (!food) return { title: "Food" };
  return {
    title: titleFromFood(food),
    description: food.description ? String(food.description) : undefined,
  };
}

export default async function CampusFoodDetailPage({ params }: Props) {
  const { id } = await params;
  const food = await fetchMarketplaceFoodById(id);
  if (!food) notFound();

  return <CampusFoodDetailTemplate food={food} />;
}
