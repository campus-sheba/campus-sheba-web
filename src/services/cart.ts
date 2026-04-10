"use server";

import {
  Cart,
  ChargeConfig,
  ChargeType,
  OrderSummaryPayload,
  OrderSummaryResponse,
} from "@/types/cart";
import { getPrivate, getPublic } from "@/utils/api/get";
import { patchPrivate } from "@/utils/api/patch";
import { postPrivate } from "@/utils/api/post";
import { deletePrivate } from "@/utils/api/delete";
import { cartEndpoints, chargesEndpoints, orderEndpoints } from "@/utils/endpoints/endpoints";

export async function getCartAction() {
  try {
    const response = await getPrivate<{ data: Cart }>(cartEndpoints.cart);
    return { success: true as const, data: response?.data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch cart";
    return { success: false as const, message, data: null };
  }
}

export async function addToCartAction(input: {
  contentId: string;
  type: "Book" | "BuySell" | "Product";
  quantity?: number;
}) {
  try {
    const response = await postPrivate<{ data: Cart }>(cartEndpoints.cart, {
      contentId: input.contentId,
      type: input.type,
      quantity: input.quantity ?? 1,
    });
    return { success: true as const, data: response?.data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add item to cart";
    return { success: false as const, message, data: null };
  }
}

export async function removeCartItemAction(id: string) {
  try {
    await deletePrivate(cartEndpoints.cart + `/${id}`);
    return { success: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to remove cart item";
    return { success: false as const, message };
  }
}

export async function removeMultipleCartItemsAction(contentIds: string[]) {
  try {
    await deletePrivate(cartEndpoints.cart, { contentIds });
    return { success: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to remove selected items";
    return { success: false as const, message };
  }
}

export async function increaseCartItemAction(contentId: string) {
  try {
    await patchPrivate(cartEndpoints.increase, { contentId });
    return { success: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to increase quantity";
    return { success: false as const, message };
  }
}

export async function decreaseCartItemAction(contentId: string) {
  try {
    await patchPrivate(cartEndpoints.decrease, { contentId });
    return { success: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to decrease quantity";
    return { success: false as const, message };
  }
}

export async function clearCartAction() {
  try {
    await deletePrivate(cartEndpoints.clear);
    return { success: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to clear cart";
    return { success: false as const, message };
  }
}

export async function getChargeByTypeAction(type: ChargeType, universityId: string) {
  try {
    const response = await getPublic<{ data: ChargeConfig }>(
      `${chargesEndpoints.query}?type=${encodeURIComponent(type)}&universityId=${encodeURIComponent(universityId)}`,
      { includeUniversity: false },
    );
    return { success: true as const, data: response?.data ?? null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch charges";
    return { success: false as const, message, data: null };
  }
}

function unwrapOrderSummary(response: unknown): OrderSummaryResponse | null {
  if (!response || typeof response !== "object") return null;
  const r = response as Record<string, unknown>;
  if (r.data && typeof r.data === "object" && r.data !== null && "total" in r.data) {
    return r.data as OrderSummaryResponse;
  }
  if ("total" in r && typeof r.total === "number") {
    return response as OrderSummaryResponse;
  }
  return null;
}

export async function createOrderSummaryAction(payload: OrderSummaryPayload) {
  try {
    const response = await postPrivate<unknown>(orderEndpoints.summary, payload, {
      includeUniversity: false,
    });
    const data = unwrapOrderSummary(response);
    if (!data) {
      return {
        success: false as const,
        message: "Invalid order summary response",
        data: null,
      };
    }
    return { success: true as const, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create order summary";
    return { success: false as const, message, data: null };
  }
}
