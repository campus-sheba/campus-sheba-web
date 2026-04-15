"use client";

import { Search } from "lucide-react";
import { SectionHeader } from "@/components/marketplace/SectionHeader";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import { useAppState } from "@/contexts/AppStateContext";
import { useTranslations } from "next-intl";
import { ResponsiveCardsGrid } from "@/components/marketplace/ResponsiveCardsGrid";
import LostFoundCard from "@/modules/lost-found/components/LostFoundCard";
import { useLostFoundBrowse } from "@/modules/lost-found/hooks/useLostFoundBrowse";

const PAGE_SIZE = 8;

function LostFoundRow({
  title,
  subtitle,
  type,
  universityId,
  guestMode,
  viewAllHref,
  emptyHint,
}: {
  title: string;
  subtitle: string;
  type: "Lost" | "Found";
  universityId?: string;
  guestMode: boolean;
  viewAllHref: string;
  emptyHint: string;
}) {
  const canLoad = guestMode ? Boolean(universityId) : true;
  const { items, isLoading, error } = useLostFoundBrowse({
    guestMode,
    universityId,
    debouncedTitle: "",
    type,
    pageSize: PAGE_SIZE,
    enabled: canLoad,
  });

  return (
    <SectionWrapper spacing="sm" background="transparent" className="my-0">
      <SectionHeader
        title={title}
        subtitle={subtitle}
        viewAllHref={viewAllHref}
      />
      {error ? (
        <p className="mt-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {isLoading && items.length === 0 ? (
        <div className="mt-4 hidden md:grid lg:hidden gap-4 grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-2xl bg-gray-100"
            />
          ))}
        </div>
      ) : null}
      {isLoading && items.length === 0 ? (
        <div className="mt-4 hidden lg:grid gap-4 grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-2xl bg-gray-100"
            />
          ))}
        </div>
      ) : null}
      {isLoading && items.length === 0 ? (
        <div className="mt-4 md:hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-2xl bg-gray-100"
              style={{
                display: "inline-block",
                width: "calc(42.86% - 10px)",
                marginRight: "16px",
              }}
            />
          ))}
        </div>
      ) : null}
      {items.length === 0 && !isLoading ? (
        <p className="mt-4 rounded-xl border border-dashed border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-500">
          {emptyHint}
        </p>
      ) : null}
      {items.length > 0 ? (
        <div className="mt-4">
          <ResponsiveCardsGrid>
            {items.slice(0, PAGE_SIZE).map((p) => (
              <LostFoundCard key={p._id} post={p} />
            ))}
          </ResponsiveCardsGrid>
        </div>
      ) : null}
    </SectionWrapper>
  );
}

export function HomeLostFoundRails() {
  const t = useTranslations("common");
  const tt = (key: string, fallback: string) =>
    t.has(key) ? t(key) : fallback;
  const { state } = useAppState();
  const universityId = state.university.selected?._id;
  const guestMode = !state.auth.isAuthenticated;

  if (guestMode && !universityId) {
    return (
      <section id="home-lost-found" aria-labelledby="home-lost-found-heading">
        <SectionWrapper
          spacing="none"
          background="transparent"
          className="my-0 bg-amber-50/30 py-12 md:py-16"
        >
          <ContentWrapper
            maxWidth="max-w-7xl mx-auto"
            padding="none"
            className="px-4 md:px-8"
          >
            <div className="flex items-start gap-4 rounded-2xl border border-dashed border-amber-200/80 bg-white p-8">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-900">
                <Search className="h-6 w-6" aria-hidden />
              </div>
              <div>
                <h2
                  id="home-lost-found-heading"
                  className="text-lg font-bold text-gray-900 md:text-xl"
                >
                  {tt("homeRails.lostFoundTitle", "Lost & found")}
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  {tt(
                    "homeRails.lostFoundNeedCampus",
                    "Pick your university to browse the latest lost and found posts from your campus.",
                  )}
                </p>
              </div>
            </div>
          </ContentWrapper>
        </SectionWrapper>
      </section>
    );
  }

  return (
    <section id="home-lost-found" aria-labelledby="home-lost-found-heading">
      <SectionWrapper
        spacing="none"
        background="transparent"
        className="my-0 bg-amber-50/30 py-12 md:py-16"
      >
        <ContentWrapper
          maxWidth="max-w-7xl mx-auto"
          padding="none"
          className="px-4 md:px-8 lg:px-0"
        >
          <div className="border-b border-amber-200/50 pb-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-800">
              {tt("homeRails.lostFoundKicker", "Lost & found")}
            </p>
            <h2
              id="home-lost-found-heading"
              className="mt-2 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl"
            >
              {tt(
                "homeRails.lostFoundHeadline",
                "Recover items — or help someone else",
              )}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-gray-600 md:text-base">
              {tt(
                "homeRails.lostFoundIntro",
                "Latest lost reports and found posts from your university, refreshed as the community posts them.",
              )}
            </p>
          </div>

          <div className="mt-10 space-y-12">
            <LostFoundRow
              title={tt("homeRails.lostLatest", "Latest lost items")}
              subtitle={tt(
                "homeRails.lostLatestSub",
                "Recently reported missing on campus.",
              )}
              type="Lost"
              universityId={universityId}
              guestMode={guestMode}
              viewAllHref="/lost-found?type=Lost"
              emptyHint={tt("homeRails.lostEmpty", "No lost posts yet.")}
            />
            <LostFoundRow
              title={tt("homeRails.foundLatest", "Latest found items")}
              subtitle={tt(
                "homeRails.foundLatestSub",
                "Good samaritan finds waiting to be claimed.",
              )}
              type="Found"
              universityId={universityId}
              guestMode={guestMode}
              viewAllHref="/lost-found?type=Found"
              emptyHint={tt("homeRails.foundEmpty", "No found posts yet.")}
            />
          </div>
        </ContentWrapper>
      </SectionWrapper>
    </section>
  );
}
