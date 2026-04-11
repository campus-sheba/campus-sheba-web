"use server";

import type { CampusMapListResponse, CampusMapLocation } from "@/types/campus-map";
import { getPublic } from "@/utils/api/get";
import { careersEndpoints } from "@/utils/endpoints/endpoints";

export type CampusMapListParams = {
  page?: number;
  limit?: number;
  university?: string;
  name?: string;
  type?: string;
  isPopular?: boolean;
  isActive?: boolean;
};

function buildListQuery(params: CampusMapListParams): string {
  const q = new URLSearchParams();
  if (params.page != null) q.set("page", String(params.page));
  if (params.limit != null) q.set("limit", String(params.limit));
  if (params.university) q.set("university", params.university);
  if (params.name?.trim()) q.set("name", params.name.trim());
  if (params.type) q.set("type", params.type);
  if (params.isPopular === true) q.set("isPopular", "true");
  if (params.isPopular === false) q.set("isPopular", "false");
  if (params.isActive === true) q.set("isActive", "true");
  if (params.isActive === false) q.set("isActive", "false");
  const s = q.toString();
  return s ? `?${s}` : "";
}

function unwrapList(response: unknown): CampusMapListResponse {
  const empty: CampusMapListResponse = { page: 1, limit: 10, total: 0, data: [] };
  if (!response || typeof response !== "object") return empty;
  const r = response as Record<string, unknown>;

  if (Array.isArray(r.data)) {
    const rows = r.data as CampusMapLocation[];
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
      const rows = inner.data as CampusMapLocation[];
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

function unwrapDetail(response: unknown): CampusMapLocation | null {
  if (!response || typeof response !== "object") return null;
  const r = response as Record<string, unknown>;
  if (r.data && typeof r.data === "object" && r.data !== null && "_id" in r.data) {
    return r.data as CampusMapLocation;
  }
  if ("_id" in r) return r as CampusMapLocation;
  return null;
}

export async function fetchCampusMapLocationsAction(params: CampusMapListParams): Promise<CampusMapListResponse> {
  const url = `${careersEndpoints.universityLocations}${buildListQuery(params)}`;
  try {
    const res = await getPublic<unknown>(url, { includeUniversity: false });
    return unwrapList(res);
  } catch {
    return { page: 1, limit: params.limit ?? 10, total: 0, data: [] };
  }
}

/**
 * Load all pages up to `maxRows`. Does not send `isActive=true` — many legacy rows omit that field and
 * would be excluded by the API. We filter client-side: drop only `isActive === false`.
 */
export async function fetchAllCampusMapLocationsAction(
  universityId: string,
  maxRows = 500,
): Promise<CampusMapLocation[]> {
  const trimmed = universityId?.trim();
  if (!trimmed) return [];
  const all: CampusMapLocation[] = [];
  let page = 1;
  const limit = 100;
  while (all.length < maxRows) {
    const res = await fetchCampusMapLocationsAction({ university: trimmed, page, limit });
    all.push(...res.data);
    if (res.data.length < limit || all.length >= res.total) break;
    page += 1;
  }
  const merged = all.slice(0, maxRows);
  return merged.filter((loc) => loc.isActive !== false);
}

export async function fetchCampusMapLocationByIdAction(id: string) {
  const trimmed = id?.trim();
  if (!trimmed) {
    return { success: false as const, message: "Invalid id", data: null as CampusMapLocation | null };
  }
  try {
    const res = await getPublic<unknown>(careersEndpoints.universityLocationById(trimmed), {
      includeUniversity: false,
    });
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
