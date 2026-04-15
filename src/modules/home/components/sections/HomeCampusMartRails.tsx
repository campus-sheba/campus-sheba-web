"use client";

import { useEffect, useState } from "react";
import { Store } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SectionHeader } from "@/components/marketplace/SectionHeader";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import { useAppState } from "@/contexts/AppStateContext";
import { useTranslations } from "next-intl";
import { ResponsiveCardsGrid } from "@/components/marketplace/ResponsiveCardsGrid";
import CampusShopCard from "@/modules/marketplace/components/CampusShopCard";
import RetailProductCard from "@/modules/marketplace/components/RetailProductCard";
import {
  fetchMartRetailShops,
  fetchMarketplaceFeaturedProducts,
} from "@/services/marketplace";
import type {
  MarketplaceProduct,
  MarketplaceShopListItem,
} from "@/types/marketplace";

const ROW = 4;

export function HomeCampusMartRails() {
  const t = useTranslations("common");
  const tt = (key: string, fallback: string) =>
    t.has(key) ? t(key) : fallback;
  const { state } = useAppState();
  const universityId = state.university.selected?._id;

  const [shops, setShops] = useState<MarketplaceShopListItem[]>([]);
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!universityId) {
      setShops([]);
      setProducts([]);
      setError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        const [shopsRes, featRes] = await Promise.all([
          fetchMartRetailShops(universityId, 1, ROW),
          fetchMarketplaceFeaturedProducts(universityId, 1, ROW),
        ]);
        if (cancelled) return;
        setShops(shopsRes.data ?? []);
        setProducts(featRes.data ?? []);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Failed to load Campus Mart.",
          );
          setShops([]);
          setProducts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [universityId]);

  const negotiableLabel = tt("campusMart.negotiable", "Negotiable");
  const featuredLabel = tt("campusMart.featuredBadge", "Featured");
  const openLabel = tt("campusMart.openNow", "Open");
  const closedLabel = tt("campusMart.closed", "Closed");
  const minOrderLabel = tt("campusMart.minOrder", "Min. order");

  if (!universityId) {
    return (
      <section id="home-campus-mart" aria-labelledby="home-campus-mart-heading">
        <SectionWrapper
          spacing="none"
          background="transparent"
          className="my-0 border-t border-gray-100 bg-white py-12 md:py-16"
        >
          <ContentWrapper
            maxWidth="max-w-7xl mx-auto"
            padding="none"
            className="px-4 md:px-8"
          >
            <div className="flex items-start gap-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 p-8">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Store className="h-6 w-6" aria-hidden />
              </div>
              <div>
                <h2
                  id="home-campus-mart-heading"
                  className="text-lg font-bold text-gray-900 md:text-xl"
                >
                  {tt(
                    "homeRails.campusMartTitle",
                    "Campus Mart — shops & products",
                  )}
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  {tt(
                    "homeRails.campusMartNeedCampus",
                    "Choose your university above to see retail stores and featured products for your campus.",
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
    <section id="home-campus-mart" aria-labelledby="home-campus-mart-heading">
      <SectionWrapper
        spacing="none"
        background="transparent"
        className="my-0 border-t border-gray-100 bg-white py-12 md:py-16"
      >
        <ContentWrapper
          maxWidth="max-w-7xl mx-auto"
          padding="none"
          className="px-4 md:px-8"
        >
          <div className="flex flex-col gap-2 border-b border-gray-200/80 pb-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                {tt("homeRails.campusMartKicker", "Campus Mart")}
              </p>
              <h2
                id="home-campus-mart-heading"
                className="mt-2 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl"
              >
                {tt(
                  "homeRails.campusMartHeadline",
                  "Official shops & retail products",
                )}
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-gray-600 md:text-base">
                {tt(
                  "homeRails.campusMartIntro",
                  "Browse verified campus stores and retail listings — separate from student Buy & Sell.",
                )}
              </p>
            </div>
            <Link
              href="/marketplace"
              className="text-sm font-bold text-[#00A651] hover:underline"
            >
              {tt("homeRails.campusMartViewAll", "Open Campus Mart")} →
            </Link>
          </div>

          {error ? (
            <p className="mt-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <div className="mt-10 space-y-12">
            <SectionWrapper
              spacing="sm"
              background="transparent"
              className="my-0"
            >
              <SectionHeader
                title={tt("homeRails.campusMartStoresTitle", "Stores near you")}
                subtitle={tt(
                  "homeRails.campusMartStoresSub",
                  "Retail outlets on Campus Mart.",
                )}
                viewAllHref="/marketplace/shops"
              />
              {loading && shops.length === 0 ? (
                <div className="mt-4 hidden md:grid lg:hidden gap-3 grid-cols-5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-56 animate-pulse rounded-2xl bg-gray-100"
                    />
                  ))}
                </div>
              ) : null}
              {loading && shops.length === 0 ? (
                <div className="mt-4 hidden lg:grid gap-3 grid-cols-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-56 animate-pulse rounded-2xl bg-gray-100"
                    />
                  ))}
                </div>
              ) : null}
              {loading && shops.length === 0 ? (
                <div className="mt-4 md:hidden">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-56 animate-pulse rounded-2xl bg-gray-100"
                      style={{
                        display: "inline-block",
                        width: "calc(42.86% - 10px)",
                        marginRight: "16px",
                      }}
                    />
                  ))}
                </div>
              ) : null}
              {shops.length === 0 && !loading ? (
                <p className="mt-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
                  {tt(
                    "homeRails.campusMartEmptyShops",
                    "No stores to show yet for this campus.",
                  )}
                </p>
              ) : null}
              {shops.length > 0 ? (
                <div className="mt-4">
                  <ResponsiveCardsGrid>
                    {shops.slice(0, ROW).map((s) => (
                      <CampusShopCard
                        key={s._id}
                        shop={s}
                        openLabel={openLabel}
                        closedLabel={closedLabel}
                        minOrderLabel={minOrderLabel}
                      />
                    ))}
                  </ResponsiveCardsGrid>
                </div>
              ) : null}
            </SectionWrapper>

            <SectionWrapper
              spacing="sm"
              background="transparent"
              className="my-0"
            >
              <SectionHeader
                title={tt(
                  "homeRails.campusMartFeaturedTitle",
                  "Featured products",
                )}
                subtitle={tt(
                  "homeRails.campusMartFeaturedSub",
                  "Highlighted listings from campus shops.",
                )}
                viewAllHref="/marketplace/products?featured=1"
              />
              {loading && products.length === 0 ? (
                <div className="mt-4 hidden md:grid lg:hidden gap-3 grid-cols-5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-72 animate-pulse rounded-2xl bg-gray-100"
                    />
                  ))}
                </div>
              ) : null}
              {loading && products.length === 0 ? (
                <div className="mt-4 hidden lg:grid gap-3 grid-cols-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-72 animate-pulse rounded-2xl bg-gray-100"
                    />
                  ))}
                </div>
              ) : null}
              {loading && products.length === 0 ? (
                <div className="mt-4 md:hidden">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-72 animate-pulse rounded-2xl bg-gray-100"
                      style={{
                        display: "inline-block",
                        width: "calc(42.86% - 10px)",
                        marginRight: "16px",
                      }}
                    />
                  ))}
                </div>
              ) : null}
              {products.length === 0 && !loading ? (
                <p className="mt-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
                  {tt(
                    "homeRails.campusMartEmptyProducts",
                    "No featured products right now.",
                  )}
                </p>
              ) : null}
              {products.length > 0 ? (
                <div className="mt-4">
                  <ResponsiveCardsGrid>
                    {products.slice(0, ROW).map((p) => (
                      <RetailProductCard
                        key={p._id}
                        product={p}
                        negotiableLabel={negotiableLabel}
                        featuredLabel={featuredLabel}
                      />
                    ))}
                  </ResponsiveCardsGrid>
                </div>
              ) : null}
            </SectionWrapper>
          </div>
        </ContentWrapper>
      </SectionWrapper>
    </section>
  );
}
