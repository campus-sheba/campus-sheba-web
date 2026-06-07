// Maps SDUI deep-links (stable {module,id} identifiers, currently shaped as
// API paths) onto this web app's real routes. Per the contract, deep-links are
// NOT finalized URLs — we route by module + the trailing id, never the raw
// string. Unknown modules fall back to the home page.

import type { CardItem, HomeSeeAll } from "@/types/home";

/** Per-module web routing: a list page and an optional detail builder. */
const MODULE_ROUTES: Record<string, { list: string; detail?: (id: string) => string }> = {
  food: { list: "/food", detail: (id) => `/food/${id}` },
  marketplace: { list: "/marketplace", detail: (id) => `/marketplace/products/${id}` },
  "buy-sell": { list: "/buy-sell", detail: (id) => `/buy-sell/${id}` },
  books: { list: "/books", detail: (id) => `/books/${id}` },
  "lost-and-found": { list: "/lost-found", detail: (id) => `/lost-found/${id}` },
  // Blood requests have no per-id web page yet — land on the requests list.
  "blood-donor": { list: "/blood-bank/requests" },
  transport: { list: "/live-bus" },
  category: { list: "/explore" },
  emergency: { list: "/emergency-contacts" },
  parcel: { list: "/parcel" },
};

/** True when a path segment looks like a Mongo ObjectId / opaque entity id. */
function looksLikeId(segment: string | undefined): segment is string {
  return !!segment && /^[a-f0-9]{24}$/i.test(segment);
}

/** Last path segment of a deep-link (drops query/hash). */
function trailingId(deeplink: string): string | undefined {
  const path = deeplink.split(/[?#]/)[0];
  const segments = path.split("/").filter(Boolean);
  return segments[segments.length - 1];
}

/** Resolve a single card to a web route. */
export function resolveCardHref(item: Pick<CardItem, "module" | "id" | "deeplink">): string {
  const route = MODULE_ROUTES[item.module];
  if (!route) return "/";

  // Prefer a detail route when we have a real entity id (from id or deep-link tail).
  const id = looksLikeId(item.id) ? item.id : trailingId(item.deeplink);
  if (route.detail && looksLikeId(id)) return route.detail(id);
  return route.list;
}

/** Resolve a shelf's "See all" target — the server-provided web route wins. */
export function resolveSeeAllHref(seeAll: HomeSeeAll | null): string | undefined {
  if (!seeAll) return undefined;
  if (seeAll.web) return seeAll.web;
  // Fall back to mapping the API deep-link by its leading module-ish segment.
  const leading = seeAll.deeplink.split(/[?#]/)[0].split("/").filter(Boolean);
  for (const seg of leading) {
    if (MODULE_ROUTES[seg]) return MODULE_ROUTES[seg].list;
  }
  return seeAll.deeplink;
}
