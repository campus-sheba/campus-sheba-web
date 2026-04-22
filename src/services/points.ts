"use server";

import type {
  CoinBalance,
  CoinConfig,
  CoinTransactionListResult,
  RedeemCoinsResult,
} from "@/types/points";
import { getPrivate } from "@/utils/api/get";
import { postPrivate } from "@/utils/api/post";
import { pointsEndpoints } from "@/utils/endpoints/endpoints";

const opts = { includeUniversity: false as const };

export type PointsResult<T> =
  | { success: true; data: T }
  | { success: false; message: string; data: null };

function pickData<T>(res: unknown): T | undefined {
  if (!res || typeof res !== "object") return undefined;
  const r = res as Record<string, unknown>;
  if ("data" in r && r.data !== undefined) return r.data as T;
  return res as T;
}

export async function getCoinBalanceAction(): Promise<PointsResult<CoinBalance>> {
  try {
    const res = await getPrivate<unknown>(pointsEndpoints.balance, opts);
    const data = pickData<CoinBalance>(res);
    if (!data || typeof data !== "object" || !("balance" in data)) {
      return { success: false, message: "Invalid balance response", data: null };
    }
    return { success: true, data };
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : "Failed to load balance", data: null };
  }
}

export async function getCoinTransactionsAction(params?: {
  page?: number;
  limit?: number;
}): Promise<PointsResult<CoinTransactionListResult>> {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  const q = new URLSearchParams({ page: String(page), limit: String(limit) });
  try {
    const res = await getPrivate<unknown>(`${pointsEndpoints.transactions}?${q}`, opts);
    const data = pickData<CoinTransactionListResult>(res);
    if (!data || !Array.isArray((data as CoinTransactionListResult).transactions)) {
      return { success: true, data: { transactions: [], page, limit, total: 0 } };
    }
    return { success: true, data };
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : "Failed to load transactions", data: null };
  }
}

export async function getCoinConfigAction(): Promise<PointsResult<CoinConfig>> {
  try {
    const res = await getPrivate<unknown>(pointsEndpoints.config, opts);
    const data = pickData<CoinConfig>(res);
    if (!data || typeof data !== "object" || !("coinsPerBDT" in data)) {
      return { success: false, message: "Invalid config response", data: null };
    }
    return { success: true, data };
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : "Failed to load config", data: null };
  }
}

export async function redeemCoinsAction(coins: number): Promise<PointsResult<RedeemCoinsResult>> {
  if (!Number.isFinite(coins) || coins <= 0) {
    return { success: false, message: "Invalid coin amount.", data: null };
  }
  try {
    const res = await postPrivate<unknown>(pointsEndpoints.redeem, { coins }, opts);
    const data = pickData<RedeemCoinsResult>(res);
    if (!data || typeof data !== "object" || !("coinsSpent" in data)) {
      return { success: false, message: "Invalid redeem response", data: null };
    }
    return { success: true, data };
  } catch (e) {
    return { success: false, message: e instanceof Error ? e.message : "Redemption failed", data: null };
  }
}
