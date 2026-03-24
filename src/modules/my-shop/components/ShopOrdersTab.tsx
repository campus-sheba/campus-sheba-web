"use client";

import { useEffect, useState, useTransition } from "react";
import {
  getOwnerOrdersAction,
  confirmOrderItemAction,
  cancelOrderItemAction,
  type Order,
} from "@/app/[locale]/(protected)/(dashboard)/my-shop/actions";
import { ShoppingBag, CheckCircle, XCircle } from "lucide-react";

export default function ShopOrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    const res = await getOwnerOrdersAction();
    if (res.success) {
      setOrders(res.data);
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

  if (loading) {
    return <div className="p-5 text-center text-sm text-gray-500">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white p-10 text-center rounded-xl border border-gray-100 shadow-sm">
        <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium font-bold">No Orders Yet</p>
        <p className="text-gray-400 text-sm mt-1">When customers order your products, they will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order._id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center text-sm text-gray-600">
            <div>Order ID: <span className="font-mono text-xs">{order._id.slice(-6)}</span></div>
            <div className="font-semibold text-gray-800">Total: ৳{order.totalAmount}</div>
          </div>
          <div className="divide-y divide-gray-50">
            {order.items?.map((item) => (
              <div key={item._id} className="p-4 flex flex-col md:flex-row gap-3 justify-between items-start md:items-center">
                <div>
                  <h4 className="font-semibold text-sm">{item.title ?? "Unknown Item"}</h4>
                  <div className="text-xs text-gray-500 mt-1">
                    <span className="inline-block mr-3">Qty: {item.quantity}</span>
                    <span className="inline-block mr-3">Price: ৳{item.price}</span>
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      item.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                      item.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {item.status ?? 'PENDING'}
                    </span>
                  </div>
                </div>
                {item.status !== "CONFIRMED" && item.status !== "CANCELLED" && (
                  <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
                    <button
                      disabled={isPending}
                      onClick={() => handleAction(order._id, item._id, "confirm")}
                      className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-semibold rounded-lg transition"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Confirm
                    </button>
                    <button
                      disabled={isPending}
                      onClick={() => handleAction(order._id, item._id, "cancel")}
                      className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg transition"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
