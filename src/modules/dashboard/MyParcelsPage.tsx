"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useAppState } from "@/contexts/AppStateContext";
import { fetchParcelsList } from "@/services/parcel";
import type { Parcel } from "@/types/parcel";

const STATUSES = ["", "Pending", "Picked Up", "In Transit", "Delivered", "Cancelled"] as const;

function locLabel(loc: Parcel["pickupLocation"]): string {
  if (!loc) return "—";
  if (typeof loc === "string") return loc;
  return loc.name ?? "—";
}

export default function MyParcelsPage() {
  const t = useTranslations("common");
  const tt = (key: string, fallback: string) => (t.has(key) ? t(key) : fallback);
  const { state } = useAppState();
  const universityId = state.university.selected?._id ?? state.user.profile?.university?._id;

  const [items, setItems] = useState<Parcel[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const limit = 12;

  const fetchPage = async (nextPage: number, append: boolean) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await fetchParcelsList({
        page: nextPage,
        limit,
        status: status || undefined,
        university: universityId,
      });
      const rows = Array.isArray(res.data) ? res.data : [];
      setTotal(typeof res.total === "number" ? res.total : rows.length);
      setItems((prev) => (append ? [...prev, ...rows] : rows));
      setPage(nextPage);
    } catch (e) {
      setError(e instanceof Error ? e.message : tt("myParcels.loadError", "Failed to load parcels."));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    void fetchPage(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasMore = items.length < total;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">{tt("myParcels.title", "My parcels")}</h1>
          <p className="text-sm text-gray-500">{tt("myParcels.subtitle", "Deliveries you have booked.")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/my-parcels/new" className="rounded-lg bg-[#E30B12] px-4 py-2 text-sm font-semibold text-white active:brightness-95">
            {tt("myParcels.new", "Book parcel")}
          </Link>
          <Link href="/parcel" className="text-sm font-semibold text-[#E30B12] hover:underline">
            {tt("myParcels.about", "About parcel delivery")} →
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex min-w-[160px] flex-1 flex-col gap-1">
            <span className="text-xs font-medium text-gray-500">{tt("myParcels.status", "Status")}</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm outline-none focus:border-[#E30B12]"
            >
              {STATUSES.map((s) => (
                <option key={s || "all"} value={s}>
                  {s || tt("myParcels.allStatuses", "All")}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => void fetchPage(1, false)}
            className="rounded-lg bg-[#E30B12] px-4 py-2 text-sm font-semibold text-white"
          >
            {tt("myParcels.apply", "Apply")}
          </button>
        </div>
      </div>

      {error ? <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      {loading ? (
        <p className="text-sm text-gray-500">{tt("myParcels.loading", "Loading…")}</p>
      ) : items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-12 text-center text-sm text-gray-500">
          {tt("myParcels.empty", "No parcels yet.")}
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/90 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3 font-medium">{tt("myParcels.id", "ID")}</th>
                  <th className="px-4 py-3 font-medium">{tt("myParcels.route", "Route")}</th>
                  <th className="px-4 py-3 font-medium">{tt("myParcels.status", "Status")}</th>
                  <th className="px-4 py-3 font-medium text-right">{tt("myParcels.fee", "Fee")}</th>
                  <th className="w-20 px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((p) => (
                  <tr key={p._id} className="bg-white hover:bg-gray-50/60">
                    <td className="px-4 py-2.5 font-mono text-xs">{p.parcelId ?? p._id.slice(-6)}</td>
                    <td className="max-w-[220px] px-4 py-2.5 text-gray-600">
                      <span className="line-clamp-1">{locLabel(p.pickupLocation)}</span>
                      <span className="text-gray-400"> → </span>
                      <span className="line-clamp-1">{locLabel(p.deliveryLocation)}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <span className="inline-block rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium">{p.status ?? "—"}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right font-semibold tabular-nums text-[#E30B12]">
                      {p.deliveryFee != null ? `৳${p.deliveryFee.toLocaleString()}` : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Link href={`/my-parcels/${p._id}`} className="font-semibold text-[#E30B12] hover:underline">
                        {tt("myParcels.view", "View")}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {hasMore && !loading ? (
        <button
          type="button"
          disabled={loadingMore}
          onClick={() => void fetchPage(page + 1, true)}
          className="w-full rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {loadingMore ? "…" : tt("myParcels.loadMore", "Load more")}
        </button>
      ) : null}
    </div>
  );
}
