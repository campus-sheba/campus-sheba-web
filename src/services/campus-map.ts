"use server";

import type {
  CampusMapFavourite,
  CampusMapListResponse,
  CampusMapLocation,
  CampusMapSearchResult,
} from "@/types/campus-map";
import { getPublic, getPrivate } from "@/utils/api/get";
import { postPrivate } from "@/utils/api/post";
import { deletePrivate } from "@/utils/api/delete";
import { campusMapEndpoints } from "@/utils/endpoints/endpoints";

export type CampusMapListParams = {
  page?: number;
  limit?: number;
  university?: string;
  type?: string;
  isPopular?: boolean;
  isFeatured?: boolean;
  isHot?: boolean;
  sort?: "default" | "mostReviewed" | "highestRated" | "recentlyAdded";
};

export type CampusMapSearchParams = {
  q: string;
  university?: string;
  type?: string;
  limit?: number;
};

function buildListQuery(params: CampusMapListParams): string {
  const q = new URLSearchParams();
  if (params.page != null) q.set("page", String(params.page));
  if (params.limit != null) q.set("limit", String(params.limit));
  if (params.university) q.set("university", params.university);
  if (params.type) q.set("type", params.type);
  if (params.isPopular === true) q.set("isPopular", "true");
  if (params.isPopular === false) q.set("isPopular", "false");
  if (params.isFeatured === true) q.set("isFeatured", "true");
  if (params.isFeatured === false) q.set("isFeatured", "false");
  if (params.isHot === true) q.set("isHot", "true");
  if (params.isHot === false) q.set("isHot", "false");
  if (params.sort) q.set("sort", params.sort);
  const s = q.toString();
  return s ? `?${s}` : "";
}

function buildSearchQuery(params: CampusMapSearchParams): string {
  const q = new URLSearchParams();
  q.set("q", params.q.trim());
  if (params.university) q.set("university", params.university);
  if (params.type) q.set("type", params.type);
  if (params.limit != null) q.set("limit", String(params.limit));
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

function unwrapSearch(response: unknown): CampusMapSearchResult[] {
  if (!response || typeof response !== "object") return [];
  const r = response as Record<string, unknown>;
  if (Array.isArray(r.data)) return r.data as CampusMapSearchResult[];
  if (r.data && typeof r.data === "object") {
    const inner = r.data as Record<string, unknown>;
    if (Array.isArray(inner.data)) return inner.data as CampusMapSearchResult[];
  }
  return [];
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
  const url = `${campusMapEndpoints.list}${buildListQuery(params)}`;
  try {
    const res = await getPublic<unknown>(url);
    return unwrapList(res);
  } catch {
    return { page: 1, limit: params.limit ?? 10, total: 0, data: [] };
  }
}

export async function fetchCampusMapFeaturedAction(universityId?: string): Promise<CampusMapLocation[]> {
  const url = `${campusMapEndpoints.featured}${universityId ? `?university=${encodeURIComponent(universityId)}` : ""}`;
  try {
    const res = await getPublic<unknown>(url);
    const rows = unwrapSearch(res);
    return rows as CampusMapLocation[];
  } catch {
    return [];
  }
}

export async function searchCampusMapLocationsAction(
  params: CampusMapSearchParams,
): Promise<CampusMapSearchResult[]> {
  if (!params.q?.trim()) return [];
  const url = `${campusMapEndpoints.search}${buildSearchQuery(params)}`;
  try {
    const res = await getPublic<unknown>(url);
    return unwrapSearch(res);
  } catch {
    return [];
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
  const limit = 200;
  while (all.length < maxRows) {
    const res = await fetchCampusMapLocationsAction({ university: trimmed, page, limit });
    all.push(...res.data);
    if (res.data.length < limit || all.length >= res.total) break;
    page += 1;
  }
  return all.slice(0, maxRows);
}

export async function fetchCampusMapLocationByIdAction(id: string) {
  const trimmed = id?.trim();
  if (!trimmed) {
    return { success: false as const, message: "Invalid id", data: null as CampusMapLocation | null };
  }
  try {
    const res = await getPublic<unknown>(campusMapEndpoints.byId(trimmed));
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

export async function fetchCampusMapLocationBySlugAction(slug: string, universityId?: string) {
  const trimmed = slug?.trim();
  if (!trimmed) {
    return { success: false as const, message: "Invalid slug", data: null as CampusMapLocation | null };
  }
  const url = `${campusMapEndpoints.bySlug(trimmed)}${universityId ? `?university=${encodeURIComponent(universityId)}` : ""}`;
  try {
    const res = await getPublic<unknown>(url);
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

export async function fetchCampusMapFavouritesAction(page = 1, limit = 10) {
  try {
    const url = `${campusMapEndpoints.favourites}?page=${page}&limit=${limit}`;
    const res = await getPrivate<unknown>(url);
    return unwrapList(res) as CampusMapListResponse & { data: CampusMapFavourite[] };
  } catch {
    return { page, limit, total: 0, data: [] } as CampusMapListResponse & { data: CampusMapFavourite[] };
  }
}

export async function addCampusMapFavouriteAction(locationId: string) {
  const trimmed = locationId?.trim();
  if (!trimmed) return { success: false as const, message: "Invalid id" };
  try {
    const res = await postPrivate<unknown>(campusMapEndpoints.favouriteToggle(trimmed));
    return { success: true as const, data: res };
  } catch (e) {
    return { success: false as const, message: e instanceof Error ? e.message : "Failed" };
  }
}

export async function removeCampusMapFavouriteAction(locationId: string) {
  const trimmed = locationId?.trim();
  if (!trimmed) return { success: false as const, message: "Invalid id" };
  try {
    const res = await deletePrivate<unknown>(campusMapEndpoints.favouriteToggle(trimmed));
    return { success: true as const, data: res };
  } catch (e) {
    return { success: false as const, message: e instanceof Error ? e.message : "Failed" };
  }
}

export async function reportCampusMapLocationAction(locationId: string, reason: string) {
  const trimmed = locationId?.trim();
  if (!trimmed) return { success: false as const, message: "Invalid id" };
  try {
    const res = await postPrivate<unknown>(campusMapEndpoints.report(trimmed), { reason });
    return { success: true as const, data: res };
  } catch (e) {
    return { success: false as const, message: e instanceof Error ? e.message : "Failed" };
  }
}

export async function submitCampusMapLocationAction(payload: Record<string, unknown>) {
  try {
    const res = await postPrivate<unknown>(campusMapEndpoints.submissions, payload);
    return { success: true as const, data: res };
  } catch (e) {
    return { success: false as const, message: e instanceof Error ? e.message : "Failed" };
  }
}
