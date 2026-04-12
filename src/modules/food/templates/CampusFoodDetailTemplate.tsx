import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import { ImageGallery } from "@/components/marketplace/ImageGallery";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import type { MarketplaceFood } from "@/types/marketplace";

type Props = {
  food: MarketplaceFood;
};

function titleOf(f: MarketplaceFood): string {
  return f.title || f.name || "—";
}

export default async function CampusFoodDetailTemplate({ food }: Props) {
  const t = await getTranslations("common.campusFood");
  const name = titleOf(food);
  const raw = (food.photos?.map((p) => p.url).filter(Boolean) as string[]) ?? [];
  const galleryImages = raw.length > 0 ? raw : ["/placeholder.jpg"];

  return (
    <ContentWrapper maxWidth="max-w-7xl mx-auto" padding="md">
      <AppBreadcrumb
        items={[
          { label: t("breadcrumbHome"), href: "/" },
          { label: t("breadcrumbFood"), href: "/food" },
          { label: name },
        ]}
      />

      <SectionWrapper spacing="sm" background="white" className="mt-6 rounded-2xl border border-gray-100 p-4 md:p-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <ImageGallery title={name} images={galleryImages} />
          <div className="flex flex-col gap-4">
            <span className="w-fit rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800">
              {t("detailBadge")}
            </span>
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">{name}</h1>
            {food.price != null ? (
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <p className="text-xs font-medium text-gray-500">{t("priceLabel")}</p>
                <p className="text-2xl font-bold text-[#00A651]">৳{food.price.toLocaleString()}</p>
              </div>
            ) : null}
            {food.description ? (
              <div>
                <h2 className="text-sm font-semibold text-gray-900">{t("descriptionHeading")}</h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 whitespace-pre-wrap">
                  {String(food.description)}
                </p>
              </div>
            ) : null}
            <div className="rounded-xl border border-amber-100 bg-amber-50/80 px-4 py-3 text-sm text-amber-950">
              <p className="font-semibold">{t("orderNoteTitle")}</p>
              <p className="mt-1 text-amber-900/90">{t("orderNoteBody")}</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/food"
                className="inline-flex flex-1 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-3 text-center text-sm font-semibold text-gray-800 hover:border-[#00A651]"
              >
                {t("back")}
              </Link>
              <Link
                href="/marketplace"
                className="inline-flex flex-1 items-center justify-center rounded-lg bg-[#00A651] px-4 py-3 text-center text-sm font-semibold text-white hover:brightness-95"
              >
                {t("linkMart")}
              </Link>
            </div>
          </div>
        </div>
      </SectionWrapper>
    </ContentWrapper>
  );
}
