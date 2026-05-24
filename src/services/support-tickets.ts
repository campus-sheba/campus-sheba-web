"use server";

import type {
  CreateSupportTicketPayload,
  SupportTicketDetail,
  SupportTicketMessage,
  SupportTicketReplyPayload,
  SupportTicketRow,
  SupportTicketsListParams,
  SupportTicketsListResponse,
} from "@/types/support-ticket";
import { getPrivate } from "@/utils/api/get";
import { postPrivate } from "@/utils/api/post";
import { supportEndpoints } from "@/utils/endpoints/endpoints";

function buildListUrl(params: SupportTicketsListParams): string {
  const q = new URLSearchParams();
  if (params.page != null) q.set("page", String(params.page));
  if (params.limit != null) q.set("limit", String(params.limit));
  if (params.status?.trim()) q.set("status", params.status.trim());
  if (params.category?.trim()) q.set("category", params.category.trim());
  if (params.priority?.trim()) q.set("priority", params.priority.trim());
  const query = q.toString();
  return query ? `${supportEndpoints.base}?${query}` : supportEndpoints.base;
}

function unwrapListResponse(response: unknown): SupportTicketsListResponse {
  const empty: SupportTicketsListResponse = {
    data: [],
    pagination: { total: 0, page: 1, limit: 20 },
  };
  if (!response || typeof response !== "object") return empty;
  const r = response as Record<string, unknown>;
  const payload = r.data && typeof r.data === "object" ? (r.data as Record<string, unknown>) : r;
  const items = Array.isArray(payload.data) ? (payload.data as SupportTicketRow[]) : [];
  const pagination =
    payload.pagination && typeof payload.pagination === "object"
      ? (payload.pagination as { total: number; page: number; limit: number })
      : { total: items.length, page: 1, limit: 20 };
  return { data: items, pagination };
}

function unwrapDetail(response: unknown): SupportTicketDetail | null {
  if (!response || typeof response !== "object") return null;
  const r = response as Record<string, unknown>;
  const inner =
    r.data && typeof r.data === "object" ? (r.data as Record<string, unknown>) : r;

  // Shape A: { ticket: {...}, messages: [...] }
  if (inner.ticket && typeof inner.ticket === "object") {
    const ticket = inner.ticket as Record<string, unknown>;
    const messages = Array.isArray(inner.messages) ? inner.messages : ticket.messages;
    return {
      ...(ticket as unknown as SupportTicketDetail),
      messages: Array.isArray(messages)
        ? (messages as SupportTicketDetail["messages"])
        : [],
    };
  }

  // Shape B: ticket fields at this level ({ _id, ..., messages? })
  if ("_id" in inner) {
    const detail = inner as unknown as SupportTicketDetail;
    return {
      ...detail,
      messages: Array.isArray(detail.messages) ? detail.messages : [],
    };
  }

  return null;
}

function unwrapMessage(response: unknown): SupportTicketMessage | null {
  if (!response || typeof response !== "object") return null;
  const r = response as Record<string, unknown>;
  const payload =
    r.data && typeof r.data === "object" && r.data !== null && "_id" in r.data
      ? (r.data as SupportTicketMessage)
      : "_id" in r
        ? (r as unknown as SupportTicketMessage)
        : null;
  return payload;
}

export async function listSupportTicketsAction(params: SupportTicketsListParams = {}) {
  try {
    const response = await getPrivate<unknown>(buildListUrl(params), {
      includeUniversity: false,
    });
    console.log("Raw ticket list response:", response);
    const data = unwrapListResponse(response);
    return { success: true as const, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load tickets";
    return {
      success: false as const,
      message,
      data: { data: [], pagination: { total: 0, page: 1, limit: 20 } } as SupportTicketsListResponse,
    };
  }
}

export async function getSupportTicketAction(id: string) {
  if (!id.trim()) {
    return { success: false as const, message: "Invalid ticket id", data: null as SupportTicketDetail | null };
  }
  try {
    const response = await getPrivate<unknown>(supportEndpoints.byId(id.trim()), {
      includeUniversity: false,
    });
    console.log("Raw ticket detail response:", response);
    const data = unwrapDetail(response);
    if (!data) {
      return { success: false as const, message: "Ticket not found", data: null };
    }
    return { success: true as const, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load ticket";
    return { success: false as const, message, data: null as SupportTicketDetail | null };
  }
}

export async function createSupportTicketAction(payload: CreateSupportTicketPayload) {
  try {
    const response = await postPrivate<unknown>(supportEndpoints.base, payload, {
      includeUniversity: false,
    });
    const data = unwrapDetail(response);
    return { success: true as const, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create ticket";
    return { success: false as const, message, data: null as SupportTicketDetail | null };
  }
}

export async function replySupportTicketAction(id: string, payload: SupportTicketReplyPayload) {
  try {
    const response = await postPrivate<unknown>(supportEndpoints.reply(id), payload, {
      includeUniversity: false,
    });
    const data = unwrapMessage(response);
    return { success: true as const, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send reply";
    return { success: false as const, message, data: null as SupportTicketMessage | null };
  }
}

export async function reopenSupportTicketAction(id: string) {
  try {
    await postPrivate<unknown>(supportEndpoints.reopen(id), {}, {
      includeUniversity: false,
    });
    return { success: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to reopen ticket";
    return { success: false as const, message };
  }
}
