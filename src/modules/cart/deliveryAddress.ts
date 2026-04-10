import type { UserAddress } from "@/types/address";

export function pickDefaultDeliveryAddressId(addresses: UserAddress[]): string | null {
  const delivery = addresses.filter((a) => a.type === "DELIVERY");
  const def = delivery.find((a) => a.isDefault);
  if (def) return def._id;
  return delivery[0]?._id ?? null;
}

/** Prefer pickup points for book handover; fall back to delivery addresses. */
export function pickDefaultBookAddressId(addresses: UserAddress[]): string | null {
  const pickup = addresses.filter((a) => a.type === "PICKUP");
  const pickupDef = pickup.find((a) => a.isDefault);
  if (pickupDef) return pickupDef._id;
  if (pickup[0]) return pickup[0]._id;
  return pickDefaultDeliveryAddressId(addresses);
}
