"use server";

import { deletePrivate } from "@/utils/api/delete";
import { getPublic } from "@/utils/api/get";
import { patchPrivate } from "@/utils/api/patch";
import { postPrivate } from "@/utils/api/post";
import { buySellEndpoints, cartEndpoints } from "@/utils/endpoints/endpoints";

export interface BuySellItem {
  _id: string;
  title: string;
  brand?: string;
  modelName?: string;
  description?: string;
  condition?: string;
  price?: number;
  negotiable?: boolean;
  quantity?: number;
  status?: string;
  category?: { title?: string };
  owner?: { _id?: string; name?: string };
  photos?: Array<{ url: string; key: string; size: number }>;
  contactName?: string;
  contactPhone?: string;
  createdAt?: string;
}

interface PaginatedBuySellResponse {
  page: number;
  limit: number;
  total: number;
  data: BuySellItem[];
}

const normalizeList = (payload: unknown): PaginatedBuySellResponse => {
  if (payload && typeof payload === "object" && "data" in (payload as Record<string, unknown>)) {
    const top = payload as { page?: number; limit?: number; total?: number; data?: unknown };
    if (Array.isArray(top.data)) {
      return {
        page: top.page ?? 1,
        limit: top.limit ?? 10,
        total: top.total ?? top.data.length,
        data: top.data as BuySellItem[],
      };
    }
    if (top.data && typeof top.data === "object") {
      const nested = top.data as PaginatedBuySellResponse;
      if (Array.isArray(nested.data)) return nested;
    }
  }
  return { page: 1, limit: 10, total: 0, data: [] };
};

export async function getBuySellListingsAction(params: Record<string, string | number> = {}) {
  try {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => query.set(key, String(value)));
    const url = `${buySellEndpoints.userBase}?${query.toString() || "page=1&limit=10"}`;
    const response = await getPublic<unknown>(url);
    return { success: true as const, data: normalizeList(response) };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to load listings",
      data: { page: 1, limit: 10, total: 0, data: [] as BuySellItem[] },
    };
  }
}

export async function getBuySellByIdAction(id: string) {
  try {
    const response = await getPublic<{ data?: BuySellItem }>(buySellEndpoints.userById(id));
    const data = response?.data ?? (response as unknown as BuySellItem);
    return { success: true as const, data };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to load listing details",
      data: null,
    };
  }
}

export async function addBuySellToCartAction(contentId: string, quantity = 1) {
  try {
    const response = await postPrivate(cartEndpoints.cart, { contentId, type: "BuySell", quantity });
    return { success: true as const, data: response };
  } catch (error) {
    return { success: false as const, message: error instanceof Error ? error.message : "Failed to add to cart" };
  }
}

export async function createBuySellListingAction(payload: Record<string, unknown>) {
  return postPrivate(buySellEndpoints.creatorBase, payload);
}

export async function updateBuySellListingAction(id: string, payload: Record<string, unknown>) {
  return patchPrivate(buySellEndpoints.creatorById(id), payload);
}

export async function deleteBuySellListingAction(id: string) {
  return deletePrivate(buySellEndpoints.creatorById(id));
}
