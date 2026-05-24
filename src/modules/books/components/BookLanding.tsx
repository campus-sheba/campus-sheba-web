"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { BookMarked, Package, Plus } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { useAppState } from "@/contexts/AppStateContext";
import { useTranslations } from "next-intl";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import { ResponsiveCategoryRow } from "@/components/marketplace/ResponsiveCategoryRow";
import { ResponsiveCardsGrid } from "@/components/marketplace/ResponsiveCardsGrid";
import { SectionHeader } from "@/components/marketplace/SectionHeader";
import { useInView } from "@/components/marketplace/useInView";
import { fetchBookCategoriesPublic } from "@/services/books.public";
import { useBooksList } from "@/modules/books/hooks/useBooksList";
import { useBorrowableBooksList } from "@/modules/books/hooks/useBorrowableBooksList";
import { useBluebookHomeFeed } from "@/modules/books/hooks/useBluebookHomeFeed";
import { useFeedBooks } from "@/modules/books/hooks/useFeedBooks";
import type { BookListing, BookshelfDiscoverCard } from "@/types/book";
import type { BuySellCategory } from "@/types/buy-sell";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";
import BookListingCard from "./BookListingCard";
import FeatureHeroAds from "@/components/marketplace/FeatureHeroAds";

/**
 * MVP pilot scope: only Sell + Showcase + bookshelves are surfaced in the
 * buyer feed. Borrow / Swap / Donation sections are kept in the code but
 * hidden behind this flag for a later phase.
 */
const ENABLE_NON_SALE_FLOWS: boolean = false;

// ── Skeleton row ──────────────────────────────────────────────────────────────

function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <ResponsiveCardsGrid>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="aspect-[3/4] animate-pulse rounded-xl bg-gray-100"
        />
      ))}
    </ResponsiveCardsGrid>
  );
}

// ── Feed section — uses auth-required senior-picks / semester feeds ────────────

function FeedSection({
  feed,
  deptId,
  title,
  subtitle,
  viewAllHref,
}: {
  feed: "senior-picks" | "semester" | "department";
  deptId?: string;
  title: string;
  subtitle?: string;
  viewAllHref: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>({
    rootMargin: "600px 0px",
  });
  const { items, isLoading, error } = useFeedBooks({
    feed,
    deptId,
    pageSize: 8,
    enabled: inView && (feed !== "department" || Boolean(deptId)),
  });

  if (inView && !isLoading && !error && items.length === 0) return null;

  return (
    <div ref={ref}>
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
        ) : !inView || (isLoading && items.length === 0) ? (
          <div className="mt-4">
            <SkeletonGrid />
          </div>
        ) : (
          <div className="mt-4">
            <ResponsiveCardsGrid>
              {items.map((item) => (
                <BookListingCard key={item._id} item={item} />
              ))}
            </ResponsiveCardsGrid>
          </div>
        )}
      </SectionWrapper>
    </div>
  );
}

// ── Borrowable section — GET /user/books/borrowable ─────────────────────────

function BorrowableListingsSection({
  title,
  subtitle,
  viewAllHref,
  universityId,
  pageSize = 8,
}: {
  title: string;
  subtitle?: string;
  viewAllHref: string;
  universityId?: string;
  pageSize?: number;
}) {
  const { items, isLoading, error } = useBorrowableBooksList({
    universityId,
    pageSize,
    availabilityStatus: "Available",
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
      ) : isLoading && items.length === 0 ? (
        <div className="mt-4">
          <SkeletonGrid />
        </div>
      ) : items.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
          No borrowable books right now.
        </p>
      ) : (
        <div className="mt-4">
          <ResponsiveCardsGrid>
            {items.slice(0, pageSize).map((item) => (
              <BookListingCard key={item._id} item={item} />
            ))}
          </ResponsiveCardsGrid>
        </div>
      )}
    </SectionWrapper>
  );
}

// ── Static book row from Bluebook home feed ───────────────────────────────────

function FeedBooksRow({
  title,
  subtitle,
  viewAllHref,
  items,
  isLoading,
  error,
}: {
  title: string;
  subtitle?: string;
  viewAllHref: string;
  items: BookListing[];
  isLoading?: boolean;
  error?: string | null;
}) {
  if (!isLoading && !error && items.length === 0) return null;

  return (
    <SectionWrapper spacing="sm" background="transparent" className="my-0">
      <SectionHeader title={title} subtitle={subtitle} viewAllHref={viewAllHref} />
      {error ? (
        <p className="mt-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : isLoading && items.length === 0 ? (
        <div className="mt-4">
          <SkeletonGrid />
        </div>
      ) : (
        <div className="mt-4">
          <ResponsiveCardsGrid>
            {items.slice(0, 8).map((item) => (
              <BookListingCard key={item._id} item={item} />
            ))}
          </ResponsiveCardsGrid>
        </div>
      )}
    </SectionWrapper>
  );
}

function CampusBookshelvesSection({
  shelves,
  isLoading,
  error,
  tt,
}: {
  shelves: BookshelfDiscoverCard[];
  isLoading?: boolean;
  error?: string | null;
  tt: (key: string, fallback: string) => string;
}) {

  if (!isLoading && !error && shelves.length === 0) return null;

  return (
    <SectionWrapper spacing="sm" background="transparent" className="my-0">
      <SectionHeader
        title={tt("bookLanding.campusBookshelves", "Campus bookshelves")}
        subtitle={tt(
          "bookLanding.campusBookshelvesSub",
          "Student libraries sharing what they read.",
        )}
        viewAllHref="/books/libraries"
      />
      {error ? (
        <p className="mt-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : isLoading ? (
        <p className="mt-4 text-sm text-gray-500">Loading libraries…</p>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shelves.slice(0, 6).map((card) => {
            const photo = card.owner?.profileImage;
            return (
              <li key={card._id}>
                <Link
                  href={`/books/library/${card._id}`}
                  className="flex h-full items-start gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-[#E30B12]/30"
                >
                  <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E30B12]/10 text-[#E30B12]">
                    {photo ? (
                      <Image
                        src={photo}
                        alt=""
                        fill
                        className="object-cover"
                        unoptimized={shouldUnoptimizeRemoteImage(photo)}
                      />
                    ) : (
                      <BookMarked className="h-5 w-5" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900">{card.displayName}</p>
                    {card.bio ? (
                      <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
                        {card.bio}
                      </p>
                    ) : null}
                    <p className="mt-1 text-[11px] font-semibold text-gray-600">
                      Rep {card.reputationScore} · {card.followersCount} followers
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </SectionWrapper>
  );
}

function BluebookHomeSections({
  universityId,
  isLoggedIn,
  tt,
}: {
  universityId: string;
  isLoggedIn: boolean;
  tt: (key: string, fallback: string) => string;
}) {
  const { feed, isLoading, error } = useBluebookHomeFeed(universityId);

  const marketplaceItems = [
    ...(feed?.marketplace?.featured ?? []),
    ...(feed?.marketplace?.recent ?? []),
    ...(feed?.marketplace?.topRated ?? []),
  ].filter(
    (book, index, arr) => arr.findIndex((b) => b._id === book._id) === index,
  );

  return (
    <>
      <FeedBooksRow
        title={tt("bookLanding.marketplaceFeatured", "Marketplace highlights")}
        subtitle={tt(
          "bookLanding.marketplaceFeaturedSub",
          "Featured and recent books for sale on campus.",
        )}
        viewAllHref="/books/all?segment=marketplace"
        items={marketplaceItems}
        isLoading={isLoading}
        error={error}
      />
      <FeedBooksRow
        title={tt("bookLanding.showcaseRecent", "Campus showcases")}
        subtitle={tt(
          "bookLanding.showcaseRecentSub",
          "Books students display on their shelves.",
        )}
        viewAllHref="/books/all?segment=showcase"
        items={feed?.showcase?.recent ?? []}
        isLoading={isLoading}
        error={error}
      />
      {ENABLE_NON_SALE_FLOWS && (
        <FeedBooksRow
          title={tt("bookLanding.borrowRecent", "Recently listed to borrow")}
          subtitle={tt(
            "bookLanding.borrowRecentSub",
            "Lending listings from the home feed.",
          )}
          viewAllHref="/books/all?type=Lending"
          items={feed?.borrow?.recent ?? []}
          isLoading={isLoading}
          error={error}
        />
      )}
      {ENABLE_NON_SALE_FLOWS && (
        <FeedBooksRow
          title={tt("bookLanding.swapRecent", "Swap listings")}
          subtitle={tt(
            "bookLanding.swapRecentSub",
            "Recent books open for exchange.",
          )}
          viewAllHref="/books/all?segment=swap"
          items={feed?.swap?.recent ?? []}
          isLoading={isLoading}
          error={error}
        />
      )}
      <CampusBookshelvesSection
        shelves={feed?.bookshelves ?? []}
        isLoading={isLoading}
        error={error}
        tt={tt}
      />
      {isLoggedIn && (feed?.following?.length ?? 0) > 0 ? (
        <FeedBooksRow
          title={tt("bookLanding.followingStrip", "From shelves you follow")}
          subtitle={tt(
            "bookLanding.followingStripSub",
            "Recent books from libraries you follow.",
          )}
          viewAllHref="/my-library"
          items={feed?.following ?? []}
          isLoading={isLoading}
          error={error}
        />
      ) : null}
    </>
  );
}

// ── Listings section — uses public /user/books with type filter ───────────────

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
  type?: "Selling" | "Lending" | "Donation" | "Swap" | "Library Only";
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
      ) : isLoading && items.length === 0 ? (
        <div className="mt-4">
          <SkeletonGrid />
        </div>
      ) : items.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
          No listings found.
        </p>
      ) : (
        <div className="mt-4">
          <ResponsiveCardsGrid>
            {items.slice(0, pageSize).map((item) => (
              <BookListingCard key={item._id} item={item} />
            ))}
          </ResponsiveCardsGrid>
        </div>
      )}
    </SectionWrapper>
  );
}

// ── Per-category lazy section ─────────────────────────────────────────────────

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

  if (inView && !isLoading && !error && items.length === 0) return null;

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
        ) : !inView || (isLoading && items.length === 0) ? (
          <div className="mt-4">
            <SkeletonGrid />
          </div>
        ) : (
          <div className="mt-4">
            <ResponsiveCardsGrid>
              {items.slice(0, 8).map((item) => (
                <BookListingCard key={item._id} item={item} />
              ))}
            </ResponsiveCardsGrid>
          </div>
        )}
      </SectionWrapper>
    </div>
  );
}

// ── Landing page ──────────────────────────────────────────────────────────────

export default function BookLanding() {
  const t = useTranslations("common");
  const router = useRouter();
  const { state, dispatch } = useAppState();
  const universityId = state.university.selected?._id;
  const isLoggedIn = state.auth.isAuthenticated;
  const rawDept = state.user.profile?.department;
  const departmentId =
    typeof rawDept === "string"
      ? rawDept
      : rawDept && typeof rawDept === "object" && "_id" in rawDept
        ? String((rawDept as { _id: string })._id)
        : undefined;

  const tt = (key: string, fallback: string) =>
    t.has(key) ? t(key) : fallback;

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
                "Buy and sell textbooks, and build your campus library shelf.",
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={openListBook}
              className="flex items-center rounded-lg bg-[#E30B12] px-4 py-2 text-sm font-semibold text-white active:brightness-95"
            >
              <Plus className="mr-2 h-4 w-4" />
              {tt("bookLanding.listBook", "List a book")}
            </button>
            <Link
              href="/books/libraries"
              className="text-sm font-semibold text-gray-700 hover:text-gray-900"
            >
              {tt("bookLanding.campusLibraries", "Campus libraries")}
            </Link>
            <Link
              href="/my-library"
              className="text-sm font-semibold text-gray-700 hover:text-gray-900"
            >
              {tt("bookLanding.myLibrary", "My library")}
            </Link>
            <Link
              href="/books/all"
              className="text-sm font-semibold text-[#E30B12] hover:underline"
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
              <FeatureHeroAds universityId={universityId} placement="book" />
            </div>

            {/* Categories pill row */}
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
                <div className="mt-4">
                  <ResponsiveCategoryRow>
                    {Array.from({ length: 10 }).map((_, i) => (
                      <span
                        key={i}
                        className="h-9 w-28 animate-pulse rounded-full bg-gray-100"
                      />
                    ))}
                  </ResponsiveCategoryRow>
                </div>
              ) : allCategories.length > 0 ? (
                <div className="mt-4">
                  <ResponsiveCategoryRow>
                    {allCategories.slice(0, 14).map((c) => (
                      <Link
                        key={c._id}
                        href={`/books/all?category=${encodeURIComponent(c._id)}`}
                        className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-[#E30B12] hover:text-[#E30B12]"
                      >
                        {c.title}
                      </Link>
                    ))}
                  </ResponsiveCategoryRow>
                </div>
              ) : null}
            </SectionWrapper>

            <div className="mt-10 space-y-10">
              <BluebookHomeSections
                universityId={universityId}
                isLoggedIn={isLoggedIn}
                tt={tt}
              />

              {/* Senior picks — auth-gated feed (featured + top-rated) */}
              {isLoggedIn && (
                <FeedSection
                  feed="senior-picks"
                  title={tt("bookLanding.seniorPicks", "Senior picks")}
                  subtitle={tt(
                    "bookLanding.seniorPicksSub",
                    "Featured and top-rated books from your campus.",
                  )}
                  viewAllHref="/books/all"
                />
              )}

              {isLoggedIn && (
                <FeedSection
                  feed="semester"
                  title={tt("bookLanding.semesterFeed", "For your semester")}
                  subtitle={tt(
                    "bookLanding.semesterFeedSub",
                    "Books matching your department and semester.",
                  )}
                  viewAllHref="/books/all"
                />
              )}

              {isLoggedIn && departmentId ? (
                <FeedSection
                  feed="department"
                  deptId={departmentId}
                  title={tt("bookLanding.departmentFeed", "Your department")}
                  subtitle={tt(
                    "bookLanding.departmentFeedSub",
                    "All approved books in your department.",
                  )}
                  viewAllHref={`/books/all?department=${encodeURIComponent(departmentId)}`}
                />
              ) : null}

              {/* Type sections — public */}
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

              {/* Borrow / Donation / Swap sections — hidden for MVP pilot */}
              {ENABLE_NON_SALE_FLOWS && (
                <BorrowableListingsSection
                  title={tt("bookLanding.sectionLend", "Books to borrow")}
                  subtitle={tt(
                    "bookLanding.sectionLendSub",
                    "Borrow for a period — great for short-term needs.",
                  )}
                  universityId={universityId}
                  viewAllHref="/books/all?type=Lending&availabilityStatus=Available"
                  pageSize={8}
                />
              )}

              {ENABLE_NON_SALE_FLOWS && (
                <SectionWrapper
                  spacing="sm"
                  background="transparent"
                  className="my-0"
                >
                  <SectionHeader
                    title={tt("bookLanding.sectionDonate", "Free books")}
                    subtitle={tt(
                      "bookLanding.sectionDonateSub",
                      "Donations from the community — grab what you need.",
                    )}
                    viewAllHref="/books/donations"
                  />
                  <p className="mt-2 text-sm text-gray-600">
                    <Link
                      href="/books/donations"
                      className="font-semibold text-[#E30B12] hover:underline"
                    >
                      Browse the donation queue →
                    </Link>
                  </p>
                </SectionWrapper>
              )}

              {ENABLE_NON_SALE_FLOWS && (
                <ListingsSection
                  title={tt(
                    "bookLanding.sectionDonateListings",
                    "Donation listings",
                  )}
                  subtitle={tt(
                    "bookLanding.sectionDonateListingsSub",
                    "Approved donation-type books on campus.",
                  )}
                  universityId={universityId}
                  viewAllHref="/books/all?type=Donation"
                  pageSize={8}
                  type="Donation"
                />
              )}

              {ENABLE_NON_SALE_FLOWS && (
                <ListingsSection
                  title={tt("bookLanding.sectionSwap", "Books to swap")}
                  subtitle={tt(
                    "bookLanding.sectionSwapSub",
                    "Exchange your books — find mutual swap partners.",
                  )}
                  universityId={universityId}
                  viewAllHref="/books/all?type=Swap"
                  pageSize={8}
                  type="Swap"
                />
              )}

              <ListingsSection
                title={tt("bookLanding.sectionLibrary", "Personal collections")}
                subtitle={tt(
                  "bookLanding.sectionLibrarySub",
                  "Showcase-only books from campus readers.",
                )}
                universityId={universityId}
                viewAllHref="/books/all?type=Library+Only"
                pageSize={8}
                type="Library Only"
              />
            </div>
          </>
        )}
      </ContentWrapper>
    </SectionWrapper>
  );
}
