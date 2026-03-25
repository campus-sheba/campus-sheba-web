"use server";

import { getPrivate } from "@/utils/api/get";
import { postPrivate } from "@/utils/api/post";
import { patchPrivate } from "@/utils/api/patch";

const BASE = process.env.BASE_URL || process.env.NEXT_PUBLIC_API_URL;

export interface ParcelPhoto {
  url: string;
  key: string;
  size: number;
}

export interface ParcelPayload {
  pickupAddress: string;
  deliveryAddress: string;
  pickupLocation?: string[];
  deliveryLocation?: string[];
  photos?: ParcelPhoto[];
  recipientName: string;
  recipientPhone: string;
  size: string; // e.g. "Small", "Medium", "Large"
  estimatedWeight?: string; // e.g. "2kg"
  description?: string;
  paymentMethod: string; // e.g. "Cash on Delivery"
}

export interface Parcel extends ParcelPayload {
  _id: string;
  status: "Pending" | "Picked Up" | "In Transit" | "Delivered" | "Cancelled" | "Refunded" | "Returned";
  createdAt?: string;
  updatedAt?: string;
  trackingId?: string;
  deliveryHero?: any; // Delivery Hero Object
}

export async function createParcelBookingAction(data: ParcelPayload) {
  try {
    const response = await postPrivate<{ data: Parcel }>(`${BASE}/user/parcel`, data as unknown as Record<string, unknown>);
    return { success: true as const, data: (response as any)?.data ?? response };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to book parcel";
    return { success: false as const, message };
  }
}

export async function getMyParcelsAction(params?: Record<string, string>) {
  try {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
    const response = await getPrivate<{ data: Parcel[]; meta?: unknown }>(`${BASE}/user/parcel${qs}`);
    const data = (response as any)?.data ?? [];
    return { success: true as const, data: data as Parcel[] };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch parcels";
    return { success: false as const, message, data: [] as Parcel[] };
  }
}

export async function getParcelByIdAction(id: string) {
  try {
    const response = await getPrivate<{ data: Parcel }>(`${BASE}/user/parcel/${id}`);
    return { success: true as const, data: (response as any)?.data ?? response };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch parcel details";
    return { success: false as const, message, data: null };
  }
}

export async function cancelParcelAction(id: string) {
  try {
    const response = await patchPrivate(`${BASE}/user/parcel/${id}/cancel`, {});
    return { success: true as const, data: (response as any)?.data ?? response };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to cancel parcel";
    return { success: false as const, message };
  }
}

export async function requestParcelRefundAction(id: string) {
  try {
    const response = await postPrivate(`${BASE}/user/parcel/${id}/refund`, {});
    return { success: true as const, data: (response as any)?.data ?? response };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to request refund";
    return { success: false as const, message };
  }
}

export async function reviewDeliveredParcelAction(id: string, payload: { rating: number; comment?: string; photos?: ParcelPhoto[] }) {
  try {
    const response = await postPrivate(`${BASE}/user/parcel/${id}/review`, payload as unknown as Record<string, unknown>);
    return { success: true as const, data: (response as any)?.data ?? response };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit review";
    return { success: false as const, message };
  }
}

export async function getParcelHistoryAction(id: string) {
  try {
    const response = await getPrivate(`${BASE}/user/parcel/${id}/history`);
    return { success: true as const, data: (response as any)?.data ?? response };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch parcel history";
    return { success: false as const, message, data: null };
  }
}
