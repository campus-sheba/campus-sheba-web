"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Headset,
  MessageSquarePlus,
  Send,
  X,
} from "lucide-react";
import { useAppState } from "@/contexts/AppStateContext";
import {
  createSupportTicketAction,
  getSupportTicketAction,
  listSupportTicketsAction,
  replySupportTicketAction,
} from "@/services/support-tickets";
import type {
  SupportTicketCategory,
  SupportTicketDetail,
  SupportTicketRow,
  SupportTicketStatus,
} from "@/types/support-ticket";

const BRAND = "#00A651";

const CATEGORIES: { value: SupportTicketCategory; label: string }[] = [
  { value: "account", label: "Account" },
  { value: "payment", label: "Payment" },
  { value: "order", label: "Order" },
  { value: "delivery", label: "Delivery" },
  { value: "wallet", label: "Wallet" },
  { value: "coins_referral", label: "Coins & Referral" },
  { value: "bus_share_appeal", label: "Bus Share Appeal" },
  { value: "shop", label: "Shop" },
  { value: "book", label: "Book" },
  { value: "buy_sell", label: "Buy & Sell" },
  { value: "parcel", label: "Parcel" },
  { value: "other", label: "Other" },
];

const STATUS_LABELS: Record<SupportTicketStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  waiting_user: "Waiting on You",
  resolved: "Resolved",
  closed: "Closed",
};

const STATUS_DOT: Record<SupportTicketStatus, string> = {
  open: "bg-blue-500",
  in_progress: "bg-amber-500",
  waiting_user: "bg-purple-500",
  resolved: "bg-green-500",
  closed: "bg-gray-400",
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

type View = "list" | "new" | "thread";

export default function SupportWidget() {
  const { state: appState, dispatch } = useAppState();
  const isLoggedIn = appState.auth.isAuthenticated;

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("list");

  const [tickets, setTickets] = useState<SupportTicketRow[]>([]);
  const [listLoading, setListLoading] = useState(false);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [detail, setDetail] = useState<SupportTicketDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<SupportTicketCategory | "">("");
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);

  const loadList = useCallback(async () => {
    setListLoading(true);
    const res = await listSupportTicketsAction({ page: 1, limit: 20 });
    console.log("List tickets result:", res);
    if (res.success) setTickets(res.data.data);
    setListLoading(false);
  }, []);

  const loadDetail = useCallback(async (id: string) => {
    setDetailLoading(true);
    setError(null);
    const res = await getSupportTicketAction(id);
    if (res.success && res.data) {
      setDetail(res.data);
    } else {
      setError(res.message ?? "Failed to load conversation");
    }
    setDetailLoading(false);
  }, []);

  useEffect(() => {
    if (open && isLoggedIn && view === "list") {
      void Promise.resolve().then(loadList);
    }
  }, [open, isLoggedIn, view, loadList]);

  useEffect(() => {
    if (view === "thread" && detail) {
      threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [view, detail]);

  function openWidget() {
    if (!isLoggedIn) {
      dispatch({ type: "OPEN_AUTH_MODAL", payload: { defaultTab: "login" } });
      return;
    }
    setOpen(true);
  }

  function openThread(id: string) {
    setActiveId(id);
    setDetail(null);
    setView("thread");
    void loadDetail(id);
  }

  function backToList() {
    setView("list");
    setActiveId(null);
    setDetail(null);
    setError(null);
  }

  async function handleCreate() {
    if (!subject.trim()) return setError("Subject is required.");
    if (!category) return setError("Please choose a category.");
    if (!message.trim()) return setError("Message is required.");
    setError(null);
    setCreating(true);
    const res = await createSupportTicketAction({
      subject: subject.trim(),
      category: category as SupportTicketCategory,
      priority: "normal",
      message: message.trim(),
    });
    setCreating(false);
    if (res.success && res.data?._id) {
      const id = res.data._id;
      setSubject("");
      setCategory("");
      setMessage("");
      setActiveId(id);
      setDetail(null);
      setView("thread");
      void loadDetail(id);
      void loadList();
    } else {
      setError(res.message ?? "Failed to start conversation.");
    }
  }

  async function handleReply() {
    if (!activeId || !reply.trim() || sending) return;
    const body = reply.trim();
    setSending(true);
    const res = await replySupportTicketAction(activeId, { body });
    setSending(false);
    if (res.success) {
      setReply("");
      await loadDetail(activeId);
    } else {
      setError(res.message ?? "Failed to send message.");
    }
  }

  return (
    <>
      {/* Floating launcher */}
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openWidget())}
        aria-label={open ? "Close support chat" : "Open support chat"}
        className="fixed bottom-5 right-5 z-[70] flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95"
        style={{
          background: BRAND,
          boxShadow: "0 6px 24px rgba(0,166,81,0.40)",
        }}
      >
        {open ? (
          <X className="h-6 w-6" strokeWidth={2.2} />
        ) : (
          <Headset className="h-6 w-6" strokeWidth={2.1} />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-[70] flex h-[560px] max-h-[calc(100vh-7rem)] w-[calc(100vw-2.5rem)] max-w-[380px] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
          {/* Header */}
          <div
            className="flex shrink-0 items-center gap-3 px-4 py-3.5 text-white"
            style={{ background: BRAND }}
          >
            {view !== "list" ? (
              <button
                type="button"
                onClick={backToList}
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/15"
                aria-label="Back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                <Headset className="h-5 w-5" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold leading-tight">
                {view === "new"
                  ? "New conversation"
                  : view === "thread"
                    ? detail?.subject || "Support"
                    : "Support"}
              </p>
              <p className="truncate text-[11px] text-white/80">
                {view === "thread" && detail
                  ? STATUS_LABELS[detail.status]
                  : "We usually reply within a few hours"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/15"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          {view === "list" && (
            <ListView
              loading={listLoading}
              tickets={tickets}
              onOpen={openThread}
              onNew={() => {
                setError(null);
                setView("new");
              }}
            />
          )}

          {view === "new" && (
            <NewView
              subject={subject}
              category={category}
              message={message}
              creating={creating}
              error={error}
              onSubject={setSubject}
              onCategory={setCategory}
              onMessage={setMessage}
              onSubmit={handleCreate}
            />
          )}

          {view === "thread" && (
            <ThreadView
              loading={detailLoading}
              detail={detail}
              error={error}
              reply={reply}
              sending={sending}
              onReply={setReply}
              onSend={handleReply}
              endRef={threadEndRef}
            />
          )}
        </div>
      )}
    </>
  );
}

function ListView({
  loading,
  tickets,
  onOpen,
  onNew,
}: {
  loading: boolean;
  tickets: SupportTicketRow[];
  onOpen: (id: string) => void;
  onNew: () => void;
}) {
  return (
    <>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-2 p-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
            <Headset className="h-10 w-10 text-gray-300" />
            <p className="text-sm font-semibold text-gray-700">
              How can we help?
            </p>
            <p className="text-xs text-gray-400">
              Start a conversation and our team will get back to you.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {tickets.map((t) => (
              <li key={t._id}>
                <button
                  type="button"
                  onClick={() => onOpen(t._id)}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
                >
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[t.status]}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {t.subject}
                    </p>
                    <p className="mt-0.5 text-[11px] text-gray-400">
                      {STATUS_LABELS[t.status]} ·{" "}
                      {formatTime(t.lastMessageAt ?? t.createdAt)}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="shrink-0 border-t border-gray-100 p-3">
        <button
          type="button"
          onClick={onNew}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition active:brightness-95"
          style={{ background: BRAND }}
        >
          <MessageSquarePlus className="h-4 w-4" strokeWidth={2.3} />
          New conversation
        </button>
      </div>
    </>
  );
}

function NewView({
  subject,
  category,
  message,
  creating,
  error,
  onSubject,
  onCategory,
  onMessage,
  onSubmit,
}: {
  subject: string;
  category: SupportTicketCategory | "";
  message: string;
  creating: boolean;
  error: string | null;
  onSubject: (v: string) => void;
  onCategory: (v: SupportTicketCategory | "") => void;
  onMessage: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
      <div>
        <label className="mb-1 block text-xs font-semibold text-gray-600">
          Subject
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => onSubject(e.target.value)}
          placeholder="Brief summary"
          maxLength={200}
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#00A651]/50 focus:outline-none focus:ring-2 focus:ring-[#00A651]/15"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-gray-600">
          Category
        </label>
        <div className="relative">
          <select
            value={category}
            onChange={(e) =>
              onCategory(e.target.value as SupportTicketCategory | "")
            }
            className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-3 pr-9 text-sm text-gray-900 focus:border-[#00A651]/50 focus:outline-none focus:ring-2 focus:ring-[#00A651]/15"
          >
            <option value="">Select category</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-gray-400" />
        </div>
      </div>
      <div className="flex flex-1 flex-col">
        <label className="mb-1 block text-xs font-semibold text-gray-600">
          Message
        </label>
        <textarea
          value={message}
          onChange={(e) => onMessage(e.target.value)}
          placeholder="Describe your issue…"
          rows={5}
          className="w-full flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#00A651]/50 focus:outline-none focus:ring-2 focus:ring-[#00A651]/15"
        />
      </div>
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={onSubmit}
        disabled={creating}
        className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition active:brightness-95 disabled:opacity-60"
        style={{ background: BRAND }}
      >
        {creating ? "Starting…" : "Start conversation"}
      </button>
    </div>
  );
}

function ThreadView({
  loading,
  detail,
  error,
  reply,
  sending,
  onReply,
  onSend,
  endRef,
}: {
  loading: boolean;
  detail: SupportTicketDetail | null;
  error: string | null;
  reply: string;
  sending: boolean;
  onReply: (v: string) => void;
  onSend: () => void;
  endRef: React.RefObject<HTMLDivElement | null>;
}) {
  const closed = detail?.status === "closed";

  return (
    <>
      <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-3">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={`h-12 w-2/3 animate-pulse rounded-2xl bg-gray-200 ${i % 2 ? "ml-auto" : ""}`}
              />
            ))}
          </div>
        ) : error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
            {error}
          </p>
        ) : (
          (detail?.messages ?? []).map((m) => {
            const mine = m.senderRole === "user";
            return (
              <div
                key={m._id}
                className={`flex flex-col ${mine ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm ${
                    mine
                      ? "rounded-br-md bg-[#00A651] text-white"
                      : "rounded-bl-md border border-gray-100 bg-white text-gray-800"
                  }`}
                >
                  {m.body}
                </div>
                <span className="mt-1 px-1 text-[10px] text-gray-400">
                  {formatTime(m.createdAt)}
                </span>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>
      <div className="shrink-0 border-t border-gray-100 bg-white p-2.5">
        {closed ? (
          <p className="px-2 py-2 text-center text-xs text-gray-400">
            This conversation is closed.
          </p>
        ) : (
          <div className="flex items-end gap-2">
            <textarea
              value={reply}
              onChange={(e) => onReply(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
              placeholder="Type a message…"
              rows={1}
              className="max-h-24 flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#00A651]/50 focus:outline-none focus:ring-2 focus:ring-[#00A651]/15"
            />
            <button
              type="button"
              onClick={onSend}
              disabled={!reply.trim() || sending}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white transition active:brightness-95 disabled:opacity-40"
              style={{ background: BRAND }}
              aria-label="Send"
            >
              <Send className="h-4 w-4" strokeWidth={2.2} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
