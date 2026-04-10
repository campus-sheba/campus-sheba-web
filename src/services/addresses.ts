"use server";

import type { ApiEnvelope } from "@/types/auth";
import type {
  CreateAddressPayload,
  UpdateAddressPayload,
  UserAddress,
} from "@/types/address";
import { deletePrivate } from "@/utils/api/delete";
import { getPrivate } from "@/utils/api/get";
import { patchPrivate } from "@/utils/api/patch";
import { postPrivate } from "@/utils/api/post";
import { addressEndpoints } from "@/utils/endpoints/endpoints";

const privateOpts = { includeUniversity: false as const };

export async function getAddressesAction(type?: string) {
  try {
    const query = type ? `?type=${encodeURIComponent(type)}` : "";
    const res = await getPrivate<ApiEnvelope<UserAddress[]>>(
      `${addressEndpoints.base}${query}`,
      privateOpts,
    );
    return { success: true as const, data: res.data ?? [] };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load addresses";
    return { success: false as const, message, data: [] as UserAddress[] };
  }
}

export async function getAddressByIdAction(id: string) {
  try {
    const res = await getPrivate<ApiEnvelope<UserAddress>>(
      addressEndpoints.byId(id),
      privateOpts,
    );
    return { success: true as const, data: res.data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load address";
    return { success: false as const, message, data: null };
  }
}

export async function createAddressAction(payload: CreateAddressPayload) {
  try {
    await postPrivate<unknown>(addressEndpoints.base, payload, privateOpts);
    return { success: true as const };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create address";
    return { success: false as const, message };
  }
}

export async function updateAddressAction(id: string, payload: UpdateAddressPayload) {
  try {
    await patchPrivate<unknown>(addressEndpoints.byId(id), payload, privateOpts);
    return { success: true as const };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update address";
    return { success: false as const, message };
  }
}

export async function deleteAddressAction(id: string) {
  try {
    await deletePrivate(addressEndpoints.byId(id), undefined, privateOpts);
    return { success: true as const };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete address";
    return { success: false as const, message };
  }
}
