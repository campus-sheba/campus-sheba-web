import type { SearchCategoryKey, SearchHit } from "@/types/search";

export const SEARCH_CATEGORY_ORDER: SearchCategoryKey[] = [
  "books",
  "food",
  "buySell",
  "products",
  "shops",
  "lostAndFound",
  "emergency",
  "campusLocations",
];

export function searchHitTitle(item: SearchHit): string {
  return (
    item.displayTitle?.trim() ||
    item.title?.trim() ||
    item.name?.trim() ||
    "Untitled"
  );
}

export function searchHitHref(item: SearchHit): string {
  const id = item._id;
  const type = (item._type ?? "").toLowerCase();

  switch (type) {
    case "book":
      return `/books/${id}`;
    case "lostandfound":
      return `/lost-found/${id}`;
    case "food":
      return `/food/${id}`;
    case "buysell":
      return `/buy-sell/${id}`;
    case "product":
    case "products":
      return `/marketplace/food/${id}`;
    case "shop":
    case "shops":
      return `/marketplace/shops/${id}`;
    case "emergency":
      return `/emergency-contacts/${id}`;
    case "campuslocation":
    case "campuslocations":
      return `/campus-map/${id}`;
    default:
      if (item.slug) return `/campus-map/by-slug/${encodeURIComponent(item.slug)}`;
      return "/explore";
  }
}

export function searchCategoryListUrl(
  category: SearchCategoryKey,
  query: string,
): string {
  const q = encodeURIComponent(query.trim());
  switch (category) {
    case "books":
      return `/books/all?searchKey=${q}`;
    case "food":
      return `/food?search=${q}`;
    case "buySell":
      return `/buy-sell/all?searchKey=${q}`;
    case "products":
      return `/marketplace/products?searchKey=${q}`;
    case "lostAndFound":
      return `/lost-found?title=${q}`;
    case "shops":
      return `/marketplace?searchKey=${q}`;
    case "emergency":
      return `/emergency-contacts?searchKey=${q}`;
    case "campusLocations":
      return `/campus-map?searchKey=${q}`;
    default:
      return `/search?q=${q}&category=${category}`;
  }
}
