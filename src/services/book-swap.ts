"use server";

import type {
  BookSwapPaginatedResponse,
  BookSwapRecord,
  CreateBookSwapPayload,
} from "@/types/book";
import { getPrivate } from "@/utils/api/get";
import { patchPrivate } from "@/utils/api/patch";
import { postPrivate } from "@/utils/api/post";
import { bookSwapEndpoints } from "@/utils/endpoints/endpoints";

export type BookSwapListParams = {
  page?: number;
  limit?: number;
  status?: string;
};

function unwrapSwapPaginated(response: unknown): BookSwapPaginatedResponse {
  if (!response || typeof response !== "object") {
    return { page: 1, limit: 10, total: 0, data: [] };
  }
  const r = response as Record<string, unknown>;
  if (Array.isArray(r.data)) {
    return {
      page: typeof r.page === "number" ? r.page : 1,
      limit: typeof r.limit === "number" ? r.limit : 10,
      total: typeof r.total === "number" ? r.total : (r.data as BookSwapRecord[]).length,
      data: r.data as BookSwapRecord[],
    };
  }
  return { page: 1, limit: 10, total: 0, data: [] };
}

function unwrapSwap(response: unknown): BookSwapRecord | null {
  if (!response || typeof response !== "object") return null;
  const r = response as Record<string, unknown>;
  if (r.data && typeof r.data === "object" && r.data !== null && "_id" in r.data) {
    return r.data as BookSwapRecord;
  }
  return null;
}

function buildSwapListUrl(base: string, params: BookSwapListParams): string {
  const q = new URLSearchParams();
  if (params.page != null) q.set("page", String(params.page));
  if (params.limit != null) q.set("limit", String(params.limit));
  if (params.status) q.set("status", params.status);
  const query = q.toString();
  return query ? `${base}?${query}` : base;
}

export async function proposeBookSwapAction(payload: CreateBookSwapPayload) {
  try {
    const res = await postPrivate<unknown>(bookSwapEndpoints.base, payload, {
      includeUniversity: false,
    });
    const data = unwrapSwap(res);
    return { success: true as const, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to propose swap";
    return { success: false as const, message, data: null };
  }
}

export async function fetchIncomingSwaps(
  params: BookSwapListParams = {},
): Promise<BookSwapPaginatedResponse> {
  const res = await getPrivate<unknown>(
    buildSwapListUrl(bookSwapEndpoints.incoming, params),
    { includeUniversity: false },
  );
  return unwrapSwapPaginated(res);
}

export async function fetchOutgoingSwaps(
  params: BookSwapListParams = {},
): Promise<BookSwapPaginatedResponse> {
  const res = await getPrivate<unknown>(
    buildSwapListUrl(bookSwapEndpoints.outgoing, params),
    { includeUniversity: false },
  );
  return unwrapSwapPaginated(res);
}

export async function acceptBookSwapAction(swapId: string) {
  try {
    const res = await patchPrivate<unknown>(bookSwapEndpoints.accept(swapId), {}, {
      includeUniversity: false,
    });
    return { success: true as const, data: unwrapSwap(res) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to accept swap";
    return { success: false as const, message, data: null };
  }
}

export async function rejectBookSwapAction(swapId: string) {
  try {
    const res = await patchPrivate<unknown>(bookSwapEndpoints.reject(swapId), {}, {
      includeUniversity: false,
    });
    return { success: true as const, data: unwrapSwap(res) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to reject swap";
    return { success: false as const, message, data: null };
  }
}

export async function completeBookSwapAction(swapId: string) {
  try {
    const res = await patchPrivate<unknown>(bookSwapEndpoints.complete(swapId), {}, {
      includeUniversity: false,
    });
    return { success: true as const, data: unwrapSwap(res) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to complete swap";
    return { success: false as const, message, data: null };
  }
}

export async function cancelBookSwapAction(swapId: string) {
  try {
    const res = await patchPrivate<unknown>(bookSwapEndpoints.cancel(swapId), {}, {
      includeUniversity: false,
    });
    return { success: true as const, data: unwrapSwap(res) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to cancel swap";
    return { success: false as const, message, data: null };
  }
}
