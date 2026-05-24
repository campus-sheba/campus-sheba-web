"use server";

import type {
  OrdersListParams,
  OrdersListResponse,
  UserOrderRow,
} from "@/types/order";
import { getPrivate } from "@/utils/api/get";
import { patchPrivate } from "@/utils/api/patch";
import { ownerOrderEndpoints } from "@/utils/endpoints/endpoints";

function buildOwnerOrdersUrl(params: OrdersListParams): string {
  const q = new URLSearchParams();
  if (params.page != null) q.set("page", String(params.page));
  if (params.limit != null) q.set("limit", String(params.limit));
  if (params.type?.trim()) q.set("type", params.type.trim());
  if (params.paymentStatus?.trim()) q.set("paymentStatus", params.paymentStatus.trim());
  if (params.status?.trim()) q.set("status", params.status.trim());
  if (params.sort) q.set("sort", params.sort);
  if (params.dateFrom?.trim()) q.set("dateFrom", params.dateFrom.trim());
  if (params.dateTo?.trim()) q.set("dateTo", params.dateTo.trim());
  const query = q.toString();
  return query ? `${ownerOrderEndpoints.base}?${query}` : ownerOrderEndpoints.base;
}

function unwrapOrderDetail(response: unknown): UserOrderRow | null {
  if (!response || typeof response !== "object") return null;
  const r = response as Record<string, unknown>;
  if (r.data && typeof r.data === "object" && r.data !== null && "_id" in r.data) {
    return r.data as UserOrderRow;
  }
  if ("_id" in r) return response as UserOrderRow;
  return null;
}

/** List orders that contain items the current user is selling. */
export async function listSellerOrdersAction(params: OrdersListParams = {}) {
  try {
    const data = await getPrivate<OrdersListResponse>(buildOwnerOrdersUrl(params), {
      includeUniversity: false,
    });
    return { success: true as const, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load sales";
    const empty: OrdersListResponse = { page: 1, limit: 15, total: 0, data: [] };
    return { success: false as const, message, data: empty };
  }
}

export async function getSellerOrderByIdAction(id: string) {
  if (!id.trim()) {
    return { success: false as const, message: "Invalid order id", data: null as UserOrderRow | null };
  }
  try {
    const response = await getPrivate<unknown>(ownerOrderEndpoints.byId(id.trim()), {
      includeUniversity: false,
    });
    const data = unwrapOrderDetail(response);
    if (!data) return { success: false as const, message: "Order not found", data: null };
    return { success: true as const, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load order";
    return { success: false as const, message, data: null };
  }
}

/** Seller accepts a pending order item (Pending → Confirmed). */
export async function confirmOrderItemAction(orderId: string, itemId: string) {
  if (!orderId.trim() || !itemId.trim()) {
    return { success: false as const, message: "Invalid order or item id" };
  }
  try {
    await patchPrivate<unknown>(
      ownerOrderEndpoints.confirmItem(orderId.trim(), itemId.trim()),
      {},
      { includeUniversity: false },
    );
    return { success: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to confirm order item";
    return { success: false as const, message };
  }
}

export async function cancelSellerOrderItemAction(
  orderId: string,
  itemId: string,
  reason: string,
) {
  if (!orderId.trim() || !itemId.trim()) {
    return { success: false as const, message: "Invalid order or item id" };
  }
  try {
    await patchPrivate<unknown>(
      ownerOrderEndpoints.cancelItem(orderId.trim(), itemId.trim()),
      { reason },
      { includeUniversity: false },
    );
    return { success: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to cancel order item";
    return { success: false as const, message };
  }
}

/**
 * Seller generates the pickup OTP the rider needs to collect the books.
 * Returns the updated order (with `pickupPIN`) on success.
 */
export async function generatePickupOtpAction(orderId: string) {
  if (!orderId.trim()) {
    return { success: false as const, message: "Invalid order id", data: null as UserOrderRow | null };
  }
  try {
    const response = await patchPrivate<unknown>(
      ownerOrderEndpoints.generatePickupOtp(orderId.trim()),
      {},
      { includeUniversity: false },
    );
    return { success: true as const, data: unwrapOrderDetail(response) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate pickup OTP";
    return { success: false as const, message, data: null };
  }
}
