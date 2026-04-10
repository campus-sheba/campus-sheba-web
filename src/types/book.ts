/** API-aligned book marketplace types (GET /user/books, creator CRUD). */

export type BookType = "Selling" | "Lending" | "Donation";
export type BookQuality = "New" | "Like New" | "Good" | "Acceptable";

export type BookCategoryRef = {
  _id: string;
  type?: string;
  title: string;
  icon?: string;
  description?: string;
};

export type BookPhoto = {
  url: string;
  key?: string;
  size?: number;
  _id?: string;
};

export type BookListing = {
  _id: string;
  title: string;
  author?: string;
  edition?: string;
  slug?: string;
  photos: BookPhoto[];
  category?: BookCategoryRef | string;
  subject?: string;
  university?: unknown;
  address?: string | { _id: string; address?: string; type?: string };
  buyingYear?: string;
  description?: string;
  type: BookType;
  status?: string;
  sellerType?: string;
  publisher?: string;
  department?: string | { _id: string; name?: string; code?: string };
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  quality?: BookQuality | string;
  price: number;
  discountPrice?: number;
  quantity?: number;
  safekeepingCharge?: number;
  availabilityStatus?: string;
  borrowDuration?: number;
  maxExtensionDuration?: number;
  allowsExtension?: boolean;
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type BookPaginatedResponse = {
  page: number;
  limit: number;
  total: number;
  data: BookListing[];
};

export type BookPhotoPayload = {
  url: string;
  key: string;
  size: number;
};

/** Shared create/update body fields matching API DTOs */
export type CreateBookPayload = {
  title: string;
  author?: string;
  addressId: string;
  edition?: string;
  photos: BookPhotoPayload[];
  category: string;
  subject?: string;
  buyingYear: string;
  description: string;
  type: BookType;
  sellerType?: string;
  publisher?: string;
  department: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  quality: BookQuality;
  price: number;
  discountPrice?: number;
  safekeepingCharge?: number;
  quantity: number;
  returnDate?: string;
  borrowDuration?: number;
  maxExtensionDuration?: number;
  allowsExtension?: boolean;
  availabilityStatus?: string;
};

export type UpdateBookPayload = Partial<Omit<CreateBookPayload, "photos">> & {
  photos?: BookPhotoPayload[];
};
