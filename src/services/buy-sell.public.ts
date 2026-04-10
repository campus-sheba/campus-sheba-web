import type { BuySellCategoriesResponse } from "@/services/buy-sell";

/**
 * Client-safe public fetch for Buy & Sell categories.
 * Uses NEXT_PUBLIC_API_URL and does not rely on server cookies/headers.
 */
export async function fetchBuySellCategoriesPublic(page = 1, limit = 100): Promise<BuySellCategoriesResponse> {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    return { page, limit, total: 0, data: [] };
  }

  const q = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    type: "Buy and Sell",
  });

  const res = await fetch(`${base}/user/categories?${q.toString()}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load categories (${res.status})`);
  }

  const json = (await res.json()) as unknown;
  // Match our normalized shape from server service.
  if (!json || typeof json !== "object") return { page, limit, total: 0, data: [] };
  const r = json as Record<string, unknown>;
  const data = r.data;
  return {
    page: typeof r.page === "number" ? r.page : page,
    limit: typeof r.limit === "number" ? r.limit : limit,
    total: typeof r.total === "number" ? r.total : Array.isArray(data) ? data.length : 0,
    data: Array.isArray(data) ? (data as BuySellCategoriesResponse["data"]) : [],
  };
}

