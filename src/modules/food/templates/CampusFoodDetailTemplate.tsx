import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import { ImageGallery } from "@/components/marketplace/ImageGallery";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import type { MarketplaceFood } from "@/types/marketplace";
import { Clock, Star, Truck, Users, Flame, Leaf, ShoppingBag } from "lucide-react";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";

type Props = {
  food: MarketplaceFood;
};

function titleOf(f: MarketplaceFood): string {
  return f.title || f.name || "—";
}

const SPICY_COLOR: Record<string, string> = {
  Mild: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Medium: "bg-orange-50 text-orange-700 border-orange-200",
  Hot: "bg-red-50 text-red-700 border-red-200",
  "Extra Hot": "bg-red-100 text-red-900 border-red-300",
};

const SPICY_EMOJI: Record<string, string> = {
  Mild: "🌶",
  Medium: "🌶🌶",
  Hot: "🌶🌶🌶",
  "Extra Hot": "🌶🌶🌶🌶",
};

export default async function CampusFoodDetailTemplate({ food }: Props) {
  const t = await getTranslations("common.campusFood");
  const name = titleOf(food);
  const raw = (food.photos?.map((p) => p.url).filter(Boolean) as string[]) ?? [];
  const galleryImages = raw.length > 0 ? raw : ["/placeholder.jpg"];

  const hasDiscount =
    food.discountPrice != null &&
    food.discountPrice > 0 &&
    food.price != null &&
    food.price > food.discountPrice;

  const displayPrice = hasDiscount ? food.discountPrice! : food.price;

  const shop = food.shop && typeof food.shop === "object" ? food.shop : null;
  const category =
    food.category && typeof food.category === "object" ? food.category : null;

  return (
    <ContentWrapper maxWidth="max-w-7xl mx-auto" padding="md">
      <AppBreadcrumb
        items={[
          { label: t("breadcrumbHome"), href: "/" },
          { label: t("breadcrumbFood"), href: "/food" },
          { label: name },
        ]}
      />

      <SectionWrapper
        spacing="sm"
        background="white"
        className="mt-6 rounded-2xl border border-gray-100 p-4 md:p-6"
      >
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Gallery */}
          <ImageGallery title={name} images={galleryImages} />

          {/* Info */}
          <div className="flex flex-col gap-4">
            {/* Badges */}
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800">
                {t("detailBadge")}
              </span>
              {food.isPopular ? (
                <span className="rounded-md bg-amber-400 px-2 py-1 text-xs font-bold text-white">
                  Popular
                </span>
              ) : null}
              {food.isVegetarian ? (
                <span className="flex items-center gap-1 rounded-md border border-green-200 bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
                  <Leaf className="h-3 w-3" /> Vegetarian
                </span>
              ) : null}
              {food.isVegan ? (
                <span className="flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                  <Leaf className="h-3 w-3" /> Vegan
                </span>
              ) : null}
              {food.spicyLevel ? (
                <span
                  className={`flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold ${SPICY_COLOR[food.spicyLevel] ?? "bg-orange-50 text-orange-700 border-orange-200"}`}
                >
                  <Flame className="h-3 w-3" />
                  {SPICY_EMOJI[food.spicyLevel]} {food.spicyLevel}
                </span>
              ) : null}
              {category?.title ? (
                <span className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-600">
                  {category.title}
                </span>
              ) : null}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">{name}</h1>

            {/* Rating & orders */}
            {(food.rating != null && food.rating > 0) || food.reviewCount ? (
              <div className="flex items-center gap-3">
                {food.rating != null && food.rating > 0 ? (
                  <span className="flex items-center gap-1 text-sm font-semibold text-amber-500">
                    <Star className="h-4 w-4 fill-amber-400 stroke-amber-400" />
                    {food.rating.toFixed(1)}
                    {food.reviewCount ? (
                      <span className="text-xs font-normal text-gray-400">
                        ({food.reviewCount} reviews)
                      </span>
                    ) : null}
                  </span>
                ) : null}
                {food.totalOrders ? (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <ShoppingBag className="h-3.5 w-3.5" />
                    {food.totalOrders} orders
                  </span>
                ) : null}
              </div>
            ) : null}

            {/* Price */}
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <p className="text-xs font-medium text-gray-500">{t("priceLabel")}</p>
              <div className="flex items-baseline gap-2">
                {displayPrice != null ? (
                  <p className="text-2xl font-bold text-[#00A651]">
                    ৳{displayPrice.toLocaleString()}
                  </p>
                ) : null}
                {hasDiscount && food.price != null ? (
                  <p className="text-sm font-medium text-gray-400 line-through">
                    ৳{food.price.toLocaleString()}
                  </p>
                ) : null}
              </div>
              {food.servingSize ? (
                <p className="mt-0.5 text-xs text-gray-400">Serving: {food.servingSize}</p>
              ) : null}
            </div>

            {/* Timing info */}
            {(food.preparationTime != null || food.deliveryTime != null) ? (
              <div className="flex flex-wrap gap-3">
                {food.preparationTime != null ? (
                  <div className="flex items-center gap-1.5 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700">
                    <Clock className="h-3.5 w-3.5 text-[#00A651]" />
                    Prep: {food.preparationTime} min
                  </div>
                ) : null}
                {food.deliveryTime != null ? (
                  <div className="flex items-center gap-1.5 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700">
                    <Truck className="h-3.5 w-3.5 text-[#00A651]" />
                    Delivery: {food.deliveryTime} min
                  </div>
                ) : null}
                {food.maxDailyOrders != null ? (
                  <div className="flex items-center gap-1.5 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700">
                    <Users className="h-3.5 w-3.5 text-[#00A651]" />
                    Max {food.maxDailyOrders}/day
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* Variations */}
            {food.variations && food.variations.length > 0 ? (
              <div>
                <p className="mb-2 text-sm font-semibold text-gray-700">Variations</p>
                <div className="flex flex-wrap gap-2">
                  {food.variations.map((v, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-800 shadow-sm"
                    >
                      {v.title} — <span className="font-bold text-[#00A651]">৳{v.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Description */}
            {food.description ? (
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  {t("descriptionHeading")}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 whitespace-pre-wrap">
                  {String(food.description)}
                </p>
              </div>
            ) : null}

            {/* Allergens */}
            {food.allergens && food.allergens.length > 0 ? (
              <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wide text-amber-800">
                  Allergens
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {food.allergens.map((a) => (
                    <span
                      key={a}
                      className="rounded-full border border-amber-200 bg-white px-2.5 py-0.5 text-xs font-medium text-amber-900"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Shop info */}
            {shop ? (
              <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
                {shop.logo?.url ? (
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-gray-200">
                    <Image
                      src={shop.logo.url}
                      alt={shop.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                      unoptimized={shouldUnoptimizeRemoteImage(shop.logo.url)}
                    />
                  </div>
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-gray-900">{shop.name}</p>
                  {shop.address ? (
                    <p className="truncate text-xs text-gray-500">{shop.address}</p>
                  ) : null}
                  {shop.minimumOrderAmount ? (
                    <p className="text-xs text-gray-400">
                      Min. order ৳{shop.minimumOrderAmount}
                    </p>
                  ) : null}
                </div>
                {shop.rating != null && shop.rating > 0 ? (
                  <span className="flex items-center gap-0.5 text-xs font-semibold text-amber-500">
                    <Star className="h-3 w-3 fill-amber-400 stroke-amber-400" />
                    {shop.rating.toFixed(1)}
                  </span>
                ) : null}
              </div>
            ) : null}

            {/* Availability note */}
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
