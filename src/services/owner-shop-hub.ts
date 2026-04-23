"use server";

import { deletePrivate } from "@/utils/api/delete";
import { getPrivate } from "@/utils/api/get";
import { patchPrivate } from "@/utils/api/patch";
import { postPrivate } from "@/utils/api/post";
import { ownerHubEndpoints } from "@/utils/endpoints/ownerHubEndpoints";
import type {
  HubReview,
  Order,
  Product,
  ProductPayload,
  ReviewItemType,
  Shop,
  ShopPayload,
} from "@/types/owner-shop-hub";

const privateOpts = { includeUniversity: false as const };

function pickData<T>(res: unknown): T | undefined {
  if (!res || typeof res !== "object") return undefined;
  const r = res as Record<string, unknown>;
  if ("data" in r && r.data !== undefined) return r.data as T;
  return undefined;
}

function pickRecord(res: unknown): Record<string, unknown> | null {
  if (!res || typeof res !== "object") return null;
  return res as Record<string, unknown>;
}

function isNotFoundMessage(message: string): boolean {
  const m = message.toLowerCase();
  return m.includes("not found") || m.includes("404");
}

export async function getMyShopAction(type: string = "Student Shop") {
  try {
    const url = ownerHubEndpoints.myShop(type);
    const response = await getPrivate<unknown>(url, privateOpts);
    const shop =
      (pickRecord(response)?.data as Shop | undefined) ??
      (("_id" in (response as object) ? response : undefined) as Shop | undefined);
    if (!shop || typeof shop !== "object" || !("_id" in shop)) {
      return { success: true as const, shop: null as Shop | null };
    }
    return { success: true as const, shop: shop as Shop };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch shop";
    if (isNotFoundMessage(message)) {
      return { success: true as const, shop: null as Shop | null };
    }
    console.error("[getMyShopAction] Error:", message);
    return { success: false as const, message, shop: null as Shop | null };
  }
}

export async function createShopAction(data: ShopPayload) {
  try {
    const body = {
      ...data,
      type: data.type ?? "Student Shop",
    } as Record<string, unknown>;
    const response = await postPrivate<unknown>(ownerHubEndpoints.shops, body, privateOpts);
    const shop =
      (pickRecord(response)?.data as Shop | undefined) ??
      (("_id" in (response as object) ? response : undefined) as Shop | undefined);
    return { success: true as const, shop: shop as Shop };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create shop";
    console.error("[createShopAction] Error:", message);
    return { success: false as const, message };
  }
}

export async function updateShopAction(id: string, data: Partial<ShopPayload>) {
  try {
    const body = data as Record<string, unknown>;
    const response = await patchPrivate<unknown>(ownerHubEndpoints.shopById(id), body, privateOpts);
    const shop =
      (pickRecord(response)?.data as Shop | undefined) ??
      (("_id" in (response as object) ? response : undefined) as Shop | undefined);
    return { success: true as const, shop: shop as Shop };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update shop";
    console.error("[updateShopAction] Error:", message);
    return { success: false as const, message };
  }
}

export async function getOwnProductsAction(params?: Record<string, string>) {
  try {
    const qs = params && Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : "";
    const url = ownerHubEndpoints.productsOwn(qs);
    const response = await getPrivate<unknown>(url, privateOpts);
    const raw = pickData<unknown>(response) ?? response;
    let data: Product[] = [];
    if (Array.isArray(raw)) data = raw as Product[];
    else if (raw && typeof raw === "object" && Array.isArray((raw as { data?: unknown }).data)) {
      data = (raw as { data: Product[] }).data;
    }
    const meta =
      raw && typeof raw === "object" && "meta" in raw ? (raw as { meta: unknown }).meta : null;
    return { success: true as const, data, meta };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch products";
    console.error("[getOwnProductsAction] Error:", message);
    return { success: false as const, message, data: [] as Product[], meta: null };
  }
}

export async function getProductStatisticsAction() {
  try {
    const response = await getPrivate<unknown>(ownerHubEndpoints.productsStatistics, privateOpts);
    return { success: true as const, data: pickData<Record<string, unknown>>(response) ?? pickRecord(response) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch statistics";
    return { success: false as const, message, data: null };
  }
}

export async function createProductAction(data: ProductPayload) {
  try {
    const body = data as unknown as Record<string, unknown>;
    console.log("createProductAction body:", body);
    const response = await postPrivate<unknown>(ownerHubEndpoints.products, body, privateOpts);
    console.log("createProductAction response:", response);
    const product =
      (pickRecord(response)?.data as Product | undefined) ??
      (("_id" in (response as object) ? response : undefined) as Product | undefined);
    return { success: true as const, product: product as Product };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create product";
    console.error("[createProductAction] Error:", message);
    return { success: false as const, message };
  }
}

export async function updateProductAction(productId: string, data: Partial<ProductPayload>) {
  try {
    const body = data as unknown as Record<string, unknown>;
    const response = await patchPrivate<unknown>(
      ownerHubEndpoints.productById(productId),
      body,
      privateOpts,
    );
    const product =
      (pickRecord(response)?.data as Product | undefined) ??
      (("_id" in (response as object) ? response : undefined) as Product | undefined);
    return { success: true as const, product: product as Product };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update product";
    console.error("[updateProductAction] Error:", message);
    return { success: false as const, message };
  }
}

export async function deleteProductAction(productId: string) {
  try {
    await deletePrivate(ownerHubEndpoints.productById(productId), undefined, privateOpts);
    return { success: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete product";
    console.error("[deleteProductAction] Error:", message);
    return { success: false as const, message };
  }
}

export async function getCategoriesAction() {
  try {
    const response = await getPrivate<unknown>(ownerHubEndpoints.userCategories, privateOpts);
    const raw = pickData<unknown>(response) ?? response;
    let data: { _id: string; title: string }[] = [];
    if (Array.isArray(raw)) data = raw as { _id: string; title: string }[];
    else if (raw && typeof raw === "object" && Array.isArray((raw as { data?: unknown }).data)) {
      data = (raw as { data: { _id: string; title: string }[] }).data;
    }
    return { success: true as const, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch categories";
    console.error("[getCategoriesAction] Error:", message);
    return { success: false as const, message, data: [] as { _id: string; title: string }[] };
  }
}

export async function getOwnerOrdersAction(params?: Record<string, string>) {
  try {
    const qs = params && Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : "";
    const url = ownerHubEndpoints.ownerOrders(qs);
    const response = await getPrivate<unknown>(url, privateOpts);
    const raw = pickData<unknown>(response) ?? response;
    let data: Order[] = [];
    if (Array.isArray(raw)) data = raw as Order[];
    else if (raw && typeof raw === "object" && Array.isArray((raw as { data?: unknown }).data)) {
      data = (raw as { data: Order[] }).data;
    }
    const meta =
      raw && typeof raw === "object" && "meta" in raw ? (raw as { meta: unknown }).meta : null;
    return { success: true as const, data, meta };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch orders";
    console.error("[getOwnerOrdersAction] Error:", message);
    return { success: false as const, message, data: [] as Order[], meta: null };
  }
}

export async function getOwnerOrderByIdAction(id: string) {
  try {
    const response = await getPrivate<unknown>(ownerHubEndpoints.ownerOrderById(id), privateOpts);
    const order =
      (pickRecord(response)?.data as Order | undefined) ??
      (("_id" in (response as object) ? response : undefined) as Order | undefined);
    return { success: true as const, order: order as Order };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch order";
    return { success: false as const, message, order: null as Order | null };
  }
}

export async function confirmOrderItemAction(orderId: string, itemId: string) {
  try {
    await patchPrivate(ownerHubEndpoints.confirmOrderItem(orderId, itemId), {}, privateOpts);
    return { success: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to confirm item";
    return { success: false as const, message };
  }
}

export async function cancelOrderItemAction(orderId: string, itemId: string) {
  try {
    await patchPrivate(ownerHubEndpoints.cancelOrderItem(orderId, itemId), {}, privateOpts);
    return { success: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to cancel item";
    return { success: false as const, message };
  }
}

export async function getReviewsAction(type: ReviewItemType, params?: Record<string, string>) {
  try {
    const qs = params && Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : "";
    const url = ownerHubEndpoints.reviewsByType(type, qs);
    const response = await getPrivate<unknown>(url, privateOpts);
    const raw = pickData<unknown>(response) ?? response;
    let data: HubReview[] = [];
    if (Array.isArray(raw)) data = raw as HubReview[];
    else if (raw && typeof raw === "object" && Array.isArray((raw as { data?: unknown }).data)) {
      data = (raw as { data: HubReview[] }).data;
    }
    const meta =
      raw && typeof raw === "object" && "meta" in raw ? (raw as { meta: unknown }).meta : null;
    return { success: true as const, data, meta };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch reviews";
    console.error("[getReviewsAction] Error:", message);
    return { success: false as const, message, data: [] as HubReview[], meta: null };
  }
}

export async function respondToReviewAction(reviewId: string, responseText: string) {
  try {
    const res = await postPrivate<unknown>(
      ownerHubEndpoints.reviewRespond(reviewId),
      { response: responseText },
      privateOpts,
    );
    return { success: true as const, data: pickData<unknown>(res) ?? res };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to respond to review";
    return { success: false as const, message };
  }
}
