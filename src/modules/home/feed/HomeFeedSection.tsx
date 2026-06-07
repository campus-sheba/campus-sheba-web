"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { CardItem, HomeFeedSection as Section } from "@/types/home";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";
import HomeFeedCard from "./HomeFeedCard";
import { resolveCardHref, resolveSeeAllHref } from "./resolveHomeHref";

function SeeAllLink({ section }: { section: Section }) {
  const href = resolveSeeAllHref(section.seeAll);
  if (!href) return null;
  return (
    <Link href={href} className="text-sm font-semibold text-[#00A651] hover:underline">
      {section.seeAll?.label || "See all"} →
    </Link>
  );
}

function SectionHead({ section }: { section: Section }) {
  if (!section.title && !section.seeAll) return null;
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div className="min-w-0">
        {section.title ? (
          <h2 className="truncate text-lg font-bold tracking-tight text-gray-900 sm:text-xl">
            {section.title}
          </h2>
        ) : null}
        {section.subtitle ? (
          <p className="mt-0.5 truncate text-sm text-gray-500">{section.subtitle}</p>
        ) : null}
      </div>
      <SeeAllLink section={section} />
    </div>
  );
}

// ── hero ──────────────────────────────────────────────────────────────────
function HeroSection({ section }: { section: Section }) {
  const item = section.items[0];
  if (!item) return null;
  const href = resolveCardHref(item);
  return (
    <Link
      href={href}
      className="relative block aspect-[16/7] w-full overflow-hidden rounded-3xl bg-gray-100 sm:aspect-[21/7]"
    >
      {item.image ? (
        <Image
          src={item.image}
          alt={item.title}
          fill
          unoptimized={shouldUnoptimizeRemoteImage(item.image)}
          className="object-cover"
          sizes="100vw"
          priority
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-0 left-0 p-6 text-white sm:p-8">
        <h2 className="text-xl font-bold sm:text-2xl">{item.title}</h2>
        {item.subtitle ? (
          <p className="mt-1 max-w-xl text-sm text-white/85">{item.subtitle}</p>
        ) : null}
      </div>
    </Link>
  );
}

// ── carousel ────────────────────────────────────────────────────────────────
function CarouselSection({ section }: { section: Section }) {
  return (
    <div>
      <SectionHead section={section} />
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {section.items.map((item) => (
          <HomeFeedCard key={item.id} item={item} variant="carousel" />
        ))}
      </div>
    </div>
  );
}

// ── grid ──────────────────────────────────────────────────────────────────
function GridSection({ section }: { section: Section }) {
  return (
    <div>
      <SectionHead section={section} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {section.items.map((item) => (
          <HomeFeedCard key={item.id} item={item} variant="grid" />
        ))}
      </div>
    </div>
  );
}

// ── list ──────────────────────────────────────────────────────────────────
function ListSection({ section }: { section: Section }) {
  return (
    <div>
      <SectionHead section={section} />
      <div className="space-y-2">
        {section.items.map((item) => (
          <HomeFeedCard key={item.id} item={item} variant="list" />
        ))}
      </div>
    </div>
  );
}

// ── category_chips ──────────────────────────────────────────────────────────
function CategoryChipsSection({ section }: { section: Section }) {
  return (
    <div>
      <SectionHead section={section} />
      <div className="flex flex-wrap gap-2">
        {section.items.map((item) => (
          <Link
            key={item.id}
            href={resolveCardHref(item)}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-[#00A651]/40 hover:text-[#00A651]"
          >
            {item.image ? (
              <span className="relative h-5 w-5 overflow-hidden rounded">
                <Image
                  src={item.image}
                  alt=""
                  fill
                  unoptimized={shouldUnoptimizeRemoteImage(item.image)}
                  className="object-cover"
                  sizes="20px"
                />
              </span>
            ) : null}
            {item.title}
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── quick_actions ────────────────────────────────────────────────────────────
function QuickActionsSection({ section }: { section: Section }) {
  return (
    <div>
      <SectionHead section={section} />
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8">
        {section.items.map((item) => (
          <Link
            key={item.id}
            href={resolveCardHref(item)}
            className="flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white p-3 text-center shadow-sm transition hover:border-gray-200 hover:shadow-md"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-xs font-bold text-[#00A651]">
              {item.title.slice(0, 2).toUpperCase()}
            </span>
            <span className="line-clamp-1 text-xs font-semibold text-gray-700">{item.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── map (bus) — list fallback with a live indicator ──────────────────────────
type BusRaw = { isLive?: boolean; activeSharer?: { name?: string } };

function MapSection({ section }: { section: Section }) {
  return (
    <div>
      <SectionHead section={section} />
      <div className="space-y-2">
        {section.items.map((item) => {
          const raw = (item.raw ?? {}) as BusRaw;
          return (
            <Link
              key={item.id}
              href={resolveCardHref(item)}
              className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-gray-200 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-sm font-bold text-[#00A651]">
                  {item.title.replace(/[^0-9]/g, "") || "•"}
                </span>
                <div>
                  <p className="text-sm font-bold text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500">
                    {raw.activeSharer?.name
                      ? `Shared by ${raw.activeSharer.name}`
                      : item.subtitle || ""}
                  </p>
                </div>
              </div>
              {raw.isLive ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Live
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ── banner — inline strip ────────────────────────────────────────────────────
function BannerSection({ section }: { section: Section }) {
  const item = section.items[0];
  if (!item) return null;
  return (
    <Link
      href={resolveCardHref(item)}
      className="group flex items-center justify-between gap-4 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 p-5 text-white shadow-md"
    >
      <div className="min-w-0">
        <h3 className="text-lg font-bold">{item.title}</h3>
        {item.subtitle ? <p className="mt-1 text-sm text-white/85">{item.subtitle}</p> : null}
      </div>
      <ArrowRight className="h-5 w-5 shrink-0 transition group-hover:translate-x-1" />
    </Link>
  );
}

/** Renders one shelf generically by its `type`. Unknown types fall back to a carousel. */
export default function HomeFeedSection({ section }: { section: Section }) {
  if (!section.items.length && section.type !== "hero") return null;

  switch (section.type) {
    case "hero":
      return <HeroSection section={section} />;
    case "grid":
      return <GridSection section={section} />;
    case "list":
      return <ListSection section={section} />;
    case "category_chips":
      return <CategoryChipsSection section={section} />;
    case "quick_actions":
      return <QuickActionsSection section={section} />;
    case "map":
      return <MapSection section={section} />;
    case "banner":
      return <BannerSection section={section} />;
    case "carousel":
    default:
      // Forward-compatible: unrecognized future types render as a carousel.
      return <CarouselSection section={section} />;
  }
}

export type { CardItem };
