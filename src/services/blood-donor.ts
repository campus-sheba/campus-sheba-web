"use server";

import type {
  BloodDonorClub,
  BloodDonorProfile,
  BloodDonorRow,
  BloodRequestsListParams,
  BloodRequestsListResponse,
  BloodRequestRow,
  CreateBloodRequestPayload,
  CreateClubPayload,
  DonationHistory,
  DonationHistoryResponse,
  DonorEligibility,
  DonorStats,
  FindBloodDonorsParams,
  BloodDonorsFindResponse,
  GetClubsParams,
  LogDonationPayload,
  RegisterBloodDonorPayload,
  ToggleAvailabilityPayload,
  UpdateBloodDonorPayload,
} from "@/types/blood-donor";
import { deletePrivate } from "@/utils/api/delete";
import { getPrivate, getPublic } from "@/utils/api/get";
import { patchPrivate } from "@/utils/api/patch";
import { postPrivate } from "@/utils/api/post";
import { bloodDonorEndpoints } from "@/utils/endpoints/endpoints";

function buildQuery(params: Record<string, string | number | boolean | undefined | null>): string {
  const q = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val != null && val !== "") q.set(key, String(val));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

function unwrapDonorsFind(response: unknown): BloodDonorsFindResponse {
  const empty: BloodDonorsFindResponse = { page: 1, limit: 10, total: 0, data: [] };
  if (!response || typeof response !== "object") return empty;
  const r = response as Record<string, unknown>;
  const pagination = (r.pagination ?? {}) as Record<string, unknown>;
  const rows = Array.isArray(r.data) ? (r.data as BloodDonorRow[]) : [];
  return {
    page: typeof pagination.page === "number" ? pagination.page : 1,
    limit: typeof pagination.limit === "number" ? pagination.limit : 10,
    total: typeof pagination.total === "number" ? pagination.total : rows.length,
    totalPages: typeof pagination.totalPages === "number" ? pagination.totalPages : undefined,
    data: rows,
  };
}

function unwrapRequestsList(response: unknown): BloodRequestsListResponse {
  const empty: BloodRequestsListResponse = { page: 1, limit: 10, total: 0, data: [] };
  if (!response || typeof response !== "object") return empty;
  const r = response as Record<string, unknown>;
  const pagination = (r.pagination ?? {}) as Record<string, unknown>;
  const rows = Array.isArray(r.data) ? (r.data as BloodRequestRow[]) : [];
  return {
    page: typeof pagination.page === "number" ? pagination.page : 1,
    limit: typeof pagination.limit === "number" ? pagination.limit : 10,
    total: typeof pagination.total === "number" ? pagination.total : rows.length,
    totalPages: typeof pagination.totalPages === "number" ? pagination.totalPages : undefined,
    data: rows,
  };
}

function unwrapProfile(response: unknown): BloodDonorProfile | null {
  if (!response || typeof response !== "object") return null;
  const r = response as Record<string, unknown>;
  if (r.data && typeof r.data === "object" && r.data !== null && "_id" in r.data) {
    return r.data as BloodDonorProfile;
  }
  if ("_id" in r) return r as BloodDonorProfile;
  return null;
}

function unwrapMyRequests(response: unknown): BloodRequestRow[] {
  if (!response || typeof response !== "object") return [];
  const r = response as Record<string, unknown>;
  if (Array.isArray(r.data)) return r.data as BloodRequestRow[];
  if (r.data && typeof r.data === "object" && Array.isArray((r.data as { data?: unknown }).data)) {
    return (r.data as { data: BloodRequestRow[] }).data;
  }
  return [];
}

function unwrapDataArray<T>(response: unknown): T[] {
  if (!response || typeof response !== "object") return [];
  const r = response as Record<string, unknown>;
  if (Array.isArray(r.data)) return r.data as T[];
  return [];
}

function unwrapPaginatedGeneric<T>(response: unknown): { page: number; limit: number; total: number; totalPages?: number; data: T[] } {
  const empty = { page: 1, limit: 10, total: 0, data: [] as T[] };
  if (!response || typeof response !== "object") return empty;
  const r = response as Record<string, unknown>;
  const pagination = (r.pagination ?? {}) as Record<string, unknown>;
  const rows = Array.isArray(r.data) ? (r.data as T[]) : [];
  return {
    page: typeof pagination.page === "number" ? pagination.page : 1,
    limit: typeof pagination.limit === "number" ? pagination.limit : 10,
    total: typeof pagination.total === "number" ? pagination.total : rows.length,
    totalPages: typeof pagination.totalPages === "number" ? pagination.totalPages : undefined,
    data: rows,
  };
}

export async function fetchBloodDonorsFind(
  params: FindBloodDonorsParams & { guestMode: boolean },
): Promise<BloodDonorsFindResponse> {
  const url = bloodDonorEndpoints.find + buildQuery({
    page: params.page,
    limit: params.limit,
    university: params.university,
    bloodGroup: params.bloodGroup,
    search: params.search?.trim() || undefined,
    hall: params.hall,
    department: params.department,
    campusLocation: params.campusLocation?.trim() || undefined,
    isAvailable: params.isAvailable,
  });
  const res = params.guestMode
    ? await getPublic<unknown>(url, { includeUniversity: false })
    : await getPrivate<unknown>(url, { includeUniversity: false });
  return unwrapDonorsFind(res);
}

export async function fetchBloodRequestsPublic(
  params: BloodRequestsListParams & { guestMode: boolean },
): Promise<BloodRequestsListResponse> {
  const url = bloodDonorEndpoints.requests + buildQuery({
    page: params.page,
    limit: params.limit,
    status: params.status,
    urgencyLevel: params.urgencyLevel,
    university: params.university,
  });
  const res = params.guestMode
    ? await getPublic<unknown>(url, { includeUniversity: false })
    : await getPrivate<unknown>(url, { includeUniversity: false });
  return unwrapRequestsList(res);
}

export async function fetchBloodDonorStatsAction(universityId: string) {
  const trimmed = universityId?.trim();
  if (!trimmed) {
    return { success: false as const, message: "University required", data: null as DonorStats | null };
  }
  try {
    const url = `${bloodDonorEndpoints.stats}?university=${encodeURIComponent(trimmed)}`;
    const res = await getPublic<unknown>(url, { includeUniversity: false });
    if (!res || typeof res !== "object") return { success: true as const, data: null };
    const r = res as Record<string, unknown>;
    const data =
      r.data && typeof r.data === "object" && r.data !== null
        ? (r.data as DonorStats)
        : null;
    return { success: true as const, data };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Failed to load stats",
      data: null,
    };
  }
}

export async function getBloodDonorProfileAction() {
  try {
    const res = await getPrivate<unknown>(bloodDonorEndpoints.profile, { includeUniversity: false });
    const data = unwrapProfile(res);
    return { success: true as const, data };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Failed to load profile",
      data: null as BloodDonorProfile | null,
    };
  }
}

export async function registerBloodDonorAction(payload: RegisterBloodDonorPayload) {
  try {
    const res = await postPrivate<unknown>(bloodDonorEndpoints.register, payload, { includeUniversity: false });
    if (res && typeof res === "object") {
      const r = res as Record<string, unknown>;
      if (r.donorId) return { success: false as const, message: "Already registered.", donorId: r.donorId as string };
    }
    return { success: true as const };
  } catch (e) {
    return { success: false as const, message: e instanceof Error ? e.message : "Registration failed" };
  }
}

export async function updateBloodDonorProfileAction(payload: UpdateBloodDonorPayload) {
  try {
    await patchPrivate<unknown>(bloodDonorEndpoints.profile, payload, { includeUniversity: false });
    return { success: true as const };
  } catch (e) {
    return { success: false as const, message: e instanceof Error ? e.message : "Update failed" };
  }
}

export async function toggleAvailabilityAction(payload: ToggleAvailabilityPayload) {
  try {
    const res = await patchPrivate<unknown>(bloodDonorEndpoints.availability, payload, { includeUniversity: false });
    if (!res || typeof res !== "object") return { success: true as const, data: null };
    const r = res as Record<string, unknown>;
    const data = r.data ? r.data as Partial<BloodDonorProfile> : null;
    return { success: true as const, data };
  } catch (e) {
    return { success: false as const, message: e instanceof Error ? e.message : "Update failed", data: null };
  }
}

export async function fetchEligibilityAction() {
  try {
    const res = await getPrivate<unknown>(bloodDonorEndpoints.eligibility, { includeUniversity: false });
    const data = unwrapDataArray<DonorEligibility>(res);
    return { success: true as const, data };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Failed to load eligibility",
      data: [] as DonorEligibility[],
    };
  }
}

export async function deactivateBloodDonorProfileAction() {
  try {
    await deletePrivate<unknown>(bloodDonorEndpoints.profile, undefined, { includeUniversity: false });
    return { success: true as const };
  } catch (e) {
    return { success: false as const, message: e instanceof Error ? e.message : "Deactivation failed" };
  }
}

export async function createBloodRequestAction(payload: CreateBloodRequestPayload) {
  try {
    const res = await postPrivate<unknown>(bloodDonorEndpoints.request, payload, { includeUniversity: false });
    if (res && typeof res === "object") {
      const r = res as Record<string, unknown>;
      if (r.message && typeof r.message === "string" && r.message.includes("at most 3 active")) {
        return { success: false as const, message: r.message as string };
      }
    }
    return { success: true as const };
  } catch (e) {
    return { success: false as const, message: e instanceof Error ? e.message : "Request failed" };
  }
}

export async function fetchMyBloodRequestsAction() {
  try {
    const res = await getPrivate<unknown>(bloodDonorEndpoints.myRequests, { includeUniversity: false });
    return { success: true as const, data: unwrapMyRequests(res) };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Failed to load requests",
      data: [] as BloodRequestRow[],
    };
  }
}

export async function updateBloodRequestStatusAction(id: string, status: "Fulfilled" | "Cancelled") {
  const trimmed = id?.trim();
  if (!trimmed) return { success: false as const, message: "Invalid id" };
  try {
    await patchPrivate<unknown>(
      bloodDonorEndpoints.requestStatus(trimmed),
      { status },
      { includeUniversity: false },
    );
    return { success: true as const };
  } catch (e) {
    return { success: false as const, message: e instanceof Error ? e.message : "Update failed" };
  }
}

export async function respondToBloodRequestAction(
  requestId: string,
  status: "I Can Help" | "Committed",
) {
  const trimmed = requestId?.trim();
  if (!trimmed) return { success: false as const, message: "Invalid request id" };
  try {
    const res = await postPrivate<unknown>(
      bloodDonorEndpoints.requestRespond(trimmed),
      { status },
      { includeUniversity: false },
    );
    return { success: true as const, data: res };
  } catch (e) {
    return { success: false as const, message: e instanceof Error ? e.message : "Failed to respond" };
  }
}

export async function logDonationAction(payload: LogDonationPayload) {
  try {
    const res = await postPrivate<unknown>(bloodDonorEndpoints.donationLog, payload, { includeUniversity: false });
    if (!res || typeof res !== "object") return { success: true as const, data: null as DonationHistory | null };
    const r = res as Record<string, unknown>;
    return { success: true as const, data: (r.data as DonationHistory) ?? null, milestoneBadge: r.milestoneBadge as string | undefined };
  } catch (e) {
    return { success: false as const, message: e instanceof Error ? e.message : "Failed to log donation", data: null };
  }
}

export async function confirmDonationAction(historyId: string, gratitudeNote?: string) {
  const trimmed = historyId?.trim();
  if (!trimmed) return { success: false as const, message: "Invalid history id" };
  try {
    const res = await postPrivate<unknown>(
      bloodDonorEndpoints.donationConfirm,
      { historyId: trimmed, gratitudeNote: gratitudeNote?.trim() || undefined },
      { includeUniversity: false },
    );
    return { success: true as const, data: res };
  } catch (e) {
    return { success: false as const, message: e instanceof Error ? e.message : "Failed to confirm" };
  }
}

export async function fetchDonationHistoryAction(params?: { page?: number; limit?: number }) {
  try {
    const url = bloodDonorEndpoints.donationHistory + buildQuery({ page: params?.page, limit: params?.limit });
    const res = await getPrivate<unknown>(url, { includeUniversity: false });
    return { success: true as const, data: unwrapPaginatedGeneric<DonationHistory>(res) };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Failed to load history",
      data: { page: 1, limit: 10, total: 0, data: [] } as DonationHistoryResponse,
    };
  }
}

export async function fetchBloodDonorClubsAction(params: GetClubsParams & { guestMode?: boolean }) {
  try {
    const url = bloodDonorEndpoints.clubs + buildQuery({
      university: params.university,
      verified: params.verified,
      page: params.page,
      limit: params.limit,
    });
    const res = params.guestMode
      ? await getPublic<unknown>(url, { includeUniversity: false })
      : await getPrivate<unknown>(url, { includeUniversity: false });
    return { success: true as const, data: unwrapPaginatedGeneric<BloodDonorClub>(res) };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Failed to load clubs",
      data: { page: 1, limit: 10, total: 0, data: [] as BloodDonorClub[] },
    };
  }
}

export async function createBloodDonorClubAction(payload: CreateClubPayload) {
  try {
    const res = await postPrivate<unknown>(bloodDonorEndpoints.clubs, payload, { includeUniversity: false });
    if (!res || typeof res !== "object") return { success: true as const, data: null };
    const r = res as Record<string, unknown>;
    return { success: true as const, data: (r.data as BloodDonorClub) ?? null };
  } catch (e) {
    return { success: false as const, message: e instanceof Error ? e.message : "Failed to create club", data: null };
  }
}

export async function followBloodDonorClubAction(clubId: string) {
  const trimmed = clubId?.trim();
  if (!trimmed) return { success: false as const, message: "Invalid club id" };
  try {
    await postPrivate<unknown>(bloodDonorEndpoints.clubFollow(trimmed), {}, { includeUniversity: false });
    return { success: true as const };
  } catch (e) {
    return { success: false as const, message: e instanceof Error ? e.message : "Failed to follow" };
  }
}

export async function unfollowBloodDonorClubAction(clubId: string) {
  const trimmed = clubId?.trim();
  if (!trimmed) return { success: false as const, message: "Invalid club id" };
  try {
    const { deletePrivate: del } = await import("@/utils/api/delete");
    await del<unknown>(bloodDonorEndpoints.clubFollow(trimmed), undefined, { includeUniversity: false });
    return { success: true as const };
  } catch (e) {
    return { success: false as const, message: e instanceof Error ? e.message : "Failed to unfollow" };
  }
}
