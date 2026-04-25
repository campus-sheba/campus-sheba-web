import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { MarketplaceShopListItem } from "@/types/marketplace";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";
import { Star, MapPin } from "lucide-react";

type Props = {
  shop: MarketplaceShopListItem;
  openLabel: string;
  closedLabel: string;
  minOrderLabel: string;
};

export default function FoodShopCard({ shop, openLabel, closedLabel, minOrderLabel }: Props) {
  const cover = shop.coverPhoto?.url || "/placeholder.jpg";
  const logo = shop.logo?.url;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:border-gray-200 hover:shadow-md">
      {/* Cover */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
        <Image
          src={cover}
          alt={shop.name}
          fill
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          unoptimized={shouldUnoptimizeRemoteImage(cover)}
        />

        {/* Open/Closed badge */}
        <span
          className={`absolute right-2 top-2 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm ${
            shop.isOpen ? "bg-emerald-600/90" : "bg-gray-700/85"
          }`}
        >
          {shop.isOpen ? openLabel : closedLabel}
        </span>

        {/* Logo overlay */}
        {logo ? (
          <div className="absolute bottom-2 left-2 h-10 w-10 overflow-hidden rounded-xl border-2 border-white bg-white shadow-md">
            <Image
              src={logo}
              alt=""
              fill
              className="object-cover"
              sizes="40px"
              unoptimized={shouldUnoptimizeRemoteImage(logo)}
            />
          </div>
        ) : null}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <p className="line-clamp-1 text-[11px] font-bold text-gray-900 md:text-sm">{shop.name}</p>

        {shop.address ? (
          <p className="flex items-start gap-0.5 text-[10px] text-gray-500 md:text-[11px]">
            <MapPin className="mt-px h-3 w-3 shrink-0 text-gray-400" />
            <span className="line-clamp-1">{shop.address}</span>
          </p>
        ) : null}

        {shop.rating != null && shop.rating > 0 ? (
          <span className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-500">
            <Star className="h-3 w-3 fill-amber-400 stroke-amber-400" />
            {shop.rating.toFixed(1)}
            {shop.reviewCount ? (
              <span className="font-normal text-gray-400">({shop.reviewCount})</span>
            ) : null}
          </span>
        ) : null}

        {shop.minimumOrderAmount != null ? (
          <p className="text-[10px] text-gray-500 md:text-[11px]">
            {minOrderLabel}:{" "}
            <span className="font-semibold text-[#00A651]">
              ৳{shop.minimumOrderAmount.toLocaleString()}
            </span>
          </p>
        ) : null}

        <Link
          href={`/food/shops/${shop._id}`}
          className="mt-auto inline-flex items-center justify-center rounded-lg bg-[#00A651] px-3 py-2 text-[11px] font-semibold text-white transition hover:brightness-105 md:text-sm"
        >
          View Menu
        </Link>
      </div>
    </div>
  );
}
