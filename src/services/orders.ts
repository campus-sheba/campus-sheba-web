"use server";

import type { OrdersListParams, OrdersListResponse, PlaceOrderPayload, UserOrderRow } from "@/types/order";
import { getPrivate } from "@/utils/api/get";
import { patchPrivate } from "@/utils/api/patch";
import { postPrivate } from "@/utils/api/post";
import { orderEndpoints } from "@/utils/endpoints/endpoints";

function buildOrdersListUrl(params: OrdersListParams): string {
  const q = new URLSearchParams();
  if (params.page != null) q.set("page", String(params.page));
  if (params.limit != null) q.set("limit", String(params.limit));
  if (params.user?.trim()) q.set("user", params.user.trim());
  if (params.deliveryHero?.trim()) q.set("deliveryHero", params.deliveryHero.trim());
  if (params.university?.trim()) q.set("university", params.university.trim());
  if (params.owner?.trim()) q.set("owner", params.owner.trim());
  if (params.type?.trim()) q.set("type", params.type.trim());
  if (params.paymentStatus?.trim()) q.set("paymentStatus", params.paymentStatus.trim());
  if (params.status?.trim()) q.set("status", params.status.trim());
  if (params.sort) q.set("sort", params.sort);
  if (params.dateFrom?.trim()) q.set("dateFrom", params.dateFrom.trim());
  if (params.dateTo?.trim()) q.set("dateTo", params.dateTo.trim());
  const query = q.toString();
  return query ? `${orderEndpoints.base}?${query}` : orderEndpoints.base;
}

export async function listOrdersAction(params: OrdersListParams = {}) {
  try {
    const data = await getPrivate<OrdersListResponse>(buildOrdersListUrl(params), {
      includeUniversity: false,
    });
    return { success: true as const, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load orders";
    const empty: OrdersListResponse = { page: 1, limit: 10, total: 0, data: [] };
    return { success: false as const, message, data: empty };
  }
}

function unwrapPlaceOrder(response: unknown): { orderId: string | null; paymentUrl: string | null } {
  if (!response || typeof response !== "object") return { orderId: null, paymentUrl: null };
  const r = response as Record<string, unknown>;
  const data = (r.data && typeof r.data === "object" ? r.data : r) as Record<string, unknown>;
  const orderId = typeof data._id === "string" ? data._id : null;
  const paymentUrl = typeof data.url === "string" ? data.url : null;
  return { orderId, paymentUrl };
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

export async function getOrderByIdAction(id: string) {
  if (!id.trim()) {
    return { success: false as const, message: "Invalid order id", data: null as UserOrderRow | null };
  }
  try {
    const response = await getPrivate<unknown>(orderEndpoints.byId(id.trim()), {
      includeUniversity: false,
    });
    const data = unwrapOrderDetail(response);
    if (!data) {
      return { success: false as const, message: "Order not found", data: null };
    }
    return { success: true as const, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load order";
    return { success: false as const, message, data: null };
  }
}

export async function cancelOrderAction(id: string, reason: string) {
  try {
    await patchPrivate(orderEndpoints.cancel(id), { reason }, { includeUniversity: false });
    return { success: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to cancel order";
    return { success: false as const, message };
  }
}

export async function placeOrderAction(payload: PlaceOrderPayload) {
  try {
    const response = await postPrivate<unknown>(orderEndpoints.base, payload, {
      includeUniversity: false,
    });
    const { orderId, paymentUrl } = unwrapPlaceOrder(response);
    return { success: true as const, orderId, paymentUrl, raw: response };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to place order";
    return {
      success: false as const,
      message,
      orderId: null as string | null,
      paymentUrl: null as string | null,
      raw: null,
    };
  }
}
