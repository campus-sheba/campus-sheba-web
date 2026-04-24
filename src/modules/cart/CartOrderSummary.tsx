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

function Money({ value, currency = "৳" }: { value: number; currency?: string }) {
  return (
    <span className="tabular-nums">
      {currency}
      {Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}
    </span>
  );
}

function SummaryRow({
  label,
  value,
  currency,
  negative,
}: {
  label: string;
  value: number;
  currency?: string;
  negative?: boolean;
}) {
  if (!value || Number.isNaN(value)) return null;
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12px] text-gray-500">{label}</span>
      <span
        className={`text-[12px] font-medium tabular-nums ${
          negative ? "text-red-600" : "text-gray-700"
        }`}
      >
        {negative ? "−" : ""}
        <Money value={value} currency={currency} />
      </span>
    </div>
  );
}

/**
 * Flattens an OrderSummaryResponse into the fields we display, reading from
 * the new `pricing` block when present and falling back to legacy `total*` fields.
 */
function readLines(summary: OrderSummaryResponse) {
  const p = summary.pricing;
  if (p) {
    return {
      subtotal: p.subtotal ?? summary.subTotal ?? 0,
      shipping: p.deliveryFee ?? 0,
      vat: p.vat ?? 0,
      tax: p.tax ?? 0,
      platformFee: p.platformFee ?? 0,
      serviceFee: p.serviceFee ?? 0,
      packagingFee: p.packagingFee ?? 0,
      codFee: p.codFee ?? 0,
      paymentGatewayFee: p.paymentGatewayFee ?? 0,
      deliveryTip: p.deliveryTip ?? 0,
      discount: p.discount ?? 0,
      currency: p.currency === "BDT" ? "৳" : p.currency,
    };
  }
  return {
    subtotal: summary.subTotal ?? 0,
    shipping: summary.totalShippingCost ?? 0,
    vat: summary.totalVat ?? 0,
    tax: summary.totalTax ?? 0,
    platformFee: summary.totalPlatformFee ?? 0,
    serviceFee: summary.totalServiceFee ?? 0,
    packagingFee: summary.totalPackagingFee ?? 0,
    codFee: summary.totalCODFee ?? 0,
    paymentGatewayFee: summary.totalPaymentGatewayFee ?? 0,
    deliveryTip: summary.deliveryTip ?? 0,
    discount: summary.totalDiscount ?? 0,
    currency: "৳",
  };
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
  const lines = summary ? readLines(summary) : null;

  return (
    <div
      className="mb-3 space-y-1.5 rounded-xl px-4 py-3"
      style={{ background: "#E8F7EF", border: "1px solid #C3E8D5" }}
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
        <div className="animate-pulse space-y-2 py-1">
          <div className="h-3 w-full rounded bg-gray-200/80" />
          <div className="h-3 w-[80%] rounded bg-gray-200/80" />
          <div className="h-3 w-[60%] rounded bg-gray-200/80" />
        </div>
      )}

      {hasAddress && error && !isLoading && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-[11px] text-amber-800">{error}</p>
      )}

      {hasAddress && summary && lines && !isLoading && (
        <>
          <SummaryRow label="Subtotal" value={lines.subtotal} currency={lines.currency} />
          <SummaryRow label="Delivery fee" value={lines.shipping} currency={lines.currency} />
          <SummaryRow label="VAT" value={lines.vat} currency={lines.currency} />
          <SummaryRow label="Tax" value={lines.tax} currency={lines.currency} />
          <SummaryRow label="Platform fee" value={lines.platformFee} currency={lines.currency} />
          <SummaryRow label="Service fee" value={lines.serviceFee} currency={lines.currency} />
          <SummaryRow label="Packaging" value={lines.packagingFee} currency={lines.currency} />
          <SummaryRow label="COD fee" value={lines.codFee} currency={lines.currency} />
          <SummaryRow
            label="Payment gateway fee"
            value={lines.paymentGatewayFee}
            currency={lines.currency}
          />
          <SummaryRow label="Delivery tip" value={lines.deliveryTip} currency={lines.currency} />
          <SummaryRow
            label={summary.coupon ? `Discount (${summary.coupon})` : "Discount"}
            value={lines.discount}
            currency={lines.currency}
            negative
          />
        </>
      )}

      {(!hasAddress || (!summary && !isLoading && !error)) && (
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-gray-500">Cart subtotal (estimate)</span>
          <span className="text-[12px] font-medium text-gray-700 tabular-nums">
            <Money value={cartSubtotal} />
          </span>
        </div>
      )}

      {(!hasAddress || (!summary && !isLoading)) && (
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-gray-500">Delivery (estimate)</span>
          <span className="text-[12px] font-medium text-gray-700 tabular-nums">
            <Money value={deliveryFeeFallback} />
          </span>
        </div>
      )}

      <div
        className="flex items-center justify-between pt-2"
        style={{ borderTop: "1px solid #C3E8D5" }}
      >
        <span className="text-[13px] font-semibold text-gray-800">
          {summary ? "Total" : "Estimated total"}
        </span>
        <span className="text-[14px] font-bold tabular-nums" style={{ color: "#00A651" }}>
          <Money value={totalDisplay} currency={lines?.currency} />
        </span>
      </div>
    </div>
  );
}
