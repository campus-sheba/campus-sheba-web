"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, MapPin } from "lucide-react";
import { useAppState } from "@/contexts/AppStateContext";
import { useTranslations } from "next-intl";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import { Button } from "@/components/ui";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import { ResponsiveCardsGrid } from "@/components/marketplace/ResponsiveCardsGrid";
import { fetchUserCategoriesByType } from "@/services/books";
import type { BuySellCategory } from "@/types/buy-sell";
import { useLostFoundBrowse } from "../hooks/useLostFoundBrowse";
import LostFoundCard from "./LostFoundCard";

const LF_TYPES = ["", "Lost", "Found"] as const;

export default function LostFoundFeed() {
  const t = useTranslations("common");
  const searchParams = useSearchParams();
  const { state } = useAppState();
  const tt = (key: string, fallback: string) =>
    t.has(key) ? t(key) : fallback;
  const universityId = state.university.selected?._id;
  const isAuthenticated = state.auth.isAuthenticated;
  const guestMode = !isAuthenticated;

  const [searchInput, setSearchInput] = useState(
    () => searchParams.get("title") || "",
  );
  const [debouncedTitle, setDebouncedTitle] = useState("");
  const [categories, setCategories] = useState<BuySellCategory[]>([]);
  const [categoryId, setCategoryId] = useState(
    () => searchParams.get("category") || "",
  );
  const [lfType, setLfType] = useState(() => searchParams.get("type") || "");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedTitle(searchInput), 400);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

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

  const canLoad = guestMode ? Boolean(universityId) : true;

  const { items, total, isLoading, error, hasMore, loadMore } =
    useLostFoundBrowse({
      guestMode,
      universityId,
      debouncedTitle,
      category: categoryId || undefined,
      type: (lfType === "Lost" || lfType === "Found" ? lfType : "") as
        | ""
        | "Lost"
        | "Found",
      pageSize: 12,
      enabled: canLoad,
    });

  return (
    <SectionWrapper spacing="none" background="transparent" className="my-0">
      <ContentWrapper
        maxWidth="max-w-7xl mx-auto"
        padding="md"
        className="pb-16 pt-2"
      >
        <AppBreadcrumb
          items={[
            { label: tt("lostFoundFeed.home", "Home"), href: "/" },
            {
              label: tt("lostFoundFeed.lostFound", "Lost & Found"),
              href: "/lost-found",
            },
          ]}
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 md:text-2xl">
              {tt("lostFoundFeed.title", "Campus Lost & Found")}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {tt(
                "lostFoundFeed.subtitle",
                "Browse lost and found posts from your university.",
              )}
            </p>
          </div>
        </div>

        {guestMode && !universityId ? (
          <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-6 py-12 text-center">
            <MapPin className="h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-700">
              {tt("lostFoundFeed.chooseCampus", "Choose your campus")}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {tt(
                "lostFoundFeed.chooseCampusHint",
                "Use the campus selector in the top bar to browse posts.",
              )}
            </p>
          </div>
        ) : (
          <>
            <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="relative sm:col-span-2">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="search"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder={tt(
                      "lostFoundFeed.searchPlaceholder",
                      "Search by title…",
                    )}
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none ring-[#00A651]/20 focus:border-[#00A651] focus:ring-2"
                  />
                </div>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#00A651]"
                >
                  <option value="">
                    {tt("lostFoundFeed.allCategories", "All categories")}
                  </option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>
                <select
                  value={lfType}
                  onChange={(e) => setLfType(e.target.value)}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#00A651]"
                >
                  {LF_TYPES.map((v) => (
                    <option key={v || "all"} value={v}>
                      {v || tt("lostFoundFeed.allTypes", "Lost & found")}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error ? (
              <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            {isLoading && items.length === 0 ? (
              <div className="mt-6">
                <ResponsiveCardsGrid>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-[4/3] animate-pulse rounded-2xl bg-gray-100"
                    />
                  ))}
                </ResponsiveCardsGrid>
              </div>
            ) : items.length === 0 ? (
              <p className="mt-8 rounded-xl border border-dashed border-gray-200 bg-white px-4 py-12 text-center text-sm text-gray-500">
                {tt("lostFoundFeed.empty", "No posts match your filters.")}
              </p>
            ) : (
              <>
                <p className="mt-4 text-xs text-gray-500">
                  {tt("lostFoundFeed.showing", "Showing")} {items.length} /{" "}
                  {total}
                </p>
                <div className="mt-3">
                  <ResponsiveCardsGrid>
                    {items.map((p) => (
                      <LostFoundCard key={p._id} post={p} />
                    ))}
                  </ResponsiveCardsGrid>
                </div>
                {hasMore ? (
                  <div className="mt-6 flex justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={loadMore}
                      disabled={isLoading}
                    >
                      {isLoading
                        ? tt("lostFoundFeed.loading", "Loading…")
                        : tt("lostFoundFeed.loadMore", "Load more")}
                    </Button>
                  </div>
                ) : null}
              </>
            )}
          </>
        )}
      </ContentWrapper>
    </SectionWrapper>
  );
}
