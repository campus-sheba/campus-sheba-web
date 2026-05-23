"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useAppState } from "@/contexts/AppStateContext";
import { listOrdersAction } from "@/services/orders";
import type { OrdersListParams, UserOrderRow } from "@/types/order";

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const entry = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : null;
}

function shortId(id: string) {
  if (id.length <= 12) return id;
  return `…${id.slice(-8)}`;
}

function formatMoney(n: number | undefined) {
  return `৳${(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export default function MyOrdersPage() {
  const { state } = useAppState();
  const [orders, setOrders] = useState<UserOrderRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultUniversityId = useMemo(() => {
    const uni = state.user.profile?.university;
    return (
      state.university.selected?._id ??
      (typeof uni === "object" && uni && "_id" in uni ? String(uni._id) : undefined) ??
      getCookieValue("universityId") ??
      ""
    );
  }, [state.university.selected?._id, state.user.profile?.university]);

  const [filterType, setFilterType] = useState("");
  const [filterPayment, setFilterPayment] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSort, setFilterSort] = useState<"ASC" | "DESC">("DESC");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const limit = 15;

  const buildParams = (nextPage: number): OrdersListParams => ({
    page: nextPage,
    limit,
    type: filterType.trim() || undefined,
    paymentStatus: filterPayment.trim() || undefined,
    status: filterStatus.trim() || undefined,
    sort: filterSort,
    university: defaultUniversityId.trim() || undefined,
    dateFrom: filterDateFrom
      ? new Date(`${filterDateFrom}T00:00:00`).toISOString()
      : undefined,
    dateTo: filterDateTo ? new Date(`${filterDateTo}T23:59:59.999`).toISOString() : undefined,
  });

  async function fetchPage(nextPage: number, append: boolean) {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError(null);
    const res = await listOrdersAction(buildParams(nextPage));
    if (res.success) {
      setTotal(res.data.total);
      setOrders((prev) => (append ? [...prev, ...res.data.data] : res.data.data));
      setPage(nextPage);
    } else {
      setError(res.message);
    }
    setLoading(false);
    setLoadingMore(false);
  }

  useEffect(() => {
    void fetchPage(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load; filters use Apply
  }, []);

  const hasMore = orders.length < total;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">My orders</h1>
          <p className="text-sm text-gray-500">Orders for your campus account.</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex min-w-[140px] flex-1 flex-col gap-1">
            <span className="text-xs font-medium text-gray-500">Type</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm outline-none focus:border-[#E30B12]"
            >
              <option value="">All types</option>
              <option value="BuySell">Buy &amp; Sell</option>
              <option value="Book">Book</option>
              <option value="Product">Product</option>
            </select>
          </label>
          <label className="flex min-w-[140px] flex-1 flex-col gap-1">
            <span className="text-xs font-medium text-gray-500">Payment</span>
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm outline-none focus:border-[#E30B12]"
            >
              <option value="">Any</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Paid">Paid</option>
            </select>
          </label>
          <label className="flex min-w-[120px] flex-1 flex-col gap-1">
            <span className="text-xs font-medium text-gray-500">Sort</span>
            <select
              value={filterSort}
              onChange={(e) => setFilterSort(e.target.value as "ASC" | "DESC")}
              className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm outline-none focus:border-[#E30B12]"
            >
              <option value="DESC">Newest</option>
              <option value="ASC">Oldest</option>
            </select>
          </label>
          <label className="flex min-w-[140px] flex-1 flex-col gap-1">
            <span className="text-xs font-medium text-gray-500">Status</span>
            <input
              placeholder="e.g. Pending"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm outline-none focus:border-[#E30B12]"
            />
          </label>
          <label className="flex w-[140px] flex-col gap-1">
            <span className="text-xs font-medium text-gray-500">From</span>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="rounded-lg border border-gray-200 px-2 py-2 text-sm outline-none focus:border-[#E30B12]"
            />
          </label>
          <label className="flex w-[140px] flex-col gap-1">
            <span className="text-xs font-medium text-gray-500">To</span>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="rounded-lg border border-gray-200 px-2 py-2 text-sm outline-none focus:border-[#E30B12]"
            />
          </label>
          <button
            type="button"
            onClick={() => void fetchPage(1, false)}
            className="rounded-lg bg-[#E30B12] px-4 py-2 text-sm font-semibold text-white active:brightness-95"
          >
            Apply
          </button>
        </div>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      {loading ? (
        <p className="text-sm text-gray-500">Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-12 text-center text-sm text-gray-500">
          No orders match these filters.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/90 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3 font-medium">Placed</th>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Items</th>
                  <th className="px-4 py-3 font-medium text-right">Total</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                  <th className="px-4 py-3 font-medium w-24" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o) => {
                  const placed = o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—";
                  const itemCount = o.items?.length ?? 0;
                  const preview =
                    o.items?.slice(0, 2).map((it) => it.title).filter(Boolean).join(", ") || "—";
                  return (
                    <tr key={o._id} className="bg-white hover:bg-gray-50/60">
                      <td className="whitespace-nowrap px-4 py-3 tabular-nums text-gray-600">{placed}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-gray-400" title={o._id}>
                          {shortId(o._id)}
                        </span>
                        <span className="ml-2 text-gray-700">{o.type ?? "Order"}</span>
                        {o.isCancelledOrder ? (
                          <span className="ml-2 rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">
                            Cancelled
                          </span>
                        ) : null}
                      </td>
                      <td className="max-w-[220px] px-4 py-3 text-gray-600">
                        <span className="line-clamp-2" title={preview}>
                          {itemCount > 0 ? `${itemCount} · ${preview}` : "—"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums text-[#E30B12]">
                        {formatMoney(o.total)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600">{o.paymentStatus ?? "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/my-orders/${o._id}`}
                          className="text-sm font-semibold text-[#E30B12] hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {hasMore && !loading ? (
        <button
          type="button"
          disabled={loadingMore}
          onClick={() => void fetchPage(page + 1, true)}
          className="w-full rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {loadingMore ? "Loading…" : "Load more"}
        </button>
      ) : null}
    </div>
  );
}
