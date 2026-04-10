import type { UserAddress } from "@/types/address";

export function pickDefaultDeliveryAddressId(addresses: UserAddress[]): string | null {
  const delivery = addresses.filter((a) => a.type === "DELIVERY");
  const def = delivery.find((a) => a.isDefault);
  if (def) return def._id;
  return delivery[0]?._id ?? null;
}
