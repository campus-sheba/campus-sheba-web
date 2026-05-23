import type { UserAddress } from "@/types/address";

export function getDefaultDeliveryAddress(
  addresses: UserAddress[],
): UserAddress | null {
  const delivery = addresses.filter((a) => a.type === "DELIVERY");
  return delivery.find((a) => a.isDefault) ?? delivery[0] ?? null;
}
