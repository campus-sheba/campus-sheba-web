/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Droplets, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useAppState } from "@/contexts/AppStateContext";
import { useTranslations } from "next-intl";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import FeatureHeroAds from "@/components/marketplace/FeatureHeroAds";
import { SectionHeader } from "@/components/marketplace/SectionHeader";
import { ResponsiveCardsGrid } from "@/components/marketplace/ResponsiveCardsGrid";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import { fetchBloodDonorStatsAction } from "@/services/blood-donor";
import { useBloodDonorsFind } from "../hooks/useBloodDonorsFind";
import { useBloodRequestsList } from "../hooks/useBloodRequestsList";
import BloodRequestCard from "./BloodRequestCard";
import DonorCard from "./DonorCard";

export default function BloodLanding() {
  const t = useTranslations("common");
  const router = useRouter();
  const { state, dispatch } = useAppState();
  const tt = (key: string, fallback: string) =>
    t.has(key) ? t(key) : fallback;
  const universityId =
    state.university.selected?._id ??
    (typeof state.user.profile?.university === "object" &&
    state.user.profile.university
      ? state.user.profile.university._id
      : undefined);
  const guestMode = !state.auth.isAuthenticated;

  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    if (!universityId) {
      setStats(null);
      return;
    }
    let cancelled = false;
    setStatsLoading(true);
    void (async () => {
      const res = await fetchBloodDonorStatsAction(universityId);
      if (cancelled) return;
      if (res.success && res.data) setStats(res.data);
      else setStats(null);
      setStatsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [universityId]);

  const donorsPreview = useBloodDonorsFind({
    guestMode,
    universityId,
    pageSize: 6,
    enabled: guestMode ? Boolean(universityId) : true,
  });

  const requestsPreview = useBloodRequestsList({
    guestMode,
    universityId,
    pageSize: 6,
    status: "Active",
    enabled: guestMode ? Boolean(universityId) : true,
  });

  const requireAuth = (path: string) => {
    if (!state.auth.isAuthenticated) {
      dispatch({ type: "OPEN_AUTH_MODAL", payload: { defaultTab: "login" } });
      return;
    }
    router.push(path);
  };

  const statEntries =
    stats && typeof stats === "object"
      ? Object.entries(stats).filter(
          ([, v]) => typeof v === "number" && Number.isFinite(v),
        )
      : [];

  return (
    <SectionWrapper spacing="none" background="transparent" className="my-0">
      <ContentWrapper
        maxWidth="max-w-7xl mx-auto"
        padding="md"
        className="pb-16 pt-2"
      >
        <AppBreadcrumb
          items={[
            { label: tt("bloodLanding.home", "Home"), href: "/" },
            { label: tt("bloodLanding.title", "Blood bank") },
          ]}
        />

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-gray-900">
              {tt("bloodLanding.title", "Blood bank")}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {tt(
                "bloodLanding.subtitle",
                "Find donors and post emergency blood needs on your campus.",
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => requireAuth("/my-blood-donor")}
              className="flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              <Droplets className="mr-2 h-4 w-4 text-red-600" />
              {tt("bloodLanding.registerDonor", "Donor profile")}
            </button>
            <button
              type="button"
              onClick={() => requireAuth("/my-blood-requests/new")}
              className="flex items-center rounded-lg bg-[#00A651] px-4 py-2 text-sm font-semibold text-white active:brightness-95"
            >
              <Plus className="mr-2 h-4 w-4" />
              {tt("bloodLanding.emergencyRequest", "Emergency request")}
            </button>
          </div>
        </div>

        {guestMode && !universityId ? (
          <div className="mt-8 rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-6 py-12 text-center">
            <Droplets className="mx-auto h-10 w-10 text-red-200" />
            <p className="mt-3 text-sm font-medium text-gray-700">
              {tt("bloodLanding.chooseCampus", "Choose a university")}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {tt(
                "bloodLanding.chooseCampusHint",
                "Use the campus selector in the top bar to see donors and requests.",
              )}
            </p>
          </div>
        ) : (
          <>
            <div className="mt-6">
              <FeatureHeroAds universityId={universityId} placement="blood" />
            </div>

            {universityId ? (
              <SectionWrapper
                spacing="sm"
                background="transparent"
                className="my-0 mt-8"
              >
                <h3 className="text-sm font-semibold text-gray-900">
                  {tt("bloodLanding.campusStats", "Campus snapshot")}
                </h3>
                {statsLoading ? (
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 h-fit">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-20 animate-pulse rounded-xl bg-gray-100"
                      />
                    ))}
                  </div>
                ) : statEntries.length > 0 ? (
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {statEntries.map(([k, v]) => (
                      <div
                        key={k}
                        className="rounded-xl border border-gray-100 bg-white px-3 py-3 shadow-sm"
                      >
                        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
                          {k.replace(/([A-Z])/g, " $1").trim()}
                        </p>
                        <p className="mt-1 text-lg font-bold text-gray-900">
                          {Number(v).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-gray-500">
                    {tt(
                      "bloodLanding.statsUnavailable",
                      "Statistics will appear here when available.",
                    )}
                  </p>
                )}
              </SectionWrapper>
            ) : null}

            <SectionWrapper
              spacing="sm"
              background="transparent"
              className="my-0 mt-8"
            >
              <SectionHeader
                title={tt("bloodLanding.donorsPreview", "Donors near you")}
                subtitle={tt(
                  "bloodLanding.donorsPreviewSub",
                  "Verified donors at your university.",
                )}
                viewAllHref="/blood-bank/donors"
              />
              {donorsPreview.error ? (
                <p className="mt-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {donorsPreview.error}
                </p>
              ) : null}
              {donorsPreview.isLoading && donorsPreview.items.length === 0 ? (
                <div className="mt-4">
                  <ResponsiveCardsGrid>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-32 animate-pulse rounded-2xl bg-gray-100"
                      />
                    ))}
                  </ResponsiveCardsGrid>
                </div>
              ) : donorsPreview.items.length === 0 ? (
                <p className="mt-4 rounded-xl border border-dashed border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-500">
                  {tt("bloodLanding.noDonors", "No donors listed yet.")}
                </p>
              ) : (
                <div className="mt-4">
                  <ResponsiveCardsGrid >
                    {donorsPreview.items.map((d) => (
                      <DonorCard key={d._id} donor={d} />
                    ))}
                  </ResponsiveCardsGrid>
                </div>
              )}
            </SectionWrapper>

            <SectionWrapper
              spacing="sm"
              background="transparent"
              className="my-0 mt-10"
            >
              <SectionHeader
                title={tt("bloodLanding.requestsPreview", "Open requests")}
                subtitle={tt(
                  "bloodLanding.requestsPreviewSub",
                  "Help respond to active campus needs.",
                )}
                viewAllHref="/blood-bank/requests"
              />
              {requestsPreview.error ? (
                <p className="mt-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {requestsPreview.error}
                </p>
              ) : null}
              {requestsPreview.isLoading &&
              requestsPreview.items.length === 0 ? (
                <div className="mt-4">
                  <ResponsiveCardsGrid>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-32 animate-pulse rounded-2xl bg-gray-100"
                      />
                    ))}
                  </ResponsiveCardsGrid>
                </div>
              ) : requestsPreview.items.length === 0 ? (
                <p className="mt-4 rounded-xl border border-dashed border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-500">
                  {tt("bloodLanding.noRequests", "No open requests yet.")}
                </p>
              ) : (
                <div className="mt-4">
                  <ResponsiveCardsGrid>
                    {requestsPreview.items.map((r) => (
                      <BloodRequestCard key={r._id} row={r} />
                    ))}
                  </ResponsiveCardsGrid>
                </div>
              )}
            </SectionWrapper>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/blood-bank/donors"
                className="text-sm font-semibold text-[#00A651] hover:underline"
              >
                {tt("bloodLanding.browseDonors", "Browse all donors")} →
              </Link>
              <Link
                href="/blood-bank/requests"
                className="text-sm font-semibold text-[#00A651] hover:underline"
              >
                {tt("bloodLanding.browseRequests", "Browse all requests")} →
              </Link>
            </div>
          </>
        )}
      </ContentWrapper>
    </SectionWrapper>
  );
}
