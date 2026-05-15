export type ReviewUser = {
  _id: string;
  name?: string;
  photo?: string | null;
};

export type ReviewPhoto = {
  url: string;
  key?: string;
  size?: number;
};

export type ReviewItem = {
  _id: string;
  user: ReviewUser | string;
  reviewableType: string;
  reviewableId: string;
  rating: number;
  comment?: string | null;
  photos?: ReviewPhoto[];
  status?: string;
  isVerifiedPurchase?: boolean;
  isDeleted?: boolean;
  helpfulCount?: number;
  unhelpfulCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type ReviewListResponse = {
  page: number;
  limit: number;
  total: number;
  data: ReviewItem[];
};
