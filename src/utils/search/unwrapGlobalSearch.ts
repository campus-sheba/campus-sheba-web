import type { GlobalSearchResults, SearchCategoryKey, SearchHit } from "@/types/search";

const CATEGORY_KEYS: SearchCategoryKey[] = [
  "books",
  "food",
  "buySell",
  "products",
  "lostAndFound",
  "shops",
  "emergency",
  "campusLocations",
];

function isCategoryBuckets(obj: Record<string, unknown>): boolean {
  return CATEGORY_KEYS.some((key) => key in obj);
}

function normalizeResults(raw: unknown): GlobalSearchResults["results"] {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const r = raw as Record<string, unknown>;
  const out: GlobalSearchResults["results"] = {};

  for (const key of CATEGORY_KEYS) {
    const bucket = r[key];
    if (!bucket || typeof bucket !== "object" || Array.isArray(bucket)) continue;
    const b = bucket as Record<string, unknown>;
    const items = Array.isArray(b.items) ? b.items : [];
    const total = typeof b.total === "number" ? b.total : items.length;
    out[key] = { items: items as SearchHit[], total };
  }

  return out;
}

/**
 * Unwrap search API payloads. Backend may return:
 * - `{ data: { query, totalResults, results: { books: … } } }`
 * - `{ data: { query, totalResults, data: { books: … } } }`  ← current API
 * - `{ query, totalResults, data: { books: … } }` (after one unwrap)
 */
export function unwrapGlobalSearchData(json: unknown): GlobalSearchResults | null {
  if (!json || typeof json !== "object") return null;

  const outer = json as Record<string, unknown>;
  let query = "";
  let totalResults = 0;
  let bucketsRaw: unknown;

  const inner =
    outer.data && typeof outer.data === "object" && !Array.isArray(outer.data)
      ? (outer.data as Record<string, unknown>)
      : null;

  if (inner && ("query" in inner || "totalResults" in inner)) {
    query = typeof inner.query === "string" ? inner.query : "";
    totalResults =
      typeof inner.totalResults === "number"
        ? inner.totalResults
        : typeof inner.total === "number"
          ? inner.total
          : 0;
    bucketsRaw = inner.results ?? inner.data;
  } else if (inner && isCategoryBuckets(inner)) {
    query = typeof outer.query === "string" ? outer.query : "";
    totalResults =
      typeof outer.totalResults === "number"
        ? outer.totalResults
        : typeof outer.total === "number"
          ? outer.total
          : 0;
    bucketsRaw = inner;
  } else {
    query =
      typeof outer.query === "string"
        ? outer.query
        : typeof outer.q === "string"
          ? outer.q
          : "";
    totalResults =
      typeof outer.totalResults === "number"
        ? outer.totalResults
        : typeof outer.total === "number"
          ? outer.total
          : 0;
    bucketsRaw = outer.results ?? outer.data;
  }

  const results = normalizeResults(bucketsRaw);

  if (!query && totalResults === 0 && Object.keys(results).length === 0) {
    return null;
  }

  return { query, totalResults, results };
}
