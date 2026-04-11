"use client";

import { useMemo } from "react";
import { Droplets } from "lucide-react";
import { SectionHeader } from "@/components/marketplace/SectionHeader";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import { useAppState } from "@/contexts/AppStateContext";
import { useTranslations } from "next-intl";
import BloodRequestCard from "@/modules/blood-bank/components/BloodRequestCard";
import DonorCard from "@/modules/blood-bank/components/DonorCard";
import { useBloodDonorsFind } from "@/modules/blood-bank/hooks/useBloodDonorsFind";
import { useBloodRequestsList } from "@/modules/blood-bank/hooks/useBloodRequestsList";
import type { BloodRequestRow } from "@/types/blood-donor";

const DONOR_PREVIEW = 6;
const REQUEST_PREVIEW = 6;

function urgencyRank(u: string | undefined): number {
  const x = (u ?? "").toLowerCase();
  if (x === "critical") return 0;
  if (x === "high") return 1;
  if (x === "medium") return 2;
  if (x === "low") return 3;
  return 5;
}

function sortRequestsUrgentFirst(rows: BloodRequestRow[]): BloodRequestRow[] {
  return [...rows].sort((a, b) => {
    const ra = urgencyRank(typeof a.urgencyLevel === "string" ? a.urgencyLevel : undefined);
    const rb = urgencyRank(typeof b.urgencyLevel === "string" ? b.urgencyLevel : undefined);
    if (ra !== rb) return ra - rb;
    const ta = Date.parse(a.createdAt ?? "") || 0;
    const tb = Date.parse(b.createdAt ?? "") || 0;
    return tb - ta;
  });
}

export function HomeBloodRails() {
  const t = useTranslations("common");
  const tt = (key: string, fallback: string) => (t.has(key) ? t(key) : fallback);
  const { state } = useAppState();
  const universityId =
    state.university.selected?._id ??
    (typeof state.user.profile?.university === "object" && state.user.profile.university
      ? state.user.profile.university._id
      : undefined);
  const guestMode = !state.auth.isAuthenticated;

  const donorsPreview = useBloodDonorsFind({
    guestMode,
    universityId,
    pageSize: DONOR_PREVIEW,
    enabled: guestMode ? Boolean(universityId) : true,
  });

  const requestsPreview = useBloodRequestsList({
    guestMode,
    universityId,
    pageSize: 12,
    status: "Open",
    enabled: guestMode ? Boolean(universityId) : true,
  });

  const urgentRequests = useMemo(
    () => sortRequestsUrgentFirst(requestsPreview.items).slice(0, REQUEST_PREVIEW),
    [requestsPreview.items],
  );

  if (guestMode && !universityId) {
    return (
      <section id="home-blood" aria-labelledby="home-blood-heading">
        <SectionWrapper spacing="none" background="transparent" className="my-0 bg-red-50/40 py-12 md:py-16">
          <ContentWrapper maxWidth="max-w-7xl mx-auto" padding="none" className="px-4 md:px-8">
            <div className="flex items-start gap-4 rounded-2xl border border-dashed border-red-200/80 bg-white p-8">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700">
                <Droplets className="h-6 w-6" aria-hidden />
              </div>
              <div>
                <h2 id="home-blood-heading" className="text-lg font-bold text-gray-900 md:text-xl">
                  {tt("homeRails.bloodTitle", "Blood bank")}
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  {tt(
                    "homeRails.bloodNeedCampus",
                    "Select a university to preview donors near you and open emergency blood requests.",
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
    <section id="home-blood" aria-labelledby="home-blood-heading">
      <SectionWrapper spacing="none" background="transparent" className="my-0 bg-red-50/40 py-12 md:py-16">
        <ContentWrapper maxWidth="max-w-7xl mx-auto" padding="none" className="px-4 md:px-8">
          <div className="border-b border-red-100 pb-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-700">
              {tt("homeRails.bloodKicker", "Blood bank")}
            </p>
            <h2 id="home-blood-heading" className="mt-2 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
              {tt("homeRails.bloodHeadline", "Donors nearby & urgent campus requests")}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-gray-600 md:text-base">
              {tt(
                "homeRails.bloodIntro",
                "Open requests are sorted with critical and high urgency first so you can respond when minutes matter.",
              )}
            </p>
          </div>

          <div className="mt-10 space-y-12">
            <SectionWrapper spacing="sm" background="transparent" className="my-0">
              <SectionHeader
                title={tt("homeRails.bloodDonors", "Donors near your campus")}
                subtitle={tt("homeRails.bloodDonorsSub", "Students and staff who registered to help.")}
                viewAllHref="/blood-bank/donors"
              />
              {donorsPreview.error ? (
                <p className="mt-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {donorsPreview.error}
                </p>
              ) : null}
              {donorsPreview.isLoading && donorsPreview.items.length === 0 ? (
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-40 animate-pulse rounded-2xl bg-white" />
                  ))}
                </div>
              ) : donorsPreview.items.length === 0 ? (
                <p className="mt-4 rounded-xl border border-dashed border-red-100/80 bg-white px-4 py-8 text-center text-sm text-gray-500">
                  {tt("homeRails.bloodNoDonors", "No donors listed yet.")}
                </p>
              ) : (
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {donorsPreview.items.map((d) => (
                    <DonorCard key={d._id} donor={d} />
                  ))}
                </div>
              )}
            </SectionWrapper>

            <SectionWrapper spacing="sm" background="transparent" className="my-0">
              <SectionHeader
                title={tt("homeRails.bloodUrgent", "Urgent & open blood requests")}
                subtitle={tt("homeRails.bloodUrgentSub", "Active needs from your university community.")}
                viewAllHref="/blood-bank/requests"
              />
              {requestsPreview.error ? (
                <p className="mt-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {requestsPreview.error}
                </p>
              ) : null}
              {requestsPreview.isLoading && requestsPreview.items.length === 0 ? (
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-44 animate-pulse rounded-2xl bg-white" />
                  ))}
                </div>
              ) : urgentRequests.length === 0 ? (
                <p className="mt-4 rounded-xl border border-dashed border-red-100/80 bg-white px-4 py-8 text-center text-sm text-gray-500">
                  {tt("homeRails.bloodNoRequests", "No open requests right now.")}
                </p>
              ) : (
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {urgentRequests.map((row) => (
                    <BloodRequestCard key={row._id} row={row} />
                  ))}
                </div>
              )}
            </SectionWrapper>
          </div>
        </ContentWrapper>
      </SectionWrapper>
    </section>
  );
}
