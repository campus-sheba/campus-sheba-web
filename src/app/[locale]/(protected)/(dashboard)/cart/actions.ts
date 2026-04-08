/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { getPrivate } from "@/utils/api/get";
import { patchPrivate } from "@/utils/api/patch";
import { postPrivate } from "@/utils/api/post";
import { deletePrivate } from "@/utils/api/delete";
import { cartEndpoints } from "@/utils/endpoints/endpoints";

export interface CartItemContent {
  _id: string;
  title: string;
  slug: string;
  description: string;
  owner: string;
  university: string;
  category: string;
  address: string;
  type: string;
  status: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  photos: { url: string; key: string; size: number }[];
  isActive: boolean;
  isDeleted: boolean;
  condition: string;
  isNegotiable: boolean;
  isFeatured: boolean;
  viewCount: number;
  contactName: string;
  contactPhone: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  content: CartItemContent;
  quantity: number;
  type: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
  groupedByShop: any[];
  otherItems: CartItem[];
}

export async function getCartAction() {
  try {
    const response = await getPrivate<{ data: Cart }>(cartEndpoints.cart);
    return { success: true as const, data: response?.data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch cart";
    return { success: false as const, message, data: null };
  }
}

export async function addToCartAction(contentId: string, type: "Book" | "BuySell", quantity = 1) {
  try {
    const response = await postPrivate(cartEndpoints.cart, { contentId, type, quantity });
    return { success: true as const, data: response };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add item";
    return { success: false as const, message };
  }
}

export async function increaseCartItemAction(id: string) {
  try {
    const response = await patchPrivate(cartEndpoints.increase, { id });
    return { success: true as const, data: response };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to increase quantity";
    return { success: false as const, message };
  }
}

export async function decreaseCartItemAction(id: string) {
  try {
    const response = await patchPrivate(cartEndpoints.decrease, { id });
    return { success: true as const, data: response };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to decrease quantity";
    return { success: false as const, message };
  }
}

export async function removeCartItemAction(id: string) {
  try {
    const response = await deletePrivate(`${cartEndpoints.cart}/${id}`);
    return { success: true as const, data: response };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to remove item";
    return { success: false as const, message };
  }
}

export async function clearCartAction() {
  try {
    const response = await deletePrivate(cartEndpoints.clear);
    return { success: true as const, data: response };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to clear cart";
    return { success: false as const, message };
  }
}
