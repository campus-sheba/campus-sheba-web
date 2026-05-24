import Image from "next/image";
import { KeyRound, Truck, User } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { UserOrderRow } from "@/types/order";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";
import { OrderFulfillmentTimeline } from "@/modules/orders/OrderFulfillmentTimeline";
import SellerOrderDetailActions from "@/modules/orders/SellerOrderDetailActions";
import {
  BUYER_FULFILMENT_STEPS,
  SELLER_FULFILMENT_STEPS,
  buyerStatusHint,
  buyerTimelineReached,
  sellerTimelineReached,
} from "@/modules/orders/orderFulfillment";
import { OrderCancelButton } from "./OrderCancelButton";

function formatMoney(n: number | undefined) {
  return `৳${(n ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function shortId(id: string) {
  if (id.length <= 10) return id;
  return `…${id.slice(-8)}`;
}

function buyerName(order: UserOrderRow): string | undefined {
  const u = order.user;
  if (!u) return undefined;
  if (typeof u === "object" && u.name) return u.name;
  return undefined;
}

type Props = {
  order: UserOrderRow;
  showPlacedSuccess?: boolean;
  /** Buyer (my-orders) or seller (my-sales) detail view. */
  view?: "buyer" | "seller";
  /** Seller view: the line item owned by the current seller. */
  sellerItemId?: string;
};

export default function OrderDetailView({
  order,
  showPlacedSuccess = false,
  view = "buyer",
  sellerItemId,
}: Props) {
  const created = order.createdAt ? new Date(order.createdAt).toLocaleString() : "—";
  const isSeller = view === "seller";
  const sellerItem =
    isSeller && sellerItemId
      ? (order.items ?? []).find((it) => it._id === sellerItemId)
      : (order.items ?? [])[0];

  const timelineSteps = isSeller ? SELLER_FULFILMENT_STEPS : BUYER_FULFILMENT_STEPS;
  const timelineReached = isSeller
    ? sellerTimelineReached(order, sellerItem?.status)
    : buyerTimelineReached(order);

  const isDelivered = timelineReached >= timelineSteps.length - 1;
  const rider =
    order.deliveryHero && typeof order.deliveryHero === "object"
      ? order.deliveryHero
      : null;

  const showDeliveryOtp =
    !isSeller &&
    Boolean(order.secretPIN) &&
    !order.isCancelledOrder &&
    !isDelivered;

  const paymentLabel = order.paymentGatewayKey ?? order.paymentType ?? "—";
  const deliveryLabel =
    order.deliveryOption?.title ?? order.deliveryOptionKey ?? "—";

  const backHref = isSeller ? "/my-sales" : "/my-orders";
  const title = isSeller ? "Sale order details" : "Order details";

  return (
    <div className="space-y-6">
      {showPlacedSuccess ? (
        <p
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
          role="status"
        >
          Order placed successfully. The seller will confirm your order before pickup and
          delivery.
        </p>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href={backHref}
            className="text-sm font-medium text-gray-500 transition hover:text-gray-900"
          >
            ← Back
          </Link>
          <h1 className="mt-2 text-xl font-bold tracking-tight text-gray-900">{title}</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            <span title={order._id} className="font-mono text-xs text-gray-400">
              {shortId(order._id)}
            </span>
            <span className="mx-2 text-gray-300">·</span>
            {created}
          </p>
        </div>
        {!isSeller && !order.isCancelledOrder ? (
          <OrderCancelButton orderId={order._id} />
        ) : null}
      </div>

      {!isSeller && buyerStatusHint(order) ? (
        <p className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {buyerStatusHint(order)}
        </p>
      ) : null}

      {order.requiresManualAssignment && !order.isCancelledOrder ? (
        <p className="rounded-lg border border-orange-100 bg-orange-50 px-4 py-3 text-sm text-orange-900">
          Rider assignment needs manual help from campus operations. Your order is still active.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Module", value: order.type ?? "—" },
          { label: "Payment", value: `${order.paymentStatus ?? "—"} · ${paymentLabel}` },
          { label: "Delivery option", value: deliveryLabel },
          {
            label: "Item status",
            value: sellerItem?.status ?? (order.isCancelledOrder ? "Cancelled" : "—"),
          },
        ].map((row) => (
          <div
            key={row.label}
            className="rounded-lg border border-gray-200/80 bg-white px-4 py-3 shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              {row.label}
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{row.value}</p>
          </div>
        ))}
      </div>

      {!order.isCancelledOrder ? (
        <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Fulfilment progress
          </p>
          <OrderFulfillmentTimeline steps={timelineSteps} reached={timelineReached} />
        </div>
      ) : null}

      {isSeller && sellerItem ? (
        <SellerOrderDetailActions order={order} sellerItem={sellerItem} />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {showDeliveryOtp ? (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <KeyRound className="h-6 w-6 flex-shrink-0 text-emerald-600" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Delivery OTP (share with rider)
              </p>
              <p className="font-mono text-2xl font-bold tracking-widest text-emerald-700">
                {order.secretPIN}
              </p>
            </div>
          </div>
        ) : null}

        {isSeller && order.pickupPIN ? (
          <div className="flex items-center gap-3 rounded-xl border border-violet-100 bg-violet-50 p-4">
            <KeyRound className="h-6 w-6 flex-shrink-0 text-violet-600" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
                Pickup OTP (share with rider)
              </p>
              <p className="font-mono text-2xl font-bold tracking-widest text-violet-700">
                {order.pickupPIN}
              </p>
              <p className="mt-0.5 text-xs text-gray-600">
                Rider must enter this OTP to confirm collection from you.
              </p>
            </div>
          </div>
        ) : null}

        {rider ? (
          <div className="flex items-center gap-3 rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm">
            <Truck className="h-6 w-6 flex-shrink-0 text-gray-400" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Delivery rider
              </p>
              <p className="text-sm font-semibold text-gray-900">{rider.name ?? "Assigned"}</p>
              {rider.phone ? (
                <a
                  href={`tel:${rider.phone}`}
                  className="text-xs font-medium text-[#E30B12] hover:underline"
                >
                  {rider.phone}
                </a>
              ) : null}
              {order.acceptDeliveryHero ? (
                <p className="mt-0.5 text-xs text-gray-500">Rider accepted assignment</p>
              ) : (
                <p className="mt-0.5 text-xs text-amber-700">Awaiting rider acceptance</p>
              )}
            </div>
          </div>
        ) : !order.isCancelledOrder ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 p-4 text-sm text-gray-600">
            No rider assigned yet.
            {order.lastAssignmentAttempt
              ? ` Last assignment attempt: ${new Date(order.lastAssignmentAttempt).toLocaleString()}`
              : null}
          </div>
        ) : null}

        {!isSeller && buyerName(order) ? (
          <div className="flex items-center gap-3 rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm">
            <User className="h-6 w-6 text-gray-400" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Buyer
              </p>
              <p className="text-sm font-semibold text-gray-900">{buyerName(order)}</p>
            </div>
          </div>
        ) : null}
      </div>

      {order.university?.name ? (
        <p className="text-sm text-gray-600">
          <span className="text-gray-400">Campus</span>{" "}
          <span className="font-medium text-gray-800">{order.university.name}</span>
        </p>
      ) : null}

      {order.address?.address ? (
        <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Delivery address
          </p>
          <p className="mt-1 text-sm text-gray-800">{order.address.address}</p>
          {order.address.description ? (
            <p className="mt-0.5 text-xs text-gray-500">{order.address.description}</p>
          ) : null}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Line items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/90 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-4 py-2.5">Item</th>
                <th className="px-4 py-2.5">Qty</th>
                <th className="px-4 py-2.5 text-right">Unit</th>
                <th className="px-4 py-2.5 text-right">Line total</th>
                {isSeller ? (
                  <th className="px-4 py-2.5 text-right">Your payout</th>
                ) : null}
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(order.items ?? []).map((it, idx) => {
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
                            <div className="flex h-full items-center justify-center text-gray-300">
                              —
                            </div>
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
                          (it.price != null
                            ? (it.price ?? 0) * (it.quantity ?? 1)
                            : undefined),
                      )}
                    </td>
                    {isSeller ? (
                      <td className="px-4 py-3 text-right tabular-nums font-semibold text-[#E30B12]">
                        {formatMoney(it.sellerPayout)}
                      </td>
                    ) : null}
                    <td className="px-4 py-3 text-gray-600">{it.status ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="ml-auto max-w-md rounded-xl border border-gray-200/80 bg-gray-50/80 p-4 text-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
          {isSeller ? "Order totals (campus)" : "Payment summary"}
        </p>
        <div className="space-y-1 text-gray-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatMoney(order.subTotal)}</span>
          </div>
          {order.totalShippingCost != null && order.totalShippingCost > 0 ? (
            <div className="flex justify-between">
              <span>Delivery</span>
              <span className="tabular-nums">{formatMoney(order.totalShippingCost)}</span>
            </div>
          ) : null}
          {order.totalPackagingFee != null && order.totalPackagingFee > 0 ? (
            <div className="flex justify-between">
              <span>Packaging</span>
              <span className="tabular-nums">{formatMoney(order.totalPackagingFee)}</span>
            </div>
          ) : null}
          {order.totalServiceFee != null && order.totalServiceFee > 0 ? (
            <div className="flex justify-between">
              <span>Service fee</span>
              <span className="tabular-nums">{formatMoney(order.totalServiceFee)}</span>
            </div>
          ) : null}
          {order.totalDiscount != null && order.totalDiscount > 0 ? (
            <div className="flex justify-between">
              <span>Discount</span>
              <span className="tabular-nums">−{formatMoney(order.totalDiscount)}</span>
            </div>
          ) : null}
          {isSeller && order.totalSellerPayout != null ? (
            <div className="flex justify-between font-medium text-gray-800">
              <span>Your total payout</span>
              <span className="tabular-nums text-[#E30B12]">
                {formatMoney(order.totalSellerPayout)}
              </span>
            </div>
          ) : null}
        </div>
        <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-gray-900">
          <span>{isSeller ? "Buyer paid" : "Total paid"}</span>
          <span className="tabular-nums text-[#E30B12]">{formatMoney(order.total)}</span>
        </div>
      </div>
    </div>
  );
}
