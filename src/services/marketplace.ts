"use server";

import { cookies } from "next/headers";
import { getPublic } from "@/utils/api/get";
import { marketplaceEndpoints } from "@/utils/endpoints/endpoints";
import type { BuySellCategory } from "@/types/buy-sell";
import { fetchUserCategoriesByType } from "@/services/books";
import type {
  ApiDataEnvelope,
  MarketplaceFood,
  MarketplaceProduct,
  MarketplaceShopListItem,
  Paginated,
} from "@/types/marketplace";
import { isFoodOutletShop } from "@/utils/marketplace/shopFilters";

export async function getMarketplaceUniversityId(): Promise<string | null> {
  const id = await resolveUniversityId();
  return id ?? null;
}

async function resolveUniversityId(explicit?: string): Promise<string | undefined> {
  if (explicit) return explicit;
  const store = await cookies();
  const direct = store.get("universityId")?.value;
  if (direct) return direct;
  const raw = store.get("university")?.value;
  if (!raw) return undefined;
  try {
    const u = JSON.parse(decodeURIComponent(raw)) as { _id?: string };
    return u?._id;
  } catch {
    return undefined;
  }
}

function appendQuery(url: string, params: Record<string, string | number | boolean | undefined>): string {
  const u = new URL(url);
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === "") continue;
    u.searchParams.set(k, String(v));
  }
  return u.toString();
}

export type MarketplaceShopListFilters = {
  type?: string;
  searchKey?: string;
};

export async function fetchMarketplaceShops(
  universityId: string | undefined,
  page = 1,
  limit = 12,
  filters?: MarketplaceShopListFilters,
): Promise<Paginated<MarketplaceShopListItem>> {
  const uid = await resolveUniversityId(universityId);
  if (!uid) return { page, limit, total: 0, data: [] };
  const params: Record<string, string | number | boolean | undefined> = { page, limit, ...filters };
  const url = appendQuery(marketplaceEndpoints.shops, params);
  try {
    const res = await getPublic<Paginated<MarketplaceShopListItem>>(url, { universityId: uid });
    return {
      page: res.page ?? page,
      limit: res.limit ?? limit,
      total: res.total ?? res.data?.length ?? 0,
      data: Array.isArray(res.data) ? res.data : [],
    };
  } catch {
    return { page, limit, total: 0, data: [] };
  }
}

export async function fetchMarketplaceShopById(
  shopId: string,
  universityId?: string,
): Promise<MarketplaceShopListItem | null> {
  const uid = await resolveUniversityId(universityId);
  if (!uid) return null;
  try {
    const res = await getPublic<ApiDataEnvelope<MarketplaceShopListItem>>(
      marketplaceEndpoints.shopById(shopId),
      { universityId: uid },
    );
    return res?.data ?? null;
  } catch {
    return null;
  }
}

export type ProductQuery = {
  page?: number;
  limit?: number;
  searchKey?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  isNegotiable?: boolean;
  isFeatured?: boolean;
  shopId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc" | string;
};

export async function fetchMarketplaceProducts(
  universityId: string | undefined,
  query: ProductQuery = {},
): Promise<Paginated<MarketplaceProduct>> {
  const uid = await resolveUniversityId(universityId);
  if (!uid) return { page: query.page ?? 1, limit: query.limit ?? 12, total: 0, data: [] };
  const { page = 1, limit = 12, ...rest } = query;
  const params: Record<string, string | number | boolean | undefined> = { page, limit, ...rest };
  const url = appendQuery(marketplaceEndpoints.products, params);
  try {
    const res = await getPublic<Paginated<MarketplaceProduct>>(url, { universityId: uid });
    return {
      page: res.page ?? page,
      limit: res.limit ?? limit,
      total: res.total ?? res.data?.length ?? 0,
      data: Array.isArray(res.data) ? res.data : [],
    };
  } catch {
    return { page, limit, total: 0, data: [] };
  }
}

export async function fetchMarketplaceFeaturedProducts(
  universityId: string | undefined,
  page = 1,
  limit = 8,
): Promise<Paginated<MarketplaceProduct>> {
  const uid = await resolveUniversityId(universityId);
  if (!uid) return { page, limit, total: 0, data: [] };
  const url = appendQuery(marketplaceEndpoints.productsFeatured, { page, limit });
  try {
    const res = await getPublic<Paginated<MarketplaceProduct>>(url, { universityId: uid });
    return {
      page: res.page ?? page,
      limit: res.limit ?? limit,
      total: res.total ?? res.data?.length ?? 0,
      data: Array.isArray(res.data) ? res.data : [],
    };
  } catch {
    return { page, limit, total: 0, data: [] };
  }
}

export async function fetchMarketplaceProductsByShop(
  shopId: string,
  universityId?: string,
  page = 1,
  limit = 12,
): Promise<Paginated<MarketplaceProduct>> {
  const uid = await resolveUniversityId(universityId);
  if (!uid) return { page, limit, total: 0, data: [] };
  const url = appendQuery(marketplaceEndpoints.productsByShop(shopId), { page, limit });
  try {
    const res = await getPublic<Paginated<MarketplaceProduct>>(url, { universityId: uid });
    return {
      page: res.page ?? page,
      limit: res.limit ?? limit,
      total: res.total ?? res.data?.length ?? 0,
      data: Array.isArray(res.data) ? res.data : [],
    };
  } catch {
    return { page, limit, total: 0, data: [] };
  }
}

export async function fetchMarketplaceProductById(productId: string): Promise<MarketplaceProduct | null> {
  try {
    const res = await getPublic<ApiDataEnvelope<MarketplaceProduct>>(
      marketplaceEndpoints.productById(productId),
      { includeUniversity: true },
    );
    return res?.data ?? null;
  } catch {
    return null;
  }
}

export async function fetchMarketplaceFoods(
  universityId: string | undefined,
  page = 1,
  limit = 20,
): Promise<Paginated<MarketplaceFood>> {
  const uid = await resolveUniversityId(universityId);
  if (!uid) return { page, limit, total: 0, data: [] };
  const url = appendQuery(marketplaceEndpoints.foods, { page, limit });
  try {
    const res = await getPublic<Paginated<MarketplaceFood>>(url, { universityId: uid });
    return {
      page: res.page ?? page,
      limit: res.limit ?? limit,
      total: res.total ?? res.data?.length ?? 0,
      data: Array.isArray(res.data) ? res.data : [],
    };
  } catch {
    return { page, limit, total: 0, data: [] };
  }
}

/** Shops for Campus Mart home: product retail, excluding food-only outlets when possible. */
export async function fetchMartRetailShops(
  universityId: string | undefined,
  page = 1,
  limit = 16,
): Promise<Paginated<MarketplaceShopListItem>> {
  const typed = await fetchMarketplaceShops(universityId, page, limit, { type: "Product" });
  if (typed.data.length > 0) return typed;
  const all = await fetchMarketplaceShops(universityId, page, Math.max(limit, 24));
  const data = all.data.filter((s) => !isFoodOutletShop(s));
  return {
    ...all,
    data,
    total: data.length,
  };
}

/** Restaurants / food halls for the Food hub. */
export async function fetchFoodOutletShops(
  universityId: string | undefined,
  page = 1,
  limit = 24,
): Promise<Paginated<MarketplaceShopListItem>> {
  const typed = await fetchMarketplaceShops(universityId, page, limit, { type: "Food" });
  if (typed.data.length > 0) return typed;
  const all = await fetchMarketplaceShops(universityId, page, Math.max(limit, 32));
  const data = all.data.filter(isFoodOutletShop);
  return {
    ...all,
    data,
    total: data.length,
  };
}

export async function fetchMarketplaceFoodById(foodId: string): Promise<MarketplaceFood | null> {
  try {
    const res = await getPublic<ApiDataEnvelope<MarketplaceFood>>(
      marketplaceEndpoints.foodById(foodId),
      { includeUniversity: true },
    );
    return res?.data ?? null;
  } catch {
    return null;
  }
}

/** Categories for retail product discovery (Campus Mart — `type=Product` from `/user/categories`). */
export async function fetchCampusMartCategories(universityId: string | undefined): Promise<BuySellCategory[]> {
  const uid = await resolveUniversityId(universityId);
  if (!uid) return [];
  for (const type of ["Product", "Selling"] as const) {
    try {
      const r = await fetchUserCategoriesByType(type, 1, 80);
      if (r.data.length > 0) return r.data;
    } catch {
      /* try next */
    }
  }
  return [];
}

/** Food cuisine / menu categories (`type=Food`). */
export async function fetchFoodBrowseCategories(): Promise<BuySellCategory[]> {
  try {
    const r = await fetchUserCategoriesByType("Food", 1, 80);
    return r.data;
  } catch {
    return [];
  }
}

export async function fetchCampusMartNewArrivals(
  universityId: string | undefined,
  limit = 16,
): Promise<MarketplaceProduct[]> {
  const res = await fetchMarketplaceProducts(universityId, {
    page: 1,
    limit,
    sortBy: "newest",
    sortOrder: "desc",
  });
  return res.data;
}
