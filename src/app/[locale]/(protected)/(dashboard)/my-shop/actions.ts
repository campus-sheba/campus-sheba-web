"use server";

import { getPrivate } from "@/utils/api/get";
import { postPrivate } from "@/utils/api/post";
import { patchPrivate } from "@/utils/api/patch";
import { deletePrivate } from "@/utils/api/delete";

const BASE = process.env.BASE_URL || process.env.NEXT_PUBLIC_API_URL;

// ─── Types ──────────────────────────────────────────────────────────────────

export interface OperatingSlot {
  open: string;
  close: string;
}

export interface OperatingHour {
  day: string;
  isClosed: boolean;
  slots: OperatingSlot[];
}

export interface ShopMedia {
  url: string;
  key: string;
  size: number;
}

export interface ShopSocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
}

export interface ShopLocation {
  type: "Point";
  coordinates: [number, number];
}

export interface ShopPayload {
  type?: "Student Shop" | "Campus Shop";
  name: string;
  description?: string;
  address?: string;
  logo?: ShopMedia;
  coverPhoto?: ShopMedia;
  contactEmail?: string;
  phoneNumber?: string;
  website?: string;
  socialLinks?: ShopSocialLinks;
  minimumOrderAmount?: number;
  operatingHours?: OperatingHour[];
  location?: ShopLocation;
}

export interface Shop extends ShopPayload {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductPhoto {
  url: string;
  key: string;
  size: number;
}

export interface Product {
  _id: string;
  title: string;
  type?: string;
  subtitle?: string;
  description?: string;
  photos?: ProductPhoto[];
  price: number;
  quantity?: number;
  condition?: string;
  isNegotiable?: boolean;
  discountPrice?: number;
  shopId?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  categoryId?: string;
  addressId?: string;
  weight?: number;
  safekeepingCharge?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductPayload {
  title: string;
  type?: string;
  addressId?: string;
  safekeepingCharge?: number;
  subtitle?: string;
  description?: string;
  photos?: ProductPhoto[];
  price: number;
  quantity?: number;
  categoryId?: string;
  weight?: number;
  condition?: string;
  isNegotiable?: boolean;
  discountPrice?: number;
  shopId?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
}

export interface OrderItem {
  _id: string;
  productId?: string;
  title?: string;
  price?: number;
  quantity?: number;
  status?: string;
}

export interface Order {
  _id: string;
  items?: OrderItem[];
  totalAmount?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  buyerId?: string | { name?: string; phone?: string };
}

// ─── Shop Actions ────────────────────────────────────────────────────────────

export async function getMyShopAction(type: string = "Student Shop") {
  try {
    const url = `${BASE}/owner/shops/my?type=${encodeURIComponent(type)}`;
    const response = await getPrivate<{ data: Shop }>(url);
    const shop = (response as any)?.data ?? (response as any);
    return { success: true as const, shop: shop as Shop };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch shop";
    if (message.toLowerCase().includes("shop not found") || message.includes("404")) {
      return { success: true as const, shop: null as Shop | null };
    }
    console.error("[getMyShopAction] Error:", message);
    return { success: false as const, message, shop: null as Shop | null };
  }
}

export async function createShopAction(data: ShopPayload) {
  try {
    const body = data as unknown as Record<string, unknown>;
    const response = await postPrivate<{ data: Shop }>(`${BASE}/owner/shops`, body);
    const shop = (response as any)?.data ?? (response as any);
    return { success: true as const, shop: shop as Shop };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create shop";
    console.error("[createShopAction] Error:", message);
    return { success: false as const, message };
  }
}

export async function updateShopAction(id: string, data: Partial<ShopPayload>) {
  try {
    const body = data as unknown as Record<string, unknown>;
    const response = await patchPrivate<{ data: Shop }>(`${BASE}/owner/shops/${id}`, body);
    const shop = (response as any)?.data ?? (response as any);
    return { success: true as const, shop: shop as Shop };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update shop";
    console.error("[updateShopAction] Error:", message);
    return { success: false as const, message };
  }
}

// ─── Product Actions ─────────────────────────────────────────────────────────

export async function getOwnProductsAction(params?: Record<string, string>) {
  try {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
    const url = `${BASE}/creator/products/own${qs}`;
    const response = await getPrivate<{ data: Product[]; meta?: unknown }>(url);
    const data = (response as any)?.data ?? [];
    const meta = (response as any)?.meta ?? null;
    return { success: true as const, data: data as Product[], meta };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch products";
    console.error("[getOwnProductsAction] Error:", message);
    return { success: false as const, message, data: [] as Product[], meta: null };
  }
}

export async function getProductStatisticsAction() {
  try {
    const response = await getPrivate<{ data: Record<string, unknown> }>(
      `${BASE}/creator/products/statistics`
    );
    return { success: true as const, data: (response as any)?.data ?? response };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch statistics";
    return { success: false as const, message, data: null };
  }
}

export async function createProductAction(data: ProductPayload) {
  try {
    const body = data as unknown as Record<string, unknown>;
    const response = await postPrivate<{ data: Product }>(`${BASE}/creator/products`, body);
    const product = (response as any)?.data ?? (response as any);
    return { success: true as const, product: product as Product };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create product";
    console.error("[createProductAction] Error:", message);
    return { success: false as const, message };
  }
}

export async function updateProductAction(productId: string, data: Partial<ProductPayload>) {
  try {
    const body = data as unknown as Record<string, unknown>;
    const response = await patchPrivate<{ data: Product }>(
      `${BASE}/creator/products/${productId}`,
      body
    );
    const product = (response as any)?.data ?? (response as any);
    return { success: true as const, product: product as Product };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update product";
    console.error("[updateProductAction] Error:", message);
    return { success: false as const, message };
  }
}

export async function deleteProductAction(productId: string) {
  try {
    await deletePrivate(`${BASE}/creator/products/${productId}`);
    return { success: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete product";
    console.error("[deleteProductAction] Error:", message);
    return { success: false as const, message };
  }
}

// ─── Order Actions ───────────────────────────────────────────────────────────

export async function getOwnerOrdersAction(params?: Record<string, string>) {
  try {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
    const url = `${BASE}/owner/orders${qs}`;
    const response = await getPrivate<{ data: Order[]; meta?: unknown }>(url);
    const data = (response as any)?.data ?? [];
    const meta = (response as any)?.meta ?? null;
    return { success: true as const, data: data as Order[], meta };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch orders";
    console.error("[getOwnerOrdersAction] Error:", message);
    return { success: false as const, message, data: [] as Order[], meta: null };
  }
}

export async function getOwnerOrderByIdAction(id: string) {
  try {
    const response = await getPrivate<{ data: Order }>(`${BASE}/owner/orders/${id}`);
    const order = (response as any)?.data ?? (response as any);
    return { success: true as const, order: order as Order };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch order";
    return { success: false as const, message, order: null as Order | null };
  }
}

export async function confirmOrderItemAction(orderId: string, itemId: string) {
  try {
    await patchPrivate(`${BASE}/owner/orders/${orderId}/items/${itemId}/confirm`, {});
    return { success: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to confirm item";
    return { success: false as const, message };
  }
}

export async function cancelOrderItemAction(orderId: string, itemId: string) {
  try {
    await patchPrivate(`${BASE}/owner/orders/${orderId}/items/${itemId}/cancel`, {});
    return { success: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to cancel item";
    return { success: false as const, message };
  }
}
