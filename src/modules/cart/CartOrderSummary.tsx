"use client";

import { Link } from "@/i18n/navigation";
import type { OrderSummaryResponse } from "@/types/cart";

type CartOrderSummaryProps = {
  hasAddress: boolean;
  isLoading: boolean;
  error: string | null;
  summary: OrderSummaryResponse | null;
  cartSubtotal: number;
  deliveryFeeFallback: number;
  totalDisplay: number;
};

function Money({ value }: { value: number }) {
  return <span className="tabular-nums">৳{value}</span>;
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  if (value === 0 || Number.isNaN(value)) return null;
  return (
    <div className="flex justify-between items-center">
      <span className="text-[12px] text-gray-500">{label}</span>
      <span className="text-[12px] font-medium text-gray-700 tabular-nums">
        <Money value={value} />
      </span>
    </div>
  );
}

export default function CartOrderSummary({
  hasAddress,
  isLoading,
  error,
  summary,
  cartSubtotal,
  deliveryFeeFallback,
  totalDisplay,
}: CartOrderSummaryProps) {
  return (
    <div
      className="rounded-xl px-4 py-3 mb-3 space-y-1.5"
      style={{
        background: "#E8F7EF",
        border: "1px solid #C3E8D5",
      }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
        Order summary
      </p>

      {!hasAddress && (
        <p className="rounded-lg bg-white/80 px-3 py-2 text-[11px] leading-relaxed text-gray-600">
          Add a{" "}
          <Link href="/my-addresses" className="font-semibold text-[#00A651] underline">
            delivery address
          </Link>{" "}
          to load VAT, gateway fees, and final total from the server.
        </p>
      )}

      {hasAddress && isLoading && (
        <div className="space-y-2 animate-pulse py-1">
          <div className="h-3 w-full rounded bg-gray-200/80" />
          <div className="h-3 w-[80%] rounded bg-gray-200/80" />
          <div className="h-3 w-[60%] rounded bg-gray-200/80" />
        </div>
      )}

      {hasAddress && error && !isLoading && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-[11px] text-amber-800">{error}</p>
      )}

      {hasAddress && summary && !isLoading && (
        <>
          <SummaryRow label="Subtotal" value={summary.subTotal} />
          <SummaryRow label="Shipping" value={summary.totalShippingCost ?? 0} />
          <SummaryRow label="VAT" value={summary.totalVat ?? 0} />
          <SummaryRow label="Tax" value={summary.totalTax ?? 0} />
          <SummaryRow label="Platform fee" value={summary.totalPlatformFee ?? 0} />
          <SummaryRow label="Service fee" value={summary.totalServiceFee ?? 0} />
          <SummaryRow label="Packaging" value={summary.totalPackagingFee ?? 0} />
          <SummaryRow label="COD fee" value={summary.totalCODFee ?? 0} />
          {summary.totalDiscount != null && summary.totalDiscount > 0 ? (
            <div className="flex justify-between items-center">
              <span className="text-[12px] text-gray-500">Discount</span>
              <span className="text-[12px] font-medium text-red-600 tabular-nums">
                −<Money value={summary.totalDiscount} />
              </span>
            </div>
          ) : null}
          <SummaryRow
            label="Payment gateway fee"
            value={summary.totalPaymentGatewayFee ?? 0}
          />
          {summary.deliveryTip != null && summary.deliveryTip > 0 ? (
            <SummaryRow label="Delivery tip" value={summary.deliveryTip} />
          ) : null}
        </>
      )}

      {(!hasAddress || (!summary && !isLoading && !error)) && (
        <div className="flex justify-between items-center">
          <span className="text-[12px] text-gray-500">Cart subtotal (estimate)</span>
          <span className="text-[12px] font-medium text-gray-700 tabular-nums">
            <Money value={cartSubtotal} />
          </span>
        </div>
      )}

      {(!hasAddress || (!summary && !isLoading)) && (
        <div className="flex justify-between items-center">
          <span className="text-[12px] text-gray-500">Delivery (estimate)</span>
          <span className="text-[12px] font-medium text-gray-700 tabular-nums">
            <Money value={deliveryFeeFallback} />
          </span>
        </div>
      )}

      <div
        className="flex justify-between items-center pt-2"
        style={{ borderTop: "1px solid #C3E8D5" }}
      >
        <span className="text-[13px] font-semibold text-gray-800">
          {summary ? "Total" : "Estimated total"}
        </span>
        <span className="text-[14px] font-bold tabular-nums" style={{ color: "#00A651" }}>
          <Money value={totalDisplay} />
        </span>
      </div>
    </div>
  );
}
