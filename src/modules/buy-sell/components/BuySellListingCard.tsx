import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { BuySellListing } from "@/types/buy-sell";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";

type Props = {
  item: BuySellListing;
};

export default function BuySellListingCard({ item }: Props) {
  const photo = item.photos?.[0]?.url || "/placeholder.jpg";
  const categoryLabel =
    typeof item.category === "object" && item.category?.title
      ? item.category.title
      : undefined;

  return (
    <div className="group flex h-full flex-col overflow-hidden border border-gray-100 bg-white shadow-sm transition hover:border-gray-200 hover:shadow-md">
      <div className="relative aspect-[4/3] w-full bg-gray-100">
        <Image
          src={photo}
          alt={item.title}
          fill
          className="object-cover transition duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          unoptimized={shouldUnoptimizeRemoteImage(photo)}
        />
        {categoryLabel && (
          <span className="absolute left-2 top-2 rounded-md bg-black/55 px-2 py-0.5 text-[9px] font-semibold text-white backdrop-blur-sm md:text-[10px]">
            {categoryLabel}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-2.5 md:p-3">
        <p className="line-clamp-2 text-[11px] font-semibold text-gray-900 md:text-sm">
          {item.title}
        </p>
        {item.condition && (
          <p className="text-[10px] text-gray-500 md:text-[11px]">
            {item.condition}
          </p>
        )}
        <div className="mt-auto flex items-baseline justify-between pt-1">
          <span className="text-sm font-bold text-[#00A651] md:text-base">
            ৳{item.price.toLocaleString()}
          </span>
          {item.negotiable && (
            <span className="text-[9px] font-medium text-amber-700 md:text-[10px]">
              Negotiable
            </span>
          )}
        </div>
        <Link
          href={`/buy-sell/${item._id}`}
          className="mt-1 md:mt-3 inline-flex items-center justify-center rounded-md md:rounded-lg bg-[#00A651] px-3 py-2 text-[11px] font-semibold text-white transition hover:brightness-105 md:text-sm"
        >
          Buy now
        </Link>
      </div>
    </div>
  );
}
