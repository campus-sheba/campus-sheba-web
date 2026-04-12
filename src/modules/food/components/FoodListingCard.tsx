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
    <Link
      href={`/food/${item._id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:border-gray-200 hover:shadow-md"
    >
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
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="line-clamp-2 text-sm font-semibold text-gray-900">{title}</p>
        {item.description ? (
          <p className="line-clamp-2 text-[11px] text-gray-500">{String(item.description)}</p>
        ) : null}
        {item.price != null ? (
          <p className="mt-auto pt-1 text-base font-bold text-[#00A651]">৳{item.price.toLocaleString()}</p>
        ) : null}
      </div>
    </Link>
  );
}
