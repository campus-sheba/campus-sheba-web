"use server";

import type {
  LeaderboardResult,
  ReferralCode,
  ReferralListResult,
  ReferralValidation,
} from "@/types/referral";
import { getPrivate, getPublic } from "@/utils/api/get";
import { referralEndpoints } from "@/utils/endpoints/endpoints";

const opts = { includeUniversity: false as const };

export type ReferralResult<T> =
  | { success: true; data: T }
  | { success: false; message: string; data: null };

function pickData<T>(res: unknown): T | undefined {
  if (!res || typeof res !== "object") return undefined;
  const r = res as Record<string, unknown>;
  if ("data" in r && r.data !== undefined) return r.data as T;
  return res as T;
}

export async function validateReferralCodeAction(code: string): Promise<ReferralResult<ReferralValidation>> {
  try {
    const res = await getPublic<unknown>(referralEndpoints.validate(code));
    const data = pickData<ReferralValidation>(res);
    if (!data || typeof data !== "object") {
      return { success: false, message: "Invalid response", data: null };
    }
    return { success: true, data };
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : "Validation failed", data: null };
  }
}

export async function getMyReferralCodeAction(): Promise<ReferralResult<ReferralCode>> {
  try {
    const res = await getPrivate<unknown>(referralEndpoints.myCode, opts);
    const data = pickData<ReferralCode>(res);
    if (!data || typeof data !== "object" || !("referralCode" in data)) {
      return { success: false, message: "Invalid referral code response", data: null };
    }
    return { success: true, data };
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : "Failed to load referral code", data: null };
  }
}

export async function getMyReferralsAction(params?: {
  page?: number;
  limit?: number;
  status?: "PENDING" | "REWARDED";
}): Promise<ReferralResult<ReferralListResult>> {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  const q = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (params?.status) q.set("status", params.status);
  try {
    const res = await getPrivate<unknown>(`${referralEndpoints.myReferrals}?${q}`, opts);
    const data = pickData<ReferralListResult>(res);
    if (!data || !Array.isArray((data as ReferralListResult).referrals)) {
      return { success: true, data: { referrals: [], page, limit, total: 0 } };
    }
    return { success: true, data };
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : "Failed to load referrals", data: null };
  }
}

export async function getReferralLeaderboardAction(): Promise<ReferralResult<LeaderboardResult>> {
  try {
    const res = await getPrivate<unknown>(referralEndpoints.leaderboard, opts);
    const data = pickData<LeaderboardResult>(res);
    if (!data || !Array.isArray((data as LeaderboardResult).data)) {
      return { success: true, data: { data: [] } };
    }
    return { success: true, data };
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : "Failed to load leaderboard", data: null };
  }
}
