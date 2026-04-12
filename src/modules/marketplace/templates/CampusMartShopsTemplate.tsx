import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import type { MarketplaceShopListItem } from "@/types/marketplace";
import CampusShopCard from "../components/CampusShopCard";

type Props = {
  universityId: string | null;
  shops: MarketplaceShopListItem[];
};

export default async function CampusMartShopsTemplate({ universityId, shops }: Props) {
  const t = await getTranslations("common.campusMart");

  return (
    <SectionWrapper spacing="none" background="transparent" className="my-0">
      <ContentWrapper maxWidth="max-w-7xl mx-auto" padding="md" className="pb-16 pt-2">
        <AppBreadcrumb
          items={[
            { label: t("breadcrumbHome"), href: "/" },
            { label: t("breadcrumbMart"), href: "/marketplace" },
            { label: t("shopsTitle") },
          ]}
        />

        <div className="mt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#00A651]">{t("shopsKicker")}</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-gray-900">{t("shopsTitle")}</h2>
          <p className="mt-1 text-sm text-gray-500">{t("shopsSubtitle")}</p>
          <Link href="/marketplace" className="mt-3 inline-block text-sm font-semibold text-[#00A651] hover:underline">
            ← {t("backMart")}
          </Link>
        </div>

        {!universityId ? (
          <div className="mt-8 rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-6 py-12 text-center">
            <p className="text-sm text-gray-700">{t("selectUniversity")}</p>
            <p className="mt-1 text-sm text-gray-500">{t("selectUniversityHint")}</p>
          </div>
        ) : shops.length === 0 ? (
          <p className="mt-8 rounded-xl border border-dashed border-gray-200 bg-white px-4 py-12 text-center text-sm text-gray-500">
            {t("emptyShops")}
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {shops.map((s) => (
              <CampusShopCard
                key={s._id}
                shop={s}
                openLabel={t("openNow")}
                closedLabel={t("closed")}
                minOrderLabel={t("minOrder")}
              />
            ))}
          </div>
        )}
      </ContentWrapper>
    </SectionWrapper>
  );
}
