"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { fetchBuySellCategories, fetchCreatorOwnBuySell } from "@/services/buy-sell";
import type { BuySellCategory, BuySellListing } from "@/types/buy-sell";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";
import { Pagination } from "@/components/ui";

const CONDITIONS = ["", "New", "Used - Like New", "Used - Good", "Used - Fair"] as const;
const STATUSES = ["", "Pending", "Approved", "Rejected", "Sold"] as const;

function formatMoney(n: number) {
  return `৳${n.toLocaleString()}`;
}

export default function MyBuySellPage() {
  const t = useTranslations("common");
  const tt = (key: string, fallback: string) => (t.has(key) ? t(key) : fallback);
  const [categories, setCategories] = useState<BuySellCategory[]>([]);
  const [items, setItems] = useState<BuySellListing[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchKey, setSearchKey] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [condition, setCondition] = useState("");
  const [status, setStatus] = useState("");

  const limit = 15;

  const buildApiParams = (nextPage: number) => ({
    page: nextPage,
    limit,
    searchKey: searchKey.trim() || undefined,
    category: categoryId || undefined,
    condition: condition || undefined,
    status: status || undefined,
  });

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetchBuySellCategories();
        setCategories(res.data ?? []);
      } catch {
        setCategories([]);
      }
    })();
  }, []);

  const fetchPage = async (nextPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCreatorOwnBuySell(buildApiParams(nextPage));
      setTotal(res.total);
      setItems(res.data);
      setPage(nextPage);
    } catch (e) {
      setError(e instanceof Error ? e.message : tt("myBuySell.failedLoadListings", "Failed to load listings."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load only
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">{tt("myBuySell.title", "My Buy & Sell")}</h1>
          <p className="text-sm text-gray-500">{tt("myBuySell.subtitle", "Your listings on campus marketplace.")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/my-buy-sell/new"
            className="rounded-lg bg-[#00A651] px-4 py-2 text-sm font-semibold text-white active:brightness-95"
          >
            {tt("myBuySell.newListing", "New listing")}
          </Link>
          <Link href="/buy-sell" className="text-sm font-semibold text-[#00A651] hover:underline">
            {tt("myBuySell.browseMarketplace", "Browse marketplace")} →
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex min-w-[200px] flex-[2] flex-col gap-1">
            <span className="text-xs font-medium text-gray-500">{tt("myBuySell.search", "Search")}</span>
            <input
              type="search"
              placeholder={tt("myBuySell.searchPlaceholder", "Title, brand, description...")}
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm outline-none focus:border-[#00A651]"
            />
          </label>
          <label className="flex min-w-[160px] flex-1 flex-col gap-1">
            <span className="text-xs font-medium text-gray-500">{tt("myBuySell.category", "Category")}</span>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm outline-none focus:border-[#00A651]"
            >
              <option value="">{tt("myBuySell.all", "All")}</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-[140px] flex-1 flex-col gap-1">
            <span className="text-xs font-medium text-gray-500">{tt("myBuySell.condition", "Condition")}</span>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm outline-none focus:border-[#00A651]"
            >
              {CONDITIONS.map((c) => (
                <option key={c || "any"} value={c}>
                  {c || tt("myBuySell.any", "Any")}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-[140px] flex-1 flex-col gap-1">
            <span className="text-xs font-medium text-gray-500">{tt("myBuySell.status", "Status")}</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm outline-none focus:border-[#00A651]"
            >
              {STATUSES.map((s) => (
                <option key={s || "any-status"} value={s}>
                  {s || tt("myBuySell.any", "Any")}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => void fetchPage(1)}
            className="rounded-lg bg-[#00A651] px-4 py-2 text-sm font-semibold text-white active:brightness-95"
          >
            {tt("myBuySell.apply", "Apply")}
          </button>
        </div>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      {loading ? (
        <p className="text-sm text-gray-500">{tt("myBuySell.loadingListings", "Loading your listings...")}</p>
      ) : items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-12 text-center text-sm text-gray-500">
          {tt("myBuySell.noListings", "No listings yet. When you post items, they will appear here.")}
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/90 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="w-16 px-4 py-3 font-medium" aria-hidden />
                  <th className="px-4 py-3 font-medium">{tt("myBuySell.listing", "Listing")}</th>
                  <th className="px-4 py-3 font-medium">{tt("myBuySell.condition", "Condition")}</th>
                  <th className="px-4 py-3 font-medium text-right">{tt("myBuySell.price", "Price")}</th>
                  <th className="px-4 py-3 font-medium">{tt("myBuySell.status", "Status")}</th>
                  <th className="px-4 py-3 font-medium w-24" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => {
                  const photo = item.photos?.[0]?.url;
                  const updated = item.updatedAt
                    ? new Date(item.updatedAt).toLocaleDateString()
                    : item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString()
                      : "—";
                  return (
                    <tr key={item._id} className="bg-white hover:bg-gray-50/60">
                      <td className="px-4 py-2.5">
                        <div className="relative h-11 w-11 overflow-hidden rounded-lg bg-gray-100">
                          {photo ? (
                            <Image
                              src={photo}
                              alt={item.title}
                              fill
                              className="object-cover"
                              sizes="44px"
                              unoptimized={shouldUnoptimizeRemoteImage(photo)}
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-gray-300">—</div>
                          )}
                        </div>
                      </td>
                      <td className="max-w-[280px] px-4 py-2.5">
                        <p className="font-medium text-gray-900 line-clamp-2">{item.title}</p>
                        <p className="mt-0.5 text-xs text-gray-400">{tt("myBuySell.updated", "Updated")} {updated}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-gray-600">{item.condition ?? "—"}</td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-right font-semibold tabular-nums text-[#00A651]">
                        {formatMoney(item.price)}
                        {item.negotiable ? (
                          <span className="ml-1 text-[10px] font-normal text-amber-700">neg.</span>
                        ) : null}
                      </td>
                      <td className="px-4 py-2.5">
                        {item.status ? (
                          <span className="inline-block rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                            {item.status}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-right text-sm">
                        <Link
                          href={`/my-buy-sell/${item._id}/edit`}
                          className="font-semibold text-gray-800 hover:underline"
                        >
                          {tt("myBuySell.edit", "Edit")}
                        </Link>
                        <span className="mx-2 text-gray-300" aria-hidden>
                          ·
                        </span>
                        <Link
                          href={`/buy-sell/${item._id}`}
                          className="font-semibold text-[#00A651] hover:underline"
                        >
                          {tt("myBuySell.view", "View")}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && items.length > 0 ? (
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <p className="text-xs text-gray-500">
            {tt("myBuySell.showing", "Showing")} {(page - 1) * limit + 1}–
            {Math.min(page * limit, total)} {tt("myBuySell.of", "of")} {total}
          </p>
          <Pagination
            page={page}
            totalPages={totalPages}
            disabled={loading}
            onPageChange={(p) => void fetchPage(p)}
          />
        </div>
      ) : null}
    </div>
  );
}
