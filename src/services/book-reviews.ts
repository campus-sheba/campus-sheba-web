"use server";

import type { BookReview, BookReviewsResponse, SubmitBookReviewPayload } from "@/types/book";
import { deletePrivate } from "@/utils/api/delete";
import { getPublic } from "@/utils/api/get";
import { postPrivate } from "@/utils/api/post";
import { bookReviewEndpoints } from "@/utils/endpoints/endpoints";

function unwrapReviews(response: unknown): BookReviewsResponse {
  if (!response || typeof response !== "object") {
    return { page: 1, limit: 10, total: 0, data: [] };
  }
  const r = response as Record<string, unknown>;

  if (Array.isArray(r.data)) {
    return {
      page: typeof r.page === "number" ? r.page : 1,
      limit: typeof r.limit === "number" ? r.limit : 10,
      total: typeof r.total === "number" ? r.total : (r.data as BookReview[]).length,
      data: r.data as BookReview[],
    };
  }

  if (r.data && typeof r.data === "object" && !Array.isArray(r.data)) {
    const inner = r.data as Record<string, unknown>;
    if (Array.isArray(inner.data)) {
      return {
        page: typeof inner.page === "number" ? inner.page : 1,
        limit: typeof inner.limit === "number" ? inner.limit : 10,
        total: typeof inner.total === "number" ? inner.total : (inner.data as BookReview[]).length,
        data: inner.data as BookReview[],
      };
    }
  }

  return { page: 1, limit: 10, total: 0, data: [] };
}

export async function fetchBookReviews(
  bookId: string,
  page = 1,
  limit = 10,
): Promise<BookReviewsResponse> {
  if (!bookId) return { page: 1, limit, total: 0, data: [] };
  const q = new URLSearchParams({ page: String(page), limit: String(limit) });
  const url = `${bookReviewEndpoints.byBook(bookId)}?${q.toString()}`;
  const res = await getPublic<unknown>(url, { includeUniversity: false });
  return unwrapReviews(res);
}

export async function submitBookReviewAction(payload: SubmitBookReviewPayload) {
  try {
    const res = await postPrivate<unknown>(
      bookReviewEndpoints.base,
      {
        bookId: payload.bookId,
        rating: payload.rating,
        comment: payload.body.trim(),
      },
      {
        includeUniversity: false,
      },
    );
    const r = res as Record<string, unknown>;
    const review = r?.data
      ? (typeof r.data === "object" && "review" in (r.data as object)
          ? (r.data as Record<string, unknown>).review
          : r.data)
      : null;
    return { success: true as const, review: review as BookReview | null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit review";
    return { success: false as const, message };
  }
}

export async function deleteBookReviewAction(reviewId: string) {
  try {
    await deletePrivate<unknown>(bookReviewEndpoints.byId(reviewId), undefined, {
      includeUniversity: false,
    });
    return { success: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete review";
    return { success: false as const, message };
  }
}
