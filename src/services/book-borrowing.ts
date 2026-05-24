"use server";

import type {
  BookBorrowPaginatedResponse,
  BookBorrowRecord,
  BookBorrowRequestPayload,
  BorrowExtendPayload,
  BorrowRespondPayload,
  BorrowReturnPayload,
  BorrowRefundInfo,
  ExtendRespondPayload,
} from "@/types/book";
import { getPrivate } from "@/utils/api/get";
import { patchPrivate } from "@/utils/api/patch";
import { postPrivate } from "@/utils/api/post";
import { bookBorrowingEndpoints } from "@/utils/endpoints/endpoints";

export type BookBorrowListParams = {
  page?: number;
  limit?: number;
  status?: string;
  searchKey?: string;
  sortBy?: string;
  sortOrder?: string;
};

function unwrapBorrowPaginated(response: unknown): BookBorrowPaginatedResponse {
  if (!response || typeof response !== "object") {
    return { page: 1, limit: 10, total: 0, data: [] };
  }
  const r = response as Record<string, unknown>;

  if (Array.isArray(r.data)) {
    return {
      page: typeof r.page === "number" ? r.page : 1,
      limit: typeof r.limit === "number" ? r.limit : 10,
      total: typeof r.total === "number" ? r.total : (r.data as BookBorrowRecord[]).length,
      data: r.data as BookBorrowRecord[],
    };
  }

  if (r.data && typeof r.data === "object" && !Array.isArray(r.data)) {
    const inner = r.data as Record<string, unknown>;
    if (Array.isArray(inner.data)) {
      return {
        page: typeof inner.page === "number" ? inner.page : 1,
        limit: typeof inner.limit === "number" ? inner.limit : 10,
        total: typeof inner.total === "number" ? inner.total : (inner.data as BookBorrowRecord[]).length,
        data: inner.data as BookBorrowRecord[],
      };
    }
  }

  return { page: 1, limit: 10, total: 0, data: [] };
}

function buildBorrowUrl(base: string, params: BookBorrowListParams): string {
  const q = new URLSearchParams();
  if (params.page != null) q.set("page", String(params.page));
  if (params.limit != null) q.set("limit", String(params.limit));
  if (params.status) q.set("status", params.status);
  if (params.searchKey?.trim()) q.set("searchKey", params.searchKey.trim());
  if (params.sortBy) q.set("sortBy", params.sortBy);
  if (params.sortOrder) q.set("sortOrder", params.sortOrder);
  const query = q.toString();
  return query ? `${base}?${query}` : base;
}

export async function requestBookBorrowAction(payload: BookBorrowRequestPayload) {
  try {
    await postPrivate<unknown>(bookBorrowingEndpoints.request, payload, {
      includeUniversity: false,
    });
    return { success: true as const };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to submit borrow request";
    return { success: false as const, message };
  }
}

export async function fetchBorrowedBooks(
  params: BookBorrowListParams = {},
): Promise<BookBorrowPaginatedResponse> {
  const res = await getPrivate<unknown>(buildBorrowUrl(bookBorrowingEndpoints.borrowed, params), {
    includeUniversity: false,
  });
  return unwrapBorrowPaginated(res);
}

export async function fetchLentBooks(
  params: BookBorrowListParams = {},
): Promise<BookBorrowPaginatedResponse> {
  const res = await getPrivate<unknown>(buildBorrowUrl(bookBorrowingEndpoints.lent, params), {
    includeUniversity: false,
  });
  return unwrapBorrowPaginated(res);
}

export async function respondToBorrowRequestAction(
  borrowRequestId: string,
  payload: BorrowRespondPayload,
) {
  try {
    await patchPrivate<unknown>(bookBorrowingEndpoints.respond(borrowRequestId), payload, {
      includeUniversity: false,
    });
    return { success: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to respond";
    return { success: false as const, message };
  }
}

export async function markBookReturnedAction(
  borrowRequestId: string,
  payload: BorrowReturnPayload,
) {
  try {
    const res = await patchPrivate<unknown>(
      bookBorrowingEndpoints.returnBook(borrowRequestId),
      payload,
      { includeUniversity: false },
    );
    const refundInfo =
      res && typeof res === "object" && "data" in res
        ? ((res as { data?: { refundInfo?: BorrowRefundInfo } }).data?.refundInfo ?? null)
        : null;
    return { success: true as const, refundInfo };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to mark returned";
    return { success: false as const, message, refundInfo: null };
  }
}

export async function requestBorrowExtensionAction(
  borrowRequestId: string,
  payload: BorrowExtendPayload,
) {
  try {
    await postPrivate<unknown>(bookBorrowingEndpoints.extendRequest(borrowRequestId), payload, {
      includeUniversity: false,
    });
    return { success: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to request extension";
    return { success: false as const, message };
  }
}

export async function respondToExtensionAction(
  borrowRequestId: string,
  extendRequestId: string,
  payload: ExtendRespondPayload,
) {
  try {
    await patchPrivate<unknown>(
      bookBorrowingEndpoints.extendRespond(borrowRequestId, extendRequestId),
      payload,
      { includeUniversity: false },
    );
    return { success: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to respond to extension";
    return { success: false as const, message };
  }
}
