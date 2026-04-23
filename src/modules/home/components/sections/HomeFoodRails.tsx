"use client";

import { useEffect, useState } from "react";
import { UtensilsCrossed } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SectionHeader } from "@/components/marketplace/SectionHeader";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import { useAppState } from "@/contexts/AppStateContext";
import { useTranslations } from "next-intl";
import { ResponsiveCardsGrid } from "@/components/marketplace/ResponsiveCardsGrid";
import FoodListingCard from "@/modules/food/components/FoodListingCard";
import CampusShopCard from "@/modules/marketplace/components/CampusShopCard";
import {
  fetchFoodOutletShops,
  fetchMarketplaceFoods,
} from "@/services/marketplace";
import type {
  MarketplaceFood,
  MarketplaceShopListItem,
} from "@/types/marketplace";

const ROW = 4;

function foodTitle(f: MarketplaceFood): string {
  return f.title || f.name || "—";
}

export function HomeFoodRails() {
  const t = useTranslations("common");
  const tt = (key: string, fallback: string) =>
    t.has(key) ? t(key) : fallback;
  const { state } = useAppState();
  const universityId = state.university.selected?._id;

  const [outlets, setOutlets] = useState<MarketplaceShopListItem[]>([]);
  const [foods, setFoods] = useState<MarketplaceFood[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!universityId) {
      setOutlets([]);
      setFoods([]);
      setError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        const [outletRes, foodRes] = await Promise.all([
          fetchFoodOutletShops(universityId, 1, ROW),
          fetchMarketplaceFoods(universityId, 1, ROW),
        ]);
        if (cancelled) return;
        setOutlets(outletRes.data ?? []);
        setFoods(foodRes.data ?? []);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load food.");
          setOutlets([]);
          setFoods([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [universityId]);

  const openLabel = tt("campusFood.openNow", "Open");
  const closedLabel = tt("campusFood.closed", "Closed");
  const minOrderLabel = tt("campusFood.minOrder", "Min. order");

  if (!universityId) {
    return (
      <section id="home-food" aria-labelledby="home-food-heading">
        <SectionWrapper
          spacing="none"
          background="transparent"
          className="my-0 bg-amber-50/40 py-12 md:py-16"
        >
          <ContentWrapper
            maxWidth="max-w-7xl mx-auto"
            padding="none"
            className="px-4 md:px-8"
          >
            <div className="flex items-start gap-4 rounded-2xl border border-dashed border-amber-200/80 bg-white p-8">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                <UtensilsCrossed className="h-6 w-6" aria-hidden />
              </div>
              <div>
                <h2
                  id="home-food-heading"
                  className="text-lg font-bold text-gray-900 md:text-xl"
                >
                  {tt("homeRails.foodTitle", "Campus food & dining")}
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  {tt(
                    "homeRails.foodNeedCampus",
                    "Select your university to see dining outlets and menu items for your campus.",
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
    <section id="home-food" aria-labelledby="home-food-heading">
      <SectionWrapper
        spacing="none"
        background="transparent"
        className="my-0 bg-amber-50/40 py-12 md:py-16"
      >
        <ContentWrapper
          maxWidth="max-w-7xl mx-auto"
          padding="none"
          className="px-4 md:px-8"
        >
          <div className="flex flex-col gap-2 border-b border-amber-200/60 pb-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-800">
                {tt("landing.food", "Food")}
              </p>
              <h2
                id="home-food-heading"
                className="mt-2 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl"
              >
                {tt("landing.foodIntro", "Restaurants, halls & menu items")}
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-gray-600 md:text-base">
                {tt(
                  "landing.foodOutlets",
                  "Food outlets and dishes from approved campus vendors — separate from general retail on Campus Mart.",
                )}
              </p>
            </div>
            <Link
              href="/food"
              className="text-sm font-bold text-[#00A651] hover:underline"
            >
              {tt("landing.browseAllFood", "Browse all food")} →
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
                title={tt("landing.placesToEat", "Places to eat")}
                subtitle={tt(
                  "landing.foodOutlets",
                  "Dining outlets on your campus.",
                )}
                viewAllHref="/food"
              />
              {loading && outlets.length === 0 ? (
                <div className="mt-4 hidden md:grid lg:hidden gap-3 grid-cols-5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-56 animate-pulse rounded-2xl bg-white/80"
                    />
                  ))}
                </div>
              ) : null}
              {loading && outlets.length === 0 ? (
                <div className="mt-4 hidden lg:grid gap-3 grid-cols-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-56 animate-pulse rounded-2xl bg-white/80"
                    />
                  ))}
                </div>
              ) : null}
              {loading && outlets.length === 0 ? (
                <div className="mt-4 md:hidden">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-56 animate-pulse rounded-2xl bg-white/80"
                      style={{
                        display: "inline-block",
                        width: "calc(42.86% - 10px)",
                        marginRight: "16px",
                      }}
                    />
                  ))}
                </div>
              ) : null}
              {outlets.length === 0 && !loading ? (
                <p className="mt-4 rounded-xl border border-dashed border-amber-200/80 bg-white px-4 py-10 text-center text-sm text-gray-500">
                  {tt(
                    "homeRails.foodEmptyOutlets",
                    "No food outlets listed yet.",
                  )}
                </p>
              ) : null}
              {outlets.length > 0 ? (
                <div className="mt-4">
                  <ResponsiveCardsGrid>
                    {outlets.slice(0, ROW).map((s) => (
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
                title={tt("landing.fromTheMenu", "From the menu")}
                subtitle={tt(
                  "landing.dishesAndItems",
                  "Dishes and items you can order.",
                )}
                viewAllHref="/food"
              />
              {loading && foods.length === 0 ? (
                <div className="mt-4 hidden md:grid lg:hidden gap-3 grid-cols-5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-72 animate-pulse rounded-2xl bg-white/80"
                    />
                  ))}
                </div>
              ) : null}
              {loading && foods.length === 0 ? (
                <div className="mt-4 hidden lg:grid gap-3 grid-cols-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-72 animate-pulse rounded-2xl bg-white/80"
                    />
                  ))}
                </div>
              ) : null}
              {loading && foods.length === 0 ? (
                <div className="mt-4 md:hidden">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-72 animate-pulse rounded-2xl bg-white/80"
                      style={{
                        display: "inline-block",
                        width: "calc(42.86% - 10px)",
                        marginRight: "16px",
                      }}
                    />
                  ))}
                </div>
              ) : null}
              {foods.length === 0 && !loading ? (
                <p className="mt-4 rounded-xl border border-dashed border-amber-200/80 bg-white px-4 py-10 text-center text-sm text-gray-500">
                  {tt("landing.foodEmptyMenu", "No menu items to show yet.")}
                </p>
              ) : null}
              {foods.length > 0 ? (
                <div className="mt-4">
                  <ResponsiveCardsGrid>
                    {foods.slice(0, ROW).map((f) => (
                      <FoodListingCard
                        key={f._id}
                        item={f}
                        title={foodTitle(f)}
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
