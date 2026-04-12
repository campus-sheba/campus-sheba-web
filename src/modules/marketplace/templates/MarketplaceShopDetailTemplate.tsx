import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import { SectionHeader } from "@/components/marketplace/SectionHeader";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import type { MarketplaceProduct, MarketplaceShopListItem } from "@/types/marketplace";
import Image from "next/image";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";
import RetailProductCard from "../components/RetailProductCard";

type Props = {
  shop: MarketplaceShopListItem;
  products: MarketplaceProduct[];
};

export default async function MarketplaceShopDetailTemplate({ shop, products }: Props) {
  const t = await getTranslations("common.campusMart");
  const cover = shop.coverPhoto?.url || "/placeholder.jpg";
  const logo = shop.logo?.url;

  return (
    <ContentWrapper maxWidth="max-w-7xl mx-auto" padding="md">
      <AppBreadcrumb
        items={[
          { label: t("breadcrumbHome"), href: "/" },
          { label: t("breadcrumbMart"), href: "/marketplace" },
          { label: t("shopsTitle"), href: "/marketplace/shops" },
          { label: shop.name },
        ]}
      />

      <SectionWrapper spacing="sm" background="white" className="mt-6 overflow-hidden rounded-2xl border border-gray-100">
        <div className="relative aspect-[21/9] max-h-56 bg-gray-100">
          <Image
            src={cover}
            alt={shop.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 896px"
            unoptimized={shouldUnoptimizeRemoteImage(cover)}
          />
        </div>
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start md:p-6">
          {logo ? (
            <div className="relative -mt-12 h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-4 border-white bg-white shadow-md sm:mt-0 sm:h-24 sm:w-24">
              <Image
                src={logo}
                alt=""
                fill
                className="object-cover"
                sizes="96px"
                unoptimized={shouldUnoptimizeRemoteImage(logo)}
              />
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{shop.name}</h1>
            {shop.type ? <p className="mt-1 text-sm text-gray-500">{shop.type}</p> : null}
            {shop.description ? <p className="mt-3 text-sm text-gray-600">{shop.description}</p> : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <span
                className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                  shop.isOpen ? "bg-emerald-50 text-emerald-800" : "bg-gray-100 text-gray-600"
                }`}
              >
                {shop.isOpen ? t("openNow") : t("closed")}
              </span>
              {shop.minimumOrderAmount != null ? (
                <span className="rounded-md border border-gray-100 bg-gray-50 px-2.5 py-1 text-xs text-gray-700">
                  {t("minOrder")}:{" "}
                  <span className="font-semibold text-[#00A651]">
                    ৳{shop.minimumOrderAmount.toLocaleString()}
                  </span>
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper spacing="sm" background="transparent" className="my-0 mt-10">
        <SectionHeader title={t("shopShelfTitle")} subtitle={t("shopShelfSub")} />
        {products.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
            {t("emptyProducts")}
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <RetailProductCard
                key={p._id}
                product={p}
                negotiableLabel={t("negotiable")}
                featuredLabel={t("featuredBadge")}
              />
            ))}
          </div>
        )}
      </SectionWrapper>

      <div className="mt-8">
        <Link href="/marketplace/shops" className="text-sm font-semibold text-[#00A651] hover:underline">
          ← {t("shopsTitle")}
        </Link>
      </div>
    </ContentWrapper>
  );
}
