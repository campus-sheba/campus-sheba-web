"use server";

import type {
  BloodDonorProfile,
  BloodDonorRow,
  BloodRequestsListParams,
  BloodRequestsListResponse,
  CreateBloodRequestPayload,
  FindBloodDonorsParams,
  BloodDonorsFindResponse,
  RegisterBloodDonorPayload,
  UpdateBloodDonorPayload,
  BloodRequestRow,
} from "@/types/blood-donor";
import { deletePrivate } from "@/utils/api/delete";
import { getPrivate, getPublic } from "@/utils/api/get";
import { patchPrivate } from "@/utils/api/patch";
import { postPrivate } from "@/utils/api/post";
import { bloodDonorEndpoints } from "@/utils/endpoints/endpoints";

function buildFindQuery(params: FindBloodDonorsParams): string {
  const q = new URLSearchParams();
  if (params.page != null) q.set("page", String(params.page));
  if (params.limit != null) q.set("limit", String(params.limit));
  if (params.university) q.set("university", params.university);
  if (params.bloodGroup) q.set("bloodGroup", params.bloodGroup);
  if (params.search?.trim()) q.set("search", params.search.trim());
  if (params.hall) q.set("hall", params.hall);
  if (params.department) q.set("department", params.department);
  if (params.campusLocation?.trim()) q.set("campusLocation", params.campusLocation.trim());
  if (params.isAvailable === true) q.set("isAvailable", "true");
  if (params.isAvailable === false) q.set("isAvailable", "false");
  const s = q.toString();
  return s ? `?${s}` : "";
}

function buildRequestsQuery(params: BloodRequestsListParams): string {
  const q = new URLSearchParams();
  if (params.page != null) q.set("page", String(params.page));
  if (params.limit != null) q.set("limit", String(params.limit));
  if (params.status) q.set("status", params.status);
  if (params.university) q.set("university", params.university);
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

/**
 * Guests must pass `university`; authenticated users can omit (API uses session university).
 */
export async function fetchBloodDonorsFind(
  params: FindBloodDonorsParams & { guestMode: boolean },
): Promise<BloodDonorsFindResponse> {
  const url = `${bloodDonorEndpoints.find}${buildFindQuery(params)}`;
  const res = params.guestMode
    ? await getPublic<unknown>(url, { includeUniversity: false })
    : await getPrivate<unknown>(url, { includeUniversity: false });
  return unwrapDonorsFind(res);
}

export async function fetchBloodRequestsPublic(
  params: BloodRequestsListParams & { guestMode: boolean },
): Promise<BloodRequestsListResponse> {
  const url = `${bloodDonorEndpoints.requests}${buildRequestsQuery(params)}`;
  const res = params.guestMode
    ? await getPublic<unknown>(url, { includeUniversity: false })
    : await getPrivate<unknown>(url, { includeUniversity: false });
  return unwrapRequestsList(res);
}

export async function fetchBloodDonorStatsAction(universityId: string) {
  const trimmed = universityId?.trim();
  if (!trimmed) {
    return { success: false as const, message: "University required", data: null as Record<string, unknown> | null };
  }
  try {
    const url = `${bloodDonorEndpoints.stats}?university=${encodeURIComponent(trimmed)}`;
    const res = await getPublic<unknown>(url, { includeUniversity: false });
    if (!res || typeof res !== "object") {
      return { success: true as const, data: {} as Record<string, unknown> };
    }
    const r = res as Record<string, unknown>;
    const data =
      r.data && typeof r.data === "object" && r.data !== null
        ? (r.data as Record<string, unknown>)
        : (r as Record<string, unknown>);
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
    await postPrivate<unknown>(bloodDonorEndpoints.register, payload, { includeUniversity: false });
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
    await postPrivate<unknown>(bloodDonorEndpoints.request, payload, { includeUniversity: false });
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
