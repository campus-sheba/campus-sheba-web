"use server";

import { getPublic } from "@/utils/api/get";
import { patchPrivate } from "@/utils/api/patch";
import { postPrivate } from "@/utils/api/post";
import { reviewEndpoints } from "@/utils/endpoints/endpoints";
import type { ReviewItem, ReviewListResponse } from "@/types/reviews";

const privateOpts = { includeUniversity: false as const };

function unwrapReviewList(response: unknown): ReviewListResponse {
  const empty: ReviewListResponse = { page: 1, limit: 10, total: 0, data: [] };
  if (!response || typeof response !== "object") return empty;
  const r = response as Record<string, unknown>;
  if (Array.isArray(r.data)) {
    return {
      page: typeof r.page === "number" ? r.page : 1,
      limit: typeof r.limit === "number" ? r.limit : 10,
      total: typeof r.total === "number" ? r.total : r.data.length,
      data: r.data as ReviewItem[],
    };
  }
  if (r.data && typeof r.data === "object") {
    const inner = r.data as Record<string, unknown>;
    if (Array.isArray(inner.data)) {
      return {
        page: typeof inner.page === "number" ? inner.page : 1,
        limit: typeof inner.limit === "number" ? inner.limit : 10,
        total: typeof inner.total === "number" ? inner.total : inner.data.length,
        data: inner.data as ReviewItem[],
      };
    }
  }
  return empty;
}

export async function fetchUniversityLocationReviewsAction(
  locationId: string,
  page = 1,
  limit = 10,
): Promise<ReviewListResponse> {
  const trimmed = locationId?.trim();
  if (!trimmed) return { page, limit, total: 0, data: [] };
  const qs = `?page=${page}&limit=${limit}`;
  try {
    const res = await getPublic<unknown>(`${reviewEndpoints.universityLocation(trimmed)}${qs}`);
    return unwrapReviewList(res);
  } catch {
    return { page, limit, total: 0, data: [] };
  }
}

export async function submitUniversityLocationReviewAction(
  locationId: string,
  rating: number,
  comment?: string,
  photos?: { url: string; key?: string; size?: number }[],
) {
  const trimmed = locationId?.trim();
  if (!trimmed) return { success: false as const, message: "Invalid location" };
  try {
    const body = {
      reviewableType: "UniversityLocation",
      reviewableId: trimmed,
      rating,
      comment: comment?.trim() || undefined,
      photos: photos && photos.length ? photos : undefined,
    };
    const res = await postPrivate<unknown>(reviewEndpoints.base, body, privateOpts);
    return { success: true as const, data: res };
  } catch (e) {
    return { success: false as const, message: e instanceof Error ? e.message : "Failed" };
  }
}

/**
 * Submit a review for a delivered Buy & Sell purchase.
 * POST /user/reviews { reviewableType: "BuySell", ... }
 * Passing `orderId` lets the backend flag it as a verified purchase.
 */
export async function submitBuySellReviewAction(
  listingId: string,
  rating: number,
  comment?: string,
  orderId?: string,
  photos?: { url: string; key?: string; size?: number }[],
) {
  const trimmed = listingId?.trim();
  if (!trimmed) return { success: false as const, message: "Invalid listing" };
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return { success: false as const, message: "Rating must be between 1 and 5" };
  }
  try {
    const body = {
      reviewableType: "BuySell",
      reviewableId: trimmed,
      orderId: orderId?.trim() || undefined,
      rating,
      comment: comment?.trim() || undefined,
      photos: photos && photos.length ? photos : undefined,
    };
    const res = await postPrivate<unknown>(reviewEndpoints.base, body, privateOpts);
    return { success: true as const, data: res };
  } catch (e) {
    return { success: false as const, message: e instanceof Error ? e.message : "Failed" };
  }
}

export async function updateUniversityLocationReviewAction(
  reviewId: string,
  rating: number,
  comment?: string,
  photos?: { url: string; key?: string; size?: number }[],
) {
  const trimmed = reviewId?.trim();
  if (!trimmed) return { success: false as const, message: "Invalid review" };
  try {
    const body = {
      rating,
      comment: comment?.trim() || undefined,
      photos: photos && photos.length ? photos : undefined,
    };
    const res = await patchPrivate<unknown>(reviewEndpoints.byId(trimmed), body, privateOpts);
    return { success: true as const, data: res };
  } catch (e) {
    return { success: false as const, message: e instanceof Error ? e.message : "Failed" };
  }
}
