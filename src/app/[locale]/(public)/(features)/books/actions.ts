"use server";

import { del, deletePrivate } from "@/utils/api/delete";
import { getPrivate, getPublic } from "@/utils/api/get";
import { patchPrivate } from "@/utils/api/patch";
import { postPrivate } from "@/utils/api/post";
import { bookEndpoints, cartEndpoints } from "@/utils/endpoints/endpoints";

export interface BookListItem {
  _id: string;
  title: string;
  description?: string;
  author?: string;
  subject?: string;
  type?: "Selling" | "Lending" | "Donation";
  quality?: string;
  price?: number;
  discountPrice?: number;
  quantity?: number;
  status?: string;
  availabilityStatus?: string;
  contactName?: string;
  contactPhone?: string;
  createdAt?: string;
  category?: { title?: string };
  owner?: { _id?: string; name?: string };
  photos?: Array<{ url: string; key: string; size: number }>;
}

interface PaginatedBooksResponse {
  page: number;
  limit: number;
  total: number;
  data: BookListItem[];
}

const normalizeList = (payload: unknown): PaginatedBooksResponse => {
  if (payload && typeof payload === "object" && "data" in (payload as Record<string, unknown>)) {
    const top = payload as { page?: number; limit?: number; total?: number; data?: unknown };
    if (Array.isArray(top.data)) {
      return {
        page: top.page ?? 1,
        limit: top.limit ?? 10,
        total: top.total ?? top.data.length,
        data: top.data as BookListItem[],
      };
    }
    if (top.data && typeof top.data === "object") {
      const nested = top.data as PaginatedBooksResponse;
      if (Array.isArray(nested.data)) return nested;
    }
  }
  return { page: 1, limit: 10, total: 0, data: [] };
};

export async function getBooksAction(params: Record<string, string | number> = {}) {
  try {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => query.set(key, String(value)));
    const url = `${bookEndpoints.userBase}?${query.toString() || "page=1&limit=10"}`;
    const response = await getPublic<unknown>(url);
    return { success: true as const, data: normalizeList(response) };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to load books",
      data: { page: 1, limit: 10, total: 0, data: [] as BookListItem[] },
    };
  }
}

export async function getBookByIdAction(id: string) {
  try {
    const response = await getPublic<{ data?: BookListItem }>(bookEndpoints.userById(id));
    const data = response?.data ?? (response as unknown as BookListItem);
    return { success: true as const, data };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to load book details",
      data: null,
    };
  }
}

export async function addBookToCartAction(contentId: string, quantity = 1) {
  try {
    const response = await postPrivate(cartEndpoints.cart, { contentId, type: "Book", quantity });
    return { success: true as const, data: response };
  } catch (error) {
    return { success: false as const, message: error instanceof Error ? error.message : "Failed to add to cart" };
  }
}

export async function createBookSellAction(payload: Record<string, unknown>) {
  return postPrivate(bookEndpoints.creatorSell, payload);
}

export async function createBookLendAction(payload: Record<string, unknown>) {
  return postPrivate(bookEndpoints.creatorLend, payload);
}

export async function createBookDonateAction(payload: Record<string, unknown>) {
  return postPrivate(bookEndpoints.creatorDonate, payload);
}

export async function updateBookAction(bookId: string, payload: Record<string, unknown>) {
  return patchPrivate(bookEndpoints.creatorById(bookId), payload);
}

export async function deleteBookAction(bookId: string) {
  return deletePrivate(bookEndpoints.creatorById(bookId));
}

export async function requestBookBorrowAction(payload: {
  bookId: string;
  requestedDueDate: string;
  requestMessage?: string;
  securityDeposit?: number;
}) {
  return postPrivate(bookEndpoints.borrowingRequest, payload);
}
