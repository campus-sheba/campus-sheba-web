"use server";

import type { BookDonation } from "@/types/book";
import { deletePrivate } from "@/utils/api/delete";
import { getPrivate } from "@/utils/api/get";
import { patchPrivate } from "@/utils/api/patch";
import { postPrivate } from "@/utils/api/post";
import { bookDonationEndpoints } from "@/utils/endpoints/endpoints";

type DonationPaginatedResponse = {
  page: number;
  limit: number;
  total: number;
  data: BookDonation[];
};

function unwrapDonations(response: unknown): DonationPaginatedResponse {
  if (!response || typeof response !== "object") {
    return { page: 1, limit: 10, total: 0, data: [] };
  }
  const r = response as Record<string, unknown>;

  if (Array.isArray(r.data)) {
    return {
      page: typeof r.page === "number" ? r.page : 1,
      limit: typeof r.limit === "number" ? r.limit : 10,
      total: typeof r.total === "number" ? r.total : (r.data as BookDonation[]).length,
      data: r.data as BookDonation[],
    };
  }
  return { page: 1, limit: 10, total: 0, data: [] };
}

function unwrapDonation(response: unknown): BookDonation | null {
  if (!response || typeof response !== "object") return null;
  const r = response as Record<string, unknown>;
  if (r.data && typeof r.data === "object" && r.data !== null) {
    const d = r.data as Record<string, unknown>;
    if ("donation" in d) return d.donation as BookDonation;
    if ("_id" in d) return d as unknown as BookDonation;
  }
  return null;
}

export async function fetchAvailableDonations(
  page = 1,
  limit = 10,
): Promise<DonationPaginatedResponse> {
  const q = new URLSearchParams({ page: String(page), limit: String(limit) });
  const res = await getPrivate<unknown>(`${bookDonationEndpoints.base}?${q.toString()}`, {
    includeUniversity: false,
  });
  return unwrapDonations(res);
}

export async function fetchMyDonations(
  page = 1,
  limit = 10,
): Promise<DonationPaginatedResponse> {
  const q = new URLSearchParams({ page: String(page), limit: String(limit) });
  const res = await getPrivate<unknown>(`${bookDonationEndpoints.mine}?${q.toString()}`, {
    includeUniversity: false,
  });
  return unwrapDonations(res);
}

export async function registerDonationAction(bookId: string, donorMessage?: string) {
  try {
    const res = await postPrivate<unknown>(
      bookDonationEndpoints.base,
      { bookId, donorMessage },
      { includeUniversity: false },
    );
    const donation = unwrapDonation(res);
    return { success: true as const, donation };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to register donation";
    return { success: false as const, message };
  }
}

export async function requestDonationAction(donationId: string, message?: string) {
  try {
    const res = await postPrivate<unknown>(
      bookDonationEndpoints.request(donationId),
      { message },
      { includeUniversity: false },
    );
    const donation = unwrapDonation(res);
    return { success: true as const, donation };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to request donation";
    return { success: false as const, message };
  }
}

export async function fulfillDonationAction(donationId: string, queueEntryId: string) {
  try {
    const res = await patchPrivate<unknown>(
      bookDonationEndpoints.fulfill(donationId, queueEntryId),
      {},
      { includeUniversity: false },
    );
    const donation = unwrapDonation(res);
    return { success: true as const, donation };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fulfill donation";
    return { success: false as const, message };
  }
}

export async function cancelDonationAction(donationId: string) {
  try {
    await deletePrivate<unknown>(bookDonationEndpoints.byId(donationId), undefined, {
      includeUniversity: false,
    });
    return { success: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to cancel donation";
    return { success: false as const, message };
  }
}
