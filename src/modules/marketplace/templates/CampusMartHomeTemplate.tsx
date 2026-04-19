import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import FeatureHeroAds from "@/components/marketplace/FeatureHeroAds";
import { ResponsiveCategoryRow } from "@/components/marketplace/ResponsiveCategoryRow";
import { SectionHeader } from "@/components/marketplace/SectionHeader";
import { ResponsiveCardsGrid } from "@/components/marketplace/ResponsiveCardsGrid";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import type { BuySellCategory } from "@/types/buy-sell";
import type {
  MarketplaceProduct,
  MarketplaceShopListItem,
} from "@/types/marketplace";
import CampusShopCard from "../components/CampusShopCard";
import RetailProductCard from "../components/RetailProductCard";

type Props = {
  universityId: string | null;
  categories: BuySellCategory[];
  shops: MarketplaceShopListItem[];
  featured: MarketplaceProduct[];
  newArrivals: MarketplaceProduct[];
};

export default async function CampusMartHomeTemplate({
  universityId,
  categories,
  shops,
  featured,
  newArrivals,
}: Props) {
  const t = await getTranslations("common.campusMart");

  return (
    <SectionWrapper spacing="none" background="transparent" className="my-0">
      <ContentWrapper
        maxWidth="max-w-7xl mx-auto"
        padding="md"
        className="pb-16 pt-2"
      >
        <AppBreadcrumb
          items={[
            { label: t("breadcrumbHome"), href: "/" },
            { label: t("breadcrumbMart"), href: "/marketplace" },
          ]}
        />

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-gray-900">
              {t("title")}
            </h2>
            <p className="mt-1 text-sm text-gray-500">{t("subtitle")}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/marketplace/shop/create"
              className="rounded-lg bg-[#00A651] px-4 py-2 text-sm font-semibold text-white active:brightness-95"
            >
              {t("ctaOpenShop")}
            </Link>
            <Link
              href="/food"
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-[#00A651] hover:text-[#00A651]"
            >
              {t("ctaFood")}
            </Link>
            <Link
              href="/buy-sell"
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-[#00A651] hover:text-[#00A651]"
            >
              {t("ctaBuySell")}
            </Link>
          </div>
        </div>

        {!universityId ? (
          <div className="mt-8 rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-6 py-12 text-center">
            <p className="text-sm font-medium text-gray-700">
              {t("selectUniversity")}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {t("selectUniversityHint")}
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
                title={t("categoriesTitle")}
                subtitle={t("categoriesSub")}
                viewAllHref="/marketplace/products"
                viewAllLabel={t("seeAllProducts")}
              />
              {categories.length > 0 ? (
                <div className="mt-4">
                  <ResponsiveCategoryRow>
                    {[
                      <Link
                        key="all"
                        href="/marketplace/products"
                        className="rounded-full border border-[#00A651] bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-[#00A651]"
                      >
                        {t("categoryAll")}
                      </Link>,
                      ...categories.slice(0, 16).map((c) => (
                        <Link
                          key={c._id}
                          href={`/marketplace/products?categoryId=${encodeURIComponent(c._id)}`}
                          className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-[#00A651] hover:text-[#00A651]"
                        >
                          {c.title}
                        </Link>
                      )),
                    ]}
                  </ResponsiveCategoryRow>
                </div>
              ) : (
                <p className="mt-4 text-sm text-gray-500">
                  {t("noCategories")}
                </p>
              )}
            </SectionWrapper>

            <SectionWrapper
              spacing="sm"
              background="transparent"
              className="my-0 mt-10"
            >
              <SectionHeader
                title={t("storesTitle")}
                subtitle={t("storesSub")}
                viewAllHref="/marketplace/shops"
              />
              {shops.length === 0 ? (
                <p className="mt-4 rounded-xl border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
                  {t("emptyShops")}
                </p>
              ) : (
                <div className="mt-4">
                  <ResponsiveCardsGrid>
                    {shops.slice(0, 8).map((s) => (
                      <CampusShopCard
                        key={s._id}
                        shop={s}
                        openLabel={t("openNow")}
                        closedLabel={t("closed")}
                        minOrderLabel={t("minOrder")}
                      />
                    ))}
                  </ResponsiveCardsGrid>
                </div>
              )}
            </SectionWrapper>

            <SectionWrapper
              spacing="sm"
              background="transparent"
              className="my-0 mt-10"
            >
              <SectionHeader
                title={t("featuredTitle")}
                subtitle={t("featuredSub")}
                viewAllHref="/marketplace/products?featured=1"
              />
              {featured.length === 0 ? (
                <p className="mt-4 rounded-xl border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
                  {t("emptyProducts")}
                </p>
              ) : (
                <div className="mt-4">
                  <ResponsiveCardsGrid>
                    {featured.slice(0, 8).map((p) => (
                      <RetailProductCard
                        key={p._id}
                        product={p}
                        negotiableLabel={t("negotiable")}
                        featuredLabel={t("featuredBadge")}
                      />
                    ))}
                  </ResponsiveCardsGrid>
                </div>
              )}
            </SectionWrapper>

            <SectionWrapper
              spacing="sm"
              background="transparent"
              className="my-0 mt-10"
            >
              <SectionHeader
                title={t("newTitle")}
                subtitle={t("newSub")}
                viewAllHref="/marketplace/products?sort=newest"
              />
              {newArrivals.length === 0 ? (
                <p className="mt-4 rounded-xl border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
                  {t("emptyProducts")}
                </p>
              ) : (
                <div className="mt-4">
                  <ResponsiveCardsGrid>
                    {newArrivals.slice(0, 8).map((p) => (
                      <RetailProductCard
                        key={p._id}
                        product={p}
                        negotiableLabel={t("negotiable")}
                        featuredLabel={t("featuredBadge")}
                      />
                    ))}
                  </ResponsiveCardsGrid>
                </div>
              )}
            </SectionWrapper>

            <SectionWrapper
              spacing="sm"
              background="transparent"
              className="my-0 mt-10"
            >
              <div className="rounded-2xl border border-gray-100 bg-gray-50/80 px-5 py-5">
                <p className="text-sm font-semibold text-gray-900">
                  {t("buySellNoteTitle")}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {t("buySellNoteBody")}
                </p>
                <Link
                  href="/buy-sell"
                  className="mt-3 inline-block text-sm font-semibold text-[#00A651] hover:underline"
                >
                  {t("buySellNoteCta")}
                </Link>
              </div>
            </SectionWrapper>
          </>
        )}
      </ContentWrapper>
    </SectionWrapper>
  );
}
