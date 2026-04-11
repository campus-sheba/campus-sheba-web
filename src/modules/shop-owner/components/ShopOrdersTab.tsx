"use client";

import { useEffect, useState, useTransition } from "react";
import { getOwnerOrdersAction, confirmOrderItemAction, cancelOrderItemAction } from "@/services/owner-shop-hub";
import type { Order } from "@/types/owner-shop-hub";
import { ShoppingBag, CheckCircle, XCircle, Search, Filter, Calendar, CreditCard, Package } from "lucide-react";
import Button from "@/components/ui/Button";

const STATUSES = [
  "All",
  "Pending",
  "Confirmed",
  "In Progress",
  "Out for Delivery",
  "Delivered",
  "Canceled",
  "Refunded",
  "Returned",
];
const TYPES = ["All", "Book", "Product", "Food", "Parcel"];
const PAYMENT_STATUSES = ["All", "Unpaid", "Paid", "Failed", "Refunded"];

export default function ShopOrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [status, setStatus] = useState("All");
  const [type, setType] = useState("All");
  const [paymentStatus, setPaymentStatus] = useState("All");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState("DESC");

  useEffect(() => {
    void fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch when filters change
  }, [status, type, paymentStatus, page, sort, dateFrom, dateTo]);

  async function fetchOrders() {
    setLoading(true);
    const params: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
      sort,
    };

    if (status !== "All") params.status = status;
    if (type !== "All") params.type = type;
    if (paymentStatus !== "All") params.paymentStatus = paymentStatus;
    if (dateFrom) params.dateFrom = new Date(dateFrom).toISOString();
    if (dateTo) params.dateTo = new Date(dateTo).toISOString();

    const res = await getOwnerOrdersAction(params);
    if (res.success) {
      setOrders(res.data);
    } else {
      setOrders([]);
    }
    setLoading(false);
  }

  function handleAction(orderId: string, itemId: string, action: "confirm" | "cancel") {
    startTransition(async () => {
      const res =
        action === "confirm"
          ? await confirmOrderItemAction(orderId, itemId)
          : await cancelOrderItemAction(orderId, itemId);
      if (!res.success) {
        alert(res.message ?? "Action failed");
      }
      await fetchOrders();
    });
  }

  const renderStatusBadge = (s?: string) => {
    let label = s ?? "PENDING";
    const statusUp = label.toUpperCase();
    let cls = "bg-gray-100 text-gray-700";
    if (statusUp === "CONFIRMED" || statusUp === "DELIVERED") cls = "bg-green-100 text-green-700";
    if (statusUp === "CANCELED" || statusUp === "CANCELLED" || statusUp === "FAILED") cls = "bg-red-100 text-red-700";
    if (statusUp === "PENDING" || statusUp === "IN PROGRESS") cls = "bg-amber-100 text-amber-700";
    if (statusUp === "OUT FOR DELIVERY") cls = "bg-blue-100 text-blue-700";

    return (
      <span
        className={`inline-flex items-center rounded border border-transparent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide shadow-sm ${cls}`}
      >
        {label}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                status === s
                  ? "bg-[#00A651] text-white shadow-md shadow-[#00A651]/20"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-end gap-3 border-t border-gray-50 pt-3">
          <div className="space-y-1">
            <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">
              <Package className="h-3 w-3" /> Type
            </label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium focus:border-[#00A651] focus:outline-none"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">
              <CreditCard className="h-3 w-3" /> Payment
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => {
                setPaymentStatus(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium focus:border-[#00A651] focus:outline-none"
            >
              {PAYMENT_STATUSES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">
              <Calendar className="h-3 w-3" /> Date from
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium focus:border-[#00A651] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">
              <Calendar className="h-3 w-3" /> Date to
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium focus:border-[#00A651] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">
              <Filter className="h-3 w-3" /> Sort
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium focus:border-[#00A651] focus:outline-none"
            >
              <option value="DESC">Newest first</option>
              <option value="ASC">Oldest first</option>
            </select>
          </div>
        </div>

        <p className="text-xs text-gray-500">
          Seller order management will appear here when the API is connected. Filters are ready for that integration.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-10">
          <span className="mb-3 h-8 w-8 animate-spin rounded-full border-4 border-[#00A651]/20 border-t-[#00A651]" />
          <span className="text-sm font-medium text-gray-500">Loading orders…</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
            <Search className="h-6 w-6 text-gray-400" />
          </div>
          <p className="mb-1 text-lg font-bold text-gray-900">No orders found</p>
          <p className="text-sm text-gray-500">Try adjusting filters once orders are available.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const date = order.createdAt
              ? new Date(order.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
              : "Unknown date";
            const paymentStat = order.paymentStatus ?? "UNPAID";

            return (
              <div key={order._id} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md">
                <div className="flex flex-col gap-2 border-b border-gray-100 bg-gray-50/50 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm">
                      <ShoppingBag className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500">
                        Order ID:{" "}
                        <span className="ml-1 font-mono text-gray-900">#{order._id.slice(-6).toUpperCase()}</span>
                      </div>
                      <div className="mt-0.5 text-xs text-gray-400">{date}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="text-right">
                      <div className="text-xs font-medium text-gray-500">Total</div>
                      <div className="text-sm font-bold text-[#00A651]">৳{order.totalAmount ?? 0}</div>
                    </div>
                    <div
                      className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        paymentStat.toUpperCase() === "PAID"
                          ? "bg-green-100 text-green-700"
                          : paymentStat.toUpperCase() === "FAILED"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {paymentStat}
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-gray-50">
                  {order.items?.map((item) => {
                    const s = (item.status ?? "PENDING").toUpperCase();
                    const canAction = s === "PENDING";

                    return (
                      <div
                        key={item._id}
                        className="flex flex-col items-start justify-between gap-4 p-5 md:flex-row md:items-center"
                      >
                        <div>
                          <h4 className="mb-1 text-sm font-bold text-gray-900">{item.title ?? "Unknown product"}</h4>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            {renderStatusBadge(item.status)}
                            <span className="border-l border-gray-200 pl-2 text-xs text-gray-500">Qty: {item.quantity}</span>
                            <span className="border-l border-gray-200 pl-2 text-xs text-gray-500">Price: ৳{item.price}</span>
                          </div>
                        </div>

                        {canAction ? (
                          <div className="flex w-full shrink-0 gap-2 border-t border-gray-50 pt-3 md:w-auto md:border-0 md:pt-0">
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() => handleAction(order._id, item._id, "confirm")}
                              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-green-700 shadow-sm transition hover:bg-green-100 md:flex-none"
                            >
                              <CheckCircle className="h-3.5 w-3.5" /> Accept
                            </button>
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() => handleAction(order._id, item._id, "cancel")}
                              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-red-700 shadow-sm transition hover:bg-red-100 md:flex-none"
                            >
                              <XCircle className="h-3.5 w-3.5" /> Reject
                            </button>
                          </div>
                        ) : (
                          <div className="border-t border-gray-50 pt-3 text-xs font-medium italic text-gray-400 md:border-0 md:pt-0">
                            Action completed
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="flex items-center justify-between px-2 py-4">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || loading}>
              Previous
            </Button>
            <span className="text-xs font-medium text-gray-500">Page {page}</span>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={orders.length < limit || loading}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
