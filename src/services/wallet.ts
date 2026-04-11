"use server";

import type {
  RequestWithdrawalPayload,
  UserWallet,
  WalletTopupInitiateResult,
  WalletTopupListResult,
  WalletTopupRecord,
  WalletTransaction,
  WalletWithdrawalListResult,
  WalletWithdrawalRequest,
} from "@/types/wallet";
import { getPrivate } from "@/utils/api/get";
import { postPrivate } from "@/utils/api/post";
import { walletEndpoints } from "@/utils/endpoints/endpoints";

const privateOpts = { includeUniversity: false as const };

function pickData<T>(res: unknown): T | undefined {
  if (!res || typeof res !== "object") return undefined;
  const r = res as Record<string, unknown>;
  if ("data" in r && r.data !== undefined) return r.data as T;
  return undefined;
}

function pickRecord(res: unknown): Record<string, unknown> | null {
  if (!res || typeof res !== "object") return null;
  return res as Record<string, unknown>;
}

export type WalletResult<T> =
  | { success: true; data: T }
  | { success: false; message: string; data: null };

export async function getWalletAction(): Promise<WalletResult<UserWallet>> {
  try {
    const res = await getPrivate<unknown>(walletEndpoints.base, privateOpts);
    const data = pickData<UserWallet>(res);
    if (!data || typeof data !== "object" || !("_id" in data)) {
      return { success: false, message: "Invalid wallet response", data: null };
    }
    return { success: true, data };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load wallet";
    return { success: false, message, data: null };
  }
}

export async function getWalletTransactionsAction(): Promise<
  WalletResult<WalletTransaction[]>
> {
  try {
    const res = await getPrivate<unknown>(walletEndpoints.transactions, privateOpts);
    const raw = pickData<unknown>(res);
    const data = Array.isArray(raw) ? raw : [];
    return { success: true, data: data as WalletTransaction[] };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load transactions";
    return { success: false, message, data: null };
  }
}

export type InitiateTopupResult =
  | { success: true; topupId: string; amount: number; url: string }
  | { success: false; message: string };

export async function initiateWalletTopupAction(amount: number): Promise<InitiateTopupResult> {
  if (!Number.isFinite(amount) || amount < 10) {
    return { success: false, message: "Minimum top-up amount is ৳10." };
  }
  try {
    const res = await postPrivate<unknown>(
      walletEndpoints.topupInitiate,
      { amount },
      privateOpts,
    );
    const data = pickData<WalletTopupInitiateResult>(res);
    if (!data?.url || !data.topupId) {
      return { success: false, message: "Invalid top-up response" };
    }
    return { success: true, topupId: data.topupId, amount: data.amount, url: data.url };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to start top-up";
    return { success: false, message };
  }
}

export type WalletTopupsActionResult =
  | { success: true; page: number; limit: number; total: number; data: WalletTopupRecord[] }
  | { success: false; message: string; data: WalletTopupRecord[]; page: number; limit: number; total: number };

export async function getWalletTopupsAction(params?: {
  page?: number;
  limit?: number;
}): Promise<WalletTopupsActionResult> {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  const q = new URLSearchParams({ page: String(page), limit: String(limit) });
  try {
    const res = await getPrivate<unknown>(`${walletEndpoints.topupList}?${q}`, privateOpts);
    const rec = pickRecord(res);
    if (rec && Array.isArray(rec.data) && typeof rec.page === "number") {
      const list = rec as unknown as WalletTopupListResult;
      return {
        success: true,
        page: list.page,
        limit: list.limit,
        total: list.total,
        data: list.data,
      };
    }
    const nested = pickData<WalletTopupListResult>(res);
    if (nested && Array.isArray(nested.data)) {
      return {
        success: true,
        page: nested.page,
        limit: nested.limit,
        total: nested.total,
        data: nested.data,
      };
    }
    return {
      success: false,
      message: "Invalid top-up history response",
      data: [],
      page,
      limit,
      total: 0,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load top-ups";
    return { success: false, message, data: [], page, limit, total: 0 };
  }
}

export type RequestWithdrawalResult =
  | { success: true; data: WalletWithdrawalRequest }
  | { success: false; message: string };

export async function requestWalletWithdrawalAction(
  payload: RequestWithdrawalPayload,
): Promise<RequestWithdrawalResult> {
  if (!Number.isFinite(payload.amount) || payload.amount < 50) {
    return { success: false, message: "Minimum withdrawal amount is ৳50." };
  }
  if (!payload.method?.trim()) {
    return { success: false, message: "Withdrawal method is required." };
  }
  try {
    const res = await postPrivate<unknown>(walletEndpoints.withdraw, payload, privateOpts);
    const data = pickData<WalletWithdrawalRequest>(res);
    if (!data || !data._id) {
      return { success: false, message: "Invalid withdrawal response" };
    }
    return { success: true, data };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to request withdrawal";
    return { success: false, message };
  }
}

export type WalletWithdrawalsActionResult =
  | {
      success: true;
      page: number;
      limit: number;
      total: number;
      data: WalletWithdrawalRequest[];
    }
  | {
      success: false;
      message: string;
      data: WalletWithdrawalRequest[];
      page: number;
      limit: number;
      total: number;
    };

export async function getWalletWithdrawalsAction(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<WalletWithdrawalsActionResult> {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  const q = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (params?.status?.trim()) q.set("status", params.status.trim());

  try {
    const res = await getPrivate<unknown>(`${walletEndpoints.withdrawList}?${q}`, privateOpts);
    const rec = pickRecord(res);
    if (rec && Array.isArray(rec.data) && typeof rec.page === "number") {
      const list = rec as unknown as WalletWithdrawalListResult;
      return {
        success: true,
        page: list.page,
        limit: list.limit,
        total: list.total,
        data: list.data,
      };
    }
    const nested = pickData<WalletWithdrawalListResult>(res);
    if (nested && Array.isArray(nested.data)) {
      return {
        success: true,
        page: nested.page,
        limit: nested.limit,
        total: nested.total,
        data: nested.data,
      };
    }
    return {
      success: false,
      message: "Invalid withdrawals response",
      data: [],
      page,
      limit,
      total: 0,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load withdrawals";
    return { success: false, message, data: [], page, limit, total: 0 };
  }
}
