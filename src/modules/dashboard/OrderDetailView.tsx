import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { UserOrderRow } from "@/types/order";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";
import { OrderCancelButton } from "./OrderCancelButton";

function formatMoney(n: number | undefined) {
  return `৳${(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function shortId(id: string) {
  if (id.length <= 10) return id;
  return `…${id.slice(-8)}`;
}

export default function OrderDetailView({ order }: { order: UserOrderRow }) {
  const created = order.createdAt ? new Date(order.createdAt).toLocaleString() : "—";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/my-orders" className="text-sm font-medium text-gray-500 transition hover:text-gray-900">
            ← Back to orders
          </Link>
          <h1 className="mt-2 text-xl font-bold tracking-tight text-gray-900">Order details</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            <span title={order._id} className="font-mono text-xs text-gray-400">
              {shortId(order._id)}
            </span>
            <span className="mx-2 text-gray-300">·</span>
            {created}
          </p>
        </div>
        {!order.isCancelledOrder ? <OrderCancelButton orderId={order._id} /> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Type", value: order.type ?? "—" },
          { label: "Payment", value: order.paymentStatus ?? "—" },
          { label: "Delivery", value: order.deliveryType ?? "—" },
          {
            label: "Status",
            value: order.isCancelledOrder ? "Cancelled" : "Active",
          },
        ].map((row) => (
          <div
            key={row.label}
            className="rounded-lg border border-gray-200/80 bg-white px-4 py-3 shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{row.label}</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{row.value}</p>
          </div>
        ))}
      </div>

      {order.university?.name ? (
        <p className="text-sm text-gray-600">
          <span className="text-gray-400">Campus</span>{" "}
          <span className="font-medium text-gray-800">{order.university.name}</span>
        </p>
      ) : null}

      {order.address?.address ? (
        <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Delivery address</p>
          <p className="mt-1 text-sm text-gray-800">{order.address.address}</p>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Line items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/90 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-4 py-2.5 font-medium">Item</th>
                <th className="px-4 py-2.5 font-medium">Qty</th>
                <th className="px-4 py-2.5 font-medium text-right">Price</th>
                <th className="px-4 py-2.5 font-medium text-right">Line total</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(order.items ?? []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No line items.
                  </td>
                </tr>
              ) : (
                (order.items ?? []).map((it, idx) => {
                  const key = it._id ?? `${idx}`;
                  const photo = it.photo;
                  return (
                    <tr key={key} className="bg-white">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                            {photo ? (
                              <Image
                                src={photo}
                                alt={it.title ?? "Product"}
                                fill
                                className="object-cover"
                                sizes="48px"
                                unoptimized={shouldUnoptimizeRemoteImage(photo)}
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-gray-300">—</div>
                            )}
                          </div>
                          <span className="font-medium text-gray-900">{it.title ?? "Item"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 tabular-nums text-gray-700">{it.quantity ?? 1}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-700">
                        {formatMoney(it.price)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums text-gray-900">
                        {formatMoney(
                          it.total ??
                            (it.price != null ? (it.price ?? 0) * (it.quantity ?? 1) : undefined),
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{it.status ?? "—"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="ml-auto max-w-sm rounded-xl border border-gray-200/80 bg-gray-50/80 p-4 text-sm">
        <div className="flex justify-between py-1 text-gray-600">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatMoney(order.subTotal)}</span>
        </div>
        {order.totalDiscount != null && order.totalDiscount > 0 ? (
          <div className="flex justify-between py-1 text-gray-600">
            <span>Discount</span>
            <span className="tabular-nums">−{formatMoney(order.totalDiscount)}</span>
          </div>
        ) : null}
        <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-gray-900">
          <span>Total</span>
          <span className="tabular-nums text-[#00A651]">{formatMoney(order.total)}</span>
        </div>
      </div>
    </div>
  );
}
