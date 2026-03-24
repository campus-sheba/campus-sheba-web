/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { getPrivate } from "@/utils/api/get";
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
