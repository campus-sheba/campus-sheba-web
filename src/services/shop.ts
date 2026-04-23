"use server";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { getPrivate } from "@/utils/api/get";
import { postPrivate } from "@/utils/api/post";
import { patchPrivate } from "@/utils/api/patch";
import { shopEndpoints } from "@/utils/endpoints/shopEndpoints";
import type { OwnerShop, SubmitShopKycPayload } from "@/types/owner-shop";
import type { CreateStudentShopBody } from "@/types/shop-create";

const opts = { includeUniversity: false as const };

function unwrapShop(res: unknown): OwnerShop | null {
  if (!res || typeof res !== "object") return null;
  const r = res as Record<string, unknown>;
  if (r.data && typeof r.data === "object" && r.data !== null && "_id" in r.data) {
    return r.data as OwnerShop;
  }
  if ("_id" in r) return res as OwnerShop;
  return null;
}

function unwrapShopList(res: unknown): OwnerShop[] {
  if (!res || typeof res !== "object") return [];
  const r = res as Record<string, unknown>;
  if (Array.isArray(r.data)) return r.data as OwnerShop[];
  if (Array.isArray(res)) return res as OwnerShop[];
  return [];
}

export async function listMyStudentShopsAction() {
  try {
    const res = await getPrivate<unknown>(`${shopEndpoints.list}?type=Student%20Shop`, opts);
    return { success: true as const, shops: unwrapShopList(res), message: "" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load shops";
    return { success: false as const, shops: [] as OwnerShop[], message };
  }
}

export async function getOwnerShopByIdAction(id: string) {
  try {
    const res = await getPrivate<unknown>(shopEndpoints.byId(id), opts);
    const shop = unwrapShop(res);
    if (!shop) return { success: false as const, shop: null as OwnerShop | null, message: "Shop not found" };
    return { success: true as const, shop, message: "" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load shop";
    return { success: false as const, shop: null as OwnerShop | null, message };
  }
}

export async function createStudentShopAction(body: CreateStudentShopBody) {
  try {
    const res = await postPrivate<unknown>(shopEndpoints.createShop, { ...body, type: "Student Shop" }, opts);
    const shop = unwrapShop(res);
    return { success: true as const, shop, message: "" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create shop";
    return { success: false as const, shop: null as OwnerShop | null, message };
  }
}

export async function updateOwnerShopAction(id: string, body: Partial<CreateStudentShopBody>) {
  try {
    const res = await patchPrivate<unknown>(shopEndpoints.updateShop(id), body, opts);
    const shop = unwrapShop(res);
    return { success: true as const, shop, message: "" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update shop";
    return { success: false as const, shop: null as OwnerShop | null, message };
  }
}

export async function submitShopKycAction(id: string, payload: SubmitShopKycPayload) {
  try {
    await patchPrivate(shopEndpoints.kyc(id), payload, opts);
    return { success: true as const, message: "" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit KYC";
    return { success: false as const, message };
  }
}

// Legacy non-action helpers (client-side usage)
export async function getMyShop() {
  const res = await getPrivate(shopEndpoints.myShop);
  if ((res as any)?.statusCode && (res as any)?.statusCode !== 200) throw new Error((res as any)?.message || "Failed to fetch shop");
  return res;
}

export async function createShop(data: any) {
  const res = await postPrivate(shopEndpoints.createShop, data);
  if ((res as any)?.statusCode && (res as any)?.statusCode !== 200) throw new Error((res as any)?.message || "Failed to create shop");
  return res;
}

export async function updateShop(id: string, data: any) {
  const res = await patchPrivate(shopEndpoints.updateShop(id), data);
  if ((res as any)?.statusCode && (res as any)?.statusCode !== 200) throw new Error((res as any)?.message || "Failed to update shop");
  return res;
}
