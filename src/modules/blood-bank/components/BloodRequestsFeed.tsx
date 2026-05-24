"use client";

import { MapPin } from "lucide-react";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useAppState } from "@/contexts/AppStateContext";
import { useTranslations } from "next-intl";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import FeatureHeroAds from "@/components/marketplace/FeatureHeroAds";
import { Button } from "@/components/ui";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import { useBloodRequestsList } from "../hooks/useBloodRequestsList";
import BloodRequestCard from "./BloodRequestCard";

const STATUSES = ["", "Open", "Fulfilled", "Cancelled"] as const;

export default function BloodRequestsFeed() {
  const t = useTranslations("common");
  const { state } = useAppState();
  const tt = (key: string, fallback: string) =>
    t.has(key) ? t(key) : fallback;
  const universityId =
    state.university.selected?._id ??
    (typeof state.user.profile?.university === "object" &&
    state.user.profile.university
      ? state.user.profile.university._id
      : undefined);
  const guestMode = !state.auth.isAuthenticated;
  const [status, setStatus] = useState("");

  const { items, total, isLoading, error, hasMore, loadMore } =
    useBloodRequestsList({
      guestMode,
      universityId,
      pageSize: 12,
      status: status || undefined,
      enabled: guestMode ? Boolean(universityId) : true,
    });

  const inputClass =
    "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-[#00A651]";

  return (
    <SectionWrapper spacing="none" background="transparent" className="my-0">
      <ContentWrapper
        maxWidth="max-w-7xl mx-auto"
        padding="md"
        className="pb-16 pt-2"
      >
        <AppBreadcrumb
          items={[
            { label: tt("bloodRequestsFeed.home", "Home"), href: "/" },
            {
              label: tt("bloodLanding.title", "Blood bank"),
              href: "/blood-bank",
            },
            { label: tt("bloodRequestsFeed.title", "Requests") },
          ]}
        />

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {tt("bloodRequestsFeed.title", "Blood requests")}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {tt(
                "bloodRequestsFeed.subtitle",
                "Active and past emergency requests on your campus.",
              )}
            </p>
          </div>
          <select
            className={`${inputClass} max-w-xs`}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUSES.map((s) => (
              <option key={s || "all"} value={s}>
                {s || tt("bloodRequestsFeed.allStatuses", "All statuses")}
              </option>
            ))}
          </select>
        </div>

        {guestMode && !universityId ? (
          <div className="mt-8 rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-6 py-12 text-center">
            <MapPin className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-700">
              {tt("bloodLanding.chooseCampus", "Choose a university")}
            </p>
          </div>
        ) : (
          <>
            <div className="mt-6">
              <FeatureHeroAds universityId={universityId} placement="blood" />
            </div>

            <p className="mt-6 text-xs text-gray-500">
              {total} {tt("bloodRequestsFeed.results", "requests")}
            </p>

            {error ? (
              <p className="mt-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            {isLoading && items.length === 0 ? (
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-28 animate-pulse rounded-2xl bg-gray-100"
                  />
                ))}
              </div>
            ) : items.length === 0 ? (
              <p className="mt-6 rounded-xl border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
                {tt("bloodRequestsFeed.empty", "No requests found.")}
              </p>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2">
                {items.map((r) => (
                  <BloodRequestCard key={r._id} row={r} />
                ))}
              </div>
            )}

            {hasMore ? (
              <div className="mt-8 flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={loadMore}
                  disabled={isLoading}
                >
                  {isLoading
                    ? tt("bloodRequestsFeed.loading", "Loading…")
                    : tt("bloodRequestsFeed.loadMore", "Load more")}
                </Button>
              </div>
            ) : null}

            <div className="mt-10">
              <Link
                href="/blood-bank"
                className="text-sm font-semibold text-[#00A651] hover:underline"
              >
                ← {tt("bloodRequestsFeed.back", "Blood bank home")}
              </Link>
            </div>
          </>
        )}
      </ContentWrapper>
    </SectionWrapper>
  );
}
