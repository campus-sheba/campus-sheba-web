import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import { SectionHeader } from "@/components/marketplace/SectionHeader";
import { ResponsiveCardsGrid } from "@/components/marketplace/ResponsiveCardsGrid";
import FoodListingCard from "@/modules/food/components/FoodListingCard";
import FoodFiltersBar from "@/modules/food/components/FoodFiltersBar";
import type { MarketplaceShopListItem, MarketplaceFood } from "@/types/marketplace";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";
import {
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  ShoppingBag,
  ChevronRight,
} from "lucide-react";

type Props = {
  shop: MarketplaceShopListItem;
  menus: MarketplaceFood[];
  total: number;
  activeCategoryId?: string;
  activeSearch?: string;
};

function itemTitle(f: MarketplaceFood): string {
  return f.title || f.name || "—";
}

/** Format operating hours slot list into a readable string. */
function formatSlots(
  slots: Array<{ open: string; close: string }> | undefined,
): string {
  if (!slots || slots.length === 0) return "Closed";
  return slots.map((s) => `${s.open}–${s.close}`).join(", ");
}

export default async function FoodShopMenuTemplate({
  shop,
  menus,
  total,
  activeCategoryId,
  activeSearch,
}: Props) {
  const t = await getTranslations("common.campusFood");
  const cover = shop.coverPhoto?.url;
  const logo = shop.logo?.url;

  // Safely access operating hours from the raw shape
  const rawHours = (shop as unknown as Record<string, unknown>)
    .operatingHours as
    | Array<{ day: string; isClosed: boolean; slots: Array<{ open: string; close: string }> }>
    | undefined;

  const subCategories = (
    (shop as unknown as Record<string, unknown>).subCategories as
      | Array<{ _id: string; title: string; icon?: string }>
      | undefined
  )?.filter((c) => c._id && c.title);

  const tags = shop.tags as string[] | undefined;

  return (
    <ContentWrapper maxWidth="max-w-7xl mx-auto" padding="md">
      <AppBreadcrumb
        items={[
          { label: t("breadcrumbHome"), href: "/" },
          { label: t("breadcrumbFood"), href: "/food" },
          { label: shop.name },
        ]}
      />

      {/* ── Shop Hero ────────────────────────────────────────── */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {/* Cover */}
        {cover ? (
          <div className="relative h-40 w-full overflow-hidden bg-gray-100 sm:h-52 md:h-64">
            <Image
              src={cover}
              alt={shop.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 1280px"
              unoptimized={shouldUnoptimizeRemoteImage(cover)}
              priority
            />
            {/* Status badge */}
            <span
              className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold text-white shadow ${
                (shop as unknown as Record<string, unknown>).isOpen
                  ? "bg-emerald-600/90"
                  : "bg-gray-700/85"
              }`}
            >
              {(shop as unknown as Record<string, unknown>).isOpen
                ? t("openNow")
                : t("closed")}
            </span>
          </div>
        ) : null}

        {/* Info row */}
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-end sm:gap-6 md:p-6">
          {/* Logo */}
          {logo ? (
            <div
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-md ${
                cover ? "-mt-10 sm:-mt-12" : ""
              }`}
            >
              <Image
                src={logo}
                alt={shop.name}
                fill
                className="object-cover"
                sizes="80px"
                unoptimized={shouldUnoptimizeRemoteImage(logo)}
              />
            </div>
          ) : null}

          {/* Name + meta */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-gray-900 md:text-2xl">
                {shop.name}
              </h1>
              {shop.type ? (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                  {shop.type}
                </span>
              ) : null}
              {shop.kycStatus === "VERIFIED" ? (
                <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                  ✓ Verified
                </span>
              ) : null}
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-gray-500">
              {shop.rating != null && shop.rating > 0 ? (
                <span className="flex items-center gap-1 font-semibold text-amber-500">
                  <Star className="h-3.5 w-3.5 fill-amber-400 stroke-amber-400" />
                  {shop.rating.toFixed(1)}
                  {shop.reviewCount ? (
                    <span className="font-normal text-gray-400">
                      ({shop.reviewCount} reviews)
                    </span>
                  ) : null}
                </span>
              ) : null}

              {shop.address ? (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-gray-400" />
                  {shop.address}
                </span>
              ) : null}

              {shop.minimumOrderAmount != null ? (
                <span className="flex items-center gap-1">
                  <ShoppingBag className="h-3.5 w-3.5 text-gray-400" />
                  Min. ৳{shop.minimumOrderAmount.toLocaleString()}
                </span>
              ) : null}
            </div>

            {/* Contact row */}
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
              {shop.phoneNumber ? (
                <a
                  href={`tel:${shop.phoneNumber}`}
                  className="flex items-center gap-1 hover:text-[#00A651]"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {shop.phoneNumber}
                </a>
              ) : null}
              {shop.contactEmail ? (
                <a
                  href={`mailto:${shop.contactEmail}`}
                  className="flex items-center gap-1 hover:text-[#00A651]"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {shop.contactEmail}
                </a>
              ) : null}
              {shop.website ? (
                <a
                  href={shop.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-[#00A651]"
                >
                  <Globe className="h-3.5 w-3.5" />
                  Website
                </a>
              ) : null}
            </div>
          </div>
        </div>

        {/* Description */}
        {shop.description ? (
          <div className="border-t border-gray-100 px-4 py-3 md:px-6">
            <p className="text-sm leading-relaxed text-gray-600">{shop.description}</p>
          </div>
        ) : null}

        {/* Tags */}
        {tags && tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 border-t border-gray-100 px-4 py-3 md:px-6">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-[11px] font-medium text-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {/* ── Sub-grid: Hours + Cuisine Categories ─────────────── */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {/* Operating hours */}
        {rawHours && rawHours.length > 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
            <p className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900">
              <Clock className="h-4 w-4 text-[#00A651]" />
              Opening Hours
            </p>
            <div className="space-y-1.5">
              {rawHours.map((h) => (
                <div key={h.day} className="flex items-center justify-between text-xs">
                  <span className="w-24 font-medium text-gray-700">{h.day}</span>
                  <span
                    className={`text-right ${
                      h.isClosed ? "text-red-500" : "text-gray-500"
                    }`}
                  >
                    {h.isClosed ? "Closed" : formatSlots(h.slots)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Food sub-categories this shop serves */}
        {subCategories && subCategories.length > 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
            <p className="mb-3 text-sm font-bold text-gray-900">Cuisine Types</p>
            <div className="flex flex-wrap gap-1.5">
              {subCategories.map((c) => (
                <Link
                  key={c._id}
                  href={`/food?categoryId=${encodeURIComponent(c._id)}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-700 transition hover:border-[#00A651] hover:text-[#00A651]"
                >
                  {c.icon && c.icon.startsWith("http") ? (
                    <span className="relative h-4 w-4 overflow-hidden rounded-full">
                      <Image
                        src={c.icon}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="16px"
                        unoptimized={shouldUnoptimizeRemoteImage(c.icon)}
                      />
                    </span>
                  ) : null}
                  {c.title}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* ── Menu ─────────────────────────────────────────────── */}
      <SectionWrapper spacing="sm" background="transparent" className="my-0 mt-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SectionHeader
            title="Menu"
            subtitle={
              total > 0
                ? `${total} item${total === 1 ? "" : "s"} available`
                : "No items available yet"
            }
          />
        </div>

        <div className="mt-3">
          <FoodFiltersBar />
        </div>

        {menus.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
            {activeCategoryId || activeSearch
              ? "No items match your filters."
              : "This shop has no menu items yet."}
          </p>
        ) : (
          <div className="mt-4">
            <ResponsiveCardsGrid>
              {menus.map((f) => (
                <FoodListingCard key={f._id} item={f} title={itemTitle(f)} />
              ))}
            </ResponsiveCardsGrid>
          </div>
        )}
      </SectionWrapper>

      {/* ── Back link ────────────────────────────────────────── */}
      <div className="mt-8">
        <Link
          href="/food"
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-[#00A651] hover:text-[#00A651]"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
          Back to Food
        </Link>
      </div>
    </ContentWrapper>
  );
}
