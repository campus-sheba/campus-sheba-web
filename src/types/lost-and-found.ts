/** API-aligned Lost & Found types (user browse, CRUD, resolve flow). */

export type LostFoundType = "Lost" | "Found";

export type LostFoundImage = {
  url: string;
  key?: string;
  size?: number;
  _id?: string;
};

export type LostFoundItem = {
  _id?: string;
  name: string;
  description?: string;
  images?: LostFoundImage[];
  category?: string;
};

export type LostFoundLocationRef = {
  _id: string;
  name?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
};

export type LostFoundCreatorRef = {
  _id?: string;
  name?: string;
  phone?: string;
  photo?: string | null;
};

export type LostFoundPost = {
  _id: string;
  items?: LostFoundItem[];
  title?: string;
  /** Legacy single-item category (Mongo id). */
  category?: string;
  description?: string;
  image?: LostFoundImage[];
  location?: (string | LostFoundLocationRef)[];
  lastSeenDate?: string;
  lastSeenTime?: string;
  contactName?: string;
  contactPhone?: string;
  alternateContactPhone?: string;
  contactEmail?: string;
  rewardAmount?: number;
  createdBy?: string | LostFoundCreatorRef;
  university?: string;
  type: LostFoundType;
  status?: string;
  escalationStatus?: string;
  linkedParcelId?: string;
  deliveryChoice?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type LostFoundBrowseResponse = {
  total: number;
  data: LostFoundPost[];
};

export type LostFoundMyPostsResponse = {
  page: number;
  limit: number;
  total: number;
  data: LostFoundPost[];
};

export type CreateLostFoundItemPayload = {
  name: string;
  description?: string;
  images?: { url: string; key?: string; size?: number }[];
  category?: string;
};

export type CreateLostFoundPayload = {
  items: CreateLostFoundItemPayload[];
  location: string[];
  lastSeenDate?: string;
  lastSeenTime?: string;
  contactName: string;
  contactPhone: string;
  alternateContactPhone?: string;
  contactEmail?: string;
  rewardAmount?: number;
  type: LostFoundType;
};

export type UpdateLostFoundPayload = Partial<CreateLostFoundPayload> & {
  title?: string;
  description?: string;
  image?: { url: string; key?: string; size?: number }[];
};

export type SendResolveRequestPayload = {
  message: string;
  images?: string[];
};

export type EscalateToParcelPayload = {
  resolveRequestId: string;
  pickupAddressId: string;
  deliveryAddressId: string;
  reason?: string;
};

export type ResolveRequestRow = {
  id?: string;
  _id?: string;
  postId?: string;
  requestedBy?: { _id?: string; name?: string; phone?: string };
  message?: string;
  images?: string[];
  status?: string;
  createdAt?: string;
};
