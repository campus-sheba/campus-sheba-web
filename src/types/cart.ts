/* eslint-disable @typescript-eslint/no-explicit-any */

export type GatewayMedia = { url: string; key?: string; size?: number };

export type PaymentGateway = {
  _id: string;
  key: string;
  title: string;
  shortLabel?: string;
  description?: string;
  provider?: string;
  logo?: GatewayMedia | null;
  icon?: GatewayMedia | null;
  sequence?: number;
  isFeatured?: boolean;
  deliveryType?: string;
  paymentType?: string;
  metadata?: unknown;
};

export type DeliveryOption = {
  _id: string;
  key: string;
  title: string;
  description?: string;
  etaMinutes?: number;
  sequence?: number;
  logo?: GatewayMedia | null;
  icon?: GatewayMedia | null;
  metadata?: unknown;
};

export interface CartMedia {
  url: string;
  key?: string;
  size?: number;
}

export interface CartItemContent {
    _id: string;
    title: string;
    slug?: string;
    description?: string;
    owner?: string;
    university?: string;
    /** API may return category as an object { _id, title, icon } or just an id string. */
    category?: string | { _id: string; title?: string; icon?: string };
    address?: string;
    type?: string;
    status?: string;
    price: number;
    discountPrice?: number;
    quantity: number;
    /** Legacy array form (returned by older endpoints). */
    photos?: CartMedia[];
    /** New single-photo form returned by GET /cart. */
    photo?: CartMedia;
    /** Embedded shop summary returned by GET /cart. */
    shop?: { _id: string; name?: string; logo?: string | CartMedia };
    variants?: Array<{ _id?: string; name: string; options: string[] }>;
    isActive?: boolean;
    isDeleted?: boolean;
    condition?: string;
    isNegotiable?: boolean;
    isFeatured?: boolean;
    viewCount?: number;
    contactName?: string;
    contactPhone?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CartItem {
    content: CartItemContent;
    quantity: number;
    type: string;
    _id: string;
    shop?: string;
    isAvailableForCheckout?: boolean;
    availabilityReason?: string | null;
    createdAt: string;
    updatedAt: string;
}

/** Inline payment gateway returned inside GET /cart response. */
export interface CartPaymentGateway {
  key: string;
  title: string;
  logo?: CartMedia;
  /** Present for wallet gateway; absent for others. */
  balance?: number;
}

/** Inline delivery method returned inside GET /cart response. */
export interface CartDeliveryMethod {
  key: string;
  title: string;
  etaMinutes?: number;
}

/** Saved delivery address returned inline with the cart. */
export interface CartSavedAddress {
  _id: string;
  address: string;
  type: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  isDefault?: boolean;
  user?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Cart {
    _id: string;
    user: string;
    items: CartItem[];
    itemCount?: number;
    paymentGateways?: CartPaymentGateway[];
    deliveryMethods?: CartDeliveryMethod[];
    savedDeliveryAddress?: CartSavedAddress | null;
    createdAt: string;
    updatedAt: string;
    groupedByShop?: any[];
    otherItems?: CartItem[];
}

export type ChargeType = "Product" | "BuySell" | "Book";

export interface ChargeConfig {
  _id: string;
  type: ChargeType;
  university: string;
  shipping?: {
    basedPrice?: number;
    shippingRatePerKM?: number;
  };
  packagingFee?: number;
  codFee?: number;
  returnFee?: number;
  vat?: { percentage?: number; isPercentage?: boolean; fixedAmount?: number };
  tax?: { percentage?: number; isPercentage?: boolean; fixedAmount?: number };
  platformFee?: { percentage?: number; isPercentage?: boolean; fixedAmount?: number };
  serviceFee?: { percentage?: number; isPercentage?: boolean; fixedAmount?: number };
  platformCommission?: { percentage?: number; isPercentage?: boolean };
  paymentGatewayFee?: { percentage?: number; fixedAmount?: number };
}

export type OrderSummaryItemPayload = {
  id: string;
  quantity: number;
};

export type OrderSummaryPayload = {
  type: string;
  rentalType: "Normal" | "Rental";
  rentalDays?: number;
  addressId: string;
  code?: string;
  items: OrderSummaryItemPayload[];
  paymentGatewayKey?: string;
  deliveryOptionKey?: string;
  /** @deprecated prefer paymentGatewayKey */
  deliveryType?: "COD" | "ONLINE";
  deliveryTip?: number;
};

/** New pricing block returned by POST /user/orders/summary. */
export interface OrderSummaryPricing {
  subtotal: number;
  deliveryFee: number;
  deliveryTip: number;
  vat: number;
  tax: number;
  serviceFee: number;
  platformFee: number;
  packagingFee: number;
  codFee: number;
  paymentGatewayFee: number;
  discount: number;
  total: number;
  currency: string;
}

/** Canonical order-summary response used across the app. */
export interface OrderSummaryResponse {
  /** Unified total surfaced regardless of which API shape returned. */
  total: number;
  /** Unified subtotal (filled from `pricing.subtotal` or legacy `subTotal`). */
  subTotal: number;
  pricing?: OrderSummaryPricing;
  paymentMethod?: { key: string; title: string; paymentType?: string };
  deliveryMethod?: {
    key: string;
    title: string;
    etaMinutes?: number;
    estimatedDeliveryTime?: string;
    logo?: CartMedia | null;
    icon?: CartMedia | null;
  };
  coupon?: string;
  address?: { _id?: string; address?: string };
  items?: Array<{
    /** Newer API uses `itemId`; older uses `_id`. Normalizer fills both. */
    _id?: string;
    itemId?: string;
    title: string;
    quantity: number;
    price: number;
    photo?: string;
    subtotal?: number;
    shippingFee?: number;
    packagingFee?: number;
    total: number;
  }>;

  /** ───── Legacy flat fields (older API shape; kept for back-compat) ───── */
  type?: string;
  totalShippingCost?: number;
  totalDeliveryOptionSurcharge?: number;
  totalVat?: number;
  totalTax?: number;
  totalPlatformFee?: number;
  totalServiceFee?: number;
  totalPackagingFee?: number;
  totalCODFee?: number;
  totalDiscount?: number;
  totalPaymentGatewayFee?: number;
  totalPlatformCommission?: number;
  totalSellerPayout?: number;
  deliveryTip?: number;
  paymentGatewayKey?: string;
  deliveryOptionKey?: string;
}

/** Response shape returned by POST /user/orders. */
export interface PlaceOrderResponse {
  orderId: string;
  status: string;
  paymentMethod: string;
  total: number;
  currency: string;
  requiresRedirect: boolean;
  redirectUrl?: string | null;
}
