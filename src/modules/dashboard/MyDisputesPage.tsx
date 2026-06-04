"use client";

import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { listMyDisputesAction } from "@/services/disputes";
import {
  DISPUTE_REASON_LABELS,
  type Dispute,
  type DisputeReason,
  type DisputeStatus,
} from "@/types/dispute";

const STATUS_STYLES: Record<DisputeStatus, string> = {
  Open: "bg-amber-50 text-amber-700 border-amber-200",
  "Under Review": "bg-blue-50 text-blue-700 border-blue-200",
  Resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Closed: "bg-gray-100 text-gray-600 border-gray-200",
};

const STATUS_FILTERS: ("" | DisputeStatus)[] = [
  "",
  "Open",
  "Under Review",
  "Resolved",
  "Closed",
];

function formatMoney(n: number | undefined) {
  if (n == null) return "—";
  return `৳${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function refLabel(ref: Dispute["order"]): string {
  if (!ref) return "—";
  if (typeof ref === "string") return `…${ref.slice(-8)}`;
  if (ref.title) return ref.title;
  if (ref.name) return ref.name;
  return ref._id ? `…${ref._id.slice(-8)}` : "—";
}

export default function MyDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [status, setStatus] = useState<"" | DisputeStatus>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      const res = await listMyDisputesAction({
        page: 1,
        limit: 50,
        status: status || undefined,
      });
      if (!active) return;
      if (res.success) {
        setDisputes(res.data.data);
      } else {
        setError(res.message);
        setDisputes([]);
      }
      setLoading(false);
    };
    void load();
    return () => {
      active = false;
    };
  }, [status]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-gray-900">
          <ShieldAlert className="h-5 w-5 text-amber-600" />
          My disputes
        </h1>
        <p className="text-sm text-gray-500">
          Problems you reported on delivered Buy &amp; Sell orders.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s || "all"}
            type="button"
            onClick={() => setStatus(s)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              status === s
                ? "border-[#E30B12] bg-[#E30B12] text-white"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="rounded-xl border border-gray-200/80 bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
          Loading disputes…
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      ) : disputes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 p-8 text-center text-sm text-gray-600">
          You haven&apos;t opened any disputes.
        </div>
      ) : (
        <div className="space-y-3">
          {disputes.map((d) => (
            <div
              key={d._id}
              className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {DISPUTE_REASON_LABELS[d.reason as DisputeReason] ?? d.reason}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Order {refLabel(d.order)}
                    <span className="mx-1.5 text-gray-300">·</span>
                    {d.createdAt ? new Date(d.createdAt).toLocaleString() : "—"}
                  </p>
                </div>
                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                    STATUS_STYLES[d.status] ?? "border-gray-200 bg-gray-100 text-gray-600"
                  }`}
                >
                  {d.status}
                </span>
              </div>

              {d.description ? (
                <p className="mt-2 text-sm text-gray-700">{d.description}</p>
              ) : null}

              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
                <span>
                  Amount in dispute:{" "}
                  <span className="font-medium text-gray-800">{formatMoney(d.itemAmount)}</span>
                </span>
                {d.outcome ? (
                  <span>
                    Outcome:{" "}
                    <span className="font-medium text-gray-800">
                      {d.outcome.replace(/_/g, " ")}
                    </span>
                  </span>
                ) : null}
                {d.partialRefundAmount != null ? (
                  <span>
                    Refunded:{" "}
                    <span className="font-medium text-gray-800">
                      {formatMoney(d.partialRefundAmount)}
                    </span>
                  </span>
                ) : null}
              </div>

              {d.adminNote ? (
                <p className="mt-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
                  <span className="font-semibold text-gray-700">Admin note:</span> {d.adminNote}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
