import type { OrderSummaryPayload } from "@/types/cart";

/** Same body as order summary for placing an order. */
export type PlaceOrderPayload = OrderSummaryPayload;

export type OrdersListParams = {
  page?: number;
  limit?: number;
  user?: string;
  deliveryHero?: string;
  university?: string;
  owner?: string;
  type?: string;
  paymentStatus?: string;
  status?: string;
  sort?: "ASC" | "DESC";
  dateFrom?: string;
  dateTo?: string;
};

export type OrderItemRow = {
  _id?: string;
  originalItemId?: string;
  title?: string;
  quantity?: number;
  photo?: string;
  status?: string;
  total?: number;
  price?: number;
  /** Item owner (seller) id — present on seller-facing responses. */
  owner?: string;
  /** Seller economics (item-owner view). */
  sellerPayout?: number;
  platformCommission?: number;
  platformCommissionRate?: number;
  isSellerPaid?: boolean;
  deliveredAt?: string;
  reason?: string;
};

/** Rider / delivery hero summary (populated on order responses). */
export type OrderDeliveryHero = {
  _id?: string;
  name?: string;
  phone?: string;
  profilePhoto?: string;
};

export type OrderDeliveryOption = {
  key?: string;
  title?: string;
  description?: string;
  etaMinutes?: number;
};

export type UserOrderRow = {
  _id: string;
  type?: string;
  paymentStatus?: string;
  paymentType?: string;
  paymentGatewayKey?: string;
  rentalType?: string;
  deliveryType?: string;
  deliveryOptionKey?: string;
  deliveryOption?: OrderDeliveryOption;
  total?: number;
  subTotal?: number;
  totalDiscount?: number;
  totalShippingCost?: number;
  totalTax?: number;
  totalVat?: number;
  totalPlatformFee?: number;
  totalServiceFee?: number;
  totalPackagingFee?: number;
  totalCODFee?: number;
  totalSellerPayout?: number;
  totalPlatformCommission?: number;
  totalPaymentGatewayFee?: number;
  deliveryTip?: number;
  createdAt?: string;
  updatedAt?: string;
  isCancelledOrder?: boolean;
  requiresManualAssignment?: boolean;
  assignmentRetryCount?: number;
  lastAssignmentAttempt?: string;
  isDeliveryPaid?: boolean;
  reason?: string | null;
  /** Delivery OTP the buyer shares with the rider on hand-over. */
  secretPIN?: string;
  /** Pickup OTP the seller shares with the rider on collection. */
  pickupPIN?: string;
  deliveryHero?: OrderDeliveryHero | string | null;
  acceptDeliveryHero?: boolean;
  items?: OrderItemRow[];
  user?: { _id?: string; name?: string; phone?: string } | string;
  address?: {
    _id?: string;
    address?: string;
    type?: string;
    description?: string;
  };
  university?: {
    _id?: string;
    name?: string;
    shortName?: string;
  };
};

export type OrdersListResponse = {
  page: number;
  limit: number;
  total: number;
  data: UserOrderRow[];
};
