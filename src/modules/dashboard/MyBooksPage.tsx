"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useAppState } from "@/contexts/AppStateContext";
import {
  deleteBookAction,
  fetchBookCategories,
  fetchCreatorOwnBooks,
  restoreBookToShelfAction,
} from "@/services/books";
import type { BookListing } from "@/types/book";
import type { BuySellCategory } from "@/types/buy-sell";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";
import { Pagination } from "@/components/ui";

// MVP pilot: only Sell + Showcase listings are managed here.
const BOOK_TYPES = ["", "Selling", "Library Only"] as const;
const QUALITIES = ["", "New", "Like New", "Good", "Acceptable"] as const;
const STATUSES = ["", "Pending", "Approved", "Rejected", "Suspended", "Flagged"] as const;
const SHELF_TABS = [
  { value: "", label: "All" },
  { value: "on_shelf", label: "Showcase" },
  { value: "promoted", label: "Listed for sale" },
  { value: "sold_out", label: "Sold out" },
] as const;
function formatMoney(n: number) {
  return `৳${n.toLocaleString()}`;
}

function typeLabel(t: string) {
  if (t === "Selling") return "Sell";
  if (t === "Lending") return "Lend";
  if (t === "Donation") return "Donate";
  if (t === "Swap") return "Swap";
  if (t === "Library Only") return "Showcase";
  return t || "—";
}

export default function MyBooksPage() {
  const t = useTranslations("common");
  const tt = (key: string, fallback: string) =>
    t.has(key) ? t(key) : fallback;
  const { state } = useAppState();

  const universityId =
    state.university.selected?._id ?? state.user.profile?.university?._id;

  const [categories, setCategories] = useState<BuySellCategory[]>([]);
  const [items, setItems] = useState<BookListing[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchKey, setSearchKey] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [bookType, setBookType] = useState("");
  const [quality, setQuality] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [shelfStatusFilter, setShelfStatusFilter] = useState("");
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const limit = 15;

  const buildApiParams = (nextPage: number, shelf: string) => ({
    page: nextPage,
    limit,
    searchKey: searchKey.trim() || undefined,
    category: categoryId || undefined,
    type: bookType || undefined,
    quality: quality || undefined,
    status: statusFilter || undefined,
    shelfStatus: shelf || undefined,
    university: universityId,
  });

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetchBookCategories();
        setCategories(res.data ?? []);
      } catch {
        setCategories([]);
      }
    })();
  }, []);

  const fetchPage = async (nextPage: number, shelfArg?: string) => {
    const shelf = shelfArg ?? shelfStatusFilter;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCreatorOwnBooks(buildApiParams(nextPage, shelf));
      const rows = Array.isArray(res.data) ? res.data : [];
      setTotal(typeof res.total === "number" ? res.total : rows.length);
      setItems(rows);
      setPage(nextPage);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : tt("myBooks.failedLoad", "Failed to load books."),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- apply filters manually
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const selectShelfTab = (value: string) => {
    setShelfStatusFilter(value);
    void fetchPage(1, value);
  };

  // Restore a promoted/for-sale listing back to the bookshelf (un-sell / cancel).
  const restoreToShelf = async (book: BookListing) => {
    setBusyId(book._id);
    setActionMsg(null);
    const res = await restoreBookToShelfAction(book._id);
    setBusyId(null);
    if (res.success) {
      setActionMsg(`"${book.title}" moved back to your bookshelf.`);
      void fetchPage(page);
    } else {
      setActionMsg(res.message ?? "Could not restore this book.");
    }
  };

  const removeListing = async (book: BookListing) => {
    if (
      !window.confirm(
        `Remove "${book.title}"? This hides the listing from the marketplace.`,
      )
    ) {
      return;
    }
    setBusyId(book._id);
    setActionMsg(null);
    const res = await deleteBookAction(book._id);
    setBusyId(null);
    if (res.success) {
      setActionMsg(`"${book.title}" removed.`);
      void fetchPage(page);
    } else {
      setActionMsg(res.message ?? "Could not remove this book.");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            {tt("myBooks.title", "My Books")}
          </h1>
          <p className="text-sm text-gray-500">
            {tt("myBooks.subtitle", "Your textbook listings.")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/my-books/new"
            className="rounded-lg bg-[#E30B12] px-4 py-2 text-sm font-semibold text-white active:brightness-95"
          >
            {tt("myBooks.newListing", "List a book")}
          </Link>
          <Link
            href="/my-library"
            className="text-sm font-semibold text-gray-700 hover:text-gray-900"
          >
            My library
          </Link>
          <Link
            href="/my-book-lent"
            className="text-sm font-semibold text-gray-700 hover:text-gray-900"
          >
            Lent out
          </Link>
          <Link
            href="/my-book-borrowed"
            className="text-sm font-semibold text-gray-700 hover:text-gray-900"
          >
            Borrowed
          </Link>
          <Link
            href="/my-book-donations"
            className="text-sm font-semibold text-gray-700 hover:text-gray-900"
          >
            Donations
          </Link>
          <Link
            href="/books"
            className="text-sm font-semibold text-[#E30B12] hover:underline"
          >
            {tt("myBooks.browse", "Browse books")} →
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex min-w-[200px] flex-[2] flex-col gap-1">
            <span className="text-xs font-medium text-gray-500">
              {tt("myBooks.search", "Search")}
            </span>
            <input
              type="search"
              placeholder={tt(
                "myBooks.searchPlaceholder",
                "Title, author, description…",
              )}
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm outline-none focus:border-[#E30B12]"
            />
          </label>
          <label className="flex min-w-[160px] flex-1 flex-col gap-1">
            <span className="text-xs font-medium text-gray-500">
              {tt("myBooks.category", "Category")}
            </span>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm outline-none focus:border-[#E30B12]"
            >
              <option value="">{tt("myBooks.all", "All")}</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-[130px] flex-1 flex-col gap-1">
            <span className="text-xs font-medium text-gray-500">
              {tt("myBooks.type", "Type")}
            </span>
            <select
              value={bookType}
              onChange={(e) => setBookType(e.target.value)}
              className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm outline-none focus:border-[#E30B12]"
            >
              {BOOK_TYPES.map((x) => (
                <option key={x || "any-type"} value={x}>
                  {x ? typeLabel(x) : tt("myBooks.any", "Any")}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-[130px] flex-1 flex-col gap-1">
            <span className="text-xs font-medium text-gray-500">
              {tt("myBooks.quality", "Quality")}
            </span>
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm outline-none focus:border-[#E30B12]"
            >
              {QUALITIES.map((q) => (
                <option key={q || "any-q"} value={q}>
                  {q || tt("myBooks.any", "Any")}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-[130px] flex-1 flex-col gap-1">
            <span className="text-xs font-medium text-gray-500">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-200 px-2.5 py-2 text-sm outline-none focus:border-[#E30B12]"
            >
              {STATUSES.map((s) => (
                <option key={s || "any-st"} value={s}>
                  {s || tt("myBooks.any", "Any")}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => void fetchPage(1)}
            className="rounded-lg bg-[#E30B12] px-4 py-2 text-sm font-semibold text-white active:brightness-95"
          >
            {tt("myBooks.apply", "Apply")}
          </button>
        </div>
      </div>

      {/* Shelf-status tabs */}
      <div className="flex flex-wrap gap-2">
        {SHELF_TABS.map((tab) => {
          const isActive = shelfStatusFilter === tab.value;
          return (
            <button
              key={tab.value || "all"}
              type="button"
              onClick={() => selectShelfTab(tab.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                isActive
                  ? "bg-[#E30B12] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {error ? (
        <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {actionMsg ? (
        <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
          {actionMsg}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-gray-500">
          {tt("myBooks.loading", "Loading your books…")}
        </p>
      ) : items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-12 text-center text-sm text-gray-500">
          {tt(
            "myBooks.empty",
            "No books yet. List a textbook to share with your campus.",
          )}
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/90 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="w-16 px-4 py-3 font-medium" aria-hidden />
                  <th className="px-4 py-3 font-medium">
                    {tt("myBooks.book", "Book")}
                  </th>
                  <th className="px-4 py-3 font-medium">
                    {tt("myBooks.type", "Type")}
                  </th>
                  <th className="px-4 py-3 font-medium text-right">
                    {tt("myBooks.price", "Price")}
                  </th>
                  <th className="px-4 py-3 font-medium">
                    {tt("myBooks.status", "Status")}
                  </th>
                  <th className="w-28 px-4 py-3 font-medium" />
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
                  const basePrice = item.price ?? 0;
                  const showPrice =
                    item.type === "Donation" ||
                    item.type === "Library Only" ||
                    basePrice <= 0;
                  const isShowcase = item.type === "Library Only";
                  const isSold = item.shelfStatus === "sold_out";
                  // Any live transactional listing can be reverted to the shelf.
                  const canRestore = !isShowcase && !isSold;
                  const isBusy = busyId === item._id;
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
                            <div className="flex h-full items-center justify-center text-xs text-gray-300">
                              —
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="max-w-[280px] px-4 py-2.5">
                        <p className="line-clamp-2 font-medium text-gray-900">
                          {item.title}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-400">
                          {tt("myBooks.updated", "Updated")} {updated}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-gray-600">
                        {typeLabel(item.type)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-right font-semibold tabular-nums text-[#E30B12]">
                        {showPrice ? (
                          <span>Free</span>
                        ) : (
                          <>
                            {item.discountPrice != null &&
                            basePrice > 0 &&
                            item.discountPrice < basePrice ? (
                              <>
                                <span>
                                  ৳{item.discountPrice.toLocaleString()}
                                </span>
                                <span className="ml-1 text-xs font-normal text-gray-400 line-through">
                                  ৳{basePrice.toLocaleString()}
                                </span>
                              </>
                            ) : (
                              formatMoney(basePrice)
                            )}
                          </>
                        )}
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
                        <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
                          {isShowcase ? (
                            <Link
                              href="/my-library"
                              className="font-semibold text-[#E30B12] hover:underline"
                            >
                              {tt("myBooks.promote", "Promote")}
                            </Link>
                          ) : null}
                          {canRestore ? (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => void restoreToShelf(item)}
                              title={tt(
                                "myBooks.restoreHint",
                                "Stop selling and keep this book on your bookshelf.",
                              )}
                              className="font-semibold text-amber-700 hover:underline disabled:opacity-50"
                            >
                              {isBusy
                                ? "…"
                                : tt("myBooks.restore", "Restore to shelf")}
                            </button>
                          ) : null}
                          {!isSold ? (
                            <Link
                              href={`/my-books/${item._id}/edit`}
                              className="font-semibold text-gray-800 hover:underline"
                            >
                              {tt("myBooks.edit", "Edit")}
                            </Link>
                          ) : null}
                          <Link
                            href={`/books/${item._id}`}
                            className="font-semibold text-[#E30B12] hover:underline"
                          >
                            {tt("myBooks.view", "View")}
                          </Link>
                          {!isSold ? (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => void removeListing(item)}
                              className="font-semibold text-red-600 hover:underline disabled:opacity-50"
                            >
                              {tt("myBooks.delete", "Delete")}
                            </button>
                          ) : null}
                        </div>
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
            {tt("myBooks.showing", "Showing")} {(page - 1) * limit + 1}–
            {Math.min(page * limit, total)} {tt("myBooks.of", "of")} {total}
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
