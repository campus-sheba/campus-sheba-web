 
"use server";

import { Cart } from "@/types/cart";
import { getPrivate } from "@/utils/api/get";
import { cartEndpoints } from "@/utils/endpoints/endpoints";


export async function getCartAction() {
    try {
        const response = await getPrivate<{ data: Cart }>(cartEndpoints.cart);
        return { success: true as const, data: response?.data };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to fetch cart";
        return { success: false as const, message, data: null };
    }
}