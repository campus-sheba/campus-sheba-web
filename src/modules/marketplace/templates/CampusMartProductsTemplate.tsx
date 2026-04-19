import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import { ResponsiveCardsGrid } from "@/components/marketplace/ResponsiveCardsGrid";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import type { MarketplaceProduct } from "@/types/marketplace";
import RetailProductCard from "../components/RetailProductCard";

type Props = {
  universityId: string | null;
  products: MarketplaceProduct[];
  filterSummary?: string;
};

export default async function CampusMartProductsTemplate({
  universityId,
  products,
  filterSummary,
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
            { label: t("productsTitle") },
          ]}
        />

        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#00A651]">
            {t("productsKicker")}
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-gray-900">
            {t("productsTitle")}
          </h2>
          {filterSummary ? (
            <p className="mt-1 text-sm text-gray-500">{filterSummary}</p>
          ) : null}
          <Link
            href="/marketplace"
            className="mt-3 inline-block text-sm font-semibold text-[#00A651] hover:underline"
          >
            ← {t("backMart")}
          </Link>
        </div>

        {!universityId ? (
          <div className="mt-8 rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-6 py-12 text-center">
            <p className="text-sm text-gray-700">{t("selectUniversity")}</p>
            <p className="mt-1 text-sm text-gray-500">
              {t("selectUniversityHint")}
            </p>
          </div>
        ) : products.length === 0 ? (
          <p className="mt-8 rounded-xl border border-dashed border-gray-200 bg-white px-4 py-12 text-center text-sm text-gray-500">
            {t("emptyProducts")}
          </p>
        ) : (
          <div className="mt-8">
            <ResponsiveCardsGrid>
              {products.map((p) => (
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
      </ContentWrapper>
    </SectionWrapper>
  );
}
