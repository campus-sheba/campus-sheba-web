"use client";

import { useEffect, useState, useTransition } from "react";
import {
  getOwnerOrdersAction,
  confirmOrderItemAction,
  cancelOrderItemAction,
  type Order,
} from "@/app/[locale]/(protected)/(dashboard)/my-shop/actions";
import { ShoppingBag, CheckCircle, XCircle, Search, Filter, Calendar, CreditCard, Package } from "lucide-react";
import Button from "@/components/ui/Button";

const STATUSES = ["All", "Pending", "Confirmed", "In Progress", "Out for Delivery", "Delivered", "Canceled", "Refunded", "Returned"];
const TYPES = ["All", "Book", "Product", "Food", "Parcel"];
const PAYMENT_STATUSES = ["All", "Unpaid", "Paid", "Failed", "Refunded"];

export default function ShopOrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Filters state
  const [status, setStatus] = useState("All");
  const [type, setType] = useState("All");
  const [paymentStatus, setPaymentStatus] = useState("All");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState("DESC");

  useEffect(() => {
    fetchOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      if (action === "confirm") {
        await confirmOrderItemAction(orderId, itemId);
      } else {
        await cancelOrderItemAction(orderId, itemId);
      }
      await fetchOrders();
    });
  }

  const renderStatusBadge = (s?: string) => {
    if (!s) s = "PENDING";
    const statusUp = s.toUpperCase();
    let cls = "bg-gray-100 text-gray-700";
    if (statusUp === "CONFIRMED" || statusUp === "DELIVERED") cls = "bg-green-100 text-green-700";
    if (statusUp === "CANCELED" || statusUp === "CANCELLED" || statusUp === "FAILED") cls = "bg-red-100 text-red-700";
    if (statusUp === "PENDING" || statusUp === "IN PROGRESS") cls = "bg-amber-100 text-amber-700";
    if (statusUp === "OUT FOR DELIVERY") cls = "bg-blue-100 text-blue-700";

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border border-transparent shadow-sm ${cls}`}>
        {s}
      </span>
    );
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      
      {/* Filters Section */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        {/* Top bar: Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                status === s
                  ? "bg-[#E30A13] text-white shadow-md shadow-[#E30A13]/20"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Bottom bar: Dropdown Filters */}
        <div className="flex flex-wrap items-end gap-3 pt-3 border-t border-gray-50">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1"><Package className="w-3 h-3"/> Type</label>
            <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#E30A13]">
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1"><CreditCard className="w-3 h-3"/> Payment</label>
            <select value={paymentStatus} onChange={(e) => { setPaymentStatus(e.target.value); setPage(1); }} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#E30A13]">
              {PAYMENT_STATUSES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1"><Calendar className="w-3 h-3"/> Date From</label>
            <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#E30A13]" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1"><Calendar className="w-3 h-3"/> Date To</label>
            <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#E30A13]" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1"><Filter className="w-3 h-3"/> Sort By</label>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#E30A13]">
              <option value="DESC">Newest First</option>
              <option value="ASC">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="py-10 flex flex-col items-center justify-center">
          <span className="w-8 h-8 border-4 border-[#E30A13]/20 border-t-[#E30A13] rounded-full animate-spin mb-3" />
          <span className="text-sm font-medium text-gray-500">Loading orders...</span>
        </div>
      ) : orders.length === 0 ? (
        /* Empty State */
        <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-gray-300">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-900 font-bold text-lg mb-1">No orders found</p>
          <p className="text-gray-500 text-sm">Try adjusting your filters or date range to find what you're looking for.</p>
        </div>
      ) : (
        /* Orders List */
        <div className="space-y-4">
          {orders.map((order) => {
            const date = order.createdAt ? new Date(order.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'Unknown Date';
            // @ts-ignore
            const paymentStat = order.paymentStatus || 'UNPAID';

            return (
              <div key={order._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition">
                {/* Order Header */}
                <div className="bg-gray-50/50 px-5 py-3 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-sm">
                      <ShoppingBag className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 font-medium">Order ID: <span className="font-mono text-gray-900 ml-1">#{order._id.slice(-6).toUpperCase()}</span></div>
                      <div className="text-xs text-gray-400 mt-0.5">{date}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="text-right">
                      <div className="text-xs font-medium text-gray-500">Total Amount</div>
                      <div className="font-bold text-[#E30A13] text-sm">৳{order.totalAmount ?? 0}</div>
                    </div>
                    <div className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${
                      paymentStat.toUpperCase() === 'PAID' ? 'bg-green-100 text-green-700' : 
                      paymentStat.toUpperCase() === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {paymentStat}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="divide-y divide-gray-50">
                  {order.items?.map((item) => {
                     // Check if item is actionable
                     const s = (item.status || "PENDING").toUpperCase();
                     const canAction = s === "PENDING";

                     return (
                      <div key={item._id} className="p-5 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm mb-1">{item.title ?? "Unknown Product"}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            {renderStatusBadge(item.status)}
                            <span className="text-xs text-gray-500 border-l border-gray-200 pl-2">Qty: {item.quantity}</span>
                            <span className="text-xs text-gray-500 border-l border-gray-200 pl-2">Price: ৳{item.price}</span>
                          </div>
                        </div>

                        {canAction && (
                          <div className="flex gap-2 w-full md:w-auto shrink-0 border-t border-gray-50 pt-3 md:border-0 md:pt-0">
                            <button
                              disabled={isPending}
                              onClick={() => handleAction(order._id, item._id, "confirm")}
                              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-green-50 border border-green-200 hover:bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-sm"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Accept
                            </button>
                            <button
                              disabled={isPending}
                              onClick={() => handleAction(order._id, item._id, "cancel")}
                              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-sm"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        )}
                        
                        {!canAction && (
                           <div className="text-xs text-gray-400 font-medium italic border-t border-gray-50 pt-3 md:border-0 md:pt-0">
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
          
          {/* Pagination Controls */}
          <div className="flex justify-between items-center py-4 px-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1 || loading}
            >
              Previous
            </Button>
            <span className="text-xs font-medium text-gray-500">Page {page}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => p + 1)} 
              disabled={orders.length < limit || loading}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
