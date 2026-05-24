"use server";

import type { GlobalSearchResults, SearchCategoryParam } from "@/types/search";
import { getPublic } from "@/utils/api/get";
import { searchEndpoints } from "@/utils/endpoints/endpoints";
import { unwrapGlobalSearchData } from "@/utils/search/unwrapGlobalSearch";

function buildSearchUrl(
  base: string,
  params: {
    q: string;
    university?: string;
    category?: SearchCategoryParam;
    page?: number;
    limit?: number;
  },
): string {
  const q = new URLSearchParams();
  q.set("q", params.q.trim());
  if (params.university) q.set("university", params.university);
  if (params.category) q.set("category", params.category);
  if (params.page != null) q.set("page", String(params.page));
  if (params.limit != null) q.set("limit", String(params.limit));
  return `${base}?${q.toString()}`;
}

async function fetchSearchFromApi(
  base: string,
  params: {
    q: string;
    university?: string;
    category?: SearchCategoryParam;
    page?: number;
    limit?: number;
  },
): Promise<GlobalSearchResults | null> {
  const trimmed = params.q.trim();
  if (trimmed.length < 2) return null;

  const url = buildSearchUrl(base, params);
  const json = await getPublic<unknown>(url, { includeUniversity: false });
  return unwrapGlobalSearchData(json);
}

/** Typeahead — GET /search/suggestions (optional JWT via httpOnly cookie). */
export async function fetchSearchSuggestionsAction(
  q: string,
  universityId?: string,
): Promise<GlobalSearchResults | null> {
  try {
    return await fetchSearchFromApi(searchEndpoints.suggestions, {
      q,
      university: universityId,
    });
  } catch {
    return null;
  }
}

/** Full search — GET /search */
export async function fetchGlobalSearchAction(
  q: string,
  options: {
    universityId?: string;
    category?: SearchCategoryParam;
    page?: number;
    limit?: number;
  } = {},
): Promise<GlobalSearchResults | null> {
  try {
    return await fetchSearchFromApi(searchEndpoints.search, {
      q,
      university: options.universityId,
      category: options.category ?? "all",
      page: options.page ?? 1,
      limit: options.limit ?? 10,
    });
  } catch {
    return null;
  }
}
