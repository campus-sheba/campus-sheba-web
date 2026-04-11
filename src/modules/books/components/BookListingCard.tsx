import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { BookListing } from "@/types/book";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";

type Props = {
  item: BookListing;
};

function typeBadge(type: BookListing["type"]) {
  if (type === "Lending") return { label: "Lend", className: "bg-sky-600/90" };
  if (type === "Donation")
    return { label: "Donate", className: "bg-violet-600/90" };
  return { label: "Sell", className: "bg-[#00A651]/90" };
}

export default function BookListingCard({ item }: Props) {
  const photo = item.photos?.[0]?.url || "/placeholder.jpg";
  const categoryLabel =
    typeof item.category === "object" && item.category?.title
      ? item.category.title
      : undefined;
  const badge = typeBadge(item.type);

  const priceLabel =
    item.type === "Donation" || item.price === 0
      ? "Free"
      : `৳${item.price.toLocaleString()}`;

  return (
    <Link
      href={`/books/${item._id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:border-gray-200 hover:shadow-md"
    >
      <div className="relative aspect-[3/4] w-full bg-gray-100">
        <Image
          src={photo}
          alt={item.title}
          fill
          className="object-cover transition duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          unoptimized={shouldUnoptimizeRemoteImage(photo)}
        />
        <span
          className={`absolute left-2 top-2 rounded-md px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm ${badge.className}`}
        >
          {badge.label}
        </span>
        {categoryLabel && (
          <span className="absolute right-2 top-2 rounded-md bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
            {categoryLabel}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="line-clamp-2 text-sm font-semibold text-gray-900">
          {item.title}
        </p>
        {item.author && (
          <p className="line-clamp-1 text-[11px] text-gray-500">
            {item.author}
          </p>
        )}
        {item.quality && (
          <p className="text-[11px] text-gray-500">{item.quality}</p>
        )}
        <div className="mt-auto flex items-baseline justify-between pt-1">
          <span className="text-base font-bold text-[#00A651]">
            {priceLabel}
          </span>
          {item.type === "Lending" && item.borrowDuration != null && (
            <span className="text-[10px] font-medium text-sky-800">
              {item.borrowDuration}d borrow
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
