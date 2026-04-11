"use server";

import { getPublic } from "@/utils/api/get";
import { careersEndpoints } from "@/utils/endpoints/endpoints";

export type UniversityLocationRow = {
  _id: string;
  name?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
};

function unwrapLocations(response: unknown): UniversityLocationRow[] {
  if (!response || typeof response !== "object") return [];
  const r = response as Record<string, unknown>;
  if (Array.isArray(r.data)) {
    return r.data as UniversityLocationRow[];
  }
  if (r.data && typeof r.data === "object" && !Array.isArray(r.data)) {
    const inner = r.data as Record<string, unknown>;
    if (Array.isArray(inner.data)) {
      return inner.data as UniversityLocationRow[];
    }
  }
  if (Array.isArray(r)) {
    return r as UniversityLocationRow[];
  }
  return [];
}

/** GET /api/university-locations?university=&page=&limit= */
export async function fetchUniversityLocationsAction(
  universityId: string,
  page = 1,
  limit = 200,
): Promise<UniversityLocationRow[]> {
  if (!universityId.trim()) return [];
  const q = new URLSearchParams({
    university: universityId,
    page: String(page),
    limit: String(limit),
  });
  try {
    const res = await getPublic<unknown>(`${careersEndpoints.universityLocations}?${q.toString()}`, {
      includeUniversity: false,
    });
    return unwrapLocations(res);
  } catch {
    return [];
  }
}
