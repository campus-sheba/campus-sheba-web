"use client";

import { useEffect, useMemo, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { SectionHeader } from "@/components/marketplace/SectionHeader";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import { useAppState } from "@/contexts/AppStateContext";
import { useTranslations } from "next-intl";
import BuySellListingCard from "@/modules/buy-sell/components/BuySellListingCard";
import { fetchUserBuySellList } from "@/services/buy-sell";
import type { BuySellListing } from "@/types/buy-sell";

const PREVIEW_LIMIT = 28;
const ROW_SIZE = 8;

function sortByTimeDesc(items: BuySellListing[], field: "createdAt" | "updatedAt"): BuySellListing[] {
  return [...items].sort((a, b) => {
    const ta = Date.parse((field === "updatedAt" ? a.updatedAt ?? a.createdAt : a.createdAt) ?? "") || 0;
    const tb = Date.parse((field === "updatedAt" ? b.updatedAt ?? b.createdAt : b.createdAt) ?? "") || 0;
    return tb - ta;
  });
}

function ListingRail({
  title,
  subtitle,
  viewAllHref,
  items,
  isLoading,
  error,
  emptyHint,
}: {
  title: string;
  subtitle: string;
  viewAllHref: string;
  items: BuySellListing[];
  isLoading: boolean;
  error: string | null;
  emptyHint: string;
}) {
  return (
    <SectionWrapper spacing="sm" background="transparent" className="my-0">
      <SectionHeader title={title} subtitle={subtitle} viewAllHref={viewAllHref} />
      {error ? (
        <p className="mt-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}
      {isLoading && items.length === 0 ? (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: ROW_SIZE }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
          {emptyHint}
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.slice(0, ROW_SIZE).map((item) => (
            <BuySellListingCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </SectionWrapper>
  );
}

export function HomeMarketplaceRails() {
  const t = useTranslations("common");
  const tt = (key: string, fallback: string) => (t.has(key) ? t(key) : fallback);
  const { state } = useAppState();
  const universityId = state.university.selected?._id;

  const [raw, setRaw] = useState<BuySellListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!universityId) {
      setRaw([]);
      setError(null);
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    void (async () => {
      try {
        const res = await fetchUserBuySellList({
          university: universityId,
          page: 1,
          limit: PREVIEW_LIMIT,
        });
        if (cancelled) return;
        setRaw(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load listings.");
          setRaw([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [universityId]);

  const featured = useMemo(() => sortByTimeDesc(raw, "updatedAt").slice(0, ROW_SIZE), [raw]);
  const latest = useMemo(() => sortByTimeDesc(raw, "createdAt").slice(0, ROW_SIZE), [raw]);

  if (!universityId) {
    return (
      <section id="home-used-marketplace" aria-labelledby="home-used-marketplace-heading">
        <SectionWrapper spacing="none" background="transparent" className="my-0 bg-gray-50/90 py-12 md:py-16">
          <ContentWrapper maxWidth="max-w-7xl mx-auto" padding="none" className="px-4 md:px-8">
            <div className="flex items-start gap-4 rounded-2xl border border-dashed border-gray-200 bg-white p-8">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <ShoppingBag className="h-6 w-6" aria-hidden />
              </div>
              <div>
                <h2 id="home-used-marketplace-heading" className="text-lg font-bold text-gray-900 md:text-xl">
                  {tt("homeRails.marketplaceTitle", "Used & second-hand marketplace")}
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  {tt(
                    "homeRails.marketplaceNeedCampus",
                    "Select your university above to load featured picks and the latest used items for sale from your campus.",
                  )}
                </p>
              </div>
            </div>
          </ContentWrapper>
        </SectionWrapper>
      </section>
    );
  }

  return (
    <section id="home-used-marketplace" aria-labelledby="home-used-marketplace-heading">
      <SectionWrapper spacing="none" background="transparent" className="my-0 bg-gray-50/90 py-12 md:py-16">
        <ContentWrapper maxWidth="max-w-7xl mx-auto" padding="none" className="">
          <div className="flex flex-col gap-2 border-b border-gray-200/80 pb-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                {tt("homeRails.marketplaceKicker", "Buy & sell")}
              </p>
              <h2 id="home-used-marketplace-heading" className="mt-2 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
                {tt("homeRails.marketplaceHeadline", "Used & second-hand deals on campus")}
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-gray-600 md:text-base">
                {tt(
                  "homeRails.marketplaceIntro",
                  "Peer-to-peer listings for gadgets, furniture, notes, and everyday items — priced for students.",
                )}
              </p>
            </div>
          </div>

          <div className="mt-10 space-y-12">
            <ListingRail
              title={tt("homeRails.marketplaceFeatured", "Featured used & second-hand")}
              subtitle={tt(
                "homeRails.marketplaceFeaturedSub",
                "Recently refreshed listings your campusmates are watching.",
              )}
              viewAllHref="/buy-sell"
              items={featured}
              isLoading={isLoading}
              error={error}
              emptyHint={tt("homeRails.marketplaceEmpty", "No listings yet. Be the first to sell on your campus.")}
            />
            <ListingRail
              title={tt("homeRails.marketplaceLatest", "Latest items for sale")}
              subtitle={tt("homeRails.marketplaceLatestSub", "Newly posted second-hand picks from your university.")}
              viewAllHref="/buy-sell/all"
              items={latest}
              isLoading={isLoading}
              error={error}
              emptyHint={tt("homeRails.marketplaceEmpty", "No listings yet. Be the first to sell on your campus.")}
            />
          </div>
        </ContentWrapper>
      </SectionWrapper>
    </section>
  );
}
