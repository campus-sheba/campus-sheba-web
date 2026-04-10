"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Package } from "lucide-react";
import { useAppState } from "@/contexts/AppStateContext";
import { useTranslations } from "next-intl";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import { Button } from "@/components/ui";
import { fetchBookCategoriesPublic } from "@/services/books.public";
import { useBooksList } from "@/modules/books/hooks/useBooksList";
import BookListingCard from "./BookListingCard";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import type { BuySellCategory } from "@/types/buy-sell";

const BOOK_TYPES = ["", "Selling", "Lending", "Donation"] as const;
const QUALITIES = ["", "New", "Like New", "Good", "Acceptable"] as const;

export default function BookFeed() {
  const t = useTranslations("common");
  const searchParams = useSearchParams();
  const { state } = useAppState();
  const tt = (key: string, fallback: string) => (t.has(key) ? t(key) : fallback);
  const universityId = state.university.selected?._id;
  const [searchInput, setSearchInput] = useState(() => searchParams.get("searchKey") || "");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categories, setCategories] = useState<BuySellCategory[]>([]);
  const [categoryId, setCategoryId] = useState(() => searchParams.get("category") || "");
  const [bookType, setBookType] = useState(() => searchParams.get("type") || "");
  const [quality, setQuality] = useState(() => searchParams.get("quality") || "");
  const [year, setYear] = useState(() => searchParams.get("year") || "");
  const [minPrice, setMinPrice] = useState(() => searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(() => searchParams.get("maxPrice") || "");

  const parsedMinPrice = minPrice.trim() ? Number(minPrice) : undefined;
  const parsedMaxPrice = maxPrice.trim() ? Number(maxPrice) : undefined;

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchInput), 400);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetchBookCategoriesPublic(1, 100);
        setCategories(res.data ?? []);
      } catch {
        setCategories([]);
      }
    })();
  }, []);

  const { items, total, isLoading, error, hasMore, loadMore } = useBooksList({
    universityId,
    debouncedSearch,
    category: categoryId || undefined,
    type: bookType || undefined,
    quality: quality || undefined,
    year: year.trim() || undefined,
    minPrice: parsedMinPrice != null && Number.isFinite(parsedMinPrice) ? parsedMinPrice : undefined,
    maxPrice: parsedMaxPrice != null && Number.isFinite(parsedMaxPrice) ? parsedMaxPrice : undefined,
  });

  return (
    <SectionWrapper spacing="none" background="transparent" className="my-0">
      <ContentWrapper maxWidth="max-w-7xl mx-auto" padding="md" className="pb-16 pt-2">
        <AppBreadcrumb
          items={[
            { label: tt("bookFeed.home", "Home"), href: "/" },
            { label: tt("bookFeed.books", "Books"), href: "/books" },
          ]}
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 md:text-2xl">
              {tt("bookFeed.title", "Campus books")}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {tt("bookFeed.subtitle", "Browse sell, lend, and donation listings from your campus.")}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            <div className="relative sm:col-span-2 xl:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={tt("bookFeed.searchPlaceholder", "Search title, author, or description...")}
                disabled={!universityId}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none ring-[#00A651]/20 focus:border-[#00A651] focus:ring-2 disabled:bg-gray-50"
              />
            </div>

            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={!universityId}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#00A651] disabled:bg-gray-50"
            >
              <option value="">{tt("bookFeed.allCategories", "All categories")}</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>

            <select
              value={bookType}
              onChange={(e) => setBookType(e.target.value)}
              disabled={!universityId}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#00A651] disabled:bg-gray-50"
            >
              {BOOK_TYPES.map((v) => (
                <option key={v || "all"} value={v}>
                  {v === ""
                    ? tt("bookFeed.anyType", "Any type")
                    : v === "Selling"
                      ? tt("bookFeed.typeSelling", "Selling")
                      : v === "Lending"
                        ? tt("bookFeed.typeLending", "Lending")
                        : tt("bookFeed.typeDonation", "Donation")}
                </option>
              ))}
            </select>

            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              disabled={!universityId}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#00A651] disabled:bg-gray-50"
            >
              {QUALITIES.map((v) => (
                <option key={v || "anyq"} value={v}>
                  {v === "" ? tt("bookFeed.anyQuality", "Any quality") : v}
                </option>
              ))}
            </select>

            <input
              type="text"
              inputMode="numeric"
              placeholder={tt("bookFeed.year", "Year")}
              value={year}
              onChange={(e) => setYear(e.target.value)}
              disabled={!universityId}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#00A651] disabled:bg-gray-50"
            />

            <input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder={tt("bookFeed.minPrice", "Min price")}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              disabled={!universityId}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#00A651] disabled:bg-gray-50"
            />
            <input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder={tt("bookFeed.maxPrice", "Max price")}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              disabled={!universityId}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#00A651] disabled:bg-gray-50"
            />

            <div className="flex items-center gap-2 sm:col-span-2 xl:col-span-6">
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setCategoryId("");
                  setBookType("");
                  setQuality("");
                  setYear("");
                  setMinPrice("");
                  setMaxPrice("");
                }}
                disabled={!universityId}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {tt("bookFeed.clear", "Clear")}
              </button>
              <p className="text-xs text-gray-500">{tt("bookFeed.filtersAuto", "Filters apply automatically.")}</p>
            </div>
          </div>
        </div>

        {!universityId && (
          <div className="mt-10 rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-6 py-12 text-center">
            <Package className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-700">
              {tt("bookFeed.chooseUniversity", "Choose a university")}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {tt("bookFeed.chooseUniversityHint", "Use the campus selector in the top bar.")}
            </p>
          </div>
        )}

        {universityId && error && (
          <p className="mt-8 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        {universityId && !error && (
          <>
            <p className="mt-4 text-xs text-gray-500">
              {total === 0 && !isLoading
                ? tt("bookFeed.noMatch", "No books match your filters.")
                : `${tt("bookFeed.showing", "Showing")} ${items.length} ${tt("bookFeed.of", "of")} ${total} ${tt("bookFeed.listings", "listings")}`}
            </p>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => (
                <BookListingCard key={item._id} item={item} />
              ))}
            </div>

            {isLoading && items.length === 0 && (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-72 animate-pulse rounded-2xl bg-gray-100" />
                ))}
              </div>
            )}

            {isLoading && items.length > 0 && (
              <p className="mt-6 text-center text-sm text-gray-500">{tt("bookFeed.loadingMore", "Loading more...")}</p>
            )}

            {hasMore && items.length > 0 && (
              <div className="mt-8 flex justify-center">
                <Button type="button" variant="secondary" uppercase={false} onClick={loadMore} disabled={isLoading}>
                  {tt("bookFeed.loadMore", "Load more")}
                </Button>
              </div>
            )}
          </>
        )}
      </ContentWrapper>
    </SectionWrapper>
  );
}
