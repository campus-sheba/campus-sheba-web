"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { CheckCircle2, KeyRound, XCircle } from "lucide-react";
import {
  cancelSellerOrderItemAction,
  confirmOrderItemAction,
  generatePickupOtpAction,
} from "@/services/owner-orders";
import type { OrderItemRow, UserOrderRow } from "@/types/order";
import { sellerStatusHint } from "./orderFulfillment";

type Props = {
  order: UserOrderRow;
  sellerItem: OrderItemRow;
};

export default function SellerOrderDetailActions({ order, sellerItem }: Props) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const itemId = sellerItem._id ?? "";
  const canConfirm = sellerItem.status === "Pending";
  const canCancel =
    sellerItem.status === "Pending" || sellerItem.status === "Confirmed";
  const canGenerateOtp =
    !order.pickupPIN &&
    Boolean(order.deliveryHero) &&
    (sellerItem.status === "Confirmed" || sellerItem.status === "In Progress");

  const refresh = () => router.refresh();

  const confirm = () => {
    startTransition(async () => {
      setMsg(null);
      const res = await confirmOrderItemAction(order._id, itemId);
      setMsg(res.success ? "Order confirmed. A rider will be assigned." : res.message ?? "Could not confirm.");
      if (res.success) refresh();
    });
  };

  const cancel = () => {
    const reason = window.prompt(`Cancel "${sellerItem.title}"? Reason:`);
    if (reason == null) return;
    startTransition(async () => {
      setMsg(null);
      const res = await cancelSellerOrderItemAction(
        order._id,
        itemId,
        reason.trim() || "Cancelled by seller",
      );
      setMsg(res.success ? "Item cancelled." : res.message ?? "Could not cancel.");
      if (res.success) refresh();
    });
  };

  const generateOtp = () => {
    startTransition(async () => {
      setMsg(null);
      const res = await generatePickupOtpAction(order._id);
      if (res.success) {
        setMsg("Pickup OTP generated. Share it with the rider on collection.");
        refresh();
      } else {
        setMsg(res.message ?? "Could not generate pickup OTP.");
      }
    });
  };

  return (
    <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        Seller actions
      </p>
      <p className="mt-1 text-sm text-gray-600">
        {sellerStatusHint(sellerItem.status, order)}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {canConfirm ? (
          <button
            type="button"
            disabled={isPending}
            onClick={confirm}
            className="inline-flex items-center gap-1 rounded-lg bg-[#E30B12] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" />
            Confirm order
          </button>
        ) : null}
        {canGenerateOtp ? (
          <button
            type="button"
            disabled={isPending}
            onClick={generateOtp}
            className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 disabled:opacity-50"
          >
            <KeyRound className="h-4 w-4" />
            Generate pickup OTP
          </button>
        ) : null}
        {canCancel ? (
          <button
            type="button"
            disabled={isPending}
            onClick={cancel}
            className="inline-flex items-center gap-1 rounded-lg border border-red-100 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            <XCircle className="h-4 w-4" />
            Cancel item
          </button>
        ) : null}
      </div>
      {msg ? (
        <p className="mt-3 text-sm text-gray-700" role="status">
          {msg}
        </p>
      ) : null}
    </div>
  );
}
