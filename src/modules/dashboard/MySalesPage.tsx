"use client";

import { useEffect, useState, useTransition } from "react";
import { Link } from "@/i18n/navigation";
import {
  CheckCircle2,
  Clock,
  KeyRound,
  Package,
  Truck,
  XCircle,
} from "lucide-react";
import {
  cancelSellerOrderItemAction,
  confirmOrderItemAction,
  generatePickupOtpAction,
  listSellerOrdersAction,
} from "@/services/owner-orders";
import type { OrderItemRow, OrdersListParams, UserOrderRow } from "@/types/order";

function shortId(id: string) {
  return id.length <= 10 ? id : `…${id.slice(-8)}`;
}

function formatMoney(n: number | undefined) {
  return `৳${(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

const STATUS_BADGE: Record<string, string> = {
  Pending: "bg-amber-50 text-amber-700",
  Confirmed: "bg-sky-50 text-sky-700",
  "In Progress": "bg-indigo-50 text-indigo-700",
  "Picked Up": "bg-violet-50 text-violet-700",
  "Out for Delivery": "bg-blue-50 text-blue-700",
  Delivered: "bg-green-50 text-green-700",
  Canceled: "bg-red-50 text-red-700",
  Refunded: "bg-gray-100 text-gray-600",
  Returned: "bg-gray-100 text-gray-600",
  Disputed: "bg-orange-50 text-orange-700",
};

/** Short guidance shown to the seller for each item status. */
function statusHint(status?: string): string {
  switch (status) {
    case "Pending":
      return "New order — confirm to start fulfilment.";
    case "Confirmed":
      return "Confirmed. Waiting for a rider — you can generate pickup OTP once assigned.";
    case "In Progress":
      return "Rider assigned. Generate pickup OTP and share it when they collect the book.";
    case "Picked Up":
      return "Rider has collected the book — in transit.";
    case "Out for Delivery":
      return "On the way to the buyer.";
    case "Delivered":
      return "Delivered. Your payout has been released to your wallet.";
    case "Canceled":
      return "This item was cancelled.";
    default:
      return "";
  }
}

function StatusBadge({ status }: { status?: string }) {
  const cls = STATUS_BADGE[status ?? ""] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>
      {status ?? "—"}
    </span>
  );
}

export default function MySalesPage() {
  const [orders, setOrders] = useState<UserOrderRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busyItem, setBusyItem] = useState<string | null>(null);
  const [busyOtp, setBusyOtp] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const limit = 15;

  const buildParams = (nextPage: number): OrdersListParams => ({
    page: nextPage,
    limit,
    type: filterType.trim() || undefined,
    status: filterStatus.trim() || undefined,
    sort: "DESC",
  });

  async function fetchPage(nextPage: number, append: boolean) {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError(null);
    const res = await listSellerOrdersAction(buildParams(nextPage));
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

  const replaceOrder = (next: UserOrderRow) =>
    setOrders((prev) => prev.map((o) => (o._id === next._id ? next : o)));

  const confirmItem = (orderId: string, item: OrderItemRow) => {
    setBusyItem(item._id ?? null);
    setMsg(null);
    startTransition(async () => {
      const res = await confirmOrderItemAction(orderId, item._id ?? "");
      setBusyItem(null);
      if (res.success) {
        setMsg(`Confirmed "${item.title}". A rider will be assigned.`);
        void fetchPage(page, false);
      } else {
        setMsg(res.message ?? "Could not confirm this item.");
      }
    });
  };

  const cancelItem = (orderId: string, item: OrderItemRow) => {
    const reason = window.prompt(`Cancel "${item.title}"? Add a short reason:`);
    if (reason == null) return;
    setBusyItem(item._id ?? null);
    setMsg(null);
    startTransition(async () => {
      const res = await cancelSellerOrderItemAction(
        orderId,
        item._id ?? "",
        reason.trim() || "Cancelled by seller",
      );
      setBusyItem(null);
      if (res.success) {
        setMsg(`Cancelled "${item.title}".`);
        void fetchPage(page, false);
      } else {
        setMsg(res.message ?? "Could not cancel this item.");
      }
    });
  };

  const generateOtp = (orderId: string) => {
    setBusyOtp(orderId);
    setMsg(null);
    startTransition(async () => {
      const res = await generatePickupOtpAction(orderId);
      setBusyOtp(null);
      if (res.success && res.data) {
        replaceOrder(res.data);
        setMsg("Pickup OTP generated. Share it with the rider on collection.");
      } else {
        setMsg(res.message ?? "Could not generate pickup OTP.");
      }
    });
  };

  const hasMore = orders.length < total;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">My sales</h1>
          <p className="text-sm text-gray-500">
            Orders placed on your books and listings — confirm, hand over, and get paid.
          </p>
        </div>
        <Link href="/my-books" className="text-sm font-semibold text-gray-700 hover:text-gray-900">
          My books
        </Link>
      </div>

      {/* Filters */}
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
              <option value="Book">Book</option>
              <option value="BuySell">Buy &amp; Sell</option>
            </select>
          </label>
          <label className="flex min-w-[140px] flex-1 flex-col gap-1">
            <span className="text-xs font-medium text-gray-500">Status</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm outline-none focus:border-[#E30B12]"
            >
              <option value="">Any status</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="In Progress">In Progress</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Canceled">Canceled</option>
            </select>
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
      {msg ? (
        <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700" role="status">
          {msg}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-gray-500">Loading your sales…</p>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-12 text-center">
          <Package className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-2 text-sm font-medium text-gray-700">No sales yet</p>
          <p className="mt-1 text-sm text-gray-500">
            When a student buys one of your books, the order shows up here to confirm and hand over.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const placed = order.createdAt
              ? new Date(order.createdAt).toLocaleString()
              : "—";
            const items = order.items ?? [];
            const rider =
              order.deliveryHero && typeof order.deliveryHero === "object"
                ? order.deliveryHero
                : null;
            // Pickup OTP becomes available once a rider is collecting (In Progress).
            const canGenerateOtp =
              !order.pickupPIN &&
              Boolean(order.deliveryHero) &&
              items.some(
                (it) => it.status === "Confirmed" || it.status === "In Progress",
              );
            const sellerTotal = items.reduce(
              (sum, it) => sum + (it.sellerPayout ?? 0),
              0,
            );

            return (
              <div
                key={order._id}
                className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 bg-gray-50/70 px-4 py-3">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <span className="font-mono text-xs text-gray-400" title={order._id}>
                      {shortId(order._id)}
                    </span>
                    <span className="text-gray-700">{order.type ?? "Order"}</span>
                    <Link
                      href={`/my-sales/${order._id}`}
                      className="text-xs font-semibold text-[#E30B12] hover:underline"
                    >
                      View details
                    </Link>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" /> {placed}
                    </span>
                    {order.isCancelledOrder ? (
                      <span className="rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">
                        Cancelled
                      </span>
                    ) : null}
                  </div>
                  <div className="text-right text-sm">
                    <span className="text-xs text-gray-400">Your payout</span>{" "}
                    <span className="font-semibold tabular-nums text-[#E30B12]">
                      {formatMoney(sellerTotal)}
                    </span>
                  </div>
                </div>

                {/* Rider + pickup OTP */}
                {(rider || order.pickupPIN || canGenerateOtp) && !order.isCancelledOrder ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Truck className="h-4 w-4 text-gray-400" />
                      {rider ? (
                        <span>
                          Rider: <span className="font-semibold text-gray-800">{rider.name}</span>
                          {rider.phone ? (
                            <a href={`tel:${rider.phone}`} className="ml-2 text-[#E30B12] hover:underline">
                              {rider.phone}
                            </a>
                          ) : null}
                        </span>
                      ) : (
                        <span>No rider assigned yet.</span>
                      )}
                    </div>
                    {order.pickupPIN ? (
                      <div className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-1.5">
                        <KeyRound className="h-4 w-4 text-emerald-600" />
                        <span className="text-xs text-gray-600">Pickup OTP</span>
                        <span className="font-mono text-base font-bold tracking-widest text-emerald-700">
                          {order.pickupPIN}
                        </span>
                      </div>
                    ) : canGenerateOtp ? (
                      <button
                        type="button"
                        disabled={busyOtp === order._id}
                        onClick={() => generateOtp(order._id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#E30B12] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        <KeyRound className="h-4 w-4" />
                        {busyOtp === order._id ? "Generating…" : "Generate pickup OTP"}
                      </button>
                    ) : null}
                  </div>
                ) : null}

                {/* Items */}
                <ul className="divide-y divide-gray-100">
                  {items.map((item, idx) => {
                    const isBusy = busyItem === item._id;
                    const canConfirm = item.status === "Pending";
                    const canCancel =
                      item.status === "Pending" || item.status === "Confirmed";
                    return (
                      <li key={item._id ?? idx} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-gray-900">{item.title ?? "Item"}</span>
                            <StatusBadge status={item.status} />
                          </div>
                          <p className="mt-0.5 text-xs text-gray-500">
                            Qty {item.quantity ?? 1} · Sale {formatMoney(item.price)} · Payout{" "}
                            <span className="font-semibold text-gray-700">{formatMoney(item.sellerPayout)}</span>
                          </p>
                          {statusHint(item.status) ? (
                            <p className="mt-0.5 text-xs text-gray-400">{statusHint(item.status)}</p>
                          ) : null}
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {canConfirm ? (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => confirmItem(order._id, item)}
                              className="inline-flex items-center gap-1 rounded-md bg-[#E30B12] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              {isBusy ? "…" : "Confirm"}
                            </button>
                          ) : null}
                          {canCancel ? (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => cancelItem(order._id, item)}
                              className="inline-flex items-center gap-1 rounded-md border border-red-100 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Cancel
                            </button>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
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
