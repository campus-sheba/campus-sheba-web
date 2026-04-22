"use server";

import { cookies } from "next/headers";
import { getPublic } from "@/utils/api/get";
import { marketplaceEndpoints } from "@/utils/endpoints/endpoints";
import type { BuySellCategory } from "@/types/buy-sell";
import { fetchUserCategoriesByType } from "@/services/books";
import type {
  ApiDataEnvelope,
  MarketplaceFood,
  MarketplaceHomeFeed,
  MarketplaceProduct,
  MarketplaceShopListItem,
  MarketplaceShopWithProducts,
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
  const url = appendQuery(marketplaceEndpoints.marketplaceShops, params);
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
  const url = appendQuery(marketplaceEndpoints.marketplaceProducts, params);
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
  return fetchMarketplaceProducts(universityId, { page, limit, isFeatured: true });
}

export async function fetchMarketplaceProductsByShop(
  shopId: string,
  universityId?: string,
  page = 1,
  limit = 12,
): Promise<Paginated<MarketplaceProduct>> {
  const uid = await resolveUniversityId(universityId);
  if (!uid) return { page, limit, total: 0, data: [] };
  const url = appendQuery(marketplaceEndpoints.marketplaceShopWithProducts(shopId), { page, limit });
  try {
    const res = await getPublic<unknown>(url, { universityId: uid });
    const r = res as Record<string, unknown>;
    // Handle combined {shop, products} response or plain paginated list
    const raw = (r?.products ?? r?.data ?? res) as Record<string, unknown>;
    if (raw && Array.isArray(raw.data)) {
      return {
        page: (raw.page as number) ?? page,
        limit: (raw.limit as number) ?? limit,
        total: (raw.total as number) ?? (raw.data as unknown[]).length,
        data: raw.data as MarketplaceProduct[],
      };
    }
    if (Array.isArray(raw)) {
      return { page, limit, total: (raw as unknown[]).length, data: raw as MarketplaceProduct[] };
    }
    return { page, limit, total: 0, data: [] };
  } catch {
    return { page, limit, total: 0, data: [] };
  }
}

/** Fetches shop detail + its products in a single call. Falls back gracefully. */
export async function fetchMarketplaceShopWithProducts(
  shopId: string,
  universityId?: string,
  page = 1,
  limit = 24,
): Promise<{ shop: MarketplaceShopListItem | null; products: MarketplaceProduct[] }> {
  const uid = await resolveUniversityId(universityId);
  if (!uid) return { shop: null, products: [] };
  const url = appendQuery(marketplaceEndpoints.marketplaceShopWithProducts(shopId), { page, limit });
  try {
    const res = await getPublic<unknown>(url, { universityId: uid });
    const r = res as Record<string, unknown>;
    const envelope = (r?.data ?? r) as Record<string, unknown>;
    const shop = (envelope?.shop ?? null) as MarketplaceShopListItem | null;
    const rawProducts = envelope?.products;
    let products: MarketplaceProduct[] = [];
    if (Array.isArray(rawProducts)) {
      products = rawProducts as MarketplaceProduct[];
    } else if (rawProducts && typeof rawProducts === "object") {
      const p = rawProducts as Record<string, unknown>;
      products = Array.isArray(p.data) ? (p.data as MarketplaceProduct[]) : [];
    }
    return { shop, products };
  } catch {
    return { shop: null, products: [] };
  }
}

/** Home feed: single call returning featuredShops, featuredProducts, latestProducts, categories. */
export async function fetchMarketplaceHomeFeed(
  universityId: string | undefined,
): Promise<MarketplaceHomeFeed> {
  const empty: MarketplaceHomeFeed = { featuredShops: [], featuredProducts: [], latestProducts: [], categories: [] };
  const uid = await resolveUniversityId(universityId);
  if (!uid) return empty;
  try {
    const res = await getPublic<ApiDataEnvelope<MarketplaceHomeFeed>>(
      marketplaceEndpoints.homeFeed,
      { universityId: uid },
    );
    const feed = res?.data;
    if (!feed) return empty;
    return {
      featuredShops: Array.isArray(feed.featuredShops) ? feed.featuredShops : [],
      featuredProducts: Array.isArray(feed.featuredProducts) ? feed.featuredProducts : [],
      latestProducts: Array.isArray(feed.latestProducts) ? feed.latestProducts : [],
      categories: Array.isArray(feed.categories) ? feed.categories : [],
    };
  } catch {
    return empty;
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

/** Shops for Campus Mart home — uses /user/marketplace/shops which returns Startup-type shops only. */
export async function fetchMartRetailShops(
  universityId: string | undefined,
  page = 1,
  limit = 16,
): Promise<Paginated<MarketplaceShopListItem>> {
  return fetchMarketplaceShops(universityId, page, limit);
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
