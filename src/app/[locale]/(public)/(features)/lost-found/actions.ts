/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { getPrivate, getPublic } from "@/utils/api/get";
import { patchPrivate } from "@/utils/api/patch";
import { postPrivate } from "@/utils/api/post";
import { careersEndpoints, userEndpoints } from "@/utils/endpoints/endpoints";

type LostFoundCategory = {
  _id: string;
  title: string;
  type: string;
  icon?: string | null;
  description?: string | null;
};

type LostFoundImage = {
  url?: string | null;
};

type LostFoundLocation = {
  _id: string;
  name: string;
  latitude?: number;
  longitude?: number;
  description?: string;
};

type UniversityLocationOption = {
  id: string;
  name: string;
  type?: "hall" | "landmark" | "hub";
  universityId?: string;
};

type LostFoundItemInner = {
  name?: string;
  description?: string;
  category?: string | { _id: string; title?: string };
  images?: LostFoundImage[];
};

type LostFoundCreator = {
  _id: string;
  name?: string;
};

type LostFoundItem = {
  _id: string;
  title: string;
  description?: string;
  image?: LostFoundImage[];
  items?: LostFoundItemInner[];
  location?: LostFoundLocation[];
  lastSeenDate?: string;
  lastSeenTime?: string;
  contactName?: string;
  contactPhone?: string;
  alternateContactPhone?: string;
  contactEmail?: string;
  rewardAmount?: number;
  createdBy?: LostFoundCreator;
  university?: string;
  type: "Lost" | "Found";
  status?: string;
  escalationStatus?: string;
  deliveryChoice?: string;
  statusHistory?: unknown[];
  deliveryRequest?: {
    status?: string | null;
  };
  resolveRequest?: {
    status?: string | null;
  };
  myResolveRequest?: {
    status?: string | null;
  };
  category?: string;
  createdAt: string;
  updatedAt?: string;
};

type PaginatedResponse<T> = {
  page: number;
  limit: number;
  total: number;
  data: T[];
};

type ApiEnvelope<T> = {
  data: T;
};

type ApiMessageResponse = {
  message?: string;
};

type ResolveRequestStatus = "pending" | "accepted" | "rejected";

type IncomingResolveRequest = {
  id: string;
  postId: string;
  requestedBy?: {
    _id?: string;
    name?: string;
    phone?: string;
  };
  message?: string;
  images?: string[];
  status?: ResolveRequestStatus;
  createdAt?: string;
};

const extractMaybeWrappedArray = <T,>(payload: unknown): T[] => {
  if (!payload || typeof payload !== "object") return [];

  const maybeData = (payload as { data?: unknown }).data;

  if (Array.isArray(maybeData)) return maybeData as T[];
  if (Array.isArray(payload)) return payload as T[];

  return [];
};

const extractMaybeWrappedObject = <T,>(payload: unknown): T | null => {
  if (!payload || typeof payload !== "object") return null;

  const maybeData = (payload as { data?: unknown }).data;

  if (maybeData && typeof maybeData === "object") {
    return maybeData as T;
  }

  return payload as T;
};

const extractArrayFromUnknown = <T,>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== "object") return [];

  const record = payload as { data?: unknown; items?: unknown };

  if (Array.isArray(record.data)) return record.data as T[];
  if (Array.isArray(record.items)) return record.items as T[];

  if (record.data && typeof record.data === "object") {
    const nested = record.data as { data?: unknown; items?: unknown };
    if (Array.isArray(nested.data)) return nested.data as T[];
    if (Array.isArray(nested.items)) return nested.items as T[];
  }

  return [];
};

const normalizeUniversityLocationOption = (value: unknown): UniversityLocationOption | null => {
  if (!value || typeof value !== "object") return null;

  const raw = value as {
    _id?: unknown;
    id?: unknown;
    name?: unknown;
    title?: unknown;
    address?: unknown;
    type?: unknown;
    university?: unknown;
  };

  const id =
    (typeof raw._id === "string" && raw._id) ||
    (typeof raw.id === "string" && raw.id) ||
    "";

  const name =
    (typeof raw.name === "string" && raw.name) ||
    (typeof raw.title === "string" && raw.title) ||
    (typeof raw.address === "string" && raw.address) ||
    "";

  if (!id || !name) return null;

  const type =
    raw.type === "hall" || raw.type === "landmark" || raw.type === "hub"
      ? raw.type
      : undefined;

  const universityId =
    raw.university && typeof raw.university === "object"
      ? (raw.university as { _id?: unknown })._id
      : undefined;

  return {
    id,
    name,
    type,
    universityId: typeof universityId === "string" ? universityId : undefined,
  };
};

export async function getLostFoundCategoriesAction() {
  try {
    const params = new URLSearchParams({
      page: "1",
      limit: "50",
      type: "Lost And Found",
    });

    const response = await getPublic<PaginatedResponse<LostFoundCategory> | ApiEnvelope<PaginatedResponse<LostFoundCategory>>>(
      `${userEndpoints.categories}?${params.toString()}`,
    );

    const parsed = extractMaybeWrappedObject<PaginatedResponse<LostFoundCategory>>(response);

    return {
      success: true as const,
      categories: parsed?.data || extractMaybeWrappedArray<LostFoundCategory>(response),
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch categories";
    return { success: false as const, message, categories: [] as LostFoundCategory[] };
  }
}

export async function getLostFoundItemsAction(params: {
  page?: number;
  limit?: number;
  title?: string;
  category?: string;
  type?: "Lost" | "Found";
  status?: string;
}) {
  try {
    const search = new URLSearchParams();
    search.set("page", String(params.page ?? 1));
    search.set("limit", String(params.limit ?? 12));

    if (params.title?.trim()) {
      search.set("title", params.title.trim());
    }

    if (params.category?.trim()) {
      search.set("category", params.category.trim());
    }

    if (params.type) {
      search.set("type", params.type);
    }

    if (params.status?.trim()) {
      search.set("status", params.status.trim());
    }

    const response = await getPublic<PaginatedResponse<LostFoundItem> | ApiEnvelope<PaginatedResponse<LostFoundItem>>>(
      `${userEndpoints.lostAndFound}?${search.toString()}`,
    );

    const parsed = extractMaybeWrappedObject<PaginatedResponse<LostFoundItem>>(response);

    return {
      success: true as const,
      page: parsed?.page ?? 1,
      limit: parsed?.limit ?? (params.limit ?? 12),
      total: parsed?.total ?? 0,
      items: parsed?.data || extractMaybeWrappedArray<LostFoundItem>(response),
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch lost and found items";

    return {
      success: false as const,
      message,
      page: 1,
      limit: params.limit ?? 12,
      total: 0,
      items: [] as LostFoundItem[],
    };
  }
}

export async function getLostFoundItemByIdAction(id: string) {
  try {
    const response = await getPublic<LostFoundItem | ApiEnvelope<LostFoundItem>>(
      `${userEndpoints.lostAndFound}/${id}`,
    );

    const item = extractMaybeWrappedObject<LostFoundItem>(response);

    if (!item?._id) {
      return { success: false as const, message: "Item not found", item: null as LostFoundItem | null };
    }

    return { success: true as const, item };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch item details";
    return { success: false as const, message, item: null as LostFoundItem | null };
  }
}

export async function getMyLostFoundItemByIdAction(id: string) {
  try {
    const response = await getPrivate<LostFoundItem | ApiEnvelope<LostFoundItem>>(
      `${userEndpoints.lostAndFound}/${id}`,
    );

    const item = extractMaybeWrappedObject<LostFoundItem>(response);

    if (!item?._id) {
      return { success: false as const, message: "Item not found", item: null as LostFoundItem | null };
    }

    return { success: true as const, item };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch item details";
    return { success: false as const, message, item: null as LostFoundItem | null };
  }
}

export async function sendResolveRequestAction(params: {
  postId: string;
  message: string;
  images?: string[];
}) {
  try {
    const payload = {
      message: params.message.trim(),
      images: params.images?.filter(Boolean) || [],
    };

    if (!payload.message) {
      return { success: false as const, message: "Resolve message is required" };
    }

    const response = await postPrivate<ApiMessageResponse | ApiEnvelope<ApiMessageResponse>>(
      `${userEndpoints.lostAndFound}/${params.postId}/resolve-request`,
      payload,
    );

    const parsed = extractMaybeWrappedObject<ApiMessageResponse>(response);

    return {
      success: true as const,
      message: parsed?.message || "Resolve request sent successfully",
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send resolve request";

    return { success: false as const, message };
  }
}

export async function createLostFoundPostAction(payload: {
  title: string;
  description: string;
  category?: string;
  locationIds?: string[];
  lastSeenDate?: string;
  lastSeenTime?: string;
  contactName: string;
  contactPhone: string;
  alternateContactPhone?: string;
  contactEmail?: string;
  rewardAmount?: number;
  type: "Lost" | "Found";
  imageUrls?: string[];
}) {
  try {
    const requestBody = {
      items: [
        {
          name: payload.title,
          description: payload.description,
          images: (payload.imageUrls || []).map((url) => ({ url })),
          category: payload.category || undefined,
        },
      ],
      location: payload.locationIds || [],
      lastSeenDate:
        payload.lastSeenDate || new Date().toISOString().split("T")[0] + "T00:00:00.000Z",
      lastSeenTime: payload.lastSeenTime || "00:00",
      contactName: payload.contactName,
      contactPhone: payload.contactPhone,
      alternateContactPhone: payload.alternateContactPhone || undefined,
      contactEmail: payload.contactEmail || undefined,
      rewardAmount: payload.rewardAmount || 0,
      type: payload.type,
    };

    const response = await postPrivate<ApiEnvelope<{ _id?: string }> | { _id?: string }>(
      userEndpoints.lostAndFound,
      requestBody,
    );

    const parsed = extractMaybeWrappedObject<{ _id?: string }>(response);

    return {
      success: true as const,
      message: "Post created successfully",
      postId: parsed?._id,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create post";
    return { success: false as const, message };
  }
}

export async function getMyLostFoundPostsAction(params?: { page?: number; limit?: number }) {
  try {
    const search = new URLSearchParams();
    search.set("page", String(params?.page ?? 1));
    search.set("limit", String(params?.limit ?? 10));

    const response:any = await getPrivate<PaginatedResponse<LostFoundItem> | ApiEnvelope<PaginatedResponse<LostFoundItem>>>(
      `${userEndpoints.lostAndFound}/my-posts?${search.toString()}`,
    );

    console.log("Raw my posts response:", response);


    return {
      success: true as const,
        items: response?.data || [],
      total: response?.total || 0,
      page: response?.page || 1,
      limit: response?.limit || (params?.limit ?? 10),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch my posts";
    return {
      success: false as const,
      message,
      items: [] as LostFoundItem[],
      total: 0,
      page: 1,
      limit: params?.limit ?? 10,
    };
  }
}

export async function updateLostFoundPostAction(params: {
  id: string;
  title: string;
  description: string;
  category?: string;
  locationIds?: string[];
  lastSeenDate?: string;
  lastSeenTime?: string;
  contactName: string;
  contactPhone: string;
  alternateContactPhone?: string;
  contactEmail?: string;
  rewardAmount?: number;
  imageUrls?: string[];
}) {
  try {
    const requestBody = {
      items: [
        {
          name: params.title,
          description: params.description,
          images: (params.imageUrls || []).map((url) => ({ url })),
          category: params.category || undefined,
        },
      ],
      title: params.title,
      description: params.description,
      image: (params.imageUrls || []).map((url) => ({ url })),
      category: params.category || undefined,
      location: params.locationIds || [],
      lastSeenDate: params.lastSeenDate || undefined,
      lastSeenTime: params.lastSeenTime || undefined,
      contactName: params.contactName,
      contactPhone: params.contactPhone,
      alternateContactPhone: params.alternateContactPhone || undefined,
      contactEmail: params.contactEmail || undefined,
      rewardAmount: params.rewardAmount || 0,
    };

    await patchPrivate(`${userEndpoints.lostAndFound}/${params.id}`, requestBody);

    return {
      success: true as const,
      message: "Post updated successfully",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update post";
    return { success: false as const, message };
  }
}

export async function getIncomingResolveRequestsAction(postId: string) {
  try {
    const response = await getPrivate<IncomingResolveRequest[] | ApiEnvelope<IncomingResolveRequest[]>>(
      `${userEndpoints.lostAndFound}/${postId}/resolve-requests`,
    );

    const requests = extractMaybeWrappedArray<IncomingResolveRequest>(response);

    return {
      success: true as const,
      requests,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load resolve requests";
    return {
      success: false as const,
      message,
      requests: [] as IncomingResolveRequest[],
    };
  }
}

export async function respondResolveRequestAction(params: {
  requestId: string;
  status: "accepted" | "rejected";
}) {
  try {
    const response = await patchPrivate<ApiMessageResponse | ApiEnvelope<ApiMessageResponse>>(
      `${userEndpoints.lostAndFound}/resolve-request/${params.requestId}`,
      { status: params.status },
    );

    const parsed = extractMaybeWrappedObject<ApiMessageResponse>(response);

    return {
      success: true as const,
      message: parsed?.message || "Resolve request updated",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update resolve request";
    return { success: false as const, message };
  }
}

export async function resolveLostFoundPostAction(id: string) {
  try {
    const response = await patchPrivate<ApiMessageResponse | ApiEnvelope<ApiMessageResponse>>(
      `${userEndpoints.lostAndFound}/${id}/resolve`,
      {},
    );

    const parsed = extractMaybeWrappedObject<ApiMessageResponse>(response);

    return {
      success: true as const,
      message: parsed?.message || "Post marked as resolved",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to resolve post";
    return { success: false as const, message };
  }
}

export async function getUniversityLocationsAction(universityId?: string) {
  try {
    const response = await getPublic<unknown>(
      `${careersEndpoints.universityLocations}?page=1&limit=100`,
    );

    const rawLocations = extractArrayFromUnknown(response);

    const normalizedLocations = rawLocations
      .map(normalizeUniversityLocationOption)
      .filter((loc): loc is UniversityLocationOption => loc !== null);

    const selectedUniversityId = universityId?.trim();
    const locations = selectedUniversityId
      ? normalizedLocations.filter((loc) => loc.universityId === selectedUniversityId)
      : normalizedLocations;

    return {
      success: true as const,
      locations,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch university locations";
    return { success: false as const, message, locations: [] as UniversityLocationOption[] };
  }
}

export type {
  IncomingResolveRequest,
  LostFoundCategory,
  LostFoundItem,
  UniversityLocationOption,
};
