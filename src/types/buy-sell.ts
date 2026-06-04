export type BuySellCategory = {
  _id: string;
  type?: string;
  title: string;
  icon?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type BuySellUniversity = {
  _id: string;
  name: string;
  shortName: string;
  coverPhoto?: string;
  logo?: string;
};

export type BuySellListing = {
  _id: string;
  title: string;
  brand?: string;
  modelName?: string;
  slug: string;
  photos: Array<{ url: string; key?: string; size?: number; _id?: string }>;
  /** Populated category or raw id from creator API */
  category?: BuySellCategory | string;
  university?: BuySellUniversity | string;
  /** Creator API returns address as id string; detail may populate */
  address?: string | { _id: string };
  description?: string;
  status?: string;
  price: number;
  negotiable?: boolean;
  quantity?: number;
  condition?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type BuySellPaginatedResponse = {
  page: number;
  limit: number;
  total: number;
  data: BuySellListing[];
};

/** Curated home feed: GET /api/user/buy-sell/feed */
export type BuySellFeedResponse = {
  featured: BuySellListing[];
  recent: BuySellListing[];
  trending: BuySellListing[];
  /** Present when no `category` filter is passed. */
  topRated?: BuySellListing[];
  /** Present when a `category` filter is passed (replaces topRated). */
  byCategory?: BuySellListing[];
};

/** Request body for POST /api/creator/buy-sell */
export type BuySellPhotoPayload = {
  url: string;
  key: string;
  size: number;
};

export type CreateBuySellListingPayload = {
  title: string;
  brand?: string;
  modelName?: string;
  addressId: string;
  photos: BuySellPhotoPayload[];
  category: string;
  description: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  condition: string;
  price: number;
  negotiable: boolean;
  quantity: number;
};

/** PATCH /api/creator/buy-sell/:id — same shape as create in API docs */
export type UpdateBuySellListingPayload = CreateBuySellListingPayload;
