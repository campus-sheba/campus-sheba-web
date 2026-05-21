"use server";

import type {
  AddReadingListPayload,
  CreateLibraryProfilePayload,
  UpdateLibraryProfilePayload,
  UpdateReadingListPayload,
  UserLibraryProfile,
} from "@/types/book";
import { deletePrivate } from "@/utils/api/delete";
import { getPrivate } from "@/utils/api/get";
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

export async function fetchLibraryProfileByIdAction(profileId: string) {
  const trimmed = profileId?.trim();
  if (!trimmed) {
    return { success: false as const, message: "Invalid profile id", data: null };
  }
  try {
    const res = await getPrivate<unknown>(userLibraryEndpoints.byId(trimmed), {
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
