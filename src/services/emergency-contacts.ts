"use server";

import type {
  ContactIssueReport,
  ContactIssueType,
  EmergencyContact,
  EmergencyContactsByCategory,
  EmergencyContactsListResponse,
} from "@/types/emergency-contact";
import { getPublic } from "@/utils/api/get";
import { postPrivate } from "@/utils/api/post";
import { emergencyEndpoints } from "@/utils/endpoints/endpoints";

function buildQuery(params: Record<string, string | number | boolean | undefined | null>): string {
  const q = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val != null && val !== "") q.set(key, String(val));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

function unwrapPaginated(response: unknown): EmergencyContactsListResponse {
  const empty: EmergencyContactsListResponse = { page: 1, limit: 10, total: 0, data: [] };
  if (!response || typeof response !== "object") return empty;
  const r = response as Record<string, unknown>;
  const pagination = (r.pagination ?? {}) as Record<string, unknown>;
  const rows = Array.isArray(r.data) ? (r.data as EmergencyContact[]) : [];
  return {
    page: typeof pagination.page === "number" ? pagination.page : 1,
    limit: typeof pagination.limit === "number" ? pagination.limit : 10,
    total: typeof pagination.total === "number" ? pagination.total : rows.length,
    totalPages: typeof pagination.totalPages === "number" ? pagination.totalPages : undefined,
    data: rows,
  };
}

function sortByPriority(contacts: EmergencyContact[]): EmergencyContact[] {
  return [...contacts].sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));
}

function unwrapByCategory(response: unknown): EmergencyContactsByCategory {
  if (!response || typeof response !== "object") return {};
  const r = response as Record<string, unknown>;
  const raw = r.data;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: EmergencyContactsByCategory = {};
  for (const [key, val] of Object.entries(raw)) {
    if (Array.isArray(val)) out[key] = sortByPriority(val as EmergencyContact[]);
  }
  return out;
}

function unwrapArray(response: unknown): EmergencyContact[] {
  if (!response || typeof response !== "object") return [];
  const r = response as Record<string, unknown>;
  return Array.isArray(r.data) ? (r.data as EmergencyContact[]) : [];
}

export async function fetchEmergencyContactsByCategoryAction(universityId: string) {
  const trimmed = universityId?.trim();
  if (!trimmed) {
    return { success: false as const, message: "University required", data: {} as EmergencyContactsByCategory };
  }
  try {
    const url = `${emergencyEndpoints.contactsByCategory}?university=${encodeURIComponent(trimmed)}`;
    const res = await getPublic<unknown>(url, { includeUniversity: false });
    return { success: true as const, data: unwrapByCategory(res) };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Failed to load",
      data: {} as EmergencyContactsByCategory,
    };
  }
}

export async function fetchEmergencyContactsQuickDialAction(universityId: string) {
  const trimmed = universityId?.trim();
  if (!trimmed) {
    return { success: false as const, message: "University required", data: [] as EmergencyContact[] };
  }
  try {
    const url = `${emergencyEndpoints.contactsQuickDial}?university=${encodeURIComponent(trimmed)}`;
    const res = await getPublic<unknown>(url, { includeUniversity: false });
    return { success: true as const, data: unwrapArray(res) };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Failed to load",
      data: [] as EmergencyContact[],
    };
  }
}

export async function fetchEmergencyContactsListAction(params: {
  university: string;
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  location?: string;
}) {
  const trimmed = params.university?.trim();
  if (!trimmed) {
    return {
      success: false as const,
      message: "University required",
      data: { page: 1, limit: 10, total: 0, data: [] } as EmergencyContactsListResponse,
    };
  }
  try {
    const url =
      emergencyEndpoints.contacts +
      buildQuery({
        university: trimmed,
        page: params.page,
        limit: params.limit,
        search: params.search,
        category: params.category,
        location: params.location,
      });
    const res = await getPublic<unknown>(url, { includeUniversity: false });
    return { success: true as const, data: unwrapPaginated(res) };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Failed to load",
      data: { page: 1, limit: 10, total: 0, data: [] } as EmergencyContactsListResponse,
    };
  }
}

export async function fetchEmergencyContactByIdAction(id: string, universityId: string) {
  const idTrim = id?.trim();
  const uTrim = universityId?.trim();
  if (!idTrim || !uTrim) {
    return { success: false as const, message: "Invalid parameters", data: null as EmergencyContact | null };
  }
  try {
    const url = `${emergencyEndpoints.contactById(idTrim)}?university=${encodeURIComponent(uTrim)}`;
    const res = await getPublic<unknown>(url, { includeUniversity: false });
    if (!res || typeof res !== "object") return { success: false as const, message: "Not found", data: null };
    const r = res as Record<string, unknown>;
    const data =
      r.data && typeof r.data === "object" && r.data !== null && "_id" in r.data
        ? (r.data as EmergencyContact)
        : "_id" in r
          ? (r as EmergencyContact)
          : null;
    if (!data) return { success: false as const, message: "Not found", data: null };
    return { success: true as const, data };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Failed to load",
      data: null,
    };
  }
}

export async function reportEmergencyContactIssueAction(
  contactId: string,
  payload: { issueType: ContactIssueType; notes?: string },
) {
  const idTrim = contactId?.trim();
  if (!idTrim) {
    return { success: false as const, message: "Contact ID required", data: null };
  }
  try {
    const url = emergencyEndpoints.contactReportIssue(idTrim);
    const res = await postPrivate<unknown>(url, payload);
    if (!res || typeof res !== "object") return { success: false as const, message: "Unexpected response", data: null };
    const r = res as Record<string, unknown>;
    return {
      success: true as const,
      data: (r.data as ContactIssueReport) ?? null,
      message: typeof r.message === "string" ? r.message : "Issue reported successfully.",
    };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Failed to submit report",
      data: null,
    };
  }
}
