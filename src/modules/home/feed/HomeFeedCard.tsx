"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { CardItem } from "@/types/home";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";
import { resolveCardHref } from "./resolveHomeHref";

/** How a shelf wants its cards laid out — derived from the section `type`. */
export type CardVariant = "carousel" | "grid" | "list";

function formatPrice(price: number | null | undefined): string | null {
  if (price == null) return null;
  return `৳${price.toLocaleString("en-BD")}`;
}

/**
 * The one card component that renders every module's items (§5 contract).
 * Presentation switches on the section `type`, never on the module.
 */
export default function HomeFeedCard({
  item,
  variant = "carousel",
}: {
  item: CardItem;
  variant?: CardVariant;
}) {
  const href = resolveCardHref(item);
  const price = formatPrice(item.price);
  const image = item.image || "/placeholder.jpg";
  const unoptimized = shouldUnoptimizeRemoteImage(item.image);

  if (variant === "list") {
    return (
      <Link
        href={href}
        className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition hover:border-gray-200 hover:shadow-md"
      >
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
          {item.image ? (
            <Image
              src={image}
              alt={item.title}
              fill
              unoptimized={unoptimized}
              className="object-cover"
              sizes="64px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-bold text-gray-300">
              {item.module.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-bold text-gray-900">{item.title}</h3>
            {item.badge ? (
              <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-600">
                {item.badge}
              </span>
            ) : null}
          </div>
          {item.subtitle ? (
            <p className="mt-0.5 truncate text-xs text-gray-500">{item.subtitle}</p>
          ) : null}
        </div>
        {price ? (
          <span className="shrink-0 text-sm font-bold text-[#00A651]">{price}</span>
        ) : null}
      </Link>
    );
  }

  // carousel | grid — same card; the container controls width/scroll vs. wrap.
  return (
    <Link
      href={href}
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:border-gray-200 hover:shadow-md ${
        variant === "carousel" ? "w-44 shrink-0 sm:w-52" : ""
      }`}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        {item.image ? (
          <Image
            src={image}
            alt={item.title}
            fill
            unoptimized={unoptimized}
            className="object-cover transition duration-300 group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 50vw, 208px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-bold text-gray-300">
            {item.module.slice(0, 3).toUpperCase()}
          </div>
        )}
        {item.badge ? (
          <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur">
            {item.badge}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 text-sm font-bold text-gray-900">{item.title}</h3>
        {item.subtitle ? (
          <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">{item.subtitle}</p>
        ) : null}
        <div className="mt-auto flex items-center justify-between pt-2">
          {price ? (
            <span className="text-sm font-bold text-[#00A651]">{price}</span>
          ) : (
            <span />
          )}
          {item.rating != null ? (
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-gray-600">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {item.rating.toFixed(1)}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
