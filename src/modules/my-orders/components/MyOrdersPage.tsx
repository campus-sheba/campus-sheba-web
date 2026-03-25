"use client";

import { useEffect, useState, useTransition } from "react";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import {
  ShoppingBag,
  BookOpen,
  Utensils,
  Package,
  LayoutGrid,
  X,
  ChevronRight,
  AlertCircle,
  CreditCard,
  Clock,
  CheckCircle2,
  Search,
} from "lucide-react";
import Button from "@/components/ui/Button";
import {
  getUserOrdersAction,
  cancelUserOrderAction,
  cancelUserOrderItemAction,
  type UserOrder,
} from "@/app/[locale]/(protected)/(dashboard)/my-orders/actions";

// ── Tab Configuration ───────────────────────────────────────────────────────

const ORDER_TABS = [
  { id: "All",     label: "All Orders",  icon: LayoutGrid,  accent: "text-slate-600",   pill: "bg-slate-900 text-white",  border: "border-slate-900" },
  { id: "Book",    label: "Books",       icon: BookOpen,    accent: "text-blue-600",    pill: "bg-blue-600 text-white",   border: "border-blue-600"  },
  { id: "Product", label: "Products",    icon: ShoppingBag, accent: "text-pink-600",    pill: "bg-pink-600 text-white",   border: "border-pink-600"  },
  { id: "Food",    label: "Food",        icon: Utensils,    accent: "text-orange-500",  pill: "bg-orange-500 text-white", border: "border-orange-500"},
  { id: "Parcel",  label: "Parcels",     icon: Package,     accent: "text-violet-600",  pill: "bg-violet-600 text-white", border: "border-violet-600"},
] as const;

type OrderType = typeof ORDER_TABS[number]["id"];

const STATUS_FILTERS = [
  "All", "Pending", "Confirmed", "In Progress",
  "Out for Delivery", "Delivered", "Canceled", "Refunded", "Returned",
];

const PAYMENT_FILTERS = ["All", "Unpaid", "Paid", "Failed", "Refunded"];

const LIMIT = 10;

// ── Status / Payment helpers ─────────────────────────────────────────────────

function statusCls(s?: string) {
  const u = (s || "").toUpperCase();
  if (u === "DELIVERED")                         return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (u === "CANCELED" || u === "RETURNED")      return "bg-red-100 text-red-800 border-red-200";
  if (u === "REFUNDED")                          return "bg-rose-100 text-rose-800 border-rose-200";
  if (u === "IN PROGRESS" || u === "OUT FOR DELIVERY") return "bg-blue-100 text-blue-800 border-blue-200";
  if (u === "CONFIRMED")                         return "bg-emerald-50 text-emerald-700 border-emerald-200";
  return "bg-amber-100 text-amber-800 border-amber-200";
}

function paymentCls(s?: string) {
  const u = (s || "").toUpperCase();
  if (u === "PAID")    return "bg-green-100 text-green-700 border-green-200";
  if (u === "FAILED")  return "bg-red-100 text-red-700 border-red-200";
  if (u === "REFUNDED")return "bg-rose-100 text-rose-700 border-rose-200";
  return "bg-gray-100 text-gray-600 border-gray-200";
}

function typeCls(t?: string) {
  if (t === "Book")    return "bg-blue-50 text-blue-700 border-blue-200";
  if (t === "Product") return "bg-pink-50 text-pink-700 border-pink-200";
  if (t === "Food")    return "bg-orange-50 text-orange-700 border-orange-200";
  if (t === "Parcel")  return "bg-violet-50 text-violet-700 border-violet-200";
  return "bg-gray-50 text-gray-600 border-gray-200";
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function MyOrdersPage() {
  const [orders, setOrders]         = useState<UserOrder[]>([]);
  const [loading, setLoading]       = useState(true);
  const [isPending, startTransition] = useTransition();

  const [activeType, setActiveType]     = useState<OrderType>("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [page, setPage]                 = useState(1);

  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget]   = useState<{ orderId: string; itemId?: string } | null>(null);
  const [cancelReason, setCancelReason]   = useState("");
  const [cancelError, setCancelError]     = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeType, statusFilter, paymentFilter, page]);

  async function fetchOrders() {
    setLoading(true);
    const params: Record<string, string> = {
      page: page.toString(),
      limit: LIMIT.toString(),
      sort: "DESC",
    };
    if (activeType !== "All")       params.type          = activeType;
    if (statusFilter !== "All")     params.status        = statusFilter;
    if (paymentFilter !== "All")    params.paymentStatus = paymentFilter;

    const res = await getUserOrdersAction(params);
    if (res.success) setOrders(res.data);
    setLoading(false);
  }

  function openCancel(orderId: string, itemId?: string) {
    setCancelTarget({ orderId, itemId });
    setCancelReason("");
    setCancelError(null);
  }

  function handleCancelSubmit() {
    if (!cancelTarget) return;
    startTransition(async () => {
      const res = cancelTarget.itemId
        ? await cancelUserOrderItemAction(cancelTarget.orderId, cancelTarget.itemId, cancelReason)
        : await cancelUserOrderAction(cancelTarget.orderId, cancelReason);

      if (res.success) {
        setCancelTarget(null);
        await fetchOrders();
      } else {
        setCancelError(res.message);
      }
    });
  }

  const activeTab = ORDER_TABS.find(t => t.id === activeType)!;

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <AppBreadcrumb items={[
        { label: "Home", href: "/" },
        { label: "Dashboard", href: "/profile" },
        { label: "My Orders" },
      ]} />

      {/* ── Cancel Modal ─────────────────────────────────────────────────── */}
      {cancelTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-in zoom-in-95">
            <h3 className="font-bold text-gray-900 text-lg mb-1">
              Cancel {cancelTarget.itemId ? "Order Item" : "Entire Order"}
            </h3>
            <p className="text-sm text-gray-500 mb-4">Provide an optional reason so the seller is informed.</p>

            {cancelError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {cancelError}
              </div>
            )}

            <textarea
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              rows={3}
              placeholder="e.g. Changed my mind, item out of stock, schedule conflict..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:border-red-400 resize-none mb-5 transition"
            />
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" uppercase={false} onClick={() => setCancelTarget(null)} disabled={isPending}>
                Keep Order
              </Button>
              <Button uppercase={false} disabled={isPending} onClick={handleCancelSubmit}
                className="bg-red-500 hover:bg-red-600 text-white border-none px-6">
                {isPending ? "Cancelling..." : "Confirm Cancellation"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Card ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50/60 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Orders</h1>
            <p className="mt-0.5 text-sm text-gray-500">All your purchases, rentals and deliveries in one place.</p>
          </div>
          {!loading && (
            <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2 self-start sm:self-auto">
              <span className={`w-2 h-2 rounded-full ${activeType === "All" ? "bg-slate-600" : ""}`} style={{ background: activeType !== "All" ? "" : undefined }} />
              <span className="text-sm font-semibold text-gray-700">
                {orders.length} result{orders.length !== 1 ? "s" : ""} {statusFilter !== "All" ? `· ${statusFilter}` : ""}
              </span>
            </div>
          )}
        </div>

        {/* ── Type Tabs ──────────────────────────────────────────────────── */}
        <div className="flex overflow-x-auto border-b border-gray-100 bg-white no-scrollbar">
          {ORDER_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveType(tab.id); setPage(1); setExpandedOrder(null); }}
                className={`flex items-center gap-2.5 px-5 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? `${tab.border} ${tab.accent} bg-gray-50/80`
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50/50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? tab.accent : "text-gray-400"}`} />
                {tab.label}
                {isActive && !loading && orders.length > 0 && (
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${tab.pill}`}>
                    {orders.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Sub-filters ────────────────────────────────────────────────── */}
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/30 flex flex-wrap gap-2 items-center">
          {/* Status pills */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {STATUS_FILTERS.map(s => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${
                  statusFilter === s
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-800"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Separator */}
          <div className="h-5 w-px bg-gray-200 hidden sm:block" />

          {/* Payment dropdown */}
          <select
            value={paymentFilter}
            onChange={e => { setPaymentFilter(e.target.value); setPage(1); }}
            className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-[11px] font-bold text-gray-600 focus:outline-none focus:border-gray-900"
          >
            {PAYMENT_FILTERS.map(t => <option key={t} value={t}>Payment: {t}</option>)}
          </select>
        </div>

        {/* ── Content Area ───────────────────────────────────────────────── */}
        <div className="p-4 min-h-[420px] bg-gray-50/20">

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <span className={`w-12 h-12 border-4 rounded-full animate-spin mb-4 ${
                activeType === "Book" ? "border-blue-600/20 border-t-blue-600" :
                activeType === "Product" ? "border-pink-600/20 border-t-pink-600" :
                activeType === "Food" ? "border-orange-500/20 border-t-orange-500" :
                activeType === "Parcel" ? "border-violet-600/20 border-t-violet-600" :
                "border-slate-900/20 border-t-slate-900"
              }`} />
              <span className="text-sm font-bold text-gray-400">Loading {activeTab.label.toLowerCase()}...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-gray-200 mt-2">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                activeType === "Book" ? "bg-blue-50" :
                activeType === "Product" ? "bg-pink-50" :
                activeType === "Food" ? "bg-orange-50" :
                activeType === "Parcel" ? "bg-violet-50" : "bg-gray-50"
              }`}>
                <activeTab.icon className={`w-7 h-7 ${activeTab.accent}`} />
              </div>
              <p className="font-bold text-gray-800 text-lg mb-1">No {activeTab.label} found</p>
              <p className="text-sm text-gray-400">
                {statusFilter !== "All" ? `No "${statusFilter}" orders match your filter.` : `You haven't placed any ${activeTab.label.toLowerCase()} orders yet.`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => {
                const isExpanded = expandedOrder === order._id;
                const date = order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })
                  : "";
                const canCancel = (order.status || "").toUpperCase() === "PENDING";

                return (
                  <div key={order._id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:border-gray-200 hover:shadow-md transition-all">

                    {/* Order Header */}
                    <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {/* Type Icon bubble */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${typeCls(order.type)}`}>
                          {order.type === "Book" && <BookOpen className="w-5 h-5" />}
                          {order.type === "Product" && <ShoppingBag className="w-5 h-5" />}
                          {order.type === "Food" && <Utensils className="w-5 h-5" />}
                          {order.type === "Parcel" && <Package className="w-5 h-5" />}
                          {!order.type && <ShoppingBag className="w-5 h-5 text-gray-400" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-[11px] font-bold text-gray-400">#{order._id.slice(-6).toUpperCase()}</span>
                            {order.type && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeCls(order.type)}`}>
                                {order.type}
                              </span>
                            )}
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border shadow-sm ${statusCls(order.status)}`}>
                              {order.status || "Pending"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {date}
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${paymentCls(order.paymentStatus)}`}>
                              <CreditCard className="w-2.5 h-2.5 inline mr-0.5" />
                              {order.paymentStatus || "Unpaid"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <div className="text-right">
                          <div className="text-lg font-black text-gray-900">৳{order.totalAmount ?? 0}</div>
                          <div className="text-[10px] font-medium text-gray-400">{order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? "s" : ""}</div>
                        </div>

                        <div className="flex gap-1">
                          {canCancel && (
                            <button
                              onClick={() => openCancel(order._id)}
                              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition border border-transparent hover:border-red-100"
                              title="Cancel order"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                            className={`p-2 text-gray-400 hover:text-gray-700 rounded-xl transition ${isExpanded ? "bg-gray-100 text-gray-700" : "hover:bg-gray-50"}`}
                            title={isExpanded ? "Collapse" : "View items"}
                          >
                            <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* ── Expanded Item List ── */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 bg-gray-50/60 divide-y divide-gray-100 animate-in slide-in-from-top-1">
                        {!order.items || order.items.length === 0 ? (
                          <div className="px-5 py-4 text-sm text-gray-400 italic">No item details available.</div>
                        ) : (
                          order.items.map(item => {
                            const itemPending = (item.status || "PENDING").toUpperCase() === "PENDING";
                            return (
                              <div key={item._id} className="px-5 py-4 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <CheckCircle2 className={`w-4 h-4 shrink-0 ${
                                    (item.status || "").toUpperCase() === "DELIVERED" ? "text-emerald-500" :
                                    (item.status || "").toUpperCase() === "CANCELED" ? "text-red-400" : "text-gray-300"
                                  }`} />
                                  <div>
                                    <div className="font-semibold text-sm text-gray-900">{item.title || "Order Item"}</div>
                                    <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                                      <span>Qty: <span className="font-bold text-gray-700">{item.quantity}</span></span>
                                      <span className="font-bold text-gray-700">৳{item.price}</span>
                                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${statusCls(item.status)}`}>
                                        {item.status || "Pending"}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {itemPending && (
                                  <button
                                    onClick={() => openCancel(order._id, item._id)}
                                    className="text-[10px] px-3 py-1.5 rounded-lg font-bold uppercase tracking-wide bg-red-50 text-red-600 hover:bg-red-100 transition border border-red-100 whitespace-nowrap"
                                  >
                                    Cancel Item
                                  </button>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Pagination */}
              <div className="flex justify-between items-center pt-4 px-1">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading}>
                  Previous
                </Button>
                <span className="text-xs font-semibold text-gray-400">Page {page}</span>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={orders.length < LIMIT || loading}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
