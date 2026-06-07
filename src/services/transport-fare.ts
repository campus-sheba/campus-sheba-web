"use server";

import { cookies } from "next/headers";
import { getPrivate } from "@/utils/api/get";
import { postPrivate } from "@/utils/api/post";
import { patchPrivate } from "@/utils/api/patch";
import { deletePrivate } from "@/utils/api/delete";
import { transportFareEndpoints } from "@/utils/endpoints/endpoints";
import type {
  BulkFareEntry,
  CreateFarePayload,
  CreateLocationPayload,
  FareVehicleType,
  TransportFare,
  TransportLocation,
  UpdateFarePayload,
  UpdateLocationPayload,
} from "@/types/transport";

// ── envelope unwrappers ──────────────────────────────────────────────────
function unwrapArray<T>(response: unknown): T[] {
  if (!response || typeof response !== "object") return [];
  const r = response as Record<string, unknown>;
  if (Array.isArray(r.data)) return r.data as T[];
  if (r.data && typeof r.data === "object") {
    const inner = r.data as Record<string, unknown>;
    if (Array.isArray(inner.data)) return inner.data as T[];
  }
  return [];
}

function unwrapObject<T>(response: unknown): T | null {
  if (!response || typeof response !== "object") return null;
  const r = response as Record<string, unknown>;
  if (r.data && typeof r.data === "object") return r.data as T;
  return response as T;
}

function errMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

/** The lookup endpoint 404s with this exact message when no fare is published. */
function isNoFareError(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message.toLowerCase().includes("fare not found for this route")
  );
}

/** Resolves the logged-in user's own campus id from cookies (same rules as the API wrappers). */
async function resolveUniversityId(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const fallback = cookieStore.get("universityId")?.value;
  if (fallback) return fallback;
  const universityCookie = cookieStore.get("university")?.value;
  if (!universityCookie) return undefined;
  try {
    const university = JSON.parse(decodeURIComponent(universityCookie));
    return university?._id as string | undefined;
  } catch {
    return undefined;
  }
}

// ===========================================================================
// USER endpoints — token only; `university` query param is auto-injected.
// ===========================================================================

/** GET /transport/fare/locations — active stops for the origin/destination pickers. */
export async function fetchTransportLocationsAction() {
  try {
    const res = await getPrivate<unknown>(transportFareEndpoints.locations);
    return { success: true as const, data: unwrapArray<TransportLocation>(res) };
  } catch (error) {
    return {
      success: false as const,
      message: errMessage(error, "Failed to load locations"),
      data: [] as TransportLocation[],
    };
  }
}

/** GET /transport/fare/matrix — full fare matrix for one vehicle type (from/to populated). */
export async function fetchFareMatrixAction(vehicleType: FareVehicleType) {
  try {
    const url = `${transportFareEndpoints.matrix}?vehicleType=${vehicleType}`;
    const res = await getPrivate<unknown>(url);
    return { success: true as const, data: unwrapArray<TransportFare>(res) };
  } catch (error) {
    return {
      success: false as const,
      message: errMessage(error, "Failed to load fare matrix"),
      data: [] as TransportFare[],
    };
  }
}

/**
 * GET /transport/fare/lookup — single fare for an exact (vehicleType, from→to).
 * `notFound: true` is the "no published fare for this route" empty state (server 404),
 * which is distinct from a real failure (`success: false`).
 */
export async function lookupFareAction(
  vehicleType: FareVehicleType,
  from: string,
  to: string,
) {
  try {
    const url = `${transportFareEndpoints.lookup}?vehicleType=${vehicleType}&from=${encodeURIComponent(
      from,
    )}&to=${encodeURIComponent(to)}`;
    const res = await getPrivate<unknown>(url);
    return {
      success: true as const,
      notFound: false as const,
      data: unwrapObject<TransportFare>(res),
    };
  } catch (error) {
    if (isNoFareError(error)) {
      return { success: true as const, notFound: true as const, data: null };
    }
    return {
      success: false as const,
      notFound: false as const,
      message: errMessage(error, "Failed to look up fare"),
      data: null,
    };
  }
}

// ===========================================================================
// ADMIN endpoints — require the transport permission grant.
// POST bodies must carry `university` (the query auto-inject doesn't cover bodies).
// ===========================================================================

/** GET /admin/transport/fare/locations — paginated location list (incl. inactive). */
export async function fetchAdminLocationsAction(
  params: { isActive?: boolean; page?: number; limit?: number } = {},
) {
  try {
    const q = new URLSearchParams();
    if (params.isActive != null) q.set("isActive", String(params.isActive));
    if (params.page != null) q.set("page", String(params.page));
    if (params.limit != null) q.set("limit", String(params.limit));
    const query = q.toString();
    const url = query
      ? `${transportFareEndpoints.adminLocations}?${query}`
      : transportFareEndpoints.adminLocations;
    const res = await getPrivate<unknown>(url);
    return { success: true as const, data: unwrapArray<TransportLocation>(res) };
  } catch (error) {
    return {
      success: false as const,
      message: errMessage(error, "Failed to load locations"),
      data: [] as TransportLocation[],
    };
  }
}

/** POST /admin/transport/fare/locations — create a stop (409 on duplicate slug). */
export async function createLocationAction(payload: CreateLocationPayload) {
  try {
    const university = await resolveUniversityId();
    const res = await postPrivate<unknown>(transportFareEndpoints.adminLocations, {
      university,
      ...payload,
    });
    return { success: true as const, data: unwrapObject<TransportLocation>(res) };
  } catch (error) {
    return { success: false as const, message: errMessage(error, "Failed to create location") };
  }
}

/** PATCH /admin/transport/fare/locations/:id — rename / re-slug / (de)activate. */
export async function updateLocationAction(id: string, payload: UpdateLocationPayload) {
  try {
    const res = await patchPrivate<unknown>(
      transportFareEndpoints.adminLocationById(id),
      payload,
    );
    return { success: true as const, data: unwrapObject<TransportLocation>(res) };
  } catch (error) {
    return { success: false as const, message: errMessage(error, "Failed to update location") };
  }
}

/** DELETE /admin/transport/fare/locations/:id — 409 if fares still reference it. */
export async function deleteLocationAction(id: string) {
  try {
    await deletePrivate<unknown>(transportFareEndpoints.adminLocationById(id));
    return { success: true as const };
  } catch (error) {
    return { success: false as const, message: errMessage(error, "Failed to delete location") };
  }
}

/** GET /admin/transport/fare — paginated fare list (from/to populated). */
export async function fetchAdminFaresAction(
  params: {
    vehicleType?: FareVehicleType;
    isActive?: boolean;
    page?: number;
    limit?: number;
  } = {},
) {
  try {
    const q = new URLSearchParams();
    if (params.vehicleType) q.set("vehicleType", params.vehicleType);
    if (params.isActive != null) q.set("isActive", String(params.isActive));
    if (params.page != null) q.set("page", String(params.page));
    if (params.limit != null) q.set("limit", String(params.limit));
    const query = q.toString();
    const url = query
      ? `${transportFareEndpoints.adminFares}?${query}`
      : transportFareEndpoints.adminFares;
    const res = await getPrivate<unknown>(url);
    return { success: true as const, data: unwrapArray<TransportFare>(res) };
  } catch (error) {
    return {
      success: false as const,
      message: errMessage(error, "Failed to load fares"),
      data: [] as TransportFare[],
    };
  }
}

/** POST /admin/transport/fare — create one directional fare (400/409 on conflict). */
export async function createFareAction(payload: CreateFarePayload) {
  try {
    const university = await resolveUniversityId();
    const res = await postPrivate<unknown>(transportFareEndpoints.adminFares, {
      university,
      ...payload,
    });
    return { success: true as const, data: unwrapObject<TransportFare>(res) };
  } catch (error) {
    return { success: false as const, message: errMessage(error, "Failed to create fare") };
  }
}

/** POST /admin/transport/fare/bulk — upsert a whole matrix for one vehicle type. */
export async function bulkUpsertFaresAction(
  vehicleType: FareVehicleType,
  fares: BulkFareEntry[],
) {
  try {
    const university = await resolveUniversityId();
    const res = await postPrivate<unknown>(transportFareEndpoints.adminFareBulk, {
      university,
      vehicleType,
      fares,
    });
    const obj = unwrapObject<{ upserted: number }>(res);
    return { success: true as const, upserted: obj?.upserted ?? 0 };
  } catch (error) {
    return { success: false as const, message: errMessage(error, "Failed to save fares") };
  }
}

/** PATCH /admin/transport/fare/:id — edit price / note / status (can't re-point from/to). */
export async function updateFareAction(id: string, payload: UpdateFarePayload) {
  try {
    const res = await patchPrivate<unknown>(transportFareEndpoints.adminFareById(id), payload);
    return { success: true as const, data: unwrapObject<TransportFare>(res) };
  } catch (error) {
    return { success: false as const, message: errMessage(error, "Failed to update fare") };
  }
}

/** DELETE /admin/transport/fare/:id. */
export async function deleteFareAction(id: string) {
  try {
    await deletePrivate<unknown>(transportFareEndpoints.adminFareById(id));
    return { success: true as const };
  } catch (error) {
    return { success: false as const, message: errMessage(error, "Failed to delete fare") };
  }
}
