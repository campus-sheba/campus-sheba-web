"use server";

import type {
  LibraryProfileReview,
  LibraryProfileReviewsResponse,
  SubmitLibraryProfileReviewPayload,
} from "@/types/book";
import { deletePrivate } from "@/utils/api/delete";
import { getPublic } from "@/utils/api/get";
import { postPrivate } from "@/utils/api/post";
import { libraryProfileReviewEndpoints } from "@/utils/endpoints/endpoints";

function unwrapReviews(response: unknown): LibraryProfileReviewsResponse {
  if (!response || typeof response !== "object") {
    return { page: 1, limit: 10, total: 0, data: [] };
  }
  const r = response as Record<string, unknown>;
  if (Array.isArray(r.data)) {
    return {
      page: typeof r.page === "number" ? r.page : 1,
      limit: typeof r.limit === "number" ? r.limit : 10,
      total: typeof r.total === "number" ? r.total : (r.data as LibraryProfileReview[]).length,
      data: r.data as LibraryProfileReview[],
    };
  }
  return { page: 1, limit: 10, total: 0, data: [] };
}

export async function fetchLibraryProfileReviews(
  profileId: string,
  page = 1,
  limit = 10,
): Promise<LibraryProfileReviewsResponse> {
  if (!profileId) return { page, limit, total: 0, data: [] };
  const q = new URLSearchParams({ page: String(page), limit: String(limit) });
  const url = `${libraryProfileReviewEndpoints.byProfile(profileId)}?${q.toString()}`;
  const res = await getPublic<unknown>(url, { includeUniversity: false });
  return unwrapReviews(res);
}

export async function submitLibraryProfileReviewAction(
  payload: SubmitLibraryProfileReviewPayload,
) {
  try {
    const res = await postPrivate<unknown>(libraryProfileReviewEndpoints.base, payload, {
      includeUniversity: false,
    });
    const r = res as Record<string, unknown>;
    const review =
      r?.data && typeof r.data === "object" && "_id" in r.data
        ? (r.data as LibraryProfileReview)
        : null;
    return { success: true as const, review };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit review";
    return { success: false as const, message, review: null };
  }
}

export async function deleteLibraryProfileReviewAction(reviewId: string) {
  try {
    await deletePrivate<unknown>(libraryProfileReviewEndpoints.byId(reviewId), undefined, {
      includeUniversity: false,
    });
    return { success: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete review";
    return { success: false as const, message };
  }
}
