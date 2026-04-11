"use server";

import type { CreateParcelPayload, Parcel, ParcelEstimatePayload } from "@/types/parcel";
import { getPrivate } from "@/utils/api/get";
import { patchPrivate } from "@/utils/api/patch";
import { postPrivate } from "@/utils/api/post";
import { parcelEndpoints } from "@/utils/endpoints/endpoints";

export type ParcelListParams = {
  page?: number;
  limit?: number;
  status?: string;
  parcelId?: string;
  university?: string;
  sender?: string;
  deliveryHero?: string;
};

function buildParcelListQuery(params: ParcelListParams): string {
  const q = new URLSearchParams();
  if (params.page != null) q.set("page", String(params.page));
  if (params.limit != null) q.set("limit", String(params.limit));
  if (params.status) q.set("status", params.status);
  if (params.parcelId?.trim()) q.set("parcelId", params.parcelId.trim());
  if (params.university) q.set("university", params.university);
  if (params.sender) q.set("sender", params.sender);
  if (params.deliveryHero) q.set("deliveryHero", params.deliveryHero);
  const s = q.toString();
  return s ? `?${s}` : "";
}

function unwrapParcelList(response: unknown): { page: number; limit: number; total: number; data: Parcel[] } {
  const empty = { page: 1, limit: 10, total: 0, data: [] as Parcel[] };
  if (!response || typeof response !== "object") return empty;
  const r = response as Record<string, unknown>;
  if (Array.isArray(r.data)) {
    const rows = r.data as Parcel[];
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
      const rows = inner.data as Parcel[];
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

function unwrapParcelDetail(response: unknown): Parcel | null {
  if (!response || typeof response !== "object") return null;
  const r = response as Record<string, unknown>;
  if (r.data && typeof r.data === "object" && r.data !== null && "_id" in r.data) {
    return r.data as Parcel;
  }
  if ("_id" in r) return r as Parcel;
  return null;
}

export async function fetchParcelsList(params: ParcelListParams = {}) {
  const url = `${parcelEndpoints.base}${buildParcelListQuery(params)}`;
  const res = await getPrivate<unknown>(url, { includeUniversity: false });
  return unwrapParcelList(res);
}

export async function fetchParcelByIdAction(id: string) {
  const trimmed = id?.trim();
  if (!trimmed) {
    return { success: false as const, message: "Invalid id", data: null as Parcel | null };
  }
  try {
    const res = await getPrivate<unknown>(parcelEndpoints.byId(trimmed), { includeUniversity: false });
    const data = unwrapParcelDetail(res);
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

function unwrapCreatedParcelId(response: unknown): string | null {
  if (!response || typeof response !== "object") return null;
  const r = response as Record<string, unknown>;
  if (r.data && typeof r.data === "object" && r.data !== null && "_id" in r.data) {
    const id = (r.data as { _id?: unknown })._id;
    return typeof id === "string" ? id : null;
  }
  if (typeof r._id === "string") return r._id;
  return null;
}

export async function createParcelAction(payload: CreateParcelPayload) {
  try {
    const res = await postPrivate<unknown>(parcelEndpoints.base, payload, { includeUniversity: false });
    return { success: true as const, parcelId: unwrapCreatedParcelId(res) };
  } catch (e) {
    return { success: false as const, message: e instanceof Error ? e.message : "Failed to book parcel" };
  }
}

export async function estimateParcelAction(payload: ParcelEstimatePayload) {
  try {
    const res = await postPrivate<unknown>(parcelEndpoints.estimate, payload, { includeUniversity: false });
    return { success: true as const, data: res };
  } catch (e) {
    return { success: false as const, message: e instanceof Error ? e.message : "Estimate failed" };
  }
}

export async function cancelParcelAction(id: string) {
  const trimmed = id?.trim();
  if (!trimmed) return { success: false as const, message: "Invalid id" };
  try {
    await patchPrivate<unknown>(parcelEndpoints.cancel(trimmed), {}, { includeUniversity: false });
    return { success: true as const };
  } catch (e) {
    return { success: false as const, message: e instanceof Error ? e.message : "Failed to cancel" };
  }
}
