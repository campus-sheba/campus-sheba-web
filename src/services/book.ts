"use server";

import type {
  BookCategory,
  BookListing,
  BookListingType,
  BookPaginatedResponse,
  CreateBookListingPayload,
  UpdateBookListingPayload,
} from "@/types/book";
import { deletePrivate } from "@/utils/api/delete";
import { getPrivate, getPublic } from "@/utils/api/get";
import { patchPrivate } from "@/utils/api/patch";
import { postPrivate } from "@/utils/api/post";
import { bookEndpoints, userEndpoints } from "@/utils/endpoints/endpoints";

export type BookListParams = {
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

function buildBookListUrl(params: BookListParams): string {
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
  return query ? `${bookEndpoints.userBase}?${query}` : bookEndpoints.userBase;
}

/**
 * Public browse: GET /api/user/book (optional JWT; university via query when guest).
 */
export async function fetchUserBookList(
  params: BookListParams = {},
): Promise<BookPaginatedResponse> {
  const url = buildBookListUrl(params);
  return getPublic<BookPaginatedResponse>(url, {
    universityId: params.university,
    includeUniversity: false,
  });
}

/**
 * Public detail: GET /api/user/book/:id
 */
export async function fetchUserBookById(id: string): Promise<BookListing | null> {
  if (!id) return null;
  const res = await getPublic<{ data?: BookListing }>(bookEndpoints.userById(id), {
    includeUniversity: false,
  });
  return res?.data ?? null;
}

/**
 * Authenticated: GET /api/user/book/my-listed
 */
export async function fetchUserMyListedBook(
  params: Omit<BookListParams, "university"> = {},
): Promise<BookPaginatedResponse> {
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
    ? `${bookEndpoints.userMyListed}?${query}`
    : bookEndpoints.userMyListed;
  return getPrivate<BookPaginatedResponse>(url);
}

/**
 * Authenticated creator dashboard list: GET /api/creator/book/own
 */
export async function fetchCreatorOwnBook(
  params: Omit<BookListParams, "university"> = {},
): Promise<BookPaginatedResponse> {
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
  const url = query ? `${bookEndpoints.creatorOwn}?${query}` : bookEndpoints.creatorOwn;
  return getPrivate<BookPaginatedResponse>(url);
}

export type BookCategoriesResponse = {
  page: number;
  limit: number;
  total: number;
  data: BookCategory[];
};

function unwrapBookCategoriesResponse(response: unknown): BookCategoriesResponse {
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
    data: Array.isArray(data) ? (data as BookCategory[]) : [],
  };
}

/** GET /api/user/categories?type=Book */
export async function fetchBookCategories(
  page = 1,
  limit = 100,
): Promise<BookCategoriesResponse> {
  const q = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    type: "Book",
  });
  const res = await getPublic<unknown>(`${userEndpoints.categories}?${q.toString()}`, {
    includeUniversity: false,
  });
  return unwrapBookCategoriesResponse(res);
}

function getBookCreateEndpoint(listingType?: BookListingType): string {
  switch (listingType) {
    case "Lend":
      return bookEndpoints.creatorLend;
    case "Donate":
      return bookEndpoints.creatorDonate;
    case "Sell":
    default:
      return bookEndpoints.creatorSell;
  }
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

function unwrapBookListing(response: unknown): BookListing | null {
  if (!response || typeof response !== "object") return null;
  const r = response as Record<string, unknown>;
  if (r.data && typeof r.data === "object" && r.data !== null && "_id" in r.data) {
    return r.data as BookListing;
  }
  if ("_id" in r) return response as BookListing;
  return null;
}

/** GET /api/creator/book/:id */
export async function getCreatorBookByIdAction(id: string) {
  const trimmed = id?.trim();
  if (!trimmed) {
    return {
      success: false as const,
      message: "Invalid listing id",
      data: null as BookListing | null,
    };
  }
  try {
    const response = await getPrivate<unknown>(bookEndpoints.creatorById(trimmed), {
      includeUniversity: false,
    });
    const data = unwrapBookListing(response);
    if (!data) {
      return { success: false as const, message: "Listing not found", data: null };
    }
    return { success: true as const, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load listing";
    return { success: false as const, message, data: null };
  }
}

/** PATCH /api/creator/book/:id */
export async function updateBookListingAction(id: string, payload: UpdateBookListingPayload) {
  const trimmed = id?.trim();
  if (!trimmed) {
    return { success: false as const, message: "Invalid listing id" };
  }
  try {
    await patchPrivate<unknown>(bookEndpoints.creatorById(trimmed), payload, {
      includeUniversity: false,
    });
    return { success: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update listing";
    return { success: false as const, message };
  }
}

/** DELETE /api/creator/book/:id */
export async function deleteBookListingAction(id: string) {
  const trimmed = id?.trim();
  if (!trimmed) {
    return { success: false as const, message: "Invalid listing id" };
  }
  try {
    await deletePrivate<unknown>(bookEndpoints.creatorById(trimmed), undefined, {
      includeUniversity: false,
    });
    return { success: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete listing";
    return { success: false as const, message };
  }
}

/** POST /api/creator/book */
export async function createBookListingAction(payload: CreateBookListingPayload) {
  try {
    const endpoint = getBookCreateEndpoint(payload.listingType);
    const response = await postPrivate<unknown>(endpoint, payload, {
      includeUniversity: false,
    });
    const listingId = unwrapCreatedListingId(response);
    return { success: true as const, listingId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create listing";
    return { success: false as const, message, listingId: null as string | null };
  }
}
