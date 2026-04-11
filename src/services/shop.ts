"use server";

import type { CreateStudentShopBody } from "@/types/shop-create";
import type { OwnerShop, SubmitShopKycPayload } from "@/types/owner-shop";
import { getPrivate } from "@/utils/api/get";
import { patchPrivate } from "@/utils/api/patch";
import { postPrivate } from "@/utils/api/post";
import { shopEndpoints } from "@/utils/endpoints/shopEndpoints";

function unwrapApiError(res: unknown): string | null {
  if (!res || typeof res !== "object") return null;
  const r = res as Record<string, unknown>;
  const code = r.statusCode ?? r.status;
  if (typeof code === "number" && code >= 400) {
    return typeof r.message === "string" ? r.message : "Request failed";
  }
  return null;
}

function unwrapCreateShopId(response: unknown): string | null {
  if (!response || typeof response !== "object") return null;
  const r = response as Record<string, unknown>;
  const data = r.data;
  if (data && typeof data === "object" && data !== null && "_id" in data) {
    const id = (data as { _id?: unknown })._id;
    return typeof id === "string" ? id : null;
  }
  if ("_id" in r && typeof r._id === "string") return r._id;
  return null;
}

function unwrapOwnerShopList(response: unknown): OwnerShop[] {
  if (!response || typeof response !== "object") return [];
  const r = response as Record<string, unknown>;
  const d = r.data;
  if (Array.isArray(d)) return d as OwnerShop[];
  if (d && typeof d === "object") {
    const inner = d as Record<string, unknown>;
    if (Array.isArray(inner.shops)) return inner.shops as OwnerShop[];
    if (Array.isArray(inner.data)) return inner.data as OwnerShop[];
    if (inner._id) return [inner as unknown as OwnerShop];
  }
  if (r._id) return [r as unknown as OwnerShop];
  return [];
}

function unwrapOwnerShopDetail(response: unknown): OwnerShop | null {
  if (!response || typeof response !== "object") return null;
  const r = response as Record<string, unknown>;
  const d = r.data;
  if (d && typeof d === "object" && d !== null && "_id" in d) return d as OwnerShop;
  if ("_id" in r) return r as unknown as OwnerShop;
  return null;
}

export async function getMyShop() {
  const res = await getPrivate(shopEndpoints.myShopStudent, { includeUniversity: false });
  const err = unwrapApiError(res);
  if (err) throw new Error(err);
  return res;
}

export type ShopListResult =
  | { success: true; shops: OwnerShop[] }
  | { success: false; message: string };

export async function listMyStudentShopsAction(): Promise<ShopListResult> {
  try {
    const res = await getPrivate<unknown>(shopEndpoints.myShopStudent, { includeUniversity: false });
    const err = unwrapApiError(res);
    if (err) return { success: false, message: err };
    return { success: true, shops: unwrapOwnerShopList(res) };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load shops";
    return { success: false, message };
  }
}

export type ShopDetailResult =
  | { success: true; shop: OwnerShop }
  | { success: false; message: string };

export async function getOwnerShopByIdAction(id: string): Promise<ShopDetailResult> {
  const trimmed = id?.trim();
  if (!trimmed) return { success: false, message: "Invalid shop id" };
  try {
    const res = await getPrivate<unknown>(shopEndpoints.shopById(trimmed), { includeUniversity: false });
    const err = unwrapApiError(res);
    if (err) return { success: false, message: err };
    const shop = unwrapOwnerShopDetail(res);
    if (!shop) return { success: false, message: "Shop not found" };
    return { success: true, shop };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load shop";
    return { success: false, message };
  }
}

export type ShopMutationResult = { success: true } | { success: false; message: string };

export async function updateOwnerShopAction(
  id: string,
  body: Record<string, unknown>,
): Promise<ShopMutationResult> {
  const trimmed = id?.trim();
  if (!trimmed) return { success: false, message: "Invalid shop id" };
  try {
    const res = await patchPrivate<unknown>(shopEndpoints.updateShop(trimmed), body, { includeUniversity: false });
    const err = unwrapApiError(res);
    if (err) return { success: false, message: err };
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update shop";
    return { success: false, message };
  }
}

export async function submitShopKycAction(id: string, payload: SubmitShopKycPayload): Promise<ShopMutationResult> {
  const trimmed = id?.trim();
  if (!trimmed) return { success: false, message: "Invalid shop id" };
  try {
    const res = await patchPrivate<unknown>(shopEndpoints.shopKyc(trimmed), payload, { includeUniversity: false });
    const err = unwrapApiError(res);
    if (err) return { success: false, message: err };
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to submit KYC";
    return { success: false, message };
  }
}

export async function createShop(data: Record<string, unknown>) {
  const res = await postPrivate(shopEndpoints.createShop, data, { includeUniversity: false });
  const err = unwrapApiError(res);
  if (err) throw new Error(err);
  return res;
}

export async function updateShop(id: string, data: Record<string, unknown>) {
  const res = await patchPrivate(shopEndpoints.updateShop(id), data, { includeUniversity: false });
  const err = unwrapApiError(res);
  if (err) throw new Error(err);
  return res;
}

export type CreateStudentShopResult =
  | { success: true; shopId: string }
  | { success: false; message: string };

/**
 * Creates a student shop. Always sends `type: "Student Shop"` (never from client).
 */
export async function createStudentShopAction(
  payload: CreateStudentShopBody,
): Promise<CreateStudentShopResult> {
  try {
    const body = {
      type: "Student Shop",
      ...payload,
    };
    const res = await postPrivate<unknown>(shopEndpoints.createShop, body, {
      includeUniversity: false,
    });
    const err = unwrapApiError(res);
    if (err) return { success: false, message: err };
    const shopId = unwrapCreateShopId(res);
    if (!shopId) return { success: false, message: "Shop created but no id returned." };
    return { success: true, shopId };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create shop";
    return { success: false, message };
  }
}
