import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import { ImageGallery } from "@/components/marketplace/ImageGallery";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import type { MarketplaceProduct } from "@/types/marketplace";
import { formatBdt } from "../components/PriceText";

type Props = {
  product: MarketplaceProduct;
};

function uniName(u: MarketplaceProduct["university"]): string | undefined {
  if (!u || typeof u === "string") return undefined;
  return u.shortName || u.name;
}

export default async function MarketplaceProductDetailTemplate({ product }: Props) {
  const t = await getTranslations("common.campusMart");
  const campus = uniName(product.university);
  const raw = (product.photos?.map((p) => p.url).filter(Boolean) as string[]) ?? [];
  const images = raw.length > 0 ? raw : ["/placeholder.jpg"];
  const hasDiscount =
    product.discountPrice != null &&
    product.price != null &&
    product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice : (product.price ?? product.discountPrice);
  const compareAt = hasDiscount ? product.price : undefined;

  return (
    <ContentWrapper maxWidth="max-w-7xl mx-auto" padding="md">
      <AppBreadcrumb
        items={[
          { label: t("breadcrumbHome"), href: "/" },
          { label: t("breadcrumbMart"), href: "/marketplace" },
          { label: t("productsTitle"), href: "/marketplace/products" },
          { label: product.title },
        ]}
      />

      <SectionWrapper spacing="sm" background="white" className="mt-6 rounded-2xl border border-gray-100 p-4 md:p-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <ImageGallery title={product.title} images={images} />
          <div className="flex flex-col gap-4">
            <span className="w-fit rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800">
              {t("productsKicker")}
            </span>
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">{product.title}</h1>
            {campus ? <p className="text-sm text-gray-500">{campus}</p> : null}
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <p className="text-xs font-medium text-gray-500">{t("priceLabel")}</p>
              <div className="mt-1 flex flex-wrap items-baseline gap-3">
                {displayPrice != null ? (
                  <span className="text-2xl font-bold text-[#00A651]">{formatBdt(displayPrice)}</span>
                ) : (
                  <span className="text-2xl font-bold text-gray-400">—</span>
                )}
                {compareAt != null ? (
                  <span className="text-sm text-gray-400 line-through">{formatBdt(compareAt)}</span>
                ) : null}
              </div>
            </div>
            {product.isNegotiable ? (
              <span className="w-fit rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">
                {t("negotiable")}
              </span>
            ) : null}
            {product.condition ? (
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{t("condition")}:</span> {product.condition}
              </p>
            ) : null}
            {product.quantity != null ? (
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{t("stock")}:</span> {product.quantity}
              </p>
            ) : null}
            {product.description ? (
              <div>
                <h2 className="text-sm font-semibold text-gray-900">{t("description")}</h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 whitespace-pre-wrap">{product.description}</p>
              </div>
            ) : null}

            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600">
              <p className="font-semibold text-gray-900">{t("notBuySellTitle")}</p>
              <p className="mt-1">{t("notBuySellBody")}</p>
              <Link href="/buy-sell" className="mt-2 inline-block text-sm font-semibold text-[#00A651] hover:underline">
                {t("notBuySellCta")}
              </Link>
            </div>
          </div>
        </div>
      </SectionWrapper>
    </ContentWrapper>
  );
}
