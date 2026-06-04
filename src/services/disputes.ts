"use server";

import { getPrivate } from "@/utils/api/get";
import { postPrivate } from "@/utils/api/post";
import { disputeEndpoints } from "@/utils/endpoints/endpoints";
import type {
  CreateDisputePayload,
  Dispute,
  DisputeListResponse,
} from "@/types/dispute";

const privateOpts = { includeUniversity: false as const };

function unwrapDispute(response: unknown): Dispute | null {
  if (!response || typeof response !== "object") return null;
  const r = response as Record<string, unknown>;
  if (r.data && typeof r.data === "object" && r.data !== null && "_id" in r.data) {
    return r.data as Dispute;
  }
  if ("_id" in r) return response as Dispute;
  return null;
}

function unwrapDisputeList(response: unknown): DisputeListResponse {
  const empty: DisputeListResponse = { page: 1, limit: 10, total: 0, data: [] };
  if (!response || typeof response !== "object") return empty;
  const r = response as Record<string, unknown>;
  if (Array.isArray(r.data)) {
    return {
      page: typeof r.page === "number" ? r.page : 1,
      limit: typeof r.limit === "number" ? r.limit : 10,
      total: typeof r.total === "number" ? r.total : r.data.length,
      data: r.data as Dispute[],
    };
  }
  if (r.data && typeof r.data === "object") {
    const inner = r.data as Record<string, unknown>;
    if (Array.isArray(inner.data)) {
      return {
        page: typeof inner.page === "number" ? inner.page : 1,
        limit: typeof inner.limit === "number" ? inner.limit : 10,
        total: typeof inner.total === "number" ? inner.total : inner.data.length,
        data: inner.data as Dispute[],
      };
    }
  }
  return empty;
}

/** POST /user/disputes — open a dispute for a delivered Buy & Sell order item. */
export async function createDisputeAction(payload: CreateDisputePayload) {
  const orderId = payload.orderId?.trim();
  const orderItemId = payload.orderItemId?.trim();
  const description = payload.description?.trim();
  if (!orderId || !orderItemId) {
    return { success: false as const, message: "Invalid order reference." };
  }
  if (!description) {
    return { success: false as const, message: "Please describe the problem." };
  }
  try {
    const body = {
      orderId,
      orderItemId,
      reason: payload.reason,
      description,
      evidence:
        payload.evidence && payload.evidence.length ? payload.evidence.slice(0, 5) : undefined,
    };
    const res = await postPrivate<unknown>(disputeEndpoints.base, body, privateOpts);
    return { success: true as const, data: unwrapDispute(res) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to open dispute";
    return { success: false as const, message };
  }
}

export type ListDisputesParams = {
  page?: number;
  limit?: number;
  status?: string;
};

/** GET /user/disputes — the current user's disputes. */
export async function listMyDisputesAction(params: ListDisputesParams = {}) {
  try {
    const q = new URLSearchParams();
    if (params.page != null) q.set("page", String(params.page));
    if (params.limit != null) q.set("limit", String(params.limit));
    if (params.status?.trim()) q.set("status", params.status.trim());
    const query = q.toString();
    const url = query ? `${disputeEndpoints.base}?${query}` : disputeEndpoints.base;
    const res = await getPrivate<unknown>(url, privateOpts);
    return { success: true as const, data: unwrapDisputeList(res) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load disputes";
    return {
      success: false as const,
      message,
      data: { page: 1, limit: 10, total: 0, data: [] } as DisputeListResponse,
    };
  }
}

/** GET /user/disputes/:id */
export async function getDisputeByIdAction(id: string) {
  const trimmed = id?.trim();
  if (!trimmed) {
    return { success: false as const, message: "Invalid dispute id", data: null };
  }
  try {
    const res = await getPrivate<unknown>(disputeEndpoints.byId(trimmed), privateOpts);
    const data = unwrapDispute(res);
    if (!data) {
      return { success: false as const, message: "Dispute not found", data: null };
    }
    return { success: true as const, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load dispute";
    return { success: false as const, message, data: null };
  }
}
