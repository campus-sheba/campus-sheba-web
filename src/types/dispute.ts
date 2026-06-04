// Buy & Sell post-delivery disputes — mirrors the backend dispute interface.

export const DISPUTE_REASONS = [
  "item_not_received",
  "item_not_as_described",
  "item_damaged",
  "counterfeit_item",
  "wrong_item_delivered",
  "seller_unresponsive",
  "other",
] as const;

export type DisputeReason = (typeof DISPUTE_REASONS)[number];

export type DisputeStatus = "Open" | "Under Review" | "Resolved" | "Closed";

export type DisputeOutcome = "refund_buyer" | "release_seller" | "partial_refund";

/** Human labels for the dispute reason enum. */
export const DISPUTE_REASON_LABELS: Record<DisputeReason, string> = {
  item_not_received: "Item not received",
  item_not_as_described: "Item not as described",
  item_damaged: "Item arrived damaged",
  counterfeit_item: "Counterfeit / fake item",
  wrong_item_delivered: "Wrong item delivered",
  seller_unresponsive: "Seller unresponsive",
  other: "Other",
};

export type DisputeRef = {
  _id?: string;
  name?: string;
  title?: string;
};

export type Dispute = {
  _id: string;
  order: string | DisputeRef;
  orderItem: string | DisputeRef;
  type?: string;
  buyer?: string | DisputeRef;
  seller?: string | DisputeRef;
  university?: string | DisputeRef;
  reason: DisputeReason;
  description: string;
  evidence?: string[];
  status: DisputeStatus;
  outcome?: DisputeOutcome;
  partialRefundAmount?: number;
  adminNote?: string;
  resolvedAt?: string;
  itemAmount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateDisputePayload = {
  orderId: string;
  orderItemId: string;
  reason: DisputeReason;
  description: string;
  evidence?: string[];
};

export type DisputeListResponse = {
  page: number;
  limit: number;
  total: number;
  data: Dispute[];
};
