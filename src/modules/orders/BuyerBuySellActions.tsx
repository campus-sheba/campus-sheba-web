"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { MessageSquareWarning, ShieldAlert, Star, X } from "lucide-react";
import type { OrderItemRow, UserOrderRow } from "@/types/order";
import { submitBuySellReviewAction } from "@/services/reviews";
import { createDisputeAction } from "@/services/disputes";
import { DISPUTE_REASONS, DISPUTE_REASON_LABELS, type DisputeReason } from "@/types/dispute";

type Props = {
  order: UserOrderRow;
};

function isBuySellOrder(order: UserOrderRow): boolean {
  return /buy.?sell/i.test(order.type ?? "");
}

/**
 * Buyer post-delivery actions for Buy & Sell orders:
 * leave a review and/or open a dispute on each delivered line item.
 */
export default function BuyerBuySellActions({ order }: Props) {
  const deliveredItems = useMemo(
    () => (order.items ?? []).filter((it) => it.status === "Delivered"),
    [order.items],
  );

  if (!isBuySellOrder(order) || order.isCancelledOrder || deliveredItems.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        Rate your purchase
      </p>
      <p className="mt-1 text-sm text-gray-600">
        Your item was delivered. Leave a review for the seller, or report a problem within 24
        hours if something is wrong.
      </p>
      <div className="mt-3 space-y-3">
        {deliveredItems.map((item) => (
          <DeliveredItemRow key={item._id ?? item.title} order={order} item={item} />
        ))}
      </div>
    </div>
  );
}

function DeliveredItemRow({ order, item }: { order: UserOrderRow; item: OrderItemRow }) {
  const [openReview, setOpenReview] = useState(false);
  const [openDispute, setOpenDispute] = useState(false);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2.5">
      <span className="text-sm font-medium text-gray-800">{item.title ?? "Item"}</span>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setOpenReview(true)}
          className="inline-flex items-center gap-1 rounded-lg bg-[#E30B12] px-3 py-1.5 text-xs font-semibold text-white"
        >
          <Star className="h-3.5 w-3.5" />
          Leave a review
        </button>
        <button
          type="button"
          onClick={() => setOpenDispute(true)}
          className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800"
        >
          <ShieldAlert className="h-3.5 w-3.5" />
          Report a problem
        </button>
      </div>

      {openReview ? (
        <ReviewModal order={order} item={item} onClose={() => setOpenReview(false)} />
      ) : null}
      {openDispute ? (
        <DisputeModal order={order} item={item} onClose={() => setOpenDispute(false)} />
      ) : null}
    </div>
  );
}

function ModalShell({
  title,
  icon,
  onClose,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900">
            {icon}
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ReviewModal({
  order,
  item,
  onClose,
}: {
  order: UserOrderRow;
  item: OrderItemRow;
  onClose: () => void;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();

  const listingId = item.originalItemId ?? item._id ?? "";

  const submit = () => {
    if (!listingId) {
      toast.error("Could not resolve the listing for this item.");
      return;
    }
    startTransition(async () => {
      const res = await submitBuySellReviewAction(listingId, rating, comment, order._id);
      if (res.success) {
        toast.success("Thanks! Your review has been posted.");
        onClose();
        router.refresh();
      } else {
        toast.error(res.message ?? "Could not submit review.");
      }
    });
  };

  return (
    <ModalShell
      title={`Review "${item.title ?? "item"}"`}
      icon={<Star className="h-5 w-5 text-[#E30B12]" />}
      onClose={onClose}
    >
      <div className="space-y-4">
        <div>
          <span className="mb-1.5 block text-sm font-medium text-gray-700">Rating</span>
          <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onMouseEnter={() => setHover(n)}
                onClick={() => setRating(n)}
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
              >
                <Star
                  className={`h-7 w-7 transition ${
                    n <= (hover || rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-gray-700">
            Comment <span className="text-gray-400">(optional)</span>
          </span>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="How was the item and the handover?"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#E30B12]"
          />
        </label>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={submit}
            className="rounded-lg bg-[#E30B12] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isPending ? "Submitting…" : "Submit review"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function DisputeModal({
  order,
  item,
  onClose,
}: {
  order: UserOrderRow;
  item: OrderItemRow;
  onClose: () => void;
}) {
  const router = useRouter();
  const [reason, setReason] = useState<DisputeReason>("item_not_as_described");
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    if (!description.trim()) {
      toast.error("Please describe the problem.");
      return;
    }
    if (!item._id) {
      toast.error("Could not resolve this order item.");
      return;
    }
    startTransition(async () => {
      const res = await createDisputeAction({
        orderId: order._id,
        orderItemId: item._id as string,
        reason,
        description,
      });
      if (res.success) {
        toast.success("Dispute opened. Campus operations will review it.");
        onClose();
        router.refresh();
      } else {
        toast.error(res.message ?? "Could not open dispute.");
      }
    });
  };

  return (
    <ModalShell
      title={`Report a problem`}
      icon={<MessageSquareWarning className="h-5 w-5 text-amber-600" />}
      onClose={onClose}
    >
      <div className="space-y-4">
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Disputes can be opened within 24 hours of delivery for{" "}
          <span className="font-semibold">{item.title ?? "this item"}</span>.
        </p>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-gray-700">Reason</span>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value as DisputeReason)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#E30B12]"
          >
            {DISPUTE_REASONS.map((r) => (
              <option key={r} value={r}>
                {DISPUTE_REASON_LABELS[r]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-gray-700">
            What went wrong?
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="Describe the issue with as much detail as possible."
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#E30B12]"
          />
        </label>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={submit}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isPending ? "Submitting…" : "Open dispute"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
