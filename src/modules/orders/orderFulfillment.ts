import type { UserOrderRow } from "@/types/order";

/** Buyer-facing fulfilment steps (order-level, uses slowest active item). */
export const BUYER_FULFILMENT_STEPS = [
  "Order placed",
  "Seller accepted",
  "Rider assigned",
  "Picked up from seller",
  "Out for delivery",
  "Delivered",
] as const;

export const SELLER_FULFILMENT_STEPS = [
  "New order",
  "You confirmed",
  "Rider assigned",
  "Pickup OTP ready",
  "Rider collected",
  "Delivered to buyer",
] as const;

export function stageIndexForItemStatus(status?: string): number {
  switch (status) {
    case "Confirmed":
      return 1;
    case "In Progress":
      return 2;
    case "Picked Up":
      return 3;
    case "Out for Delivery":
      return 4;
    case "Delivered":
      return 5;
    case "Canceled":
    case "Refunded":
    case "Returned":
    case "Disputed":
      return -2;
    default:
      return 0; // Pending
  }
}

export function buyerTimelineReached(order: UserOrderRow): number {
  if (order.isCancelledOrder) return -1;
  const active = (order.items ?? []).filter((it) => it.status !== "Canceled");
  if (active.length === 0) return 0;

  let minItem = Math.min(...active.map((it) => stageIndexForItemStatus(it.status)));

  // Order-level signals when item status lags behind rider assignment
  if (order.deliveryHero && minItem < 2) minItem = 2;
  if (order.pickupPIN && minItem < 3) minItem = 3;

  return Math.min(minItem, BUYER_FULFILMENT_STEPS.length - 1);
}

export function sellerTimelineReached(
  order: UserOrderRow,
  sellerItemStatus?: string,
): number {
  if (order.isCancelledOrder) return -1;
  const status = sellerItemStatus ?? order.items?.[0]?.status;
  let idx = stageIndexForItemStatus(status);
  if (order.deliveryHero && idx < 2) idx = 2;
  if (order.pickupPIN && idx < 3) idx = 3;
  return Math.min(idx, SELLER_FULFILMENT_STEPS.length - 1);
}

export function buyerStatusHint(order: UserOrderRow): string {
  if (order.isCancelledOrder) return "This order was cancelled.";
  if (order.requiresManualAssignment) {
    return "A rider could not be assigned automatically. Campus ops will assign one shortly.";
  }
  const active = (order.items ?? []).filter((it) => it.status !== "Canceled");
  const pending = active.some((it) => it.status === "Pending");
  if (pending) return "Waiting for the seller to accept your order.";
  if (!order.deliveryHero) return "Seller accepted. A delivery rider is being assigned.";
  if (order.secretPIN) {
    return "Share your delivery OTP with the rider when they arrive.";
  }
  return "";
}

export function sellerStatusHint(itemStatus?: string, order?: UserOrderRow): string {
  switch (itemStatus) {
    case "Pending":
      return "New order — confirm to start fulfilment.";
    case "Confirmed":
      if (!order?.deliveryHero) return "Confirmed. Waiting for a rider to be assigned.";
      return "Rider assigned. Generate pickup OTP when the rider arrives to collect.";
    case "In Progress":
      if (!order?.pickupPIN) {
        return "Rider is on the way. Generate pickup OTP and share it on handover.";
      }
      return "Pickup OTP active — share it with the rider to confirm collection.";
    case "Picked Up":
      return "Rider collected the item. On the way to the buyer.";
    case "Out for Delivery":
      return "Item is out for delivery to the buyer.";
    case "Delivered":
      return "Delivered. Your payout is released to your wallet.";
    case "Canceled":
      return "This item was cancelled.";
    default:
      return "";
  }
}

export function resolveOwnerId(owner: unknown): string | undefined {
  if (!owner) return undefined;
  if (typeof owner === "string") return owner;
  if (typeof owner === "object" && owner !== null && "_id" in owner) {
    return String((owner as { _id: string })._id);
  }
  return undefined;
}

export function isBookOwner(
  item: { owner?: unknown },
  currentUserId?: string,
): boolean {
  if (!currentUserId) return false;
  return resolveOwnerId(item.owner) === currentUserId;
}
