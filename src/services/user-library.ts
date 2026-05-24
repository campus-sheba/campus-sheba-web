"use server";

import type {
  AddReadingListPayload,
  CreateLibraryProfilePayload,
  LibraryFollowListResponse,
  LibraryHubData,
  LibraryLeaderboardResponse,
  LibraryProfileCard,
  LibraryProfileListParams,
  LibraryProfileListResponse,
  ReportLibraryProfilePayload,
  ReorderRecommendationsPayload,
  UpdateLibraryProfilePayload,
  UpdateReadingListPayload,
  UserLibraryProfile,
} from "@/types/book";
import { deletePrivate } from "@/utils/api/delete";
import { getPrivate, getPublic } from "@/utils/api/get";
import { patchPrivate } from "@/utils/api/patch";
import { postPrivate } from "@/utils/api/post";
import { userLibraryEndpoints } from "@/utils/endpoints/endpoints";

function unwrapProfile(response: unknown): UserLibraryProfile | null {
  if (!response || typeof response !== "object") return null;
  const r = response as Record<string, unknown>;
  if (r.data && typeof r.data === "object" && r.data !== null && "_id" in r.data) {
    return r.data as UserLibraryProfile;
  }
  if ("_id" in r) return response as UserLibraryProfile;
  return null;
}

function unwrapFollowList(response: unknown): LibraryFollowListResponse {
  const empty: LibraryFollowListResponse = { page: 1, limit: 20, total: 0, data: [] };
  if (!response || typeof response !== "object") return empty;
  const r = response as Record<string, unknown>;
  const rows = Array.isArray(r.data) ? r.data : [];
  return {
    page: typeof r.page === "number" ? r.page : 1,
    limit: typeof r.limit === "number" ? r.limit : 20,
    total: typeof r.total === "number" ? r.total : rows.length,
    data: rows as LibraryFollowListResponse["data"],
  };
}

function unwrapLeaderboard(response: unknown): LibraryLeaderboardResponse {
  const empty: LibraryLeaderboardResponse = { page: 1, limit: 20, total: 0, data: [] };
  if (!response || typeof response !== "object") return empty;
  const r = response as Record<string, unknown>;
  const payload =
    r.data && typeof r.data === "object" && !Array.isArray(r.data)
      ? (r.data as Record<string, unknown>)
      : r;
  const rows = Array.isArray(payload.data)
    ? payload.data
    : Array.isArray(r.data)
      ? r.data
      : [];
  return {
    page: typeof payload.page === "number" ? payload.page : typeof r.page === "number" ? r.page : 1,
    limit: typeof payload.limit === "number" ? payload.limit : typeof r.limit === "number" ? r.limit : 20,
    total:
      typeof payload.total === "number"
        ? payload.total
        : typeof r.total === "number"
          ? r.total
          : rows.length,
    data: rows as LibraryLeaderboardResponse["data"],
  };
}

function unwrapHub(response: unknown): LibraryHubData | null {
  if (!response || typeof response !== "object") return null;
  const r = response as Record<string, unknown>;
  if (r.data && typeof r.data === "object") return r.data as LibraryHubData;
  return null;
}

function unwrapProfileList(response: unknown): LibraryProfileListResponse {
  const empty: LibraryProfileListResponse = { page: 1, limit: 20, total: 0, data: [] };
  if (!response || typeof response !== "object") return empty;
  const r = response as Record<string, unknown>;
  const rows = Array.isArray(r.data) ? (r.data as LibraryProfileCard[]) : [];
  return {
    page: typeof r.page === "number" ? r.page : 1,
    limit: typeof r.limit === "number" ? r.limit : 20,
    total: typeof r.total === "number" ? r.total : rows.length,
    data: rows,
  };
}

/** Discover public library profiles (search / sort / paginate). */
export async function listLibraryProfilesAction(
  params: LibraryProfileListParams = {},
) {
  try {
    const q = new URLSearchParams();
    if (params.search?.trim()) q.set("search", params.search.trim());
    if (params.university) q.set("university", params.university);
    if (params.sortBy) q.set("sortBy", params.sortBy);
    if (params.page != null) q.set("page", String(params.page));
    if (params.limit != null) q.set("limit", String(params.limit));
    const query = q.toString();
    const url = query ? `${userLibraryEndpoints.base}?${query}` : userLibraryEndpoints.base;
    const res = await getPublic<unknown>(url, { includeUniversity: false });
    return { success: true as const, ...unwrapProfileList(res) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load profiles";
    return {
      success: false as const,
      message,
      page: 1,
      limit: 20,
      total: 0,
      data: [] as LibraryProfileCard[],
    };
  }
}

export async function fetchMyLibraryProfileAction() {
  try {
    const res = await getPrivate<unknown>(userLibraryEndpoints.me, {
      includeUniversity: false,
    });
    const data = unwrapProfile(res);
    return { success: true as const, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load library profile";
    return { success: false as const, message, data: null };
  }
}

/** Profile hub — shelves (showcase / promoted / sold out) + reading lists. */
export async function fetchLibraryHubAction(profileId: string) {
  const trimmed = profileId?.trim();
  if (!trimmed) {
    return { success: false as const, message: "Invalid profile id", data: null };
  }
  try {
    const res = await getPublic<unknown>(userLibraryEndpoints.hub(trimmed), {
      includeUniversity: false,
    });
    const data = unwrapHub(res);
    if (!data) {
      return { success: false as const, message: "Profile not found", data: null };
    }
    return { success: true as const, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load library hub";
    return { success: false as const, message, data: null };
  }
}

export async function fetchLibraryLeaderboardAction(params: {
  university?: string;
  page?: number;
  limit?: number;
} = {}) {
  try {
    const q = new URLSearchParams();
    if (params.university) q.set("university", params.university);
    if (params.page != null) q.set("page", String(params.page));
    if (params.limit != null) q.set("limit", String(params.limit));
    const query = q.toString();
    const url = query
      ? `${userLibraryEndpoints.leaderboard}?${query}`
      : userLibraryEndpoints.leaderboard;
    const res = await getPublic<unknown>(url, { includeUniversity: false });
    return { success: true as const, ...unwrapLeaderboard(res) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load leaderboard";
    return {
      success: false as const,
      message,
      page: 1,
      limit: 20,
      total: 0,
      data: [],
    };
  }
}

/** Activity from followed shelves — GET /user/library/feed */
export async function fetchLibraryActivityFeedAction(params: {
  page?: number;
  limit?: number;
} = {}) {
  try {
    const q = new URLSearchParams();
    if (params.page != null) q.set("page", String(params.page));
    if (params.limit != null) q.set("limit", String(params.limit));
    const query = q.toString();
    const url = query
      ? `${userLibraryEndpoints.activityFeed}?${query}`
      : userLibraryEndpoints.activityFeed;
    const res = await getPrivate<unknown>(url, { includeUniversity: false });
    if (!res || typeof res !== "object") {
      return { success: true as const, page: 1, limit: 20, total: 0, data: [] as LibraryProfileCard[] };
    }
    const r = res as Record<string, unknown>;
    const rows = Array.isArray(r.data) ? (r.data as LibraryProfileCard[]) : [];
    return {
      success: true as const,
      page: typeof r.page === "number" ? r.page : 1,
      limit: typeof r.limit === "number" ? r.limit : 20,
      total: typeof r.total === "number" ? r.total : rows.length,
      data: rows,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load activity feed";
    return {
      success: false as const,
      message,
      page: 1,
      limit: 20,
      total: 0,
      data: [] as LibraryProfileCard[],
    };
  }
}

export async function fetchLibraryFollowersAction(
  profileId: string,
  params: { page?: number; limit?: number } = {},
) {
  const trimmed = profileId?.trim();
  if (!trimmed) {
    return { success: false as const, message: "Invalid profile id", ...unwrapFollowList(null) };
  }
  try {
    const q = new URLSearchParams();
    if (params.page != null) q.set("page", String(params.page));
    if (params.limit != null) q.set("limit", String(params.limit));
    const query = q.toString();
    const base = userLibraryEndpoints.followers(trimmed);
    const url = query ? `${base}?${query}` : base;
    const res = await getPublic<unknown>(url, { includeUniversity: false });
    return { success: true as const, ...unwrapFollowList(res) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load followers";
    return { success: false as const, message, ...unwrapFollowList(null) };
  }
}

export async function fetchLibraryFollowingAction(
  profileId: string,
  params: { page?: number; limit?: number } = {},
) {
  const trimmed = profileId?.trim();
  if (!trimmed) {
    return { success: false as const, message: "Invalid profile id", ...unwrapFollowList(null) };
  }
  try {
    const q = new URLSearchParams();
    if (params.page != null) q.set("page", String(params.page));
    if (params.limit != null) q.set("limit", String(params.limit));
    const query = q.toString();
    const base = userLibraryEndpoints.following(trimmed);
    const url = query ? `${base}?${query}` : base;
    const res = await getPublic<unknown>(url, { includeUniversity: false });
    return { success: true as const, ...unwrapFollowList(res) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load following";
    return { success: false as const, message, ...unwrapFollowList(null) };
  }
}

export async function reportLibraryProfileAction(payload: ReportLibraryProfilePayload) {
  try {
    await postPrivate<unknown>(userLibraryEndpoints.report, payload, {
      includeUniversity: false,
    });
    return { success: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit report";
    return { success: false as const, message };
  }
}

export async function addLibraryRecommendationAction(bookId: string) {
  try {
    const res = await postPrivate<unknown>(
      userLibraryEndpoints.recommendation(bookId),
      {},
      { includeUniversity: false },
    );
    const data = unwrapProfile(res);
    return { success: true as const, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add recommendation";
    return { success: false as const, message, data: null };
  }
}

export async function removeLibraryRecommendationAction(bookId: string) {
  try {
    const res = await deletePrivate<unknown>(
      userLibraryEndpoints.recommendation(bookId),
      undefined,
      { includeUniversity: false },
    );
    const data = unwrapProfile(res);
    return { success: true as const, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to remove recommendation";
    return { success: false as const, message, data: null };
  }
}

export async function reorderLibraryRecommendationsAction(
  payload: ReorderRecommendationsPayload,
) {
  try {
    const res = await patchPrivate<unknown>(
      userLibraryEndpoints.recommendationsOrder,
      payload,
      { includeUniversity: false },
    );
    const data = unwrapProfile(res);
    return { success: true as const, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to reorder recommendations";
    return { success: false as const, message, data: null };
  }
}

export async function fetchLibraryProfileByIdAction(profileId: string) {
  const trimmed = profileId?.trim();
  if (!trimmed) {
    return { success: false as const, message: "Invalid profile id", data: null };
  }
  try {
    const res = await getPublic<unknown>(userLibraryEndpoints.byId(trimmed), {
      includeUniversity: false,
    });
    const data = unwrapProfile(res);
    if (!data) {
      return { success: false as const, message: "Profile not found", data: null };
    }
    return { success: true as const, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load profile";
    return { success: false as const, message, data: null };
  }
}

export async function createLibraryProfileAction(payload: CreateLibraryProfilePayload) {
  try {
    const res = await postPrivate<unknown>(userLibraryEndpoints.base, payload, {
      includeUniversity: false,
    });
    const data = unwrapProfile(res);
    return { success: true as const, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create profile";
    return { success: false as const, message, data: null };
  }
}

export async function updateLibraryProfileAction(payload: UpdateLibraryProfilePayload) {
  try {
    const res = await patchPrivate<unknown>(userLibraryEndpoints.me, payload, {
      includeUniversity: false,
    });
    const data = unwrapProfile(res);
    return { success: true as const, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update profile";
    return { success: false as const, message, data: null };
  }
}

export async function addToReadingListAction(payload: AddReadingListPayload) {
  try {
    const res = await postPrivate<unknown>(userLibraryEndpoints.readingList, payload, {
      includeUniversity: false,
    });
    const data = unwrapProfile(res);
    return { success: true as const, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add to reading list";
    return { success: false as const, message, data: null };
  }
}

export async function updateReadingListStatusAction(
  bookId: string,
  payload: UpdateReadingListPayload,
) {
  try {
    const res = await patchPrivate<unknown>(
      userLibraryEndpoints.readingListBook(bookId),
      payload,
      { includeUniversity: false },
    );
    const data = unwrapProfile(res);
    return { success: true as const, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update reading status";
    return { success: false as const, message, data: null };
  }
}

export async function removeFromReadingListAction(bookId: string) {
  try {
    const res = await deletePrivate<unknown>(
      userLibraryEndpoints.readingListBook(bookId),
      undefined,
      { includeUniversity: false },
    );
    const data = unwrapProfile(res);
    return { success: true as const, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to remove from reading list";
    return { success: false as const, message, data: null };
  }
}

export async function followLibraryAction(profileId: string) {
  try {
    await postPrivate<unknown>(userLibraryEndpoints.follow(profileId), {}, {
      includeUniversity: false,
    });
    return { success: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to follow";
    return { success: false as const, message };
  }
}

export async function unfollowLibraryAction(profileId: string) {
  try {
    await deletePrivate<unknown>(userLibraryEndpoints.follow(profileId), undefined, {
      includeUniversity: false,
    });
    return { success: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to unfollow";
    return { success: false as const, message };
  }
}
