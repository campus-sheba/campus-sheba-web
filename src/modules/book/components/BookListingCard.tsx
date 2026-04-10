import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { BookListing } from "@/types/book";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";

type Props = {
  item: BookListing;
};

export default function BookListingCard({ item }: Props) {
  const photo = item.photos?.[0]?.url || "https://pngimg.com/image/2111";
  const categoryLabel =
    typeof item.category === "object" && item.category?.title
      ? item.category.title
      : undefined;

  return (
    <Link
      href={`/books/${item._id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:border-gray-200 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full bg-gray-100">
        <Image
          src={photo}
          alt={item.title || "Book photo"}
          fill
          className="object-cover transition duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          unoptimized={shouldUnoptimizeRemoteImage(photo)}
        />
        {categoryLabel && (
          <span className="absolute left-2 top-2 rounded-md bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
            {categoryLabel}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="line-clamp-2 text-sm font-semibold text-gray-900">
          {item.title}
        </p>
        {item.condition && (
          <p className="text-[11px] text-gray-500">{item.condition}</p>
        )}
        <div className="mt-auto flex items-baseline justify-between pt-1">
          <span className="text-base font-bold text-[#00A651]">
            ৳{item.price.toLocaleString()}
          </span>
          {item.negotiable && (
            <span className="text-[10px] font-medium text-amber-700">
              Negotiable
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
