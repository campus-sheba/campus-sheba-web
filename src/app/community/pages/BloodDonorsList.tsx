"use client";

import { Droplets, MapPin, Phone, Search, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAppState } from "@/contexts/AppStateContext";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import FeatureHeroAds from "@/components/marketplace/FeatureHeroAds";
import { ResponsiveCardsGrid } from "@/components/marketplace/ResponsiveCardsGrid";
import { Button } from "@/components/ui";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import { fetchBloodDonorStatsAction } from "@/services/blood-donor";
import { getUniversityMetadataAction } from "@/services/user";
import { BLOOD_GROUPS, type BloodDonorRow, type DonorStats } from "@/types/blood-donor";
import { useBloodDonorsFind } from "@/modules/blood-bank/hooks/useBloodDonorsFind";

function availBadge(row: BloodDonorRow): { label: string; cls: string } {
  const s = row.availabilityStatus ?? (row.isAvailable ? "Available" : "Not Available");
  if (s === "Available") return { label: "Available", cls: "bg-emerald-50 text-emerald-800" };
  if (s === "Recently Donated") return { label: "Recently Donated", cls: "bg-blue-50 text-blue-700" };
  if (s === "Temporarily Unavailable") return { label: "Temp. Unavailable", cls: "bg-amber-50 text-amber-800" };
  return { label: "Not Available", cls: "bg-gray-100 text-gray-600" };
}

function DonorCard({ donor }: { donor: BloodDonorRow }) {
  const isAnon = donor.privacySetting === "Anonymous";
  const name = isAnon ? "Anonymous Donor" : (donor.user?.name ?? "Donor");
  const badge = availBadge(donor);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-gray-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold text-gray-900">{name}</p>
          {!isAnon && donor.user?.gender ? (
            <p className="mt-0.5 text-xs text-gray-500">{donor.user.gender}</p>
          ) : null}
        </div>
        <span className="shrink-0 rounded-lg bg-red-50 px-2.5 py-1 text-sm font-bold text-red-700">
          {donor.bloodGroup}
        </span>
      </div>

      <span className={`mt-2 inline-flex w-fit rounded-md px-2 py-0.5 text-[11px] font-semibold ${badge.cls}`}>
        {badge.label}
      </span>

      {donor.donationType ? (
        <p className="mt-1.5 text-xs text-gray-500">
          Donates: <span className="font-medium text-gray-700">{donor.donationType}</span>
        </p>
      ) : null}

      {!isAnon && donor.campusLocation ? (
        <p className="mt-1.5 flex items-start gap-1 text-xs text-gray-500">
          <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
          <span className="line-clamp-1">{donor.campusLocation}</span>
        </p>
      ) : null}

      {donor.donationCount != null && donor.donationCount > 0 ? (
        <p className="mt-1 text-xs text-gray-500">
          <span className="font-semibold text-gray-700">{donor.donationCount}</span> donation{donor.donationCount !== 1 ? "s" : ""}
        </p>
      ) : null}

      {!isAnon && donor.phoneNumber && donor.contactPreference !== "Call" ? (
        <a
          href={`tel:${donor.phoneNumber.replace(/\s/g, "")}`}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#00A651] hover:underline"
        >
          <Phone className="h-3.5 w-3.5" />
          {donor.phoneNumber}
        </a>
      ) : !isAnon && donor.contactPreference === "Call" && donor.phoneNumber ? (
        <a
          href={`tel:${donor.phoneNumber.replace(/\s/g, "")}`}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#00A651] hover:underline"
        >
          <Phone className="h-3.5 w-3.5" />
          {donor.phoneNumber}
        </a>
      ) : null}
    </div>
  );
}

function StatsPanel({ stats }: { stats: DonorStats }) {
  const maxCount = Math.max(...stats.donorsByBloodGroup.map((b) => b.count), 1);
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-3">
        {[
          { label: "Total donors", value: stats.totalDonors },
          { label: "Available now", value: stats.availableDonors },
          { label: "Active requests", value: stats.activeRequests },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-gray-50 px-3 py-3 text-center">
            <p className="text-xl font-black text-gray-900">{s.value.toLocaleString()}</p>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>
      {stats.donorsByBloodGroup.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">By blood group</p>
          <div className="mt-2 grid grid-cols-4 gap-1.5 sm:grid-cols-8">
            {stats.donorsByBloodGroup.map((b) => (
              <div key={b._id} className="flex flex-col items-center gap-1">
                <div className="w-full rounded bg-gray-100" style={{ height: 40 }}>
                  <div
                    className="w-full rounded bg-red-400 transition-all"
                    style={{ height: `${Math.round((b.count / maxCount) * 40)}px`, marginTop: `${40 - Math.round((b.count / maxCount) * 40)}px` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-gray-700">{b._id}</span>
                <span className="text-[10px] text-gray-500">{b.count}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

const inputClass = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-[#00A651]";

export default function BloodDonorsList() {
  const searchParams = useSearchParams();
  const { state } = useAppState();
  const universityId =
    state.university.selected?._id ??
    (typeof state.user.profile?.university === "object" && state.user.profile.university
      ? state.user.profile.university._id
      : undefined);
  const guestMode = !state.auth.isAuthenticated;

  const [bloodGroup, setBloodGroup] = useState(() => searchParams.get("bloodGroup") || "");
  const [hall, setHall] = useState("");
  const [department, setDepartment] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState<boolean | undefined>(undefined);
  const [halls, setHalls] = useState<{ _id: string; name: string }[]>([]);
  const [departments, setDepartments] = useState<{ _id: string; name: string }[]>([]);
  const [stats, setStats] = useState<DonorStats | null>(null);

  useEffect(() => {
    const tmr = window.setTimeout(() => setDebouncedSearch(searchInput), 400);
    return () => window.clearTimeout(tmr);
  }, [searchInput]);

  useEffect(() => {
    if (!universityId) return;
    let cancelled = false;
    void (async () => {
      const [metaRes, statsRes] = await Promise.all([
        state.auth.isAuthenticated ? getUniversityMetadataAction(universityId) : Promise.resolve(null),
        fetchBloodDonorStatsAction(universityId),
      ]);
      if (cancelled) return;
      if (metaRes?.success) {
        setHalls(metaRes.halls);
        setDepartments(metaRes.departments);
      }
      if (statsRes.success && statsRes.data) setStats(statsRes.data);
    })();
    return () => { cancelled = true; };
  }, [universityId, state.auth.isAuthenticated]);

  const { items, total, isLoading, error, hasMore, loadMore } = useBloodDonorsFind({
    guestMode,
    universityId,
    pageSize: 12,
    bloodGroup: bloodGroup || undefined,
    search: debouncedSearch,
    hall: hall || undefined,
    department: department || undefined,
    isAvailable: onlyAvailable,
    enabled: guestMode ? Boolean(universityId) : true,
  });

  return (
    <SectionWrapper spacing="none" background="transparent" className="my-0">
      <ContentWrapper maxWidth="max-w-7xl mx-auto" padding="md" className="pb-16 pt-2">
        <AppBreadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Blood bank", href: "/blood-bank" },
            { label: "Donors" },
          ]}
        />

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Find blood donors</h2>
            <p className="mt-1 text-sm text-gray-500">Registered donors at your university, filtered by availability and blood group.</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-gray-100 bg-white px-3 py-2 text-sm shadow-sm">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="font-semibold text-gray-900">{total}</span>
            <span className="text-gray-500">donors</span>
          </div>
        </div>

        {guestMode && !universityId ? (
          <div className="mt-8 rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 px-6 py-12 text-center">
            <MapPin className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-700">Select a university to see donors</p>
          </div>
        ) : (
          <>
            <div className="mt-6">
              <FeatureHeroAds universityId={universityId} />
            </div>

            {stats ? (
              <div className="mt-6">
                <StatsPanel stats={stats} />
              </div>
            ) : null}

            <div className="mt-6 grid gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:grid-cols-2 lg:grid-cols-4">
              <div className="relative md:col-span-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  className={`${inputClass} pl-9`}
                  placeholder="Search name, location, department…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              <select
                className={inputClass}
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
              >
                <option value="">All blood groups</option>
                {BLOOD_GROUPS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <select
                className={inputClass}
                value={onlyAvailable === undefined ? "" : onlyAvailable ? "yes" : "no"}
                onChange={(e) => {
                  const v = e.target.value;
                  setOnlyAvailable(v === "" ? undefined : v === "yes");
                }}
              >
                <option value="">All availability</option>
                <option value="yes">Available only</option>
                <option value="no">Unavailable only</option>
              </select>
              {halls.length > 0 ? (
                <select className={inputClass} value={hall} onChange={(e) => setHall(e.target.value)}>
                  <option value="">All halls</option>
                  {halls.map((h) => <option key={h._id} value={h._id}>{h.name}</option>)}
                </select>
              ) : null}
              {departments.length > 0 ? (
                <select className={inputClass} value={department} onChange={(e) => setDepartment(e.target.value)}>
                  <option value="">All departments</option>
                  {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              ) : null}
            </div>

            {error ? (
              <p className="mt-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
            ) : null}

            {isLoading && items.length === 0 ? (
              <div className="mt-6">
                <ResponsiveCardsGrid>
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="h-40 animate-pulse rounded-2xl bg-gray-100" />
                  ))}
                </ResponsiveCardsGrid>
              </div>
            ) : items.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
                <Droplets className="mx-auto h-10 w-10 text-gray-200" />
                <p className="mt-3 text-sm text-gray-500">No donors match your filters.</p>
              </div>
            ) : (
              <div className="mt-6">
                <ResponsiveCardsGrid>
                  {items.map((d) => (
                    <DonorCard key={d._id} donor={d} />
                  ))}
                </ResponsiveCardsGrid>
              </div>
            )}

            {hasMore ? (
              <div className="mt-8 flex justify-center">
                <Button type="button" variant="outline" onClick={loadMore} disabled={isLoading}>
                  {isLoading ? "Loading…" : "Load more"}
                </Button>
              </div>
            ) : null}
          </>
        )}
      </ContentWrapper>
    </SectionWrapper>
  );
}
