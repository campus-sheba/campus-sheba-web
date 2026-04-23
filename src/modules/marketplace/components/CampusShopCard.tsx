import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { MarketplaceShopListItem } from "@/types/marketplace";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";

type Props = {
  shop: MarketplaceShopListItem;
  openLabel: string;
  closedLabel: string;
  minOrderLabel: string;
};

export default function CampusShopCard({
  shop,
  openLabel,
  closedLabel,
  minOrderLabel,
}: Props) {
  const cover = shop.coverPhoto?.url || "/placeholder.jpg";
  const logo = shop.logo?.url;

  return (
    <div className="group flex h-full flex-col overflow-hidden border border-gray-100 bg-white shadow-sm transition hover:border-gray-200 hover:shadow-md">
      <div className="relative aspect-[16/10] w-full bg-gray-100">
        <Image
          src={cover}
          alt={shop.name}
          fill
          className="object-cover transition duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          unoptimized={shouldUnoptimizeRemoteImage(cover)}
        />
        <div className="absolute left-2 top-2 flex items-start gap-2 md:bottom-2 md:left-2 md:top-auto md:items-end">
          {logo ? (
            <div className="relative h-10 w-10 overflow-hidden rounded-lg border-2 border-white bg-white shadow-sm md:h-11 md:w-11">
              <Image
                src={logo}
                alt=""
                fill
                className="object-cover"
                sizes="44px"
                unoptimized={shouldUnoptimizeRemoteImage(logo)}
              />
            </div>
          ) : null}
        </div>
        <span
          className={`absolute bottom-2 right-2 rounded-md px-2 py-0.5 text-[9px] font-semibold text-white backdrop-blur-sm md:bottom-auto md:right-2 md:top-2 md:text-[10px] ${
            shop.isOpen ? "bg-emerald-600/90" : "bg-gray-700/85"
          }`}
        >
          {shop.isOpen ? openLabel : closedLabel}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-2.5 md:p-3">
        <p className="line-clamp-1 text-[11px] font-semibold text-gray-900 md:text-sm">
          {shop.name}
        </p>
        {shop.type ? (
          <p className="text-[10px] text-gray-500 md:text-[11px]">
            {shop.type}
          </p>
        ) : null}
        {shop.minimumOrderAmount != null ? (
          <p className="mt-auto pt-1 text-[10px] text-gray-600 md:text-xs">
            {minOrderLabel}:{" "}
            <span className="font-semibold text-[#00A651]">
              ৳{shop.minimumOrderAmount.toLocaleString()}
            </span>
          </p>
        ) : null}
        <Link
          href={`/marketplace/shops/${shop._id}`}
          className="mt-1 md:mt-3 inline-flex items-center justify-center rounded-md md:rounded-lg bg-[#00A651] px-3 py-2 text-[11px] font-semibold text-white transition hover:brightness-105 md:text-sm"
        >
          Buy now
        </Link>
      </div>
    </div>
  );
}
