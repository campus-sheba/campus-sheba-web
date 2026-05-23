import type {
  GlobalSearchResponse,
  GlobalSearchResults,
  SearchCategoryParam,
} from "@/types/search";

function getApiBase(): string | null {
  return process.env.NEXT_PUBLIC_API_URL ?? null;
}

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const entry = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : null;
}

function buildSearchUrl(
  path: "search" | "search/suggestions",
  params: { q: string; university?: string; category?: SearchCategoryParam; page?: number; limit?: number },
): string {
  const base = getApiBase();
  if (!base) throw new Error("API URL not configured");

  const q = new URLSearchParams();
  q.set("q", params.q.trim());
  if (params.university) q.set("university", params.university);
  if (params.category) q.set("category", params.category);
  if (params.page != null) q.set("page", String(params.page));
  if (params.limit != null) q.set("limit", String(params.limit));

  return `${base}/${path}?${q.toString()}`;
}

function unwrapSearchData(json: unknown): GlobalSearchResults | null {
  if (!json || typeof json !== "object") return null;
  const outer = json as Record<string, unknown>;
  const data = outer.data;
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  if (typeof d.query !== "string" || typeof d.totalResults !== "number") return null;
  const results =
    d.results && typeof d.results === "object" && !Array.isArray(d.results)
      ? (d.results as GlobalSearchResults["results"])
      : {};
  return {
    query: d.query,
    totalResults: d.totalResults,
    results,
  };
}

async function fetchSearch(
  path: "search" | "search/suggestions",
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

  const url = buildSearchUrl(path, params);
  const token = getCookieValue("accessToken");

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) return null;

  const json = (await res.json()) as unknown;
  return unwrapSearchData(json);
}

export async function fetchSearchSuggestions(
  q: string,
  universityId?: string,
): Promise<GlobalSearchResults | null> {
  return fetchSearch("search/suggestions", { q, university: universityId });
}

export async function fetchGlobalSearch(
  q: string,
  options: {
    universityId?: string;
    category?: SearchCategoryParam;
    page?: number;
    limit?: number;
  } = {},
): Promise<GlobalSearchResults | null> {
  return fetchSearch("search", {
    q,
    university: options.universityId,
    category: options.category ?? "all",
    page: options.page ?? 1,
    limit: options.limit ?? 10,
  });
}

export type { GlobalSearchResponse };
