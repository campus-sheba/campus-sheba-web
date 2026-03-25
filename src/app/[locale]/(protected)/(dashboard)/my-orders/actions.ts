"use server";

import { getPrivate } from "@/utils/api/get";
import { postPrivate } from "@/utils/api/post";
import { patchPrivate } from "@/utils/api/patch";

const BASE = process.env.BASE_URL || process.env.NEXT_PUBLIC_API_URL;

// ─── Types ───────────────────────────────────────────────────────────────────

export interface OrderItem {
  _id: string;
  id?: string;
  title?: string;
  price?: number;
  quantity?: number;
  status?: string;
}

export interface UserOrder {
  _id: string;
  type?: "Book" | "Product" | "Food" | "Parcel";
  status?: string;
  paymentStatus?: "Unpaid" | "Paid" | "Failed" | "Refunded";
  totalAmount?: number;
  items?: OrderItem[];
  createdAt?: string;
  updatedAt?: string;
  addressId?: string | { address?: string };
}

export interface OrderSummaryPayload {
  type: "Book" | "Product" | "Food" | "Parcel";
  rentalType?: "Rental" | "Purchase";
  rentalDays?: number;
  addressId: string;
  code?: string;
  items: { id: string; quantity: number }[];
  deliveryType?: "COD" | "Online";
  deliveryTip?: number;
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export async function getOrderSummaryAction(data: OrderSummaryPayload) {
  try {
    const res = await postPrivate<{ data: unknown }>(`${BASE}/user/orders/summary`, data as unknown as Record<string, unknown>);
    return { success: true as const, data: (res as any)?.data ?? res };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch order summary";
    return { success: false as const, message, data: null };
  }
}

export async function placeOrderAction(data: OrderSummaryPayload) {
  try {
    const res = await postPrivate<{ data: UserOrder }>(`${BASE}/user/orders`, data as unknown as Record<string, unknown>);
    return { success: true as const, data: (res as any)?.data ?? res };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to place order";
    return { success: false as const, message };
  }
}

export async function getUserOrdersAction(params?: Record<string, string>) {
  try {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
    const res = await getPrivate<{ data: UserOrder[]; meta?: unknown }>(`${BASE}/user/orders${qs}`);
    const data = (res as any)?.data ?? [];
    const meta = (res as any)?.meta ?? null;
    return { success: true as const, data: data as UserOrder[], meta };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch orders";
    return { success: false as const, message, data: [] as UserOrder[], meta: null };
  }
}

export async function getUserOrderByIdAction(id: string) {
  try {
    const res = await getPrivate<{ data: UserOrder }>(`${BASE}/user/orders/${id}`);
    return { success: true as const, data: ((res as any)?.data ?? res) as UserOrder };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch order";
    return { success: false as const, message, data: null };
  }
}

export async function cancelUserOrderAction(id: string, reason?: string) {
  try {
    const res = await patchPrivate(`${BASE}/user/orders/${id}/cancel`, { reason: reason ?? "" });
    return { success: true as const, data: (res as any)?.data ?? res };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to cancel order";
    return { success: false as const, message };
  }
}

export async function cancelUserOrderItemAction(orderId: string, itemId: string, reason?: string) {
  try {
    const res = await patchPrivate(`${BASE}/user/orders/${orderId}/items/${itemId}/cancel`, { reason: reason ?? "" });
    return { success: true as const, data: (res as any)?.data ?? res };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to cancel item";
    return { success: false as const, message };
  }
}
