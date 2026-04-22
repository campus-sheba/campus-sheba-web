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

export interface CartItemContent {
    _id: string;
    title: string;
    slug: string;
    description: string;
    owner: string;
    university: string;
    category: string;
    address: string;
    type: string;
    status: string;
    price: number;
    discountPrice?: number;
    quantity: number;
    photos: { url: string; key: string; size: number }[];
    isActive: boolean;
    isDeleted: boolean;
    condition: string;
    isNegotiable: boolean;
    isFeatured: boolean;
    viewCount: number;
    contactName: string;
    contactPhone: string;
    createdAt: string;
    updatedAt: string;
}

export interface CartItem {
    content: CartItemContent;
    quantity: number;
    type: string;
    _id: string;
    createdAt: string;
    updatedAt: string;
}

export interface Cart {
    _id: string;
    user: string;
    items: CartItem[];
    createdAt: string;
    updatedAt: string;
    groupedByShop: any[];
    otherItems: CartItem[];
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

export interface OrderSummaryResponse {
  type?: string;
  subTotal: number;
  total: number;
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
  deliveryChargeBreakdown?: {
    baseShippingCost: number;
    deliveryOptionSurcharge: number;
    finalShippingCost: number;
  };
  paymentGatewayFeeBreakdown?: {
    key: string;
    percentage: number;
    fixed: number;
    appliedFee: number;
  };
  feeSummary?: {
    subTotal: number;
    vat: number;
    tax: number;
    serviceFee: number;
    platformFee: number;
    packagingFee: number;
    codFee: number;
    deliveryCharge: number;
    deliveryOptionSurcharge: number;
    paymentGatewayFee: number;
    deliveryTip: number;
    discount: number;
    total: number;
    currency: string;
  };
  address?: { _id?: string; address?: string };
  items?: Array<{
    _id: string;
    title: string;
    quantity: number;
    price: number;
    total: number;
    subTotal?: number;
    shippingCost?: number;
    packagingFee?: number;
  }>;
}
