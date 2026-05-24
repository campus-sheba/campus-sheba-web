/** Global search API — GET /search, GET /search/suggestions */

export type SearchCategoryKey =
  | "books"
  | "food"
  | "buySell"
  | "products"
  | "lostAndFound"
  | "shops"
  | "emergency"
  | "campusLocations";

export type SearchCategoryParam =
  | "all"
  | "books"
  | "food"
  | "buySell"
  | "products"
  | "lostAndFound"
  | "shops"
  | "emergency"
  | "campusLocations";

export type SearchHit = {
  _id: string;
  _type?: string;
  title?: string;
  displayTitle?: string;
  name?: string;
  author?: string;
  description?: string;
  thumbnail?: string | null;
  slug?: string;
  type?: string;
  price?: number;
  score?: number;
};

export type SearchCategoryBucket = {
  items: SearchHit[];
  total: number;
};

export type GlobalSearchResults = {
  query: string;
  totalResults: number;
  results: Partial<Record<SearchCategoryKey, SearchCategoryBucket>>;
};

export type GlobalSearchResponse = {
  data: GlobalSearchResults;
};
