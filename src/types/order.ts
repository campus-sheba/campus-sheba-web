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

export type UserOrderRow = {
  _id: string;
  type?: string;
  paymentStatus?: string;
  rentalType?: string;
  deliveryType?: string;
  total?: number;
  subTotal?: number;
  totalDiscount?: number;
  createdAt?: string;
  updatedAt?: string;
  isCancelledOrder?: boolean;
  items?: Array<{
    _id?: string;
    title?: string;
    quantity?: number;
    photo?: string;
    status?: string;
    total?: number;
    price?: number;
  }>;
  address?: {
    _id?: string;
    address?: string;
    type?: string;
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
