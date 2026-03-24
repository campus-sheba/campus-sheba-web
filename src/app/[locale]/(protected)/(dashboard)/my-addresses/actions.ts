"use server";

import { getPrivate } from "@/utils/api/get";
import { postPrivate } from "@/utils/api/post";
import { patchPrivate } from "@/utils/api/patch";
import { userEndpoints } from "@/utils/endpoints/endpoints";
import { deletePrivate } from "@/utils/api/delete";

export interface Address {
  _id?: string;
  address: string;
  type: "DELIVERY" | "PICKUP";
  latitude: number;
  longitude: number;
  description?: string;
  isDefault?: boolean;
  user?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function getAddressesAction(type?: string) {
  try {
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    const response = await getPrivate<{ data: Address[] }>(`${userEndpoints.addresses}${type ? `?${params.toString()}` : ""}`);
    // For compatibility with client code expecting 'data' property
    const data = response?.data || [];
   
    return { success: true as const, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch addresses";
    console.error("[getAddressesAction] Error:", message);
    return { success: false as const, message, data: [] as Address[] };
  }
}

export async function getAddressByIdAction(id: string) {
  try {
    const response = await getPrivate<{ data: Address }>(`${userEndpoints.addresses}/${id}`);
    return { success: true as const, address: response?.data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch address";
    return { success: false as const, message, address: null as Address | null };
  }
}

export async function createAddressAction(data: Omit<Address, "_id" | "user" | "createdAt" | "updatedAt">) {
  try {
    const response = await postPrivate<{ data: Address }>(userEndpoints.addresses, data);
    return { success: true as const, address: response?.data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create address";
    return { success: false as const, message };
  }
}

export async function updateAddressAction(id: string, data: Partial<Address>) {
  try {
    await patchPrivate(`${userEndpoints.addresses}/${id}`, data);
    return { success: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update address";
    return { success: false as const, message };
  }
}

export async function deleteAddressAction(id: string) {
  try {
    await deletePrivate(`${userEndpoints.addresses}/${id}`);
    return { success: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete address";
    return { success: false as const, message };
  }
}
