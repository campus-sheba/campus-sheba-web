"use server";

import type {
  BookListing,
  BookPaginatedResponse,
  CreateBookPayload,
  UpdateBookPayload,
} from "@/types/book";
import type { BuySellCategory } from "@/types/buy-sell";
import { deletePrivate } from "@/utils/api/delete";
import { getPrivate, getPublic } from "@/utils/api/get";
import { patchPrivate } from "@/utils/api/patch";
import { postPrivate } from "@/utils/api/post";
import { bookBorrowingEndpoints, bookEndpoints, userEndpoints } from "@/utils/endpoints/endpoints";

export type BookListParams = {
  page?: number;
  limit?: number;
  searchKey?: string;
  university?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  type?: string;
  quality?: string;
  year?: string;
  department?: string;
};

function buildUserBooksUrl(params: BookListParams): string {
  const q = new URLSearchParams();
  if (params.page != null) q.set("page", String(params.page));
  if (params.limit != null) q.set("limit", String(params.limit));
  if (params.searchKey?.trim()) q.set("searchKey", params.searchKey.trim());
  if (params.university) q.set("university", params.university);
  if (params.category) q.set("category", params.category);
  if (params.minPrice != null) q.set("minPrice", String(params.minPrice));
  if (params.maxPrice != null) q.set("maxPrice", String(params.maxPrice));
  if (params.type) q.set("type", params.type);
  if (params.quality) q.set("quality", params.quality);
  if (params.year) q.set("year", params.year);
  if (params.department) q.set("department", params.department);
  const query = q.toString();
  return query ? `${bookEndpoints.userBase}?${query}` : bookEndpoints.userBase;
}

/**
 * Handles paginated book list shapes:
 * - User: `{ page, limit, total, data: BookListing[] }`
 * - Nested: `{ data: { page, limit, total, data: BookListing[] } }`
 * - Creator own: `{ page, limit, total, data: { books: BookListing[], booksByType?, stats? } }`
 */
function unwrapBookPaginatedResponse(response: unknown): BookPaginatedResponse {
  if (!response || typeof response !== "object") {
    return { page: 1, limit: 10, total: 0, data: [] };
  }
  const r = response as Record<string, unknown>;

  if (r.data && typeof r.data === "object" && !Array.isArray(r.data)) {
    const inner = r.data as Record<string, unknown>;

    if (Array.isArray(inner.books)) {
      const rows = inner.books as BookListing[];
      return {
        page: typeof r.page === "number" ? r.page : 1,
        limit: typeof r.limit === "number" ? r.limit : 10,
        total: typeof r.total === "number" ? r.total : rows.length,
        data: rows,
      };
    }

    if (Array.isArray(inner.data)) {
      const rows = inner.data as BookListing[];
      return {
        page: typeof inner.page === "number" ? inner.page : 1,
        limit: typeof inner.limit === "number" ? inner.limit : 10,
        total: typeof inner.total === "number" ? inner.total : rows.length,
        data: rows,
      };
    }
  }

  if (Array.isArray(r.data)) {
    const rows = r.data as BookListing[];
    return {
      page: typeof r.page === "number" ? r.page : 1,
      limit: typeof r.limit === "number" ? r.limit : 10,
      total: typeof r.total === "number" ? r.total : rows.length,
      data: rows,
    };
  }

  return { page: 1, limit: 10, total: 0, data: [] };
}

export async function fetchUserBooksList(
  params: BookListParams = {},
): Promise<BookPaginatedResponse> {
  const url = buildUserBooksUrl(params);
  const res = await getPublic<unknown>(url, {
    universityId: params.university,
    includeUniversity: false,
  });
  return unwrapBookPaginatedResponse(res);
}

export async function fetchUserBookById(id: string): Promise<BookListing | null> {
  if (!id) return null;
  const res = await getPublic<{ data?: BookListing }>(bookEndpoints.userById(id), {
    includeUniversity: false,
  });
  return res?.data ?? null;
}

export type BookCategoriesResponse = {
  page: number;
  limit: number;
  total: number;
  data: BuySellCategory[];
};

function unwrapBookCategoriesResponse(response: unknown): BookCategoriesResponse {
  if (!response || typeof response !== "object") {
    return { page: 1, limit: 100, total: 0, data: [] };
  }
  const r = response as Record<string, unknown>;

  // Common: `{ page, limit, total, data: Category[] }` — `data` is an array (arrays are `typeof "object"`).
  if (Array.isArray(r.data)) {
    const rows = r.data as BuySellCategory[];
    return {
      page: typeof r.page === "number" ? r.page : 1,
      limit: typeof r.limit === "number" ? r.limit : 100,
      total: typeof r.total === "number" ? r.total : rows.length,
      data: rows,
    };
  }

  // Wrapped: `{ data: { page, limit, total, data: Category[] } }`
  if (r.data && typeof r.data === "object" && !Array.isArray(r.data)) {
    const inner = r.data as Record<string, unknown>;
    const nested = inner.data;
    return {
      page: typeof inner.page === "number" ? inner.page : 1,
      limit: typeof inner.limit === "number" ? inner.limit : 100,
      total: typeof inner.total === "number" ? inner.total : Array.isArray(nested) ? nested.length : 0,
      data: Array.isArray(nested) ? (nested as BuySellCategory[]) : [],
    };
  }

  return { page: 1, limit: 100, total: 0, data: [] };
}

/** GET /api/user/categories?type=Book */
export async function fetchBookCategories(page = 1, limit = 100): Promise<BookCategoriesResponse> {
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

/** GET /api/user/categories?type=… (e.g. Lost and Found, Buy and Sell, Book) */
export async function fetchUserCategoriesByType(
  type: string,
  page = 1,
  limit = 100,
): Promise<BookCategoriesResponse> {
  const q = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    type,
  });
  const res = await getPublic<unknown>(`${userEndpoints.categories}?${q.toString()}`, {
    includeUniversity: false,
  });
  return unwrapBookCategoriesResponse(res);
}

export type CreatorBookListParams = Omit<BookListParams, "university"> & {
  university?: string;
};

function buildCreatorOwnUrl(params: CreatorBookListParams): string {
  const q = new URLSearchParams();
  if (params.page != null) q.set("page", String(params.page));
  if (params.limit != null) q.set("limit", String(params.limit));
  if (params.searchKey?.trim()) q.set("searchKey", params.searchKey.trim());
  if (params.university) q.set("university", params.university);
  if (params.category) q.set("category", params.category);
  if (params.minPrice != null) q.set("minPrice", String(params.minPrice));
  if (params.maxPrice != null) q.set("maxPrice", String(params.maxPrice));
  if (params.type) q.set("type", params.type);
  if (params.quality) q.set("quality", params.quality);
  if (params.year) q.set("year", params.year);
  if (params.department) q.set("department", params.department);
  const query = q.toString();
  return query ? `${bookEndpoints.creatorOwn}?${query}` : bookEndpoints.creatorOwn;
}

export async function fetchCreatorOwnBooks(
  params: CreatorBookListParams = {},
): Promise<BookPaginatedResponse> {
  const res = await getPrivate<unknown>(buildCreatorOwnUrl(params), {
    includeUniversity: false,
  });
  return unwrapBookPaginatedResponse(res);
}

function unwrapBook(response: unknown): BookListing | null {
  if (!response || typeof response !== "object") return null;
  const r = response as Record<string, unknown>;
  if (r.data && typeof r.data === "object" && r.data !== null && "_id" in r.data) {
    return r.data as BookListing;
  }
  if ("_id" in r) return response as BookListing;
  return null;
}

export async function getCreatorBookByIdAction(id: string) {
  const trimmed = id?.trim();
  if (!trimmed) {
    return { success: false as const, message: "Invalid book id", data: null as BookListing | null };
  }
  try {
    const response = await getPrivate<unknown>(bookEndpoints.creatorById(trimmed), {
      includeUniversity: false,
    });
    const data = unwrapBook(response);
    if (!data) {
      return { success: false as const, message: "Book not found", data: null };
    }
    return { success: true as const, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load book";
    return { success: false as const, message, data: null };
  }
}

function unwrapCreatedBookId(response: unknown): string | null {
  if (!response || typeof response !== "object") return null;
  const r = response as Record<string, unknown>;
  if (r.data && typeof r.data === "object" && r.data !== null && "_id" in r.data) {
    const id = (r.data as { _id?: unknown })._id;
    return typeof id === "string" ? id : null;
  }
  if ("_id" in r && typeof r._id === "string") return r._id;
  return null;
}

export type BookCreateMode = "sell" | "lend" | "donate";

export async function createBookListingAction(payload: CreateBookPayload, mode: BookCreateMode) {
  const url =
    mode === "sell"
      ? bookEndpoints.creatorSell
      : mode === "lend"
        ? bookEndpoints.creatorLend
        : bookEndpoints.creatorDonate;
  try {
    const response = await postPrivate<unknown>(url, payload, {
      includeUniversity: false,
    });
    const bookId = unwrapCreatedBookId(response);
    return { success: true as const, bookId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create listing";
    return { success: false as const, message, bookId: null as string | null };
  }
}

export async function updateBookAction(id: string, payload: UpdateBookPayload) {
  const trimmed = id?.trim();
  if (!trimmed) {
    return { success: false as const, message: "Invalid book id" };
  }
  try {
    await patchPrivate<unknown>(bookEndpoints.creatorById(trimmed), payload, {
      includeUniversity: false,
    });
    return { success: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update book";
    return { success: false as const, message };
  }
}

export async function deleteBookAction(id: string) {
  const trimmed = id?.trim();
  if (!trimmed) {
    return { success: false as const, message: "Invalid book id" };
  }
  try {
    await deletePrivate<unknown>(bookEndpoints.creatorById(trimmed), undefined, {
      includeUniversity: false,
    });
    return { success: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete book";
    return { success: false as const, message };
  }
}

export type BookBorrowRequestPayload = {
  bookId: string;
  requestedDueDate: string;
  requestMessage?: string;
  securityDeposit?: number;
};

export async function requestBookBorrowAction(payload: BookBorrowRequestPayload) {
  try {
    await postPrivate<unknown>(bookBorrowingEndpoints.request, payload, {
      includeUniversity: false,
    });
    return { success: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit borrow request";
    return { success: false as const, message };
  }
}
