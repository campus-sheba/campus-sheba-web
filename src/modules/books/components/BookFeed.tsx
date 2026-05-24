"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Package, SlidersHorizontal, X } from "lucide-react";
import { useAppState } from "@/contexts/AppStateContext";
import { useTranslations } from "next-intl";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import { Pagination } from "@/components/ui";
import { fetchBookCategoriesPublic } from "@/services/books.public";
import { getUniversityMetadataAction } from "@/services/user";
import { useBooksBrowse } from "@/modules/books/hooks/useBooksBrowse";
import { useBooksList } from "@/modules/books/hooks/useBooksList";
import type { BrowseSegment } from "@/types/book";
import BookListingCard from "./BookListingCard";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import type { BuySellCategory } from "@/types/buy-sell";

// MVP pilot: only Sell + Showcase are browsable. Lend/Donate/Swap kept in
// TYPE_LABELS for back-compat but not offered as filter options.
const BOOK_TYPES = ["", "Selling", "Library Only"] as const;

const QUALITIES = ["", "New", "Like New", "Good", "Acceptable"] as const;
const AVAILABILITIES = ["", "Available", "Borrowed", "Reserved"] as const;
const BROWSE_SEGMENTS = [
  "marketplace",
  "showcase",
  "selling",
  "lending",
  "donation",
  "swap",
] as const satisfies readonly BrowseSegment[];

const TYPE_LABELS: Record<string, string> = {
  "": "Any type",
  Selling: "Selling",
  Lending: "Lending",
  Donation: "Donation",
  Swap: "Swap",
  "Library Only": "Library Only",
  "Request Based": "Request Based",
};

export default function BookFeed() {
  const t = useTranslations("common");
  const searchParams = useSearchParams();
  const { state } = useAppState();
  const tt = (key: string, fallback: string) => (t.has(key) ? t(key) : fallback);
  const universityId = state.university.selected?._id;
  const currentUserId = state.user.profile?._id;

  const [showFilters, setShowFilters] = useState(false);

  const [searchInput, setSearchInput] = useState(
    () => searchParams.get("searchKey") || "",
  );
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categories, setCategories] = useState<BuySellCategory[]>([]);
  const [categoryId, setCategoryId] = useState(
    () => searchParams.get("category") || "",
  );
  const [bookType, setBookType] = useState(() => {
    // MVP pilot: clamp any incoming ?type to the browsable set.
    const raw = searchParams.get("type") || "";
    return (BOOK_TYPES as readonly string[]).includes(raw) ? raw : "";
  });
  const [quality, setQuality] = useState(() => searchParams.get("quality") || "");
  const [semester, setSemester] = useState(() => searchParams.get("semester") || "");
  const [courseCode, setCourseCode] = useState(() => searchParams.get("courseCode") || "");
  const [availability, setAvailability] = useState(
    () => searchParams.get("availabilityStatus") || "",
  );
  const [year, setYear] = useState(() => searchParams.get("year") || "");
  const [minPrice, setMinPrice] = useState(() => searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(() => searchParams.get("maxPrice") || "");
  const [language, setLanguage] = useState(() => searchParams.get("language") || "");
  const [departmentId, setDepartmentId] = useState(
    () => searchParams.get("department") || "",
  );
  const [departments, setDepartments] = useState<{ _id: string; name: string }[]>([]);
  const [allowsExtension, setAllowsExtension] = useState(
    () => searchParams.get("allowsExtension") === "true",
  );
  const [minBorrowDays, setMinBorrowDays] = useState(
    () => searchParams.get("minBorrowDuration") || "",
  );
  const [maxBorrowDays, setMaxBorrowDays] = useState(
    () => searchParams.get("maxBorrowDuration") || "",
  );

  const parsedMinPrice =
    minPrice.trim() && Number.isFinite(Number(minPrice)) ? Number(minPrice) : undefined;
  const parsedMaxPrice =
    maxPrice.trim() && Number.isFinite(Number(maxPrice)) ? Number(maxPrice) : undefined;

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

  useEffect(() => {
    if (!universityId) {
      setDepartments([]);
      return;
    }
    void (async () => {
      try {
        const meta = await getUniversityMetadataAction(universityId);
        if (meta?.success) setDepartments(meta.departments ?? []);
      } catch {
        setDepartments([]);
      }
    })();
  }, [universityId]);

  const parsedMinBorrow =
    minBorrowDays.trim() && Number.isFinite(Number(minBorrowDays))
      ? Number(minBorrowDays)
      : undefined;
  const parsedMaxBorrow =
    maxBorrowDays.trim() && Number.isFinite(Number(maxBorrowDays))
      ? Number(maxBorrowDays)
      : undefined;

  const PAGE_SIZE = 12;
  const rawSegment = searchParams.get("segment") ?? "";
  // MVP pilot: only sell-side segments are browsable (lending/donation/swap hidden).
  const MVP_SEGMENTS: readonly BrowseSegment[] = ["marketplace", "showcase", "selling"];
  const browseSegment =
    BROWSE_SEGMENTS.includes(rawSegment as BrowseSegment) &&
    MVP_SEGMENTS.includes(rawSegment as BrowseSegment)
      ? (rawSegment as BrowseSegment)
      : null;

  const listQuery = useBooksList({
    pageSize: PAGE_SIZE,
    universityId,
    debouncedSearch,
    category: categoryId || undefined,
    type: bookType || undefined,
    quality: quality || undefined,
    semester: semester.trim() || undefined,
    courseCode: courseCode.trim() || undefined,
    language: language.trim() || undefined,
    department: departmentId || undefined,
    availabilityStatus: availability || undefined,
    year: year.trim() || undefined,
    minPrice: parsedMinPrice,
    maxPrice: parsedMaxPrice,
    allowsExtension: bookType === "Lending" && allowsExtension ? true : undefined,
    minBorrowDuration: parsedMinBorrow,
    maxBorrowDuration: parsedMaxBorrow,
    useBorrowableEndpoint: bookType === "Lending",
    enabled: !browseSegment,
  });

  const browseQuery = useBooksBrowse({
    segment: browseSegment ?? "marketplace",
    pageSize: PAGE_SIZE,
    universityId,
    debouncedSearch,
    category: categoryId || undefined,
    type: bookType || undefined,
    quality: quality || undefined,
    semester: semester.trim() || undefined,
    courseCode: courseCode.trim() || undefined,
    department: departmentId || undefined,
    year: year.trim() || undefined,
    minPrice: parsedMinPrice,
    maxPrice: parsedMaxPrice,
    enabled: Boolean(browseSegment),
  });

  const { items, total, page, totalPages, isLoading, error, goToPage } = browseSegment
    ? browseQuery
    : listQuery;

  const activeFilterCount = [
    categoryId,
    bookType,
    quality,
    semester,
    courseCode,
    availability,
    year,
    minPrice,
    maxPrice,
    language,
    departmentId,
    allowsExtension,
    minBorrowDays,
    maxBorrowDays,
  ].filter(Boolean).length;

  const clearAll = () => {
    setSearchInput("");
    setCategoryId("");
    setBookType("");
    setQuality("");
    setSemester("");
    setCourseCode("");
    setAvailability("");
    setYear("");
    setMinPrice("");
    setMaxPrice("");
    setLanguage("");
    setDepartmentId("");
    setAllowsExtension(false);
    setMinBorrowDays("");
    setMaxBorrowDays("");
  };

  return (
    <SectionWrapper spacing="none" background="transparent" className="my-0">
      <ContentWrapper
        maxWidth="max-w-7xl mx-auto"
        padding="md"
        className="pb-16 pt-2"
      >
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
              {tt(
                "bookFeed.subtitle",
                "Browse sell, lend, donation, and swap listings from your campus.",
              )}
            </p>
          </div>
        </div>

        {/* Search + filter bar */}
        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={tt(
                  "bookFeed.searchPlaceholder",
                  "Search title, author, course…",
                )}
                disabled={!universityId}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none ring-[#E30B12]/20 focus:border-[#E30B12] focus:ring-2 disabled:bg-gray-50"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              disabled={!universityId}
              className={`relative flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition disabled:opacity-50 ${showFilters ? "border-[#E30B12] bg-[#E30B12]/5 text-[#E30B12]" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {tt("bookFeed.filters", "Filters")}
              {activeFilterCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#E30B12] text-[9px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {/* Category */}
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={!universityId}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#E30B12] disabled:bg-gray-50"
              >
                <option value="">{tt("bookFeed.allCategories", "All categories")}</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </select>

              {/* Type */}
              <select
                value={bookType}
                onChange={(e) => setBookType(e.target.value)}
                disabled={!universityId}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#E30B12] disabled:bg-gray-50"
              >
                {BOOK_TYPES.map((v) => (
                  <option key={v || "all"} value={v}>
                    {TYPE_LABELS[v]}
                  </option>
                ))}
              </select>

              {/* Quality */}
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                disabled={!universityId}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#E30B12] disabled:bg-gray-50"
              >
                {QUALITIES.map((v) => (
                  <option key={v || "anyq"} value={v}>
                    {v === "" ? tt("bookFeed.anyQuality", "Any quality") : v}
                  </option>
                ))}
              </select>

              {/* Availability — only relevant for Lending (hidden for MVP) */}
              {bookType === "Lending" ? (
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  disabled={!universityId}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#E30B12] disabled:bg-gray-50"
                >
                  {AVAILABILITIES.map((v) => (
                    <option key={v || "anyav"} value={v}>
                      {v === ""
                        ? tt("bookFeed.anyAvailability", "Any availability")
                        : v}
                    </option>
                  ))}
                </select>
              ) : null}

              {/* Semester */}
              <input
                type="text"
                placeholder={tt("bookFeed.semester", "Semester (e.g. 3rd)")}
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                disabled={!universityId}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#E30B12] disabled:bg-gray-50"
              />

              {/* Course code */}
              <input
                type="text"
                placeholder={tt("bookFeed.courseCode", "Course (e.g. CSE-311)")}
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                disabled={!universityId}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#E30B12] disabled:bg-gray-50"
              />

              <input
                type="text"
                placeholder={tt("bookFeed.language", "Language (e.g. English)")}
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={!universityId}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#E30B12] disabled:bg-gray-50"
              />

              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                disabled={!universityId}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#E30B12] disabled:bg-gray-50"
              >
                <option value="">{tt("bookFeed.allDepartments", "All departments")}</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>

              {bookType === "Lending" ? (
                <>
                  <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm">
                    <input
                      type="checkbox"
                      checked={allowsExtension}
                      onChange={(e) => setAllowsExtension(e.target.checked)}
                      className="rounded border-gray-300 text-[#E30B12]"
                    />
                    {tt("bookFeed.allowsExtension", "Allows extension")}
                  </label>
                  <input
                    type="number"
                    min={1}
                    placeholder={tt("bookFeed.minBorrowDays", "Min borrow days")}
                    value={minBorrowDays}
                    onChange={(e) => setMinBorrowDays(e.target.value)}
                    disabled={!universityId}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#E30B12] disabled:bg-gray-50"
                  />
                  <input
                    type="number"
                    min={1}
                    placeholder={tt("bookFeed.maxBorrowDays", "Max borrow days")}
                    value={maxBorrowDays}
                    onChange={(e) => setMaxBorrowDays(e.target.value)}
                    disabled={!universityId}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#E30B12] disabled:bg-gray-50"
                  />
                </>
              ) : null}

              {/* Year purchased */}
              <input
                type="text"
                inputMode="numeric"
                placeholder={tt("bookFeed.year", "Year purchased")}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                disabled={!universityId}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#E30B12] disabled:bg-gray-50"
              />

              {/* Price range */}
              <div className="flex gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder={tt("bookFeed.minPrice", "Min ৳")}
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  disabled={!universityId}
                  className="w-1/2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#E30B12] disabled:bg-gray-50"
                />
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder={tt("bookFeed.maxPrice", "Max ৳")}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  disabled={!universityId}
                  className="w-1/2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#E30B12] disabled:bg-gray-50"
                />
              </div>

              {/* Clear */}
              <div className="flex items-center gap-2 sm:col-span-2 xl:col-span-4">
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    disabled={!universityId}
                    className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" />
                    {tt("bookFeed.clearFilters", `Clear ${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""}`)}
                  </button>
                )}
                <p className="text-xs text-gray-400">
                  {tt("bookFeed.filtersAuto", "Filters apply automatically.")}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* No university selected */}
        {!universityId && (
          <div className="mt-10 rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-6 py-12 text-center">
            <Package className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-700">
              {tt("bookFeed.chooseUniversity", "Choose a university")}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {tt(
                "bookFeed.chooseUniversityHint",
                "Use the campus selector in the top bar.",
              )}
            </p>
          </div>
        )}

        {universityId && error && (
          <p className="mt-8 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {universityId && !error && (
          <>
            <p className="mt-4 text-xs text-gray-500">
              {total === 0 && !isLoading
                ? tt("bookFeed.noMatch", "No books match your filters.")
                : `${tt("bookFeed.showing", "Showing")} ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} ${tt("bookFeed.of", "of")} ${total} ${tt("bookFeed.listings", "listings")}`}
            </p>

            {isLoading && items.length === 0 ? (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="h-72 animate-pulse rounded-xl bg-gray-100" />
                ))}
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((item) => (
                  <BookListingCard key={item._id} item={item} currentUserId={currentUserId} />
                ))}
              </div>
            )}

            {items.length > 0 && totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  disabled={isLoading}
                  onPageChange={goToPage}
                />
              </div>
            )}
          </>
        )}
      </ContentWrapper>
    </SectionWrapper>
  );
}
