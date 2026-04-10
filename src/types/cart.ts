/* eslint-disable @typescript-eslint/no-explicit-any */



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
  type: "Book" | "BuySell";
  rentalType: "Normal" | "Rental";
  rentalDays?: number;
  addressId: string;
  code?: string;
  items: OrderSummaryItemPayload[];
  deliveryType: "COD" | "ONLINE";
  deliveryTip?: number;
};

export interface OrderSummaryResponse {
  type: string;
  subTotal: number;
  total: number;
  totalShippingCost?: number;
  totalVat?: number;
  totalTax?: number;
  totalPlatformFee?: number;
  totalServiceFee?: number;
  totalPackagingFee?: number;
  totalCODFee?: number;
  totalDiscount?: number;
  totalPaymentGatewayFee?: number;
  totalPlatformCommission?: number;
  deliveryTip?: number;
  address?: { _id?: string; address?: string };
  items: Array<{
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
