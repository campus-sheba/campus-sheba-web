"use client";

import { MapPin, Plus } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { useAppState } from "@/contexts/AppStateContext";
import { useTranslations } from "next-intl";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import FeatureHeroAds from "@/components/marketplace/FeatureHeroAds";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import { ResponsiveCardsGrid } from "@/components/marketplace/ResponsiveCardsGrid";
import { SectionHeader } from "@/components/marketplace/SectionHeader";
import { useLostFoundBrowse } from "../hooks/useLostFoundBrowse";
import LostFoundCard from "./LostFoundCard";

function SectionBlock({
  title,
  subtitle,
  type,
  universityId,
  guestMode,
  viewAllHref,
  tt,
}: {
  title: string;
  subtitle: string;
  type: "Lost" | "Found";
  universityId?: string;
  guestMode: boolean;
  viewAllHref: string;
  tt: (k: string, f: string) => string;
}) {
  const canLoad = guestMode ? Boolean(universityId) : true;
  const { items, isLoading, error } = useLostFoundBrowse({
    guestMode,
    universityId,
    debouncedTitle: "",
    type,
    pageSize: 8,
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
        <div className="mt-4">
          <ResponsiveCardsGrid>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/3] animate-pulse rounded-2xl bg-gray-100"
              />
            ))}
          </ResponsiveCardsGrid>
        </div>
      ) : items.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-500">
          {tt("lostFoundLanding.noPosts", "No posts yet.")}
        </p>
      ) : (
        <div className="mt-4">
          <ResponsiveCardsGrid>
            {items.slice(0, 8).map((p) => (
              <LostFoundCard key={p._id} post={p} />
            ))}
          </ResponsiveCardsGrid>
        </div>
      )}
    </SectionWrapper>
  );
}

export default function LostFoundLanding() {
  const t = useTranslations("common");
  const router = useRouter();
  const { state, dispatch } = useAppState();
  const tt = (key: string, fallback: string) =>
    t.has(key) ? t(key) : fallback;
  const universityId = state.university.selected?._id;
  const guestMode = !state.auth.isAuthenticated;

  const openCreate = () => {
    if (!state.auth.isAuthenticated) {
      dispatch({ type: "OPEN_AUTH_MODAL", payload: { defaultTab: "login" } });
      return;
    }
    router.push("/my-lost-found/new");
  };

  return (
    <SectionWrapper spacing="none" background="transparent" className="my-0">
      <ContentWrapper
        maxWidth="max-w-7xl mx-auto"
        padding="md"
        className="pb-16 pt-2"
      >
        <AppBreadcrumb
          items={[
            { label: tt("lostFoundLanding.home", "Home"), href: "/" },
            { label: tt("lostFoundLanding.title", "Lost & Found") },
          ]}
        />

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-gray-900">
              {tt("lostFoundLanding.title", "Lost & Found")}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {tt(
                "lostFoundLanding.subtitle",
                "Report lost items or help others recover what they lost.",
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={openCreate}
              className="flex items-center rounded-lg bg-[#00A651] px-4 py-2 text-sm font-semibold text-white active:brightness-95"
            >
              <Plus className="mr-2 h-4 w-4" />
              {tt("lostFoundLanding.post", "Post")}
            </button>
            <Link
              href="/lost-found/all"
              className="text-sm font-semibold text-[#00A651] hover:underline"
            >
              {tt("lostFoundLanding.browseAll", "Browse all")} →
            </Link>
          </div>
        </div>

        {guestMode && !universityId ? (
          <div className="mt-8 rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-6 py-12 text-center">
            <MapPin className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-700">
              {tt("lostFoundLanding.chooseCampus", "Choose a university")}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {tt(
                "lostFoundLanding.chooseCampusHint",
                "Use the campus selector in the top bar.",
              )}
            </p>
          </div>
        ) : (
          <div className="mt-10 space-y-10">
            {universityId ? (
              <div className="mb-2">
                <FeatureHeroAds universityId={universityId} />
              </div>
            ) : null}
            <SectionBlock
              title={tt("lostFoundLanding.lost", "Recently lost")}
              subtitle={tt(
                "lostFoundLanding.lostSub",
                "Items people are looking for.",
              )}
              type="Lost"
              universityId={universityId}
              guestMode={guestMode}
              viewAllHref="/lost-found/all?type=Lost"
              tt={tt}
            />
            <SectionBlock
              title={tt("lostFoundLanding.found", "Recently found")}
              subtitle={tt(
                "lostFoundLanding.foundSub",
                "Items waiting to be claimed.",
              )}
              type="Found"
              universityId={universityId}
              guestMode={guestMode}
              viewAllHref="/lost-found/all?type=Found"
              tt={tt}
            />
          </div>
        )}
      </ContentWrapper>
    </SectionWrapper>
  );
}
