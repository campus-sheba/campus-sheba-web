"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Package, Plus } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { useAppState } from "@/contexts/AppStateContext";
import { useTranslations } from "next-intl";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import { SectionHeader } from "@/components/marketplace/SectionHeader";
import { useInView } from "@/components/marketplace/useInView";
import { fetchBookCategoriesPublic } from "@/services/books.public";
import { useBooksList } from "@/modules/books/hooks/useBooksList";
import type { BuySellCategory } from "@/types/buy-sell";
import BookListingCard from "./BookListingCard";
import FeatureHeroAds from "@/components/marketplace/FeatureHeroAds";

function CategoryListingsSection({
  category,
  universityId,
  tt,
}: {
  category: BuySellCategory;
  universityId?: string;
  tt: (key: string, fallback: string) => string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>({
    rootMargin: "600px 0px",
  });

  const { items, isLoading, error } = useBooksList({
    enabled: inView,
    universityId,
    debouncedSearch: "",
    pageSize: 8,
    category: category._id,
  });

  if (inView && !isLoading && !error && items.length === 0) {
    return null;
  }

  return (
    <div ref={ref}>
      <SectionWrapper spacing="sm" background="transparent" className="my-0">
        <SectionHeader
          title={category.title}
          subtitle={
            category.description ||
            tt("bookLanding.browseCategory", "Browse books in this category.")
          }
          viewAllHref={`/books/all?category=${encodeURIComponent(category._id)}`}
        />

        {error ? (
          <p className="mt-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {!inView ? (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-gray-50" />
            ))}
          </div>
        ) : isLoading && items.length === 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] animate-pulse rounded-2xl bg-gray-100"
              />
            ))}
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {items.slice(0, 8).map((item) => (
              <BookListingCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </SectionWrapper>
    </div>
  );
}

function ListingsSection({
  title,
  subtitle,
  viewAllHref,
  universityId,
  pageSize = 8,
  type,
}: {
  title: string;
  subtitle?: string;
  viewAllHref: string;
  universityId?: string;
  pageSize?: number;
  /** API filter: Selling | Lending | Donation */
  type?: "Selling" | "Lending" | "Donation";
}) {
  const { items, isLoading, error } = useBooksList({
    universityId,
    debouncedSearch: "",
    pageSize,
    type,
  });

  return (
    <SectionWrapper spacing="sm" background="transparent" className="my-0">
      <SectionHeader
        title={title}
        subtitle={subtitle}
        viewAllHref={viewAllHref}
      />
      {error ? (
        <p className="mt-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {isLoading && items.length === 0 ? (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] animate-pulse rounded-2xl bg-gray-100"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
          No listings found.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.slice(0, pageSize).map((item) => (
            <BookListingCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </SectionWrapper>
  );
}

export default function BookLanding() {
  const t = useTranslations("common");
  const router = useRouter();
  const { state, dispatch } = useAppState();
  const universityId = state.university.selected?._id;
  const tt = (key: string, fallback: string) =>
    t.has(key) ? t(key) : fallback;
  const isLoggedIn = state.auth.isAuthenticated;

  const [categories, setCategories] = useState<BuySellCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setCategoriesLoading(true);
    setCategoriesError(null);
    try {
      const res = await fetchBookCategoriesPublic(1, 100);
      setCategories(res.data ?? []);
    } catch (e) {
      setCategories([]);
      setCategoriesError(
        e instanceof Error ? e.message : "Failed to load categories",
      );
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const allCategories = useMemo(() => categories, [categories]);

  const openListBook = () => {
    if (!isLoggedIn) {
      dispatch({ type: "OPEN_AUTH_MODAL", payload: { defaultTab: "login" } });
      return;
    }
    router.push("/my-books/new");
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
            { label: tt("bookLanding.home", "Home"), href: "/" },
            { label: tt("bookLanding.books", "Books"), href: "/books" },
          ]}
        />

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-gray-900">
              {tt("bookLanding.title", "Book Sheba")}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {tt(
                "bookLanding.subtitle",
                "Sell, lend, or donate textbooks on your campus.",
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={openListBook}
              className="flex items-center rounded-lg bg-[#00A651] px-4 py-2 text-sm font-semibold text-white active:brightness-95"
            >
              <Plus className="mr-2 h-4 w-4" />
              {tt("bookLanding.listBook", "List a book")}
            </button>
            <Link
              href="/books/all"
              className="text-sm font-semibold text-[#00A651] hover:underline"
            >
              {tt("bookLanding.browseAll", "Browse all")} →
            </Link>
          </div>
        </div>

        {!universityId ? (
          <div className="mt-8 rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-6 py-12 text-center">
            <Package className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-700">
              {tt("bookLanding.chooseUniversity", "Choose a university")}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {tt(
                "bookLanding.chooseUniversityHint",
                "Use the campus selector in the top bar.",
              )}
            </p>
          </div>
        ) : (
          <>
            <div className="mt-6">
              <FeatureHeroAds universityId={universityId} />
            </div>

            <SectionWrapper
              spacing="sm"
              background="transparent"
              className="my-0 mt-8"
            >
              <SectionHeader
                title={tt(
                  "bookLanding.popularCategories",
                  "Popular categories",
                )}
                subtitle={tt(
                  "bookLanding.popularCategoriesSub",
                  "Jump to a subject or genre.",
                )}
                viewAllHref="/books/all"
                viewAllLabel={tt("bookLanding.seeAll", "See all")}
              />
              {categoriesLoading && allCategories.length === 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <span
                      key={i}
                      className="h-9 w-28 animate-pulse rounded-full bg-gray-100"
                    />
                  ))}
                </div>
              ) : allCategories.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {allCategories.slice(0, 14).map((c) => (
                    <Link
                      key={c._id}
                      href={`/books/all?category=${encodeURIComponent(c._id)}`}
                      className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-[#00A651] hover:text-[#00A651]"
                    >
                      {c.title}
                    </Link>
                  ))}
                </div>
              ) : null}
            </SectionWrapper>

            <div className="mt-10 space-y-10">
              <ListingsSection
                title={tt("bookLanding.sectionSell", "Books for sale")}
                subtitle={tt(
                  "bookLanding.sectionSellSub",
                  "Buy textbooks from students on your campus.",
                )}
                universityId={universityId}
                viewAllHref="/books/all?type=Selling"
                pageSize={8}
                type="Selling"
              />

              <ListingsSection
                title={tt("bookLanding.sectionLend", "Books to borrow")}
                subtitle={tt(
                  "bookLanding.sectionLendSub",
                  "Borrow for a period — great for short-term needs.",
                )}
                universityId={universityId}
                viewAllHref="/books/all?type=Lending"
                pageSize={8}
                type="Lending"
              />

              <ListingsSection
                title={tt("bookLanding.sectionDonate", "Free books")}
                subtitle={tt(
                  "bookLanding.sectionDonateSub",
                  "Donations from the community — grab what you need.",
                )}
                universityId={universityId}
                viewAllHref="/books/all?type=Donation"
                pageSize={8}
                type="Donation"
              />

              {categoriesError ? (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-700">
                  <p className="font-semibold">
                    {tt(
                      "bookLanding.categoriesUnavailable",
                      "Categories unavailable",
                    )}
                  </p>
                  <p className="mt-1 text-red-700/90">{categoriesError}</p>
                  <button
                    type="button"
                    onClick={() => void loadCategories()}
                    className="mt-3 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white"
                  >
                    {tt("bookLanding.retry", "Retry")}
                  </button>
                </div>
              ) : categoriesLoading && allCategories.length === 0 ? (
                <div className="space-y-3">
                  <div className="h-6 w-48 rounded bg-gray-100" />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-72 animate-pulse rounded-2xl bg-gray-100"
                      />
                    ))}
                  </div>
                </div>
              ) : allCategories.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
                  {tt("bookLanding.noCategories", "No book categories found.")}
                </div>
              ) : null}

              {allCategories.map((c) => (
                <CategoryListingsSection
                  key={c._id}
                  category={c}
                  universityId={universityId}
                  tt={tt}
                />
              ))}
            </div>
          </>
        )}
      </ContentWrapper>
    </SectionWrapper>
  );
}
