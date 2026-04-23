import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Package, Truck, RotateCcw, Store, ShieldCheck, Tag } from "lucide-react";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import { ImageGallery } from "@/components/marketplace/ImageGallery";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import MarketplaceProductActions from "@/modules/marketplace/components/MarketplaceProductActions";
import type { MarketplaceProduct, MarketplaceShopListItem } from "@/types/marketplace";
import { formatBdt } from "../components/PriceText";

type Props = {
  product: MarketplaceProduct;
};

function shopObj(s: MarketplaceProduct["shop"]): MarketplaceShopListItem | null {
  if (!s || typeof s === "string") return null;
  return s;
}

function categoryTitle(c: MarketplaceProduct["category"]): string | undefined {
  if (!c) return undefined;
  if (typeof c === "string") return c;
  return c.title;
}

function uniName(u: MarketplaceProduct["university"]): string | undefined {
  if (!u || typeof u === "string") return undefined;
  return u.shortName || u.name;
}

export default async function MarketplaceProductDetailTemplate({ product }: Props) {
  const t = await getTranslations("common.campusMart");
  const campus = uniName(product.university);
  const shop = shopObj(product.shop);
  const catTitle = categoryTitle(product.category);

  const raw = (product.photos?.map((p) => p.url).filter(Boolean) as string[]) ?? [];
  const images = raw.length > 0 ? raw : ["/placeholder.jpg"];

  const hasDiscount =
    product.discountPrice != null &&
    product.price != null &&
    product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice : (product.price ?? product.discountPrice);
  const compareAt = hasDiscount ? product.price : undefined;

  const stockLeft = product.quantity ?? 0;

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
          {/* ── Left: Gallery ── */}
          <ImageGallery title={product.title} images={images} />

          {/* ── Right: Core info ── */}
          <div className="flex flex-col gap-4">
            {/* Category + kicker badges */}
            <div className="flex flex-wrap gap-2">
              <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800">
                {t("productsKicker")}
              </span>
              {catTitle && (
                <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">
                  {catTitle}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">{product.title}</h1>
            {product.subtitle && (
              <p className="text-sm text-gray-500">{product.subtitle}</p>
            )}
            {campus && <p className="text-sm text-gray-400">{campus}</p>}

            {/* Price block */}
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <p className="text-xs font-medium text-gray-500">{t("priceLabel")}</p>
              <div className="mt-1 flex flex-wrap items-baseline gap-3">
                {displayPrice != null ? (
                  <span className="text-2xl font-bold text-[#00A651]">{formatBdt(displayPrice)}</span>
                ) : (
                  <span className="text-2xl font-bold text-gray-400">—</span>
                )}
                {compareAt != null && (
                  <span className="text-sm text-gray-400 line-through">{formatBdt(compareAt)}</span>
                )}
                {hasDiscount && compareAt && displayPrice && (
                  <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600">
                    {Math.round(((compareAt - displayPrice) / compareAt) * 100)}% off
                  </span>
                )}
              </div>
            </div>

            {/* Status badges */}
            <div className="flex flex-wrap gap-2">
              {product.isNegotiable && (
                <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">
                  {t("negotiable")}
                </span>
              )}
              {product.condition && (
                <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                  {product.condition}
                </span>
              )}
              {stockLeft > 0 ? (
                <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                  {stockLeft} in stock
                </span>
              ) : (
                <span className="rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-red-600">
                  Out of stock
                </span>
              )}
              {product.unit && product.unit !== "Piece" && (
                <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                  per {product.unit}
                </span>
              )}
            </div>

            {/* Brand / SKU row */}
            {(product.brand || product.sku) && (
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {product.brand && (
                  <span>
                    <span className="font-semibold text-gray-900">Brand: </span>
                    {product.brand}
                  </span>
                )}
                {product.sku && (
                  <span>
                    <span className="font-semibold text-gray-900">SKU: </span>
                    {product.sku}
                  </span>
                )}
              </div>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600"
                  >
                    <Tag className="h-2.5 w-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Variant + qty + add-to-cart */}
            <MarketplaceProductActions
              product={{ _id: product._id, variants: product.variants, quantity: product.quantity }}
            />

            {/* Short description */}
            {product.description && (
              <div>
                <h2 className="mb-1.5 text-sm font-semibold text-gray-900">{t("description")}</h2>
                <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-wrap line-clamp-5">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </SectionWrapper>

      {/* ── Extended details below the fold ── */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Left 2/3: Description + Specs + Delivery + Return */}
        <div className="space-y-4 lg:col-span-2">
          {/* Full description */}
          {product.description && (
            <section className="rounded-2xl border border-gray-100 bg-white p-5">
              <h2 className="mb-3 text-base font-bold text-gray-900">Description</h2>
              <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-wrap">
                {product.description}
              </p>
            </section>
          )}

          {/* Specifications */}
          {product.specifications && product.specifications.length > 0 && (
            <section className="rounded-2xl border border-gray-100 bg-white p-5">
              <h2 className="mb-3 text-base font-bold text-gray-900">Specifications</h2>
              <div className="overflow-hidden rounded-xl border border-gray-100">
                <table className="w-full text-sm">
                  <tbody>
                    {product.specifications.map((spec, i) => (
                      <tr
                        key={spec.key}
                        className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}
                      >
                        <td className="w-1/3 px-4 py-2.5 font-semibold text-gray-700">
                          {spec.key}
                        </td>
                        <td className="px-4 py-2.5 text-gray-600">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Delivery info */}
          {product.deliveryInfo &&
            (product.deliveryInfo.estimatedDays ||
              product.deliveryInfo.deliveryCharge ||
              product.deliveryInfo.freeDeliveryAbove) && (
              <section className="rounded-2xl border border-gray-100 bg-white p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Truck className="h-4 w-4 text-[#00A651]" />
                  <h2 className="text-base font-bold text-gray-900">Delivery</h2>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {product.deliveryInfo.estimatedDays && (
                    <span>
                      <span className="font-semibold text-gray-800">Estimated: </span>
                      {product.deliveryInfo.estimatedDays} day{product.deliveryInfo.estimatedDays !== 1 ? "s" : ""}
                    </span>
                  )}
                  {product.deliveryInfo.deliveryCharge != null && (
                    <span>
                      <span className="font-semibold text-gray-800">Charge: </span>
                      {product.deliveryInfo.deliveryCharge === 0
                        ? "Free"
                        : formatBdt(product.deliveryInfo.deliveryCharge)}
                    </span>
                  )}
                  {product.deliveryInfo.freeDeliveryAbove != null && (
                    <span>
                      <span className="font-semibold text-gray-800">Free above: </span>
                      {formatBdt(product.deliveryInfo.freeDeliveryAbove)}
                    </span>
                  )}
                </div>
              </section>
            )}

          {/* Return policy */}
          {product.returnPolicy && (
            <section className="rounded-2xl border border-gray-100 bg-white p-5">
              <div className="mb-3 flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-[#00A651]" />
                <h2 className="text-base font-bold text-gray-900">Return policy</h2>
              </div>
              {product.returnPolicy.isReturnable ? (
                <div className="space-y-1.5 text-sm text-gray-600">
                  <p className="font-semibold text-emerald-700">Returns accepted</p>
                  {product.returnPolicy.returnWindowDays && (
                    <p>
                      <span className="font-semibold text-gray-800">Window: </span>
                      {product.returnPolicy.returnWindowDays} day{product.returnPolicy.returnWindowDays !== 1 ? "s" : ""}
                    </p>
                  )}
                  {product.returnPolicy.conditions && (
                    <p>
                      <span className="font-semibold text-gray-800">Conditions: </span>
                      {product.returnPolicy.conditions}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">This item is not returnable.</p>
              )}
            </section>
          )}
        </div>

        {/* Right 1/3: Shop info */}
        <div className="space-y-4">
          {shop && (
            <section className="rounded-2xl border border-gray-100 bg-white p-5">
              <div className="mb-3 flex items-center gap-2">
                <Store className="h-4 w-4 text-[#00A651]" />
                <h2 className="text-base font-bold text-gray-900">Shop</h2>
              </div>
              <div className="flex items-start gap-3">
                {shop.logo?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={shop.logo.url}
                    alt={shop.name}
                    className="h-12 w-12 shrink-0 rounded-xl border border-gray-100 object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-lg font-bold text-gray-400">
                    {shop.name[0]}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 leading-tight">{shop.name}</p>
                  {shop.type && (
                    <p className="text-xs text-gray-500">{shop.type}</p>
                  )}
                  {shop.kycStatus === "VERIFIED" && (
                    <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-emerald-700">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Verified
                    </div>
                  )}
                  {shop.rating != null && (
                    <p className="mt-1 text-xs text-gray-500">
                      ★ {shop.rating.toFixed(1)}
                      {shop.reviewCount ? ` (${shop.reviewCount})` : ""}
                    </p>
                  )}
                </div>
              </div>
              {shop.description && (
                <p className="mt-3 text-xs leading-relaxed text-gray-500 line-clamp-3">
                  {shop.description}
                </p>
              )}
              {shop.phoneNumber && (
                <p className="mt-2 text-xs text-gray-600">
                  <span className="font-semibold">Phone: </span>
                  <a href={`tel:${shop.phoneNumber}`} className="text-[#00A651] hover:underline">
                    {shop.phoneNumber}
                  </a>
                </p>
              )}
              {shop._id && (
                <Link
                  href={`/marketplace/shops/${shop._id}`}
                  className="mt-3 inline-block w-full rounded-xl border border-[#C3E8D5] py-2 text-center text-xs font-semibold text-[#00A651] hover:bg-[#E8F7EF]"
                >
                  View shop
                </Link>
              )}
            </section>
          )}

          {/* Package / type info */}
          <section className="rounded-2xl border border-gray-100 bg-white p-5">
            <div className="mb-3 flex items-center gap-2">
              <Package className="h-4 w-4 text-[#00A651]" />
              <h2 className="text-base font-bold text-gray-900">Item info</h2>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              {product.type && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>
                  <span className="font-medium text-gray-800">{product.type}</span>
                </div>
              )}
              {product.condition && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Condition</span>
                  <span className="font-medium text-gray-800">{product.condition}</span>
                </div>
              )}
              {product.unit && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Unit</span>
                  <span className="font-medium text-gray-800">{product.unit}</span>
                </div>
              )}
              {product.brand && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Brand</span>
                  <span className="font-medium text-gray-800">{product.brand}</span>
                </div>
              )}
              {product.sku && (
                <div className="flex justify-between">
                  <span className="text-gray-500">SKU</span>
                  <span className="font-medium text-gray-800">{product.sku}</span>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </ContentWrapper>
  );
}
