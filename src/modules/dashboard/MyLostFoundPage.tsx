"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useAppState } from "@/contexts/AppStateContext";
import { fetchLostFoundMyPosts } from "@/services/lost-and-found";
import { fetchUserCategoriesByType } from "@/services/books";
import type { LostFoundPost } from "@/types/lost-and-found";
import type { BuySellCategory } from "@/types/buy-sell";
import { lostFoundDisplayTitle, lostFoundPrimaryImage } from "@/modules/lost-found/lostFoundDisplay";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";

const LF_TYPES = ["", "Lost", "Found"] as const;

export default function MyLostFoundPage() {
  const t = useTranslations("common");
  const tt = (key: string, fallback: string) => (t.has(key) ? t(key) : fallback);
  const { state } = useAppState();
  const universityId = state.university.selected?._id ?? state.user.profile?.university?._id;

  const [categories, setCategories] = useState<BuySellCategory[]>([]);
  const [items, setItems] = useState<LostFoundPost[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchKey, setSearchKey] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [lfType, setLfType] = useState("");
  const limit = 12;

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetchUserCategoriesByType("Lost and Found", 1, 100);
        setCategories(res.data ?? []);
      } catch {
        setCategories([]);
      }
    })();
  }, []);

  const fetchPage = async (nextPage: number, append: boolean) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await fetchLostFoundMyPosts({
        page: nextPage,
        limit,
        title: searchKey.trim() || undefined,
        category: categoryId || undefined,
        type: lfType === "Lost" || lfType === "Found" ? lfType : undefined,
        university: universityId,
      });
      const rows = Array.isArray(res.data) ? res.data : [];
      setTotal(typeof res.total === "number" ? res.total : rows.length);
      setItems((prev) => (append ? [...prev, ...rows] : rows));
      setPage(nextPage);
    } catch (e) {
      setError(e instanceof Error ? e.message : tt("myLostFound.loadError", "Failed to load posts."));
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
          <h1 className="text-xl font-bold tracking-tight text-gray-900">{tt("myLostFound.title", "My Lost & Found")}</h1>
          <p className="text-sm text-gray-500">{tt("myLostFound.subtitle", "Posts you created.")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/my-lost-found/new" className="rounded-lg bg-[#00A651] px-4 py-2 text-sm font-semibold text-white active:brightness-95">
            {tt("myLostFound.new", "New post")}
          </Link>
          <Link href="/lost-found/all" className="text-sm font-semibold text-[#00A651] hover:underline">
            {tt("myLostFound.browse", "Browse")} →
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex min-w-[200px] flex-[2] flex-col gap-1">
            <span className="text-xs font-medium text-gray-500">{tt("myLostFound.search", "Search title")}</span>
            <input
              type="search"
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm outline-none focus:border-[#00A651]"
            />
          </label>
          <label className="flex min-w-[140px] flex-1 flex-col gap-1">
            <span className="text-xs font-medium text-gray-500">{tt("myLostFound.category", "Category")}</span>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm outline-none focus:border-[#00A651]"
            >
              <option value="">{tt("myLostFound.all", "All")}</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-[120px] flex-1 flex-col gap-1">
            <span className="text-xs font-medium text-gray-500">{tt("myLostFound.type", "Type")}</span>
            <select
              value={lfType}
              onChange={(e) => setLfType(e.target.value)}
              className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm outline-none focus:border-[#00A651]"
            >
              {LF_TYPES.map((x) => (
                <option key={x || "any"} value={x}>
                  {x || tt("myLostFound.anyType", "Any")}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => void fetchPage(1, false)}
            className="rounded-lg bg-[#00A651] px-4 py-2 text-sm font-semibold text-white active:brightness-95"
          >
            {tt("myLostFound.apply", "Apply")}
          </button>
        </div>
      </div>

      {error ? <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      {loading ? (
        <p className="text-sm text-gray-500">{tt("myLostFound.loading", "Loading…")}</p>
      ) : items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-12 text-center text-sm text-gray-500">
          {tt("myLostFound.empty", "No posts yet.")}
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/90 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="w-14 px-4 py-3" aria-hidden />
                  <th className="px-4 py-3 font-medium">{tt("myLostFound.post", "Post")}</th>
                  <th className="px-4 py-3 font-medium">{tt("myLostFound.type", "Type")}</th>
                  <th className="px-4 py-3 font-medium">{tt("myLostFound.status", "Status")}</th>
                  <th className="w-28 px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => {
                  const photo = lostFoundPrimaryImage(item);
                  const title = lostFoundDisplayTitle(item);
                  return (
                    <tr key={item._id} className="bg-white hover:bg-gray-50/60">
                      <td className="px-4 py-2.5">
                        <div className="relative h-11 w-11 overflow-hidden rounded-lg bg-gray-100">
                          {photo ? (
                            <Image
                              src={photo}
                              alt=""
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
                      <td className="max-w-[240px] px-4 py-2.5">
                        <p className="line-clamp-2 font-medium text-gray-900">{title}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5">{item.type}</td>
                      <td className="px-4 py-2.5">
                        <span className="inline-block rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                          {item.status ?? "—"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-right text-sm">
                        <Link href={`/my-lost-found/${item._id}/edit`} className="font-semibold text-gray-800 hover:underline">
                          {tt("myLostFound.edit", "Edit")}
                        </Link>
                        <span className="mx-2 text-gray-300">·</span>
                        <Link href={`/lost-found/${item._id}`} className="font-semibold text-[#00A651] hover:underline">
                          {tt("myLostFound.view", "View")}
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

      {hasMore && !loading ? (
        <button
          type="button"
          disabled={loadingMore}
          onClick={() => void fetchPage(page + 1, true)}
          className="w-full rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {loadingMore ? tt("myLostFound.loadingShort", "Loading…") : tt("myLostFound.loadMore", "Load more")}
        </button>
      ) : null}
    </div>
  );
}
