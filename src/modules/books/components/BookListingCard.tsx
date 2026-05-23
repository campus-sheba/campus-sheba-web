import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { BookListing, BookType } from "@/types/book";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";

type Props = {
  item: BookListing;
};

type BadgeConfig = {
  label: string;
  className: string;
};

function typeBadge(type: BookType): BadgeConfig {
  switch (type) {
    case "Lending":
      return { label: "Lend", className: "bg-sky-600/90" };
    case "Donation":
      return { label: "Free", className: "bg-violet-600/90" };
    case "Swap":
      return { label: "Swap", className: "bg-orange-500/90" };
    case "Library Only":
      return { label: "Library", className: "bg-gray-600/90" };
    case "Request Based":
      return { label: "Request", className: "bg-amber-600/90" };
    default:
      return { label: "Sell", className: "bg-[#E30B12]/90" };
  }
}

function ctaLabel(type: BookType, outOfStock: boolean): string {
  if (outOfStock && type === "Selling") return "Out of stock";
  switch (type) {
    case "Lending":
      return "Request borrow";
    case "Donation":
      return "Request";
    case "Swap":
      return "Propose swap";
    case "Library Only":
      return "View";
    case "Request Based":
      return "Request";
    default:
      return "Buy now";
  }
}

function ctaColor(type: BookType): string {
  switch (type) {
    case "Lending":
      return "bg-sky-600 hover:brightness-105";
    case "Donation":
      return "bg-violet-600 hover:brightness-105";
    case "Swap":
      return "bg-orange-500 hover:brightness-105";
    case "Library Only":
      return "bg-gray-500 hover:brightness-105";
    case "Request Based":
      return "bg-amber-600 hover:brightness-105";
    default:
      return "bg-[#E30B12] hover:brightness-105";
  }
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 12 12"
          className={`h-2.5 w-2.5 ${
            i < full
              ? "text-amber-400"
              : i === full && half
                ? "text-amber-300"
                : "text-gray-200"
          }`}
          fill="currentColor"
        >
          <path d="M6 1l1.2 3.6H11L8.1 6.9l1 3.1L6 8.2 2.9 10l1-3.1L1 4.6h3.8z" />
        </svg>
      ))}
    </span>
  );
}

function AvailabilityBadge({ status }: { status?: string }) {
  if (!status) return null;
  const map: Record<string, { label: string; className: string }> = {
    Available: { label: "Available", className: "bg-green-100 text-green-800" },
    Borrowed: { label: "Borrowed", className: "bg-rose-100 text-rose-700" },
    Reserved: { label: "Reserved", className: "bg-yellow-100 text-yellow-800" },
  };
  const cfg = map[status];
  if (!cfg) return null;
  return (
    <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

export default function BookListingCard({ item }: Props) {
  const photo = item.photos?.[0]?.url || "/placeholder.jpg";
  const categoryLabel =
    typeof item.category === "object" && item.category !== null && "title" in item.category
      ? (item.category as { title: string }).title
      : undefined;

  const badge = typeBadge(item.type);
  const outOfStock = (item.quantity ?? 1) < 1;

  const priceLabel =
    item.type === "Donation" || item.type === "Library Only" || item.price === 0
      ? "Free"
      : `৳${(item.discountPrice != null && item.discountPrice < item.price ? item.discountPrice : item.price).toLocaleString()}`;

  const ownerName =
    typeof item.owner === "object" && item.owner !== null
      ? (item.owner as { name?: string }).name
      : item.contactName;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:border-gray-200 hover:shadow-md">
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
          className={`absolute left-2 top-2 rounded-md px-2 py-0.5 text-[9px] font-semibold text-white backdrop-blur-sm md:text-[10px] ${badge.className}`}
        >
          {badge.label}
        </span>
        {categoryLabel && (
          <span className="absolute bottom-2 right-2 rounded-md bg-black/55 px-2 py-0.5 text-[9px] font-semibold text-white backdrop-blur-sm md:text-[10px]">
            {categoryLabel}
          </span>
        )}
        {item.isFeatured && (
          <span className="absolute left-2 bottom-2 rounded-md bg-amber-400/90 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur-sm">
            Featured
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-2.5 md:p-3">
        <p className="line-clamp-2 text-[11px] font-semibold text-gray-900 md:text-sm">
          {item.title}
        </p>
        {item.author && (
          <p className="line-clamp-1 text-[10px] text-gray-500 md:text-[11px]">
            {item.author}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-1">
          {item.quality && (
            <span className="text-[10px] text-gray-500">{item.quality}</span>
          )}
          {item.semester && (
            <span className="rounded bg-gray-100 px-1 py-0.5 text-[9px] font-medium text-gray-600">
              {item.semester} sem
            </span>
          )}
          {item.courseCode && (
            <span className="rounded bg-gray-100 px-1 py-0.5 text-[9px] font-medium text-gray-600">
              {item.courseCode}
            </span>
          )}
        </div>

        {item.type === "Lending" && (
          <div className="flex items-center gap-1.5">
            {item.availabilityStatus && (
              <AvailabilityBadge status={item.availabilityStatus} />
            )}
            {item.borrowDuration != null && (
              <span className="text-[9px] font-medium text-sky-700 md:text-[10px]">
                {item.borrowDuration}d
              </span>
            )}
            {item.allowsExtension && (
              <span className="text-[9px] text-sky-600">+ext</span>
            )}
          </div>
        )}

        {item.rating != null && item.rating > 0 && (
          <div className="flex items-center gap-1">
            <StarRating rating={item.rating} />
            {item.reviewCount != null && item.reviewCount > 0 && (
              <span className="text-[9px] text-gray-400">({item.reviewCount})</span>
            )}
          </div>
        )}

        <div className="mt-auto flex items-baseline justify-between pt-1">
          <span className="text-sm font-bold text-[#E30B12] md:text-base">{priceLabel}</span>
          {ownerName && (
            <span className="line-clamp-1 max-w-[6rem] text-[9px] text-gray-400 md:text-[10px]">
              {ownerName}
            </span>
          )}
        </div>

        <Link
          href={`/books/${item._id}`}
          className={`mt-1 inline-flex items-center justify-center rounded-md px-3 py-2 text-[11px] font-semibold text-white transition md:mt-2 md:rounded-lg md:text-sm ${ctaColor(item.type)} ${outOfStock && item.type === "Selling" ? "opacity-60 pointer-events-none" : ""}`}
        >
          {ctaLabel(item.type, outOfStock)}
        </Link>
      </div>
    </div>
  );
}
