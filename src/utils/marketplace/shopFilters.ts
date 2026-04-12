import type { MarketplaceShopListItem } from "@/types/marketplace";

/** Outlets that belong on the Food hub (restaurants, halls, etc.). */
export function isFoodOutletShop(shop: MarketplaceShopListItem): boolean {
  const t = (shop.type || "").toLowerCase();
  return ["food", "restaurant", "hotel", "cafe", "dining", "cafeteria"].includes(t);
}
