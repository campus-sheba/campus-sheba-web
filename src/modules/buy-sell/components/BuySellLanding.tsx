"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Package, Plus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useAppState } from "@/contexts/AppStateContext";
import { useTranslations } from "next-intl";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import { SectionHeader } from "@/components/marketplace/SectionHeader";
import { useInView } from "@/components/marketplace/useInView";
import { fetchBuySellCategoriesPublic } from "@/services/buy-sell.public";
import { useBuySellList } from "@/modules/buy-sell/hooks/useBuySellList";
import type { BuySellCategory } from "@/types/buy-sell";
import BuySellListingCard from "./BuySellListingCard";
import { useHomeBanners } from "@/modules/home/hooks/useHomeBanners";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";

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

  const { items, isLoading, error } = useBuySellList({
    enabled: inView,
    universityId,
    debouncedSearch: "",
    pageSize: 8,
    category: category._id,
  });

  // Do not render category section when it has no listings.
  if (inView && !isLoading && !error && items.length === 0) {
    return null;
  }

  return (
    <div ref={ref}>
      <SectionWrapper spacing="sm" background="transparent" className="my-0">
        <SectionHeader
          title={category.title}
          subtitle={category.description || tt("buySellLanding.browseCategoryItems", "Browse items in this category.")}
          viewAllHref={`/buy-sell/all?category=${encodeURIComponent(category._id)}`}
        />

        {error ? (
          <p className="mt-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {!inView ? (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-72 rounded-2xl bg-gray-50" />
            ))}
          </div>
        ) : isLoading && items.length === 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-72 animate-pulse rounded-2xl bg-gray-100"
              />
            ))}
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.slice(0, 8).map((item) => (
              <BuySellListingCard key={item._id} item={item} />
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
  category,
  pageSize = 8,
}: {
  title: string;
  subtitle?: string;
  viewAllHref: string;
  universityId?: string;
  category?: string;
  pageSize?: number;
}) {
  const { items, isLoading, error } = useBuySellList({
    universityId,
    debouncedSearch: "",
    pageSize,
    category,
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
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-2xl bg-gray-100"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
          No listings found.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.slice(0, pageSize).map((item) => (
            <BuySellListingCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </SectionWrapper>
  );
}

function HeroAds({ universityId }: { universityId?: string }) {
  const { banners, isLoading, error } = useHomeBanners(universityId);

  if (!universityId) return null;
  if (error) return null;
  if (isLoading && banners.length === 0) {
    return <div className="h-[240px] animate-pulse rounded-2xl bg-gray-100" />;
  }

  const ads = (banners ?? []).slice(0, 4);
  if (ads.length === 0) return null;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="relative h-[260px] overflow-hidden rounded border border-gray-200 bg-gray-50 lg:col-span-2">
        <Image
          src={ads[0]?.photo?.url || "/placeholder.jpg"}
          alt={ads[0]?.title || "Ad"}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 66vw"
          unoptimized={shouldUnoptimizeRemoteImage(ads[0]?.photo?.url || "")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        {ads.slice(1, 3).map((b) => (
          <div
            key={b._id}
            className="relative h-[122px] overflow-hidden rounded border border-gray-200 bg-gray-50"
          >
            <Image
              src={b.photo?.url || "/placeholder.jpg"}
              alt={b.title || "Ad"}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 50vw, 33vw"
              unoptimized={shouldUnoptimizeRemoteImage(b.photo?.url || "")}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BuySellLanding() {
  const t = useTranslations("common");
  const { state } = useAppState();
  const universityId = state.university.selected?._id;
  const tt = (key: string, fallback: string) => (t.has(key) ? t(key) : fallback);

  const [categories, setCategories] = useState<BuySellCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setCategoriesLoading(true);
    setCategoriesError(null);
    try {
      const res = await fetchBuySellCategoriesPublic(1, 100);
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

  return (
    <SectionWrapper spacing="none" background="transparent" className="my-0">
      <ContentWrapper
        maxWidth="max-w-7xl mx-auto"
        padding="md"
        className="pb-16 pt-2"
      >
        <AppBreadcrumb
          items={[
            { label: tt("buySellLanding.home", "Home"), href: "/" },
            { label: tt("buySellLanding.buySell", "Buy & Sell"), href: "/buy-sell" },
          ]}
        />

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-gray-900">
              {tt("buySellLanding.buySell", "Buy & Sell")}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {tt("buySellLanding.subtitle", "Campus marketplace deals - browse by featured, latest, and categories.")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/my-buy-sell/new"
              className="rounded-lg bg-[#00A651] px-4 py-2 text-sm font-semibold text-white active:brightness-95 flex items-center"
            >
              {/* icon plus */}
              <Plus className="h-4 w-4 mr-2" />
              {tt("buySellLanding.listUsedProduct", "List your used product")}
            </Link>
            {/* <Link
              href="/buy-sell/all"
              className="text-sm font-semibold text-[#00A651] hover:underline"
            >
              Browse all →
            </Link> */}
          </div>
        </div>

        {!universityId ? (
          <div className="mt-8 rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-6 py-12 text-center">
            <Package className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-700">
              {tt("buySellLanding.chooseUniversity", "Choose a university")}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {tt("buySellLanding.chooseUniversityHint", "Use the campus selector in the top bar to see listings.")}
            </p>
          </div>
        ) : (
          <>
            <div className="mt-6">
              <HeroAds universityId={universityId} />
            </div>

            <SectionWrapper
              spacing="sm"
              background="transparent"
              className="my-0 mt-8"
            >
              <SectionHeader
                title={tt("buySellLanding.popularCategories", "Popular categories")}
                subtitle={tt("buySellLanding.popularCategoriesSub", "Jump to the category you are looking for.")}
                viewAllHref="/buy-sell/all"
                viewAllLabel={tt("buySellLanding.seeAllListings", "See all listings")}
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
                      href={`/buy-sell/all?category=${encodeURIComponent(c._id)}`}
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
                title={tt("buySellLanding.featuredProducts", "Featured Products")}
                subtitle={tt("buySellLanding.featuredProductsSub", "Popular picks from your campus.")}
                universityId={universityId}
                viewAllHref="/buy-sell/all"
                pageSize={8}
              />

              <ListingsSection
                title={tt("buySellLanding.latestProducts", "Latest Products")}
                subtitle={tt("buySellLanding.latestProductsSub", "Freshly posted items.")}
                universityId={universityId}
                viewAllHref="/buy-sell/all"
                pageSize={8}
              />

              {categoriesError ? (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-700">
                  <p className="font-semibold">{tt("buySellLanding.categoriesUnavailable", "Categories unavailable")}</p>
                  <p className="mt-1 text-red-700/90">{categoriesError}</p>
                  <button
                    type="button"
                    onClick={() => void loadCategories()}
                    className="mt-3 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white"
                  >
                    {tt("buySellLanding.retry", "Retry")}
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
                  {tt("buySellLanding.noCategories", "No categories found for Buy & Sell.")}
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
