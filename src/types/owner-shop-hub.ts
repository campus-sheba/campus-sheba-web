export interface OperatingSlot {
  open: string;
  close: string;
}

export interface OperatingHour {
  day: string;
  isClosed: boolean;
  slots: OperatingSlot[];
}

export interface ShopMedia {
  url: string;
  key: string;
  size: number;
}

export interface ShopSocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  whatsapp?: string;
}

export interface ShopLocation {
  type: "Point";
  coordinates: [number, number];
}

export interface ShopPayload {
  type?: "Student Shop" | "Campus Shop" | string;
  name: string;
  description?: string;
  address?: string;
  logo?: ShopMedia;
  coverPhoto?: ShopMedia;
  contactEmail?: string;
  phoneNumber?: string;
  website?: string;
  socialLinks?: ShopSocialLinks;
  minimumOrderAmount?: number;
  operatingHours?: OperatingHour[];
  location?: ShopLocation;
}

export interface Shop extends ShopPayload {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
  /** Extra fields the API may return */
  kycStatus?: string;
  status?: string;
  isActive?: boolean;
  [key: string]: unknown;
}

export interface ProductPhoto {
  url: string;
  key: string;
  size: number;
}

export interface Product {
  _id: string;
  title: string;
  type?: string;
  subtitle?: string;
  description?: string;
  photos?: ProductPhoto[];
  price: number;
  quantity?: number;
  condition?: string;
  isNegotiable?: boolean;
  discountPrice?: number;
  shopId?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  categoryId?: string;
  addressId?: string;
  weight?: number;
  safekeepingCharge?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductPayload {
  title: string;
  type?: string;
  addressId?: string;
  safekeepingCharge?: number;
  subtitle?: string;
  description?: string;
  photos?: ProductPhoto[];
  price: number;
  quantity?: number;
  categoryId?: string;
  weight?: number;
  condition?: string;
  isNegotiable?: boolean;
  discountPrice?: number;
  shopId?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
}

export interface OrderItem {
  _id: string;
  productId?: string;
  title?: string;
  price?: number;
  quantity?: number;
  status?: string;
}

export interface Order {
  _id: string;
  items?: OrderItem[];
  totalAmount?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  buyerId?: string | { name?: string; phone?: string };
  /** Some APIs expose this separately from `status` */
  paymentStatus?: string;
}

export interface HubReview {
  _id: string;
  rating?: number;
  comment?: string;
  response?: string;
  isVerifiedPurchase?: boolean;
  createdAt?: string;
  user?: { name?: string; avatar?: string };
}

/** Alias for review lists (matches older hub naming). */
export type Review = HubReview;

export type ReviewItemType = "shop" | "product" | "food" | "book" | "parcel";
