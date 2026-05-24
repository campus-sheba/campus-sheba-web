"use server";

import type {
  BluebookHomeFeed,
  BookBrowsePaginatedResponse,
  BookListing,
  BookPaginatedResponse,
  BookshelfDiscoverCard,
  BrowseSegment,
  CreateBookPayload,
  CreateShelfBookPayload,
  PromoteBookPayload,
  UpdateBookPayload,
} from "@/types/book";
import type { BuySellCategory } from "@/types/buy-sell";
import { deletePrivate } from "@/utils/api/delete";
import { getPrivate, getPublic } from "@/utils/api/get";
import { patchPrivate } from "@/utils/api/patch";
import { postPrivate } from "@/utils/api/post";
import {
  bookEndpoints,
  userEndpoints,
} from "@/utils/endpoints/endpoints";

// ── Query param types ──────────────────────────────────────────────────────────

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
  semester?: string;
  courseCode?: string;
  language?: string;
  availabilityStatus?: string;
  allowsExtension?: boolean;
  minBorrowDuration?: number;
  maxBorrowDuration?: number;
};

export type CreatorBookListParams = Omit<BookListParams, "university"> & {
  university?: string;
  status?: string;
  shelfStatus?: string;
};

export type BooksBrowseParams = BookListParams & {
  segment: BrowseSegment;
};

// ── Response normalisation ─────────────────────────────────────────────────────

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

function unwrapBook(response: unknown): BookListing | null {
  if (!response || typeof response !== "object") return null;
  const r = response as Record<string, unknown>;
  if (r.data && typeof r.data === "object" && r.data !== null && "_id" in r.data) {
    return r.data as BookListing;
  }
  if ("_id" in r) return response as BookListing;
  return null;
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

// ── URL builders ───────────────────────────────────────────────────────────────

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
  if (params.semester) q.set("semester", params.semester);
  if (params.courseCode) q.set("courseCode", params.courseCode);
  if (params.language) q.set("language", params.language);
  if (params.availabilityStatus) q.set("availabilityStatus", params.availabilityStatus);
  if (params.allowsExtension != null) q.set("allowsExtension", String(params.allowsExtension));
  if (params.minBorrowDuration != null) q.set("minBorrowDuration", String(params.minBorrowDuration));
  if (params.maxBorrowDuration != null) q.set("maxBorrowDuration", String(params.maxBorrowDuration));
  const query = q.toString();
  return query ? `${bookEndpoints.userBase}?${query}` : bookEndpoints.userBase;
}

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
  if (params.semester) q.set("semester", params.semester);
  if (params.courseCode) q.set("courseCode", params.courseCode);
  if (params.status) q.set("status", params.status);
  if (params.shelfStatus) q.set("shelfStatus", params.shelfStatus);
  const query = q.toString();
  return query ? `${bookEndpoints.creatorOwn}?${query}` : bookEndpoints.creatorOwn;
}

function buildBrowseUrl(params: BooksBrowseParams): string {
  const q = new URLSearchParams();
  q.set("segment", params.segment);
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
  if (params.semester) q.set("semester", params.semester);
  if (params.courseCode) q.set("courseCode", params.courseCode);
  return `${bookEndpoints.userBrowse}?${q.toString()}`;
}

function unwrapBrowseResponse(response: unknown): BookBrowsePaginatedResponse {
  const base = unwrapBookPaginatedResponse(response);
  if (!response || typeof response !== "object") return base;
  const r = response as Record<string, unknown>;
  const segment =
    typeof r.segment === "string" ? (r.segment as BrowseSegment) : undefined;
  return { ...base, segment };
}

function unwrapBookshelfDiscover(response: unknown): BookshelfDiscoverCard[] {
  if (!response || typeof response !== "object") return [];
  const r = response as Record<string, unknown>;
  if (Array.isArray(r.data)) return r.data as BookshelfDiscoverCard[];
  return [];
}

function unwrapBluebookFeed(response: unknown): BluebookHomeFeed | null {
  if (!response || typeof response !== "object") return null;
  const r = response as Record<string, unknown>;
  const data = r.data;
  if (!data || typeof data !== "object") return null;
  return data as BluebookHomeFeed;
}

function buildFeedUrl(base: string, page?: number, limit?: number): string {
  const q = new URLSearchParams();
  if (page != null) q.set("page", String(page));
  if (limit != null) q.set("limit", String(limit));
  const query = q.toString();
  return query ? `${base}?${query}` : base;
}

// ── Public book listing ────────────────────────────────────────────────────────

/** Bluebook home — GET /user/books/feed (optional JWT; guests need university query). */
export async function fetchBluebookHomeFeed(
  universityId?: string,
): Promise<BluebookHomeFeed | null> {
  const url = universityId
    ? `${bookEndpoints.userFeed}?university=${encodeURIComponent(universityId)}`
    : bookEndpoints.userFeed;
  const res = await getPublic<unknown>(url, {
    universityId,
    includeUniversity: !universityId,
  });
  return unwrapBluebookFeed(res);
}

/** Paginated segment browse — GET /user/books/browse?segment=… */
export async function fetchBooksBrowse(
  params: BooksBrowseParams,
): Promise<BookBrowsePaginatedResponse> {
  const res = await getPublic<unknown>(buildBrowseUrl(params), {
    universityId: params.university,
    includeUniversity: false,
  });
  return unwrapBrowseResponse(res);
}

/** Discover campus bookshelves — GET /user/books/browse/bookshelves */
export async function fetchBrowseBookshelves(params: {
  university?: string;
  sortBy?: "reputation" | "recent" | "followers";
  searchKey?: string;
  page?: number;
  limit?: number;
} = {}): Promise<{ page: number; limit: number; total: number; data: BookshelfDiscoverCard[] }> {
  const q = new URLSearchParams();
  if (params.page != null) q.set("page", String(params.page));
  if (params.limit != null) q.set("limit", String(params.limit));
  if (params.searchKey?.trim()) q.set("searchKey", params.searchKey.trim());
  if (params.university) q.set("university", params.university);
  if (params.sortBy) q.set("sortBy", params.sortBy);
  const query = q.toString();
  const url = query
    ? `${bookEndpoints.userBrowseBookshelves}?${query}`
    : bookEndpoints.userBrowseBookshelves;
  const res = await getPublic<unknown>(url, {
    universityId: params.university,
    includeUniversity: false,
  });
  if (!res || typeof res !== "object") {
    return { page: 1, limit: 10, total: 0, data: [] };
  }
  const r = res as Record<string, unknown>;
  const rows = unwrapBookshelfDiscover(res);
  return {
    page: typeof r.page === "number" ? r.page : 1,
    limit: typeof r.limit === "number" ? r.limit : 10,
    total: typeof r.total === "number" ? r.total : rows.length,
    data: rows,
  };
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

export async function fetchBorrowableBooks(
  params: BookListParams = {},
): Promise<BookPaginatedResponse> {
  const q = new URLSearchParams();
  if (params.page != null) q.set("page", String(params.page));
  if (params.limit != null) q.set("limit", String(params.limit));
  if (params.searchKey?.trim()) q.set("searchKey", params.searchKey.trim());
  if (params.university) q.set("university", params.university);
  if (params.semester) q.set("semester", params.semester);
  if (params.courseCode) q.set("courseCode", params.courseCode);
  if (params.quality) q.set("quality", params.quality);
  if (params.language) q.set("language", params.language);
  if (params.availabilityStatus) q.set("availabilityStatus", params.availabilityStatus);
  if (params.allowsExtension != null) q.set("allowsExtension", String(params.allowsExtension));
  if (params.minBorrowDuration != null) q.set("minBorrowDuration", String(params.minBorrowDuration));
  if (params.maxBorrowDuration != null) q.set("maxBorrowDuration", String(params.maxBorrowDuration));
  const query = q.toString();
  const url = query ? `${bookEndpoints.userBorrowable}?${query}` : bookEndpoints.userBorrowable;
  const res = await getPublic<unknown>(url, { includeUniversity: false });
  return unwrapBookPaginatedResponse(res);
}

export async function fetchUserBookById(id: string): Promise<BookListing | null> {
  if (!id) return null;
  const res = await getPublic<{ data?: BookListing }>(bookEndpoints.userById(id), {
    includeUniversity: false,
  });
  return res?.data ?? null;
}

// ── Discovery feeds (auth required) ───────────────────────────────────────────

export async function fetchSemesterFeed(page = 1, limit = 10): Promise<BookPaginatedResponse> {
  const res = await getPrivate<unknown>(buildFeedUrl(bookEndpoints.feedSemester, page, limit), {
    includeUniversity: false,
  });
  return unwrapBookPaginatedResponse(res);
}

export async function fetchSeniorPicksFeed(page = 1, limit = 10): Promise<BookPaginatedResponse> {
  const res = await getPrivate<unknown>(buildFeedUrl(bookEndpoints.feedSeniorPicks, page, limit), {
    includeUniversity: false,
  });
  return unwrapBookPaginatedResponse(res);
}

export async function fetchDepartmentFeed(
  deptId: string,
  page = 1,
  limit = 10,
): Promise<BookPaginatedResponse> {
  const res = await getPrivate<unknown>(
    buildFeedUrl(bookEndpoints.feedDepartment(deptId), page, limit),
    { includeUniversity: false },
  );
  return unwrapBookPaginatedResponse(res);
}

// ── Categories ─────────────────────────────────────────────────────────────────

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

  if (Array.isArray(r.data)) {
    const rows = r.data as BuySellCategory[];
    return {
      page: typeof r.page === "number" ? r.page : 1,
      limit: typeof r.limit === "number" ? r.limit : 100,
      total: typeof r.total === "number" ? r.total : rows.length,
      data: rows,
    };
  }

  if (r.data && typeof r.data === "object" && !Array.isArray(r.data)) {
    const inner = r.data as Record<string, unknown>;
    const nested = inner.data;
    return {
      page: typeof inner.page === "number" ? inner.page : 1,
      limit: typeof inner.limit === "number" ? inner.limit : 100,
      total:
        typeof inner.total === "number"
          ? inner.total
          : Array.isArray(nested)
            ? nested.length
            : 0,
      data: Array.isArray(nested) ? (nested as BuySellCategory[]) : [],
    };
  }

  return { page: 1, limit: 100, total: 0, data: [] };
}

export async function fetchBookCategories(page = 1, limit = 100): Promise<BookCategoriesResponse> {
  const q = new URLSearchParams({ page: String(page), limit: String(limit), type: "Book" });
  const res = await getPublic<unknown>(`${userEndpoints.categories}?${q.toString()}`, {
    includeUniversity: false,
  });
  return unwrapBookCategoriesResponse(res);
}

export async function fetchUserCategoriesByType(
  type: string,
  page = 1,
  limit = 100,
): Promise<BookCategoriesResponse> {
  const q = new URLSearchParams({ page: String(page), limit: String(limit), type });
  const res = await getPublic<unknown>(`${userEndpoints.categories}?${q.toString()}`, {
    includeUniversity: false,
  });
  return unwrapBookCategoriesResponse(res);
}

// ── Creator CRUD ───────────────────────────────────────────────────────────────

export async function fetchCreatorOwnBooks(
  params: CreatorBookListParams = {},
): Promise<BookPaginatedResponse> {
  const res = await getPrivate<unknown>(buildCreatorOwnUrl(params), {
    includeUniversity: false,
  });
  return unwrapBookPaginatedResponse(res);
}

export async function getCreatorBookByIdAction(id: string) {
  const trimmed = id?.trim();
  if (!trimmed) {
    return {
      success: false as const,
      message: "Invalid book id",
      data: null as BookListing | null,
    };
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

export type BookCreateMode = "sell" | "lend" | "donate" | "swap" | "library-only";

export async function createBookListingAction(
  payload: CreateBookPayload,
  mode: BookCreateMode,
) {
  const urlMap: Record<BookCreateMode, string> = {
    sell: bookEndpoints.creatorSell,
    lend: bookEndpoints.creatorLend,
    donate: bookEndpoints.creatorDonate,
    swap: bookEndpoints.creatorSwap,
    "library-only": bookEndpoints.creatorLibraryOnly,
  };
  try {
    const response = await postPrivate<unknown>(urlMap[mode], payload, {
      includeUniversity: false,
    });
    const bookId = unwrapCreatedBookId(response);
    return { success: true as const, bookId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create listing";
    return { success: false as const, message, bookId: null as string | null };
  }
}

/** Add a showcase book via the slim shelf endpoint (server forces type/price/qty). */
export async function addShelfBookAction(payload: CreateShelfBookPayload) {
  try {
    const response = await postPrivate<unknown>(bookEndpoints.creatorShelf, payload, {
      includeUniversity: false,
    });
    const bookId = unwrapCreatedBookId(response);
    return { success: true as const, bookId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add shelf book";
    return { success: false as const, message, bookId: null as string | null };
  }
}

/** Promote a Library Only book into a transactional lane (re-moderated). */
export async function promoteBookAction(id: string, payload: PromoteBookPayload) {
  const trimmed = id?.trim();
  if (!trimmed) {
    return { success: false as const, message: "Invalid book id" };
  }
  try {
    await postPrivate<unknown>(bookEndpoints.creatorPromote(trimmed), payload, {
      includeUniversity: false,
    });
    return { success: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to promote book";
    return { success: false as const, message };
  }
}

/**
 * Restore a promoted/for-sale book back to the bookshelf (showcase).
 * Powers both "Restore to shelf" and "Cancel listing" — the book stays in the
 * library, just no longer for sale. Server blocks this while an order is in flight.
 */
export async function restoreBookToShelfAction(id: string) {
  const trimmed = id?.trim();
  if (!trimmed) {
    return { success: false as const, message: "Invalid book id" };
  }
  try {
    await patchPrivate<unknown>(bookEndpoints.creatorRestore(trimmed), {}, {
      includeUniversity: false,
    });
    return { success: true as const };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to restore book to shelf";
    return { success: false as const, message };
  }
}

/** Fetch another user's approved shelf (public, optional auth). */
export async function fetchBooksByOwner(
  ownerId: string,
  params: { type?: string; status?: string; searchKey?: string; page?: number; limit?: number } = {},
): Promise<BookPaginatedResponse> {
  const trimmed = ownerId?.trim();
  if (!trimmed) return { page: 1, limit: 20, total: 0, data: [] };
  const q = new URLSearchParams();
  if (params.type) q.set("type", params.type);
  if (params.status) q.set("status", params.status);
  if (params.searchKey?.trim()) q.set("searchKey", params.searchKey.trim());
  if (params.page != null) q.set("page", String(params.page));
  if (params.limit != null) q.set("limit", String(params.limit));
  const query = q.toString();
  const base = bookEndpoints.userByOwner(trimmed);
  const url = query ? `${base}?${query}` : base;
  const res = await getPublic<unknown>(url, { includeUniversity: false });
  return unwrapBookPaginatedResponse(res);
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
