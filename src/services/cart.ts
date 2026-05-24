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

const cartOpts = { includeUniversity: false as const };

export async function getCartAction() {
  try {
    const response = await getPrivate<{ data: Cart }>(cartEndpoints.cart, cartOpts);
    return { success: true as const, data: response?.data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch cart";
    return { success: false as const, message, data: null };
  }
}

export async function addToCartAction(input: {
  contentId: string;
  /** Module the item belongs to: "book", "buy_sell", "food", etc. */
  type: string;
  quantity?: number;
}) {
  try {
    const response = await postPrivate<{ data: Cart }>(cartEndpoints.cart, {
      contentId: input.contentId,
      type: input.type,
      quantity: input.quantity ?? 1,
    }, cartOpts);
    return { success: true as const, data: response?.data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add item to cart";
    return { success: false as const, message, data: null };
  }
}

/** Replace cart with a single item for direct checkout (one seller per order). */
export async function buyNowAction(input: {
  contentId: string;
  type: string;
}) {
  try {
    const existing = await getPrivate<{ data: Cart }>(cartEndpoints.cart, cartOpts).catch(
      () => null,
    );
    if (existing?.data?.items?.length) {
      await deletePrivate(cartEndpoints.clear, undefined, cartOpts).catch(() => undefined);
    }

    const response = await postPrivate<{ data: Cart }>(cartEndpoints.cart, {
      contentId: input.contentId,
      type: input.type,
      quantity: 1,
    }, cartOpts);
    return { success: true as const, data: response?.data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to start checkout";
    return { success: false as const, message, data: null };
  }
}

export async function removeCartItemAction(id: string) {
  try {
    await deletePrivate(cartEndpoints.cart + `/${id}`, undefined, cartOpts);
    return { success: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to remove cart item";
    return { success: false as const, message };
  }
}

export async function removeMultipleCartItemsAction(contentIds: string[]) {
  try {
    await deletePrivate(cartEndpoints.cart, { contentIds }, cartOpts);
    return { success: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to remove selected items";
    return { success: false as const, message };
  }
}

export async function increaseCartItemAction(contentId: string) {
  try {
    await patchPrivate(cartEndpoints.increase, { contentId }, cartOpts);
    return { success: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to increase quantity";
    return { success: false as const, message };
  }
}

export async function decreaseCartItemAction(contentId: string) {
  try {
    await patchPrivate(cartEndpoints.decrease, { contentId }, cartOpts);
    return { success: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to decrease quantity";
    return { success: false as const, message };
  }
}

export async function clearCartAction() {
  try {
    await deletePrivate(cartEndpoints.clear, undefined, cartOpts);
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

/**
 * Normalizes both the legacy flat shape and the new `pricing`-object shape into
 * a single `OrderSummaryResponse` with consistent `total` / `subTotal` surfaces.
 */
function unwrapOrderSummary(response: unknown): OrderSummaryResponse | null {
  if (!response || typeof response !== "object") return null;
  const r = response as Record<string, unknown>;
  const payload =
    r.data && typeof r.data === "object"
      ? (r.data as Record<string, unknown>)
      : r;

  const pricing = payload.pricing as OrderSummaryResponse["pricing"] | undefined;
  const legacyTotal = typeof payload.total === "number" ? (payload.total as number) : null;
  const legacySub = typeof payload.subTotal === "number" ? (payload.subTotal as number) : null;

  const total = pricing?.total ?? legacyTotal;
  const subTotal = pricing?.subtotal ?? legacySub ?? 0;
  if (total == null) return null;

  return {
    ...(payload as Partial<OrderSummaryResponse>),
    pricing,
    total,
    subTotal,
  } as OrderSummaryResponse;
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
