"use client";

import Image from "next/image";
import {
  Clock,
  Facebook,
  Globe,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Store,
  Tag,
  Twitter,
} from "lucide-react";
import type { CreateStudentShopBody } from "@/types/shop-create";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";

function isProbablyUrl(s: string): boolean {
  return /^https?:\/\//i.test(s.trim());
}

function formatSlots(slots: { open: string; close: string }[]): string {
  if (!slots.length) return "—";
  return slots.map((s) => `${s.open}–${s.close}`).join(", ");
}

type Props = {
  payload: CreateStudentShopBody;
  shopCategoryTitle: string;
  specialtyLabels: string[];
};

export default function ShopCreateReviewCard({
  payload,
  shopCategoryTitle,
  specialtyLabels,
}: Props) {
  const social = payload.socialLinks ?? {};
  const entries = [
    {
      key: "facebook",
      label: "Facebook",
      value: social.facebook,
      Icon: Facebook,
    },
    {
      key: "instagram",
      label: "Instagram",
      value: social.instagram,
      Icon: Instagram,
    },
    { key: "twitter", label: "X", value: social.twitter, Icon: Twitter },
    { key: "whatsapp", label: "WhatsApp", value: social.whatsapp, Icon: Phone },
  ].filter((x) => x.value && String(x.value).trim());

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-lg font-bold text-gray-900 md:text-xl">Preview</h2>
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-800 ring-1 ring-amber-100">
          Not published
        </span>
      </div>

      <article className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-black/[0.04]">
        {/* Cover — FB style */}
        <div className="relative aspect-[2.7/1] w-full bg-gradient-to-br from-gray-100 to-gray-200">
          <Image
            src={payload.coverPhoto.url}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 512px) 100vw, 512px"
            priority
            unoptimized={shouldUnoptimizeRemoteImage(payload.coverPhoto.url)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />
        </div>

        {/* Profile row */}
        <div className="relative px-4 pb-0 pt-0 sm:px-5">
          <div className="relative -mt-14 flex flex-col items-center sm:-mt-16 sm:flex-row sm:items-end sm:gap-4">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-[4px] border-white bg-white shadow-lg shadow-black/10 sm:h-32 sm:w-32">
              <Image
                src={payload.logo.url}
                alt={payload.name}
                fill
                className="object-cover"
                sizes="128px"
                unoptimized={shouldUnoptimizeRemoteImage(payload.logo.url)}
              />
            </div>
            <div className="mt-3 w-full text-center sm:mb-1 sm:mt-0 sm:flex-1 sm:pb-1 sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h3 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                  {payload.name}
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 ring-1 ring-emerald-100">
                  <Store className="h-3 w-3" aria-hidden />
                  Student Shop
                </span>
              </div>
              <p className="mt-1 text-sm font-medium text-[#00A651]">
                {shopCategoryTitle}
              </p>
              {specialtyLabels.length > 0 ? (
                <div className="mt-2 flex flex-wrap justify-center gap-1.5 sm:justify-start">
                  {specialtyLabels.map((t) => (
                    <span
                      key={t}
                      className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-5 px-4 py-5 sm:px-5">
          <div>
            <p className="text-sm leading-relaxed text-gray-700">
              {payload.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-2 text-xs font-medium text-gray-800 ring-1 ring-gray-100">
              <MapPin
                className="h-3.5 w-3.5 shrink-0 text-gray-500"
                aria-hidden
              />
              {payload.address}
            </span>
            <a
              href={`tel:${payload.phoneNumber.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold text-[#00A651] ring-1 ring-gray-100 hover:bg-emerald-50"
            >
              <Phone className="h-3.5 w-3.5" aria-hidden />
              {payload.phoneNumber}
            </a>
            {payload.contactEmail ? (
              <a
                href={`mailto:${payload.contactEmail}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-2 text-xs font-medium text-gray-800 ring-1 ring-gray-100 hover:bg-gray-100"
              >
                <Mail className="h-3.5 w-3.5 text-gray-500" aria-hidden />
                {payload.contactEmail}
              </a>
            ) : null}
            {payload.website ? (
              <a
                href={
                  isProbablyUrl(payload.website)
                    ? payload.website
                    : `https://${payload.website}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-2 text-xs font-medium text-blue-700 ring-1 ring-gray-100 hover:bg-blue-50"
              >
                <Globe className="h-3.5 w-3.5" aria-hidden />
                Website
              </a>
            ) : null}
          </div>

          {entries.length > 0 ? (
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Social
              </p>
              <div className="flex flex-wrap gap-2">
                {entries.map(({ key, label, value, Icon }) => {
                  const v = String(value).trim();
                  const asLink = isProbablyUrl(v);
                  const className =
                    "inline-flex max-w-full items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 shadow-sm transition hover:border-[#00A651]/30 hover:text-[#00A651]";
                  if (asLink) {
                    return (
                      <a
                        key={key}
                        href={v}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={className}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        {label}
                      </a>
                    );
                  }
                  return (
                    <span
                      key={key}
                      className={`${className} cursor-default hover:border-gray-200 hover:text-gray-800`}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      <span className="truncate">
                        {label}: {v}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="grid gap-3 border-t border-gray-100 pt-4 sm:grid-cols-2">
            <div className="rounded-xl bg-gray-50/80 p-3 ring-1 ring-gray-100">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                <Sparkles className="h-3 w-3 text-amber-500" aria-hidden />
                Minimum order
              </p>
              <p className="mt-1 text-lg font-bold text-gray-900">
                ৳{payload.minimumOrderAmount}
              </p>
            </div>
            {payload.tags && payload.tags.length > 0 ? (
              <div className="rounded-xl bg-gray-50/80 p-3 ring-1 ring-gray-100">
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                  <Tag className="h-3 w-3" aria-hidden />
                  Tags
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {payload.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-md bg-white px-2 py-0.5 text-[11px] font-medium text-gray-700 ring-1 ring-gray-200"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-gray-50/40 p-3 ring-1 ring-dashed ring-gray-200">
                <p className="text-xs text-gray-400">No tags</p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              Hours you&apos;re submitting
            </p>
            <ul className="grid gap-1.5 text-xs text-gray-700 sm:grid-cols-2">
              {payload.operatingHours.map((row) => (
                <li
                  key={row.day}
                  className="flex items-center justify-between gap-2 rounded-lg bg-gray-50/90 px-2.5 py-1.5 ring-1 ring-gray-100"
                >
                  <span className="font-semibold text-gray-800">
                    {row.day.slice(0, 3)}
                  </span>
                  <span className="text-right text-gray-600">
                    {row.isClosed ? (
                      <span className="text-gray-400">Closed</span>
                    ) : (
                      formatSlots(row.slots)
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-4 text-[11px] text-gray-500">
            <span>
              Aggregator:{" "}
              <strong className="text-gray-800">
                {payload.isAggregator ? "Yes" : "No"}
              </strong>
            </span>
            <span>
              Skill-based:{" "}
              <strong className="text-gray-800">
                {payload.isSkillBased ? "Yes" : "No"}
              </strong>
            </span>
            {payload.location ? (
              <span>
                Map:{" "}
                <strong className="font-mono text-gray-800">
                  {payload.location.coordinates[0].toFixed(4)},{" "}
                  {payload.location.coordinates[1].toFixed(4)}
                </strong>
              </span>
            ) : null}
          </div>
        </div>
      </article>

      <p className="mt-4 px-1 text-center text-xs text-gray-500">
        This is how your storefront will look to students after approval. By
        submitting, you confirm these details are accurate.
      </p>
    </div>
  );
}
