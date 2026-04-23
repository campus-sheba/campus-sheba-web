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
  isActive?: boolean;
  isOpen?: boolean;
  minimumOrderAmount?: number;
  rating?: number;
  reviewCount?: number;
  logo?: MarketplaceMedia | null;
  coverPhoto?: MarketplaceMedia | null;
  university?: MarketplaceUniversityRef | string;
  category?: string | { _id?: string; title?: string };
  subCategories?: string[];
  kycStatus?: string;
  trustScore?: number;
  address?: string;
  phoneNumber?: string;
  contactEmail?: string;
  website?: string;
  socialLinks?: Record<string, string | null>;
  tags?: string[];
};

export type MarketplaceProductVariant = {
  name: string;
  options: string[];
};

export type MarketplaceProductSpec = {
  key: string;
  value: string;
};

export type MarketplaceProduct = {
  _id: string;
  title: string;
  slug?: string;
  subtitle?: string;
  description?: string;
  price?: number;
  discountPrice?: number;
  quantity?: number;
  condition?: string;
  isNegotiable?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
  type?: string;
  photos?: MarketplaceMedia[];
  university?: MarketplaceUniversityRef | string;
  shop?: MarketplaceShopListItem | string | null;
  category?: { _id?: string; title?: string; icon?: string } | string | null;
  brand?: string;
  sku?: string;
  unit?: string;
  tags?: string[];
  variants?: MarketplaceProductVariant[];
  specifications?: MarketplaceProductSpec[];
  returnPolicy?: { isReturnable?: boolean; returnWindowDays?: number; conditions?: string };
  deliveryInfo?: { estimatedDays?: number; freeDeliveryAbove?: number; deliveryCharge?: number };
  viewCount?: number;
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

/** Response shape for GET /user/marketplace (home feed). */
export type MarketplaceHomeFeed = {
  featuredShops: MarketplaceShopListItem[];
  featuredProducts: MarketplaceProduct[];
  latestProducts: MarketplaceProduct[];
  categories: Array<{ _id: string; title: string; icon?: string; description?: string; type?: string }>;
};

/** Response shape for GET /user/marketplace/shops/:shopId/products. */
export type MarketplaceShopWithProducts = {
  shop: MarketplaceShopListItem;
  products: Paginated<MarketplaceProduct> | MarketplaceProduct[];
};
