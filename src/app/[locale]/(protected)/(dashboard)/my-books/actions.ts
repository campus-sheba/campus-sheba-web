"use server";

import { getPrivate } from "@/utils/api/get";
import { postPrivate } from "@/utils/api/post";
import { patchPrivate } from "@/utils/api/patch";
import { deletePrivate } from "@/utils/api/delete";

const BASE = process.env.BASE_URL || process.env.NEXT_PUBLIC_API_URL;

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface BookPhoto {
  url: string;
  key: string;
  size: number;
}

export interface BookPayload {
  title: string;
  author: string;
  edition?: string;
  publisher?: string;
  department?: string;
  subject?: string;
  buyingYear?: string;
  description?: string;
  photos?: BookPhoto[];
  addressId?: string;
  category?: string;
  type: "Selling" | "Lending" | "Donation";
  sellerType?: "individual";
  quality?: "New" | "Like New" | "Good" | "Acceptable";
  price?: number;
  discountPrice?: number;
  safekeepingCharge?: number;
  quantity?: number;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  returnDate?: string;
  borrowDuration?: number;
  maxExtensionDuration?: number;
  allowsExtension?: boolean;
  availabilityStatus?: "Available" | "Unavailable" | "Borrowed";
}

export interface Book extends BookPayload {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BorrowRequest {
  _id: string;
  bookId: string | Book;
  borrowerId: string | { name: string; avatar?: string; phone?: string; email?: string };
  ownerId: string;
  status: "Pending" | "Approved" | "Rejected" | "Returned";
  requestDate?: string;
  approvalDate?: string;
  expectedReturnDate?: string;
  actualReturnDate?: string;
  duration?: number;
  extensionRequests?: any[]; // Simplified for type check safely
}

// ─── Creator / Owner Book Actions ──────────────────────────────────────────

export async function getOwnBooksAction(params?: Record<string, string>) {
  try {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
    const response = await getPrivate<{ data: Book[]; meta?: unknown }>(`${BASE}/creator/books/own${qs}`);
    const data = (response as any)?.data ?? [];
    const meta = (response as any)?.meta ?? null;
    return { success: true as const, data: data as Book[], meta };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch own books";
    return { success: false as const, message, data: [] as Book[], meta: null };
  }
}

export async function createBookAction(data: BookPayload) {
  try {
    const payload = data as unknown as Record<string, unknown>;
    // According to specs: /api/creator/books handles generic book creation
    const response = await postPrivate<{ data: Book }>(`${BASE}/creator/books`, payload);
    const book = (response as any)?.data ?? response;
    return { success: true as const, data: book as Book };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create book";
    return { success: false as const, message };
  }
}

export async function updateBookAction(id: string, data: Partial<BookPayload>) {
  try {
    const payload = data as Record<string, unknown>;
    const response = await patchPrivate<{ data: Book }>(`${BASE}/creator/books/${id}`, payload);
    const book = (response as any)?.data ?? response;
    return { success: true as const, data: book as Book };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update book";
    return { success: false as const, message };
  }
}

export async function deleteBookAction(id: string) {
  try {
    await deletePrivate(`${BASE}/creator/books/${id}`);
    return { success: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete book";
    return { success: false as const, message };
  }
}

// ─── Borrowing Activity Actions (Lent & Borrowed) ─────────────────────────

export async function getLentBooksAction() {
  try {
    const response = await getPrivate<{ data: BorrowRequest[] }>(`${BASE}/book-borrowing/lent`);
    const data = (response as any)?.data ?? [];
    return { success: true as const, data: data as BorrowRequest[] };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch lent books";
    return { success: false as const, message, data: [] as BorrowRequest[] };
  }
}

export async function getBorrowedBooksAction() {
  try {
    const response = await getPrivate<{ data: BorrowRequest[] }>(`${BASE}/book-borrowing/borrowed`);
    const data = (response as any)?.data ?? [];
    return { success: true as const, data: data as BorrowRequest[] };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch borrowed books";
    return { success: false as const, message, data: [] as BorrowRequest[] };
  }
}

export async function respondToBorrowRequestAction(requestId: string, action: "Approved" | "Rejected") {
  try {
    const response = await patchPrivate(`${BASE}/book-borrowing/respond/${requestId}`, { status: action });
    return { success: true as const, data: (response as any)?.data ?? response };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to respond to borrow request";
    return { success: false as const, message };
  }
}

export async function markBookReturnedAction(requestId: string) {
  try {
    const response = await patchPrivate(`${BASE}/book-borrowing/return/${requestId}`, {});
    return { success: true as const, data: (response as any)?.data ?? response };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to mark book as returned";
    return { success: false as const, message };
  }
}

export async function requestBorrowExtensionAction(borrowId: string) {
  try {
    const response = await postPrivate(`${BASE}/book-borrowing/extend/${borrowId}`, {});
    return { success: true as const, data: (response as any)?.data ?? response };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to request extension";
    return { success: false as const, message };
  }
}

export async function respondToExtensionAction(borrowId: string, extendId: string, action: "Approved" | "Rejected") {
  try {
    const response = await patchPrivate(`${BASE}/book-borrowing/extend/${borrowId}/${extendId}`, { status: action });
    return { success: true as const, data: (response as any)?.data ?? response };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to respond to extension request";
    return { success: false as const, message };
  }
}
