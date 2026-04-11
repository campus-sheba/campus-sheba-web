"use server";

import type {
  CreateLostFoundPayload,
  EscalateToParcelPayload,
  LostFoundBrowseResponse,
  LostFoundMyPostsResponse,
  LostFoundPost,
  SendResolveRequestPayload,
  UpdateLostFoundPayload,
} from "@/types/lost-and-found";
import { deletePrivate } from "@/utils/api/delete";
import { getPrivate, getPublic } from "@/utils/api/get";
import { patchPrivate } from "@/utils/api/patch";
import { postPrivate } from "@/utils/api/post";
import { lostFoundEndpoints } from "@/utils/endpoints/endpoints";

export type LostFoundBrowseParams = {
  page?: number;
  limit?: number;
  title?: string;
  category?: string;
  type?: LostFoundPost["type"];
  location?: string[];
  university?: string;
};

function buildBrowseQuery(params: LostFoundBrowseParams): string {
  const q = new URLSearchParams();
  if (params.page != null) q.set("page", String(params.page));
  if (params.limit != null) q.set("limit", String(params.limit));
  if (params.title?.trim()) q.set("title", params.title.trim());
  if (params.category) q.set("category", params.category);
  if (params.type) q.set("type", params.type);
  if (params.university) q.set("university", params.university);
  if (params.location?.length) {
    for (const id of params.location) {
      if (id) q.append("location", id);
    }
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

function unwrapBrowse(response: unknown): LostFoundBrowseResponse {
  const empty: LostFoundBrowseResponse = { total: 0, data: [] };
  if (!response || typeof response !== "object") return empty;
  const r = response as Record<string, unknown>;
  if (Array.isArray(r.data)) {
    const rows = r.data as LostFoundPost[];
    return { total: typeof r.total === "number" ? r.total : rows.length, data: rows };
  }
  if (r.data && typeof r.data === "object" && !Array.isArray(r.data)) {
    const inner = r.data as Record<string, unknown>;
    if (Array.isArray(inner.data)) {
      const rows = inner.data as LostFoundPost[];
      return { total: typeof inner.total === "number" ? inner.total : rows.length, data: rows };
    }
  }
  return empty;
}

function unwrapMyPosts(response: unknown): LostFoundMyPostsResponse {
  const empty: LostFoundMyPostsResponse = { page: 1, limit: 10, total: 0, data: [] };
  if (!response || typeof response !== "object") return empty;
  const r = response as Record<string, unknown>;
  if (Array.isArray(r.data)) {
    const rows = r.data as LostFoundPost[];
    return {
      page: typeof r.page === "number" ? r.page : 1,
      limit: typeof r.limit === "number" ? r.limit : 10,
      total: typeof r.total === "number" ? r.total : rows.length,
      data: rows,
    };
  }
  if (r.data && typeof r.data === "object" && !Array.isArray(r.data)) {
    const inner = r.data as Record<string, unknown>;
    if (Array.isArray(inner.data)) {
      const rows = inner.data as LostFoundPost[];
      return {
        page: typeof inner.page === "number" ? inner.page : 1,
        limit: typeof inner.limit === "number" ? inner.limit : 10,
        total: typeof inner.total === "number" ? inner.total : rows.length,
        data: rows,
      };
    }
  }
  return empty;
}

function unwrapDetail(response: unknown): LostFoundPost | null {
  if (!response || typeof response !== "object") return null;
  const r = response as Record<string, unknown>;
  if (r.data && typeof r.data === "object" && r.data !== null && "_id" in r.data) {
    return r.data as LostFoundPost;
  }
  if ("_id" in r) return r as LostFoundPost;
  return null;
}

/**
 * Browse approved posts. Guests must pass `university`; authenticated callers omit it (API uses session).
 */
export async function fetchLostFoundBrowse(
  params: LostFoundBrowseParams & { guestMode: boolean },
): Promise<LostFoundBrowseResponse> {
  const url = `${lostFoundEndpoints.base}${buildBrowseQuery(params)}`;
  const res = params.guestMode
    ? await getPublic<unknown>(url, { includeUniversity: false })
    : await getPrivate<unknown>(url, { includeUniversity: false });
  return unwrapBrowse(res);
}

export async function fetchLostFoundById(id: string): Promise<LostFoundPost | null> {
  const trimmed = id?.trim();
  if (!trimmed) return null;
  const res = await getPublic<unknown>(lostFoundEndpoints.byId(trimmed), { includeUniversity: false });
  return unwrapDetail(res);
}

export type LostFoundMyPostsParams = {
  page?: number;
  limit?: number;
  title?: string;
  category?: string;
  type?: LostFoundPost["type"];
  location?: string[];
  university?: string;
  status?: string;
};

function buildMyPostsQuery(params: LostFoundMyPostsParams): string {
  const q = new URLSearchParams();
  if (params.page != null) q.set("page", String(params.page));
  if (params.limit != null) q.set("limit", String(params.limit));
  if (params.title?.trim()) q.set("title", params.title.trim());
  if (params.category) q.set("category", params.category);
  if (params.type) q.set("type", params.type);
  if (params.university) q.set("university", params.university);
  if (params.status) q.set("status", params.status);
  if (params.location?.length) {
    for (const id of params.location) {
      if (id) q.append("location", id);
    }
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export async function fetchLostFoundMyPosts(
  params: LostFoundMyPostsParams = {},
): Promise<LostFoundMyPostsResponse> {
  const url = `${lostFoundEndpoints.myPosts}${buildMyPostsQuery(params)}`;
  const res = await getPrivate<unknown>(url, { includeUniversity: false });
  return unwrapMyPosts(res);
}

export async function getLostFoundByIdForEditAction(id: string) {
  const trimmed = id?.trim();
  if (!trimmed) {
    return { success: false as const, message: "Invalid id", data: null as LostFoundPost | null };
  }
  try {
    const res = await getPrivate<unknown>(lostFoundEndpoints.byId(trimmed), { includeUniversity: false });
    const data = unwrapDetail(res);
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

export async function createLostFoundAction(payload: CreateLostFoundPayload) {
  try {
    await postPrivate<unknown>(lostFoundEndpoints.base, payload, { includeUniversity: false });
    return { success: true as const };
  } catch (e) {
    return { success: false as const, message: e instanceof Error ? e.message : "Failed to create" };
  }
}

export async function updateLostFoundAction(id: string, payload: UpdateLostFoundPayload) {
  const trimmed = id?.trim();
  if (!trimmed) return { success: false as const, message: "Invalid id" };
  try {
    await patchPrivate<unknown>(lostFoundEndpoints.byId(trimmed), payload, { includeUniversity: false });
    return { success: true as const };
  } catch (e) {
    return { success: false as const, message: e instanceof Error ? e.message : "Failed to update" };
  }
}

export async function deleteLostFoundAction(id: string) {
  const trimmed = id?.trim();
  if (!trimmed) return { success: false as const, message: "Invalid id" };
  try {
    await deletePrivate<unknown>(lostFoundEndpoints.byId(trimmed), undefined, { includeUniversity: false });
    return { success: true as const };
  } catch (e) {
    return { success: false as const, message: e instanceof Error ? e.message : "Failed to delete" };
  }
}

export async function sendLostFoundResolveRequestAction(postId: string, payload: SendResolveRequestPayload) {
  try {
    await postPrivate<unknown>(lostFoundEndpoints.resolveRequest(postId), payload, { includeUniversity: false });
    return { success: true as const };
  } catch (e) {
    return { success: false as const, message: e instanceof Error ? e.message : "Failed to send request" };
  }
}

export async function respondLostFoundResolveRequestAction(requestId: string, status: "accepted" | "rejected") {
  try {
    await patchPrivate<unknown>(
      lostFoundEndpoints.resolveRequestRespond(requestId),
      { status },
      { includeUniversity: false },
    );
    return { success: true as const };
  } catch (e) {
    return { success: false as const, message: e instanceof Error ? e.message : "Failed to respond" };
  }
}

export async function markLostFoundResolvedAction(id: string) {
  try {
    await patchPrivate<unknown>(lostFoundEndpoints.resolve(id), {}, { includeUniversity: false });
    return { success: true as const };
  } catch (e) {
    return { success: false as const, message: e instanceof Error ? e.message : "Failed to resolve" };
  }
}

export async function cancelLostFoundAction(id: string) {
  try {
    await patchPrivate<unknown>(lostFoundEndpoints.cancel(id), {}, { includeUniversity: false });
    return { success: true as const };
  } catch (e) {
    return { success: false as const, message: e instanceof Error ? e.message : "Failed to cancel" };
  }
}

export async function escalateLostFoundToParcelAction(postId: string, payload: EscalateToParcelPayload) {
  try {
    await postPrivate<unknown>(lostFoundEndpoints.escalateToParcel(postId), payload, { includeUniversity: false });
    return { success: true as const };
  } catch (e) {
    return { success: false as const, message: e instanceof Error ? e.message : "Failed to escalate" };
  }
}

export async function fetchLostFoundResolveRequestsAction(postId: string) {
  try {
    const res = await getPrivate<unknown>(lostFoundEndpoints.resolveRequestsList(postId), {
      includeUniversity: false,
    });
    if (Array.isArray(res)) return { success: true as const, data: res };
    if (res && typeof res === "object" && Array.isArray((res as { data?: unknown }).data)) {
      return { success: true as const, data: (res as { data: unknown[] }).data };
    }
    return { success: true as const, data: [] as unknown[] };
  } catch (e) {
    return {
      success: false as const,
      message: e instanceof Error ? e.message : "Failed to load requests",
      data: [] as unknown[],
    };
  }
}
