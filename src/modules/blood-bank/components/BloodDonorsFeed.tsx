/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { MapPin, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useAppState } from "@/contexts/AppStateContext";
import { useTranslations } from "next-intl";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import FeatureHeroAds from "@/components/marketplace/FeatureHeroAds";
import { ResponsiveCardsGrid } from "@/components/marketplace/ResponsiveCardsGrid";
import { Button } from "@/components/ui";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import { getUniversityMetadataAction } from "@/services/user";
import { BLOOD_GROUPS } from "@/types/blood-donor";
import { useBloodDonorsFind } from "../hooks/useBloodDonorsFind";
import DonorCard from "./DonorCard";

export default function BloodDonorsFeed() {
  const t = useTranslations("common");
  const searchParams = useSearchParams();
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

  const [bloodGroup, setBloodGroup] = useState(
    () => searchParams.get("bloodGroup") || "",
  );
  const [hall, setHall] = useState("");
  const [department, setDepartment] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState<boolean | undefined>(
    undefined,
  );
  const [halls, setHalls] = useState<{ _id: string; name: string }[]>([]);
  const [departments, setDepartments] = useState<
    { _id: string; name: string }[]
  >([]);

  useEffect(() => {
    const tmr = window.setTimeout(() => setDebouncedSearch(searchInput), 400);
    return () => window.clearTimeout(tmr);
  }, [searchInput]);

  useEffect(() => {
    if (!state.auth.isAuthenticated || !universityId) {
      setHalls([]);
      setDepartments([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      const res = await getUniversityMetadataAction(universityId);
      if (cancelled) return;
      if (res.success) {
        setHalls(res.halls);
        setDepartments(res.departments);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [state.auth.isAuthenticated, universityId]);

  const { items, total, isLoading, error, hasMore, loadMore } =
    useBloodDonorsFind({
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
            { label: tt("bloodDonorsFeed.home", "Home"), href: "/" },
            {
              label: tt("bloodLanding.title", "Blood bank"),
              href: "/blood-bank",
            },
            { label: tt("bloodDonorsFeed.title", "Donors") },
          ]}
        />

        <div className="mt-4">
          <h2 className="text-xl font-bold text-gray-900">
            {tt("bloodDonorsFeed.title", "Find donors")}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {tt(
              "bloodDonorsFeed.subtitle",
              "Filter by blood group, hall, and availability.",
            )}
          </p>
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
              <FeatureHeroAds universityId={universityId} />
            </div>

            <div className="mt-8 grid gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:grid-cols-2 lg:grid-cols-4">
              <div className="relative md:col-span-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  className={`${inputClass} pl-9`}
                  placeholder={tt(
                    "bloodDonorsFeed.searchPh",
                    "Search name, department, location…",
                  )}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              <select
                className={inputClass}
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
              >
                <option value="">
                  {tt("bloodDonorsFeed.allGroups", "All blood groups")}
                </option>
                {BLOOD_GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <select
                className={inputClass}
                value={
                  onlyAvailable === undefined
                    ? ""
                    : onlyAvailable
                      ? "yes"
                      : "no"
                }
                onChange={(e) => {
                  const v = e.target.value;
                  setOnlyAvailable(v === "" ? undefined : v === "yes");
                }}
              >
                <option value="">
                  {tt("bloodDonorsFeed.allAvailability", "All availability")}
                </option>
                <option value="yes">
                  {tt("bloodDonorsFeed.availableOnly", "Available only")}
                </option>
                <option value="no">
                  {tt("bloodDonorsFeed.unavailableOnly", "Unavailable only")}
                </option>
              </select>
              {halls.length > 0 ? (
                <select
                  className={inputClass}
                  value={hall}
                  onChange={(e) => setHall(e.target.value)}
                >
                  <option value="">
                    {tt("bloodDonorsFeed.allHalls", "All halls")}
                  </option>
                  {halls.map((h) => (
                    <option key={h._id} value={h._id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              ) : null}
              {departments.length > 0 ? (
                <select
                  className={inputClass}
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option value="">
                    {tt("bloodDonorsFeed.allDepartments", "All departments")}
                  </option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              ) : null}
            </div>

            <p className="mt-3 text-xs text-gray-500">
              {total} {tt("bloodDonorsFeed.results", "donors")}
            </p>

            {error ? (
              <p className="mt-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            {isLoading && items.length === 0 ? (
              <div className="mt-6">
                <ResponsiveCardsGrid>
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-32 animate-pulse rounded-2xl bg-gray-100"
                    />
                  ))}
                </ResponsiveCardsGrid>
              </div>
            ) : items.length === 0 ? (
              <p className="mt-6 rounded-xl border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
                {tt("bloodDonorsFeed.empty", "No donors match your filters.")}
              </p>
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={loadMore}
                  disabled={isLoading}
                >
                  {isLoading
                    ? tt("bloodDonorsFeed.loading", "Loading…")
                    : tt("bloodDonorsFeed.loadMore", "Load more")}
                </Button>
              </div>
            ) : null}

            <div className="mt-10">
              <Link
                href="/blood-bank"
                className="text-sm font-semibold text-[#00A651] hover:underline"
              >
                ← {tt("bloodDonorsFeed.back", "Blood bank home")}
              </Link>
            </div>
          </>
        )}
      </ContentWrapper>
    </SectionWrapper>
  );
}
