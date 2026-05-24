"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { MessageSquare, Plus, ChevronDown } from "lucide-react";
import { listSupportTicketsAction } from "@/services/support-tickets";
import type {
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketRow,
  SupportTicketStatus,
} from "@/types/support-ticket";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";

const STATUS_LABELS: Record<SupportTicketStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  waiting_user: "Waiting on You",
  resolved: "Resolved",
  closed: "Closed",
};

const STATUS_COLORS: Record<SupportTicketStatus, string> = {
  open: "bg-blue-50 text-blue-700 border border-blue-200",
  in_progress: "bg-amber-50 text-amber-700 border border-amber-200",
  waiting_user: "bg-purple-50 text-purple-700 border border-purple-200",
  resolved: "bg-green-50 text-green-700 border border-green-200",
  closed: "bg-gray-100 text-gray-500 border border-gray-200",
};

const PRIORITY_COLORS: Record<SupportTicketPriority, string> = {
  low: "text-gray-400",
  normal: "text-blue-500",
  high: "text-amber-500",
  urgent: "text-red-500",
};

const CATEGORY_LABELS: Record<SupportTicketCategory, string> = {
  account: "Account",
  payment: "Payment",
  order: "Order",
  delivery: "Delivery",
  wallet: "Wallet",
  coins_referral: "Coins & Referral",
  bus_share_appeal: "Bus Share Appeal",
  shop: "Shop",
  book: "Book",
  buy_sell: "Buy & Sell",
  parcel: "Parcel",
  other: "Other",
};

const PAGE_LIMIT = 10;

export default function MySupportTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicketRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState<SupportTicketStatus | "">("");
  const [filterCategory, setFilterCategory] = useState<SupportTicketCategory | "">("");
  const [filterPriority, setFilterPriority] = useState<SupportTicketPriority | "">("");

  async function fetchPage(nextPage: number, append: boolean) {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError(null);

    const res = await listSupportTicketsAction({
      page: nextPage,
      limit: PAGE_LIMIT,
      status: filterStatus || undefined,
      category: filterCategory || undefined,
      priority: filterPriority || undefined,
    });

    if (res.success) {
      setTotal(res.data.pagination.total);
      setTickets((prev) =>
        append ? [...prev, ...res.data.data] : res.data.data,
      );
    } else {
      setError(res.message ?? "Something went wrong");
    }

    if (append) setLoadingMore(false);
    else setLoading(false);
  }

  useEffect(() => {
    setPage(1);
    void fetchPage(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterCategory, filterPriority]);

  const hasMore = tickets.length < total;

  function handleLoadMore() {
    const next = page + 1;
    setPage(next);
    void fetchPage(next, true);
  }

  return (
    <div className="space-y-5">
      <AppBreadcrumb
        items={[
          { label: "Dashboard", href: "/profile" },
          { label: "Support Tickets" },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Support Tickets</h1>
          <p className="text-sm text-gray-500">
            {total > 0 ? `${total} ticket${total !== 1 ? "s" : ""}` : "No tickets yet"}
          </p>
        </div>
        <Link
          href="/support-tickets/new"
          className="inline-flex items-center gap-2 rounded-xl bg-[#E30A13] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#c0080f]"
        >
          <Plus className="h-4 w-4" />
          New Ticket
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as SupportTicketStatus | "")}
            className="appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E30A13]/20"
          >
            <option value="">All Statuses</option>
            {(Object.keys(STATUS_LABELS) as SupportTicketStatus[]).map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
        </div>

        <div className="relative">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as SupportTicketCategory | "")}
            className="appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E30A13]/20"
          >
            <option value="">All Categories</option>
            {(Object.keys(CATEGORY_LABELS) as SupportTicketCategory[]).map((c) => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
        </div>

        <div className="relative">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as SupportTicketPriority | "")}
            className="appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E30A13]/20"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
        </div>
      </div>

      {/* Content */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-sm text-red-500">{error}</p>
            <button
              onClick={() => fetchPage(1, false)}
              className="mt-3 text-sm font-semibold text-[#E30A13] hover:underline"
            >
              Try again
            </button>
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <MessageSquare className="h-10 w-10 text-gray-300" />
            <p className="text-sm font-medium text-gray-500">No tickets found</p>
            <Link
              href="/support-tickets/new"
              className="text-sm font-semibold text-[#E30A13] hover:underline"
            >
              Create your first ticket
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {tickets.map((ticket) => (
              <li key={ticket._id}>
                <Link
                  href={`/support-tickets/${ticket._id}`}
                  className="flex items-start justify-between gap-4 px-5 py-4 transition-colors hover:bg-gray-50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {ticket.subject}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {CATEGORY_LABELS[ticket.category]}
                      </span>
                      <span className="text-gray-200">·</span>
                      <span className={`text-xs font-semibold ${PRIORITY_COLORS[ticket.priority]}`}>
                        {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                      </span>
                      <span className="text-gray-200">·</span>
                      <span className="text-xs text-gray-400">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLORS[ticket.status]}`}
                  >
                    {STATUS_LABELS[ticket.status]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {hasMore && !loading && (
          <div className="border-t border-gray-100 p-4 text-center">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="text-sm font-semibold text-[#E30A13] hover:underline disabled:opacity-50"
            >
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
