"use server";

import type {
  BuySellCategory,
  BuySellListing,
  BuySellPaginatedResponse,
  CreateBuySellListingPayload,
  UpdateBuySellListingPayload,
} from "@/types/buy-sell";
import { deletePrivate } from "@/utils/api/delete";
import { getPrivate, getPublic } from "@/utils/api/get";
import { patchPrivate } from "@/utils/api/patch";
import { postPrivate } from "@/utils/api/post";
import { buySellEndpoints, userEndpoints } from "@/utils/endpoints/endpoints";

export type BuySellListParams = {
  page?: number;
  limit?: number;
  searchKey?: string;
  university?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  status?: string;
  negotiable?: boolean;
};

function buildBuySellListUrl(params: BuySellListParams): string {
  const q = new URLSearchParams();
  if (params.page != null) q.set("page", String(params.page));
  if (params.limit != null) q.set("limit", String(params.limit));
  if (params.searchKey?.trim()) q.set("searchKey", params.searchKey.trim());
  if (params.university) q.set("university", params.university);
  if (params.category) q.set("category", params.category);
  if (params.minPrice != null) q.set("minPrice", String(params.minPrice));
  if (params.maxPrice != null) q.set("maxPrice", String(params.maxPrice));
  if (params.condition) q.set("condition", params.condition);
  if (params.status) q.set("status", params.status);
  if (params.negotiable != null) q.set("negotiable", String(params.negotiable));
  const query = q.toString();
  return query ? `${buySellEndpoints.userBase}?${query}` : buySellEndpoints.userBase;
}

/**
 * Public browse: GET /api/user/buy-sell (optional JWT; university via query when guest).
 */
export async function fetchUserBuySellList(
  params: BuySellListParams = {},
): Promise<BuySellPaginatedResponse> {
  const url = buildBuySellListUrl(params);
  return getPublic<BuySellPaginatedResponse>(url, {
    universityId: params.university,
    includeUniversity: false,
  });
}

/**
 * Public detail: GET /api/user/buy-sell/:id
 */
export async function fetchUserBuySellById(id: string): Promise<BuySellListing | null> {
  if (!id) return null;
  const res = await getPublic<{ data?: BuySellListing }>(buySellEndpoints.userById(id), {
    includeUniversity: false,
  });
  return res?.data ?? null;
}

/**
 * Authenticated: GET /api/user/buy-sell/my-listed
 */
export async function fetchUserMyListedBuySell(
  params: Omit<BuySellListParams, "university"> = {},
): Promise<BuySellPaginatedResponse> {
  const q = new URLSearchParams();
  if (params.page != null) q.set("page", String(params.page));
  if (params.limit != null) q.set("limit", String(params.limit));
  if (params.searchKey?.trim()) q.set("searchKey", params.searchKey.trim());
  if (params.category) q.set("category", params.category);
  if (params.minPrice != null) q.set("minPrice", String(params.minPrice));
  if (params.maxPrice != null) q.set("maxPrice", String(params.maxPrice));
  if (params.condition) q.set("condition", params.condition);
  if (params.status) q.set("status", params.status);
  if (params.negotiable != null) q.set("negotiable", String(params.negotiable));
  const query = q.toString();
  const url = query
    ? `${buySellEndpoints.userMyListed}?${query}`
    : buySellEndpoints.userMyListed;
  return getPrivate<BuySellPaginatedResponse>(url);
}

/**
 * Authenticated creator dashboard list: GET /api/creator/buy-sell/own
 */
export async function fetchCreatorOwnBuySell(
  params: Omit<BuySellListParams, "university"> = {},
): Promise<BuySellPaginatedResponse> {
  const q = new URLSearchParams();
  if (params.page != null) q.set("page", String(params.page));
  if (params.limit != null) q.set("limit", String(params.limit));
  if (params.searchKey?.trim()) q.set("searchKey", params.searchKey.trim());
  if (params.category) q.set("category", params.category);
  if (params.minPrice != null) q.set("minPrice", String(params.minPrice));
  if (params.maxPrice != null) q.set("maxPrice", String(params.maxPrice));
  if (params.condition) q.set("condition", params.condition);
  if (params.status) q.set("status", params.status);
  if (params.negotiable != null) q.set("negotiable", String(params.negotiable));
  const query = q.toString();
  const url = query ? `${buySellEndpoints.creatorOwn}?${query}` : buySellEndpoints.creatorOwn;
  return getPrivate<BuySellPaginatedResponse>(url);
}

export type BuySellCategoriesResponse = {
  page: number;
  limit: number;
  total: number;
  data: BuySellCategory[];
};

function unwrapBuySellCategoriesResponse(response: unknown): BuySellCategoriesResponse {
  if (!response || typeof response !== "object") {
    return { page: 1, limit: 100, total: 0, data: [] };
  }
  const r = response as Record<string, unknown>;

  // Some APIs return { data: { page, limit, total, data: [...] } }
  const inner = r.data && typeof r.data === "object" ? (r.data as Record<string, unknown>) : null;
  const candidate = (inner ?? r) as Record<string, unknown>;

  const data = candidate.data;
  return {
    page: typeof candidate.page === "number" ? candidate.page : 1,
    limit: typeof candidate.limit === "number" ? candidate.limit : 100,
    total: typeof candidate.total === "number" ? candidate.total : (Array.isArray(data) ? data.length : 0),
    data: Array.isArray(data) ? (data as BuySellCategory[]) : [],
  };
}

/** GET /api/user/categories?type=Buy and Sell */
export async function fetchBuySellCategories(
  page = 1,
  limit = 100,
): Promise<BuySellCategoriesResponse> {
  const q = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    type: "Buy and Sell",
  });
  const res = await getPublic<unknown>(`${userEndpoints.categories}?${q.toString()}`, {
    includeUniversity: false,
  });
  return unwrapBuySellCategoriesResponse(res);
}

function unwrapCreatedListingId(response: unknown): string | null {
  if (!response || typeof response !== "object") return null;
  const r = response as Record<string, unknown>;
  if (r.data && typeof r.data === "object" && r.data !== null && "_id" in r.data) {
    const id = (r.data as { _id?: unknown })._id;
    return typeof id === "string" ? id : null;
  }
  if ("_id" in r && typeof r._id === "string") return r._id;
  return null;
}

function unwrapBuySellListing(response: unknown): BuySellListing | null {
  if (!response || typeof response !== "object") return null;
  const r = response as Record<string, unknown>;
  if (r.data && typeof r.data === "object" && r.data !== null && "_id" in r.data) {
    return r.data as BuySellListing;
  }
  if ("_id" in r) return response as BuySellListing;
  return null;
}

/** GET /api/creator/buy-sell/:id */
export async function getCreatorBuySellByIdAction(id: string) {
  const trimmed = id?.trim();
  if (!trimmed) {
    return {
      success: false as const,
      message: "Invalid listing id",
      data: null as BuySellListing | null,
    };
  }
  try {
    const response = await getPrivate<unknown>(buySellEndpoints.creatorById(trimmed), {
      includeUniversity: false,
    });
    const data = unwrapBuySellListing(response);
    if (!data) {
      return { success: false as const, message: "Listing not found", data: null };
    }
    return { success: true as const, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load listing";
    return { success: false as const, message, data: null };
  }
}

/** PATCH /api/creator/buy-sell/:id */
export async function updateBuySellListingAction(id: string, payload: UpdateBuySellListingPayload) {
  const trimmed = id?.trim();
  if (!trimmed) {
    return { success: false as const, message: "Invalid listing id" };
  }
  try {
    await patchPrivate<unknown>(buySellEndpoints.creatorById(trimmed), payload, {
      includeUniversity: false,
    });
    return { success: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update listing";
    return { success: false as const, message };
  }
}

/** DELETE /api/creator/buy-sell/:id */
export async function deleteBuySellListingAction(id: string) {
  const trimmed = id?.trim();
  if (!trimmed) {
    return { success: false as const, message: "Invalid listing id" };
  }
  try {
    await deletePrivate<unknown>(buySellEndpoints.creatorById(trimmed), undefined, {
      includeUniversity: false,
    });
    return { success: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete listing";
    return { success: false as const, message };
  }
}

/** POST /api/creator/buy-sell */
export async function createBuySellListingAction(payload: CreateBuySellListingPayload) {
  try {
    const response = await postPrivate<unknown>(buySellEndpoints.creatorBase, payload, {
      includeUniversity: false,
    });
    const listingId = unwrapCreatedListingId(response);
    return { success: true as const, listingId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create listing";
    return { success: false as const, message, listingId: null as string | null };
  }
}
