export type MarketplaceMedia = {
  url?: string;
  key?: string;
  size?: number;
};

export type MarketplaceUniversityRef = {
  _id: string;
  name?: string;
  shortName?: string;
};

export type MarketplaceShopListItem = {
  _id: string;
  name: string;
  description?: string;
  type?: string;
  status?: string;
  isOpen?: boolean;
  minimumOrderAmount?: number;
  rating?: number;
  reviewCount?: number;
  logo?: MarketplaceMedia | null;
  coverPhoto?: MarketplaceMedia | null;
  university?: MarketplaceUniversityRef | string;
};

export type MarketplaceProduct = {
  _id: string;
  title: string;
  slug?: string;
  description?: string;
  price?: number;
  discountPrice?: number;
  quantity?: number;
  condition?: string;
  isNegotiable?: boolean;
  isFeatured?: boolean;
  type?: string;
  photos?: MarketplaceMedia[];
  university?: MarketplaceUniversityRef | string;
};

export type Paginated<T> = {
  page: number;
  limit: number;
  total: number;
  data: T[];
};

export type ApiDataEnvelope<T> = {
  data: T;
};

/** Food items vary by API version; keep loose for list cards. */
export type MarketplaceFood = {
  _id: string;
  name?: string;
  title?: string;
  description?: string;
  price?: number;
  photos?: MarketplaceMedia[];
  isActive?: boolean;
  categoryId?: string;
  category?: string | { _id?: string };
  [key: string]: unknown;
};
