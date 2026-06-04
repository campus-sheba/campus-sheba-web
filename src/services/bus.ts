"use server";

import { cookies } from "next/headers";
import { getPrivate } from "@/utils/api/get";
import { busEndpoints } from "@/utils/endpoints/endpoints";
import type { Bus, BusShareStatus, LiveBus } from "@/types/bus";

const privateOpts = { includeUniversity: false as const };

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

/** GET /buses — list my campus buses (active first, isLive flag). */
export async function fetchBusesAction(params: { isActive?: boolean; page?: number; limit?: number } = {}) {
  try {
    const q = new URLSearchParams();
    if (params.isActive != null) q.set("isActive", String(params.isActive));
    if (params.page != null) q.set("page", String(params.page));
    if (params.limit != null) q.set("limit", String(params.limit));
    const query = q.toString();
    const url = query ? `${busEndpoints.list}?${query}` : busEndpoints.list;
    const res = await getPrivate<unknown>(url, privateOpts);
    return { success: true as const, data: unwrapArray<Bus>(res) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load buses";
    return { success: false as const, message, data: [] as Bus[] };
  }
}

/** GET /buses/live — map snapshot of all buses + last known location. */
export async function fetchLiveBusesAction() {
  try {
    const res = await getPrivate<unknown>(busEndpoints.live, privateOpts);
    return { success: true as const, data: unwrapArray<LiveBus>(res) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load live buses";
    return { success: false as const, message, data: [] as LiveBus[] };
  }
}

/** GET /bus-tracking/me/status — my sharer trust / block status. */
export async function fetchMyBusShareStatusAction() {
  try {
    const res = await getPrivate<unknown>(busEndpoints.myStatus, privateOpts);
    return { success: true as const, data: unwrapObject<BusShareStatus>(res) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load status";
    return { success: false as const, message, data: null as BusShareStatus | null };
  }
}

/**
 * Hands the access token to the client for the Socket.IO handshake.
 *
 * The access token is an httpOnly cookie (unreadable by client JS), but the
 * bus-tracking WebSocket needs it at the handshake. This server action returns
 * the current token + the WS origin (the namespace lives at host root, NOT
 * under the /api prefix).
 */
export async function getBusWsTokenAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value ?? null;

  // Browser-facing API URL (e.g. https://api.campussheba.com/api). The WS
  // namespace is mounted at the host root, so strip a trailing "/api".
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
  const wsUrl = apiUrl.replace(/\/api\/?$/, "");

  if (!token) {
    return { success: false as const, message: "Not authenticated", token: null, wsUrl };
  }
  return { success: true as const, token, wsUrl };
}
