import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { MarketplaceFood } from "@/types/marketplace";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";

type Props = {
  item: MarketplaceFood;
  title: string;
};

export default function FoodListingCard({ item, title }: Props) {
  const photo = item.photos?.[0]?.url || "/placeholder.jpg";

  return (
    <div className="group flex h-full flex-col overflow-hidden border border-gray-100 bg-white shadow-sm transition hover:border-gray-200 hover:shadow-md">
      <div className="relative aspect-[4/3] w-full bg-gray-100">
        <Image
          src={photo}
          alt={title}
          fill
          className="object-cover transition duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          unoptimized={shouldUnoptimizeRemoteImage(photo)}
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-2.5 md:p-3">
        <p className="line-clamp-2 text-[11px] font-semibold text-gray-900 md:text-sm">
          {title}
        </p>
        {item.description ? (
          <p className="line-clamp-2 text-[10px] text-gray-500 md:text-[11px]">
            {String(item.description)}
          </p>
        ) : null}
        {item.price != null ? (
          <p className="mt-auto pt-1 text-sm font-bold text-[#00A651] md:text-base">
            ৳{item.price.toLocaleString()}
          </p>
        ) : null}
        <Link
          href={`/food/${item._id}`}
          className="mt-1 md:mt-3 inline-flex items-center justify-center rounded-md md:rounded-lg bg-[#00A651] px-3 py-2 text-[11px] font-semibold text-white transition hover:brightness-105 md:text-sm"
        >
          Buy now
        </Link>
      </div>
    </div>
  );
}
