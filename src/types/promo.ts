export type PublicPromoCode = {
  _id: string;
  code: string;
  imageUrl?: string | null;
  type?: string;
  discount?: number;
  minOrderAmount?: number;
  maxDiscount?: number | null;
  validUntil?: string;
  isActive?: boolean;
};

export type PublicPromoCodesPage = {
  page: number;
  limit: number;
  total: number;
  data: PublicPromoCode[];
};

export type ValidatePromoResponse = {
  code: string;
  discountAmount: number;
  type?: string;
  maxDiscount?: number | null;
  minOrderAmount?: number;
};
