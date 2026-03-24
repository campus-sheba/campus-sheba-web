/* eslint-disable @typescript-eslint/no-explicit-any */
import { getPrivate } from "@/utils/api/get";
import { postPrivate } from "@/utils/api/post";
import { patchPrivate } from "@/utils/api/patch";
import { shopEndpoints } from "@/utils/endpoints/shopEndpoints";

// GET /api/owner/shops/my?type=Student%20Shop
export async function getMyShop() {
  const res = await getPrivate(shopEndpoints.myShop);
  if ((res as any)?.statusCode && (res as any)?.statusCode !== 200) throw new Error((res as any)?.message || "Failed to fetch shop");
  return res;
}

// POST /api/owner/shops
export async function createShop(data: any) {
  const res = await postPrivate(shopEndpoints.createShop, data);
  if ((res as any)?.statusCode && (res as any)?.statusCode !== 200) throw new Error((res as any)?.message || "Failed to create shop");
  return res;
}

// PATCH /api/owner/shops/{id}
export async function updateShop(id: string, data: any) {
  const res = await patchPrivate(shopEndpoints.updateShop(id), data);
  if ((res as any)?.statusCode && (res as any)?.statusCode !== 200) throw new Error((res as any)?.message || "Failed to update shop");
  return res;
}
