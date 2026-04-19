import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import FeatureHeroAds from "@/components/marketplace/FeatureHeroAds";
import { ResponsiveCategoryRow } from "@/components/marketplace/ResponsiveCategoryRow";
import { SectionHeader } from "@/components/marketplace/SectionHeader";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import CampusShopCard from "@/modules/marketplace/components/CampusShopCard";
import { ResponsiveCardsGrid } from "@/components/marketplace/ResponsiveCardsGrid";
import type { BuySellCategory } from "@/types/buy-sell";
import type {
  MarketplaceFood,
  MarketplaceShopListItem,
} from "@/types/marketplace";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";
import FoodListingCard from "../components/FoodListingCard";

type Props = {
  universityId: string | null;
  foodShops: MarketplaceShopListItem[];
  categories: BuySellCategory[];
  foods: MarketplaceFood[];
  activeCategoryId?: string;
};

function itemTitle(f: MarketplaceFood): string {
  return f.title || f.name || "—";
}

export default async function CampusFoodHomeTemplate({
  universityId,
  foodShops,
  categories,
  foods,
  activeCategoryId,
}: Props) {
  const t = await getTranslations("common.campusFood");

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
            { label: t("breadcrumbFood"), href: "/food" },
          ]}
        />

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-gray-900">
              {t("title")}
            </h2>
            <p className="mt-1 text-sm text-gray-500">{t("subtitle")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/marketplace"
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-[#00A651] hover:text-[#00A651]"
            >
              {t("linkMart")}
            </Link>
            <Link
              href="/buy-sell"
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-[#00A651] hover:text-[#00A651]"
            >
              {t("linkBuySell")}
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
                title={t("outletsTitle")}
                subtitle={t("outletsSub")}
              />
              {foodShops.length === 0 ? (
                <p className="mt-4 rounded-xl border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
                  {t("emptyOutlets")}
                </p>
              ) : (
                <div className="mt-4">
                  <ResponsiveCardsGrid>
                    {foodShops.map((s) => (
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
                title={t("categoriesTitle")}
                subtitle={t("categoriesSub")}
              />
              <div className="mt-4">
                <ResponsiveCategoryRow>
                  {[
                    <Link
                      key="all"
                      href="/food"
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                        !activeCategoryId
                          ? "border-[#00A651] bg-emerald-50 text-[#00A651]"
                          : "border-gray-200 bg-white text-gray-700 hover:border-[#00A651] hover:text-[#00A651]"
                      }`}
                    >
                      {t("catAll")}
                    </Link>,
                    ...categories.map((c) => {
                      const active = activeCategoryId === c._id;
                      const icon = c.icon?.trim();
                      return (
                        <Link
                          key={c._id}
                          href={`/food?categoryId=${encodeURIComponent(c._id)}`}
                          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                            active
                              ? "border-[#00A651] bg-emerald-50 text-[#00A651]"
                              : "border-gray-200 bg-white text-gray-700 hover:border-[#00A651] hover:text-[#00A651]"
                          }`}
                        >
                          {icon ? (
                            <span className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full bg-gray-100">
                              <Image
                                src={icon}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="20px"
                                unoptimized={shouldUnoptimizeRemoteImage(icon)}
                              />
                            </span>
                          ) : null}
                          {c.title}
                        </Link>
                      );
                    }),
                  ]}
                </ResponsiveCategoryRow>
              </div>
            </SectionWrapper>

            <SectionWrapper
              spacing="sm"
              background="transparent"
              className="my-0 mt-10"
            >
              <SectionHeader title={t("menuTitle")} subtitle={t("menuSub")} />
              {foods.length === 0 ? (
                <p className="mt-4 rounded-xl border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
                  {t("empty")}
                </p>
              ) : (
                <div className="mt-4">
                  <ResponsiveCardsGrid>
                    {foods.map((f) => (
                      <FoodListingCard
                        key={f._id}
                        item={f}
                        title={itemTitle(f)}
                      />
                    ))}
                  </ResponsiveCardsGrid>
                </div>
              )}
            </SectionWrapper>
          </>
        )}
      </ContentWrapper>
    </SectionWrapper>
  );
}
