import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { MarketplaceFood } from "@/types/marketplace";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";
import { Clock, Star } from "lucide-react";

type Props = {
  item: MarketplaceFood;
  title: string;
};

const SPICY_EMOJI: Record<string, string> = {
  Mild: "🌶",
  Medium: "🌶🌶",
  Hot: "🌶🌶🌶",
  "Extra Hot": "🌶🌶🌶🌶",
};

export default function FoodListingCard({ item, title }: Props) {
  const photo = item.photos?.[0]?.url || "/placeholder.jpg";
  const hasDiscount =
    item.discountPrice != null &&
    item.discountPrice > 0 &&
    item.price != null &&
    item.price > item.discountPrice;

  const displayPrice = hasDiscount ? item.discountPrice! : item.price;

  const shopName =
    item.shop && typeof item.shop === "object" ? item.shop.name : null;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:border-gray-200 hover:shadow-md">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        <Image
          src={photo}
          alt={title}
          fill
          className="object-cover transition duration-300 group-hover:scale-[1.04]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          unoptimized={shouldUnoptimizeRemoteImage(photo)}
        />
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          {item.isPopular ? (
            <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
              Popular
            </span>
          ) : null}
          {item.isVegetarian ? (
            <span className="rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">
              Veg
            </span>
          ) : null}
          {item.isVegan ? (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              Vegan
            </span>
          ) : null}
          {item.spicyLevel ? (
            <span className="rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] font-medium text-orange-700">
              {SPICY_EMOJI[item.spicyLevel] ?? ""} {item.spicyLevel}
            </span>
          ) : null}
        </div>
        {item.isAvailable === false ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-800">
              Unavailable
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <p className="line-clamp-2 text-[11px] font-bold leading-snug text-gray-900 md:text-sm">
          {title}
        </p>

        {shopName ? (
          <p className="text-[10px] font-medium text-gray-400 md:text-[11px]">{shopName}</p>
        ) : null}

        {item.description ? (
          <p className="line-clamp-2 text-[10px] text-gray-500 md:text-[11px]">
            {String(item.description)}
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-between pt-1.5">
          <div>
            {displayPrice != null ? (
              <p className="text-sm font-black text-[#00A651] md:text-base">
                ৳{displayPrice.toLocaleString()}
              </p>
            ) : null}
            {hasDiscount && item.price != null ? (
              <p className="text-[10px] font-medium text-gray-400 line-through">
                ৳{item.price.toLocaleString()}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col items-end gap-1">
            {item.rating != null && item.rating > 0 ? (
              <span className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-500">
                <Star className="h-3 w-3 fill-amber-400 stroke-amber-400" />
                {item.rating.toFixed(1)}
              </span>
            ) : null}
            {item.preparationTime != null ? (
              <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                <Clock className="h-3 w-3" />
                {item.preparationTime}m
              </span>
            ) : null}
          </div>
        </div>

        <Link
          href={`/food/${item._id}`}
          className="mt-1.5 inline-flex items-center justify-center rounded-lg bg-[#00A651] px-3 py-2 text-[11px] font-semibold text-white transition hover:brightness-105 md:text-sm"
        >
          View & Order
        </Link>
      </div>
    </div>
  );
}
