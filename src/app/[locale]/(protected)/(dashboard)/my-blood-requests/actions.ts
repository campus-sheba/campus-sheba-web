"use server";

import { getPrivate } from "@/utils/api/get";
import { postPrivate } from "@/utils/api/post";
import { patchPrivate } from "@/utils/api/patch";
import { deletePrivate } from "@/utils/api/delete";

const BASE = process.env.BASE_URL || process.env.NEXT_PUBLIC_API_URL;

// ─── Types ───────────────────────────────────────────────────────────────────

export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

export interface DonorProfile {
  _id?: string;
  bloodGroup: BloodGroup;
  phoneNumber: string;
  email?: string;
  campusLocation?: string;
  department?: string;
  lastDonationDate?: string;
  emergencyContact?: string;
  notes?: string;
  isAvailable?: boolean;
  availabilityStatus?: "Available" | "Unavailable" | "Temporarily Unavailable";
  user?: { name?: string; avatar?: string };
  createdAt?: string;
}

export interface BloodRequest {
  _id: string;
  bloodGroup: BloodGroup;
  urgencyLevel: "Low" | "Medium" | "High" | "Critical";
  hospital: string;
  location: string;
  contactNumber: string;
  patientName: string;
  requiredUnits: number;
  additionalInfo?: string;
  status: "Open" | "Fulfilled" | "Cancelled";
  createdAt?: string;
  user?: { name?: string };
}

// ─── Donor Profile Actions ───────────────────────────────────────────────────

export async function getMyDonorProfileAction() {
  try {
    const res = await getPrivate<{ data: DonorProfile }>(`${BASE}/blood-donor/profile`);
    return { success: true as const, data: (res as any)?.data ?? null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch profile";
    if (message.toLowerCase().includes("not found") || message.includes("404")) {
      return { success: true as const, data: null };
    }
    return { success: false as const, message, data: null };
  }
}

export async function registerDonorAction(data: Omit<DonorProfile, "_id" | "user" | "createdAt">) {
  try {
    const res = await postPrivate<{ data: DonorProfile }>(`${BASE}/blood-donor/register`, data as unknown as Record<string, unknown>);
    return { success: true as const, data: (res as any)?.data ?? res };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to register";
    return { success: false as const, message };
  }
}

export async function updateDonorProfileAction(data: Partial<DonorProfile>) {
  try {
    const res = await patchPrivate<{ data: DonorProfile }>(`${BASE}/blood-donor/profile`, data as unknown as Record<string, unknown>);
    return { success: true as const, data: (res as any)?.data ?? res };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update profile";
    return { success: false as const, message };
  }
}

export async function deactivateDonorProfileAction() {
  try {
    await deletePrivate(`${BASE}/blood-donor/profile`);
    return { success: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to deactivate";
    return { success: false as const, message };
  }
}

// ─── Blood Requests Actions ──────────────────────────────────────────────────

export async function getMyBloodRequestsAction() {
  try {
    const res = await getPrivate<{ data: BloodRequest[] }>(`${BASE}/blood-donor/my-requests`);
    return { success: true as const, data: ((res as any)?.data ?? []) as BloodRequest[] };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch requests";
    return { success: false as const, message, data: [] as BloodRequest[] };
  }
}

export async function createBloodRequestAction(data: Omit<BloodRequest, "_id" | "status" | "createdAt" | "user">) {
  try {
    const res = await postPrivate<{ data: BloodRequest }>(`${BASE}/blood-donor/request`, data as unknown as Record<string, unknown>);
    return { success: true as const, data: (res as any)?.data ?? res };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create request";
    return { success: false as const, message };
  }
}

export async function updateBloodRequestStatusAction(id: string, status: "Open" | "Fulfilled" | "Cancelled") {
  try {
    const res = await patchPrivate(`${BASE}/blood-donor/request/${id}/status`, { status });
    return { success: true as const, data: (res as any)?.data ?? res };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update status";
    return { success: false as const, message };
  }
}
