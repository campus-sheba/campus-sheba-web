"use client";

import dynamic from "next/dynamic";
import {
  ChevronRight,
  Compass,
  MapPin,
  Search,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useAppState } from "@/contexts/AppStateContext";
import type { AppState } from "@/types/global";
import { useTranslations } from "next-intl";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import FeatureHeroAds from "@/components/marketplace/FeatureHeroAds";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import { fetchAllCampusMapLocationsAction } from "@/services/campus-map";
import type { CampusMapLocation } from "@/types/campus-map";
import { CAMPUS_LOCATION_TYPES } from "@/types/campus-map";

const CampusMapLeaflet = dynamic(() => import("./CampusMapLeaflet"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[min(52vh,520px)] min-h-[280px] items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 md:min-h-[420px]">
      <div className="flex flex-col items-center gap-2 text-sm text-slate-500">
        <Compass className="h-8 w-8 animate-pulse text-[#00A651]" />
        Loading map…
      </div>
    </div>
  ),
});

function resolveUniversityId(state: AppState): string | undefined {
  return (
    state.university.selected?._id ??
    (typeof state.user.profile?.university === "object" && state.user.profile.university
      ? state.user.profile.university._id
      : undefined)
  );
}

function typeColorClass(type?: string): string {
  const t = (type ?? "").toLowerCase();
  const m: Record<string, string> = {
    academic: "bg-blue-100 text-blue-800",
    hall: "bg-violet-100 text-violet-800",
    food: "bg-orange-100 text-orange-800",
    transport: "bg-slate-200 text-slate-800",
    hangout: "bg-pink-100 text-pink-800",
    lake: "bg-cyan-100 text-cyan-800",
    cultural: "bg-amber-100 text-amber-900",
  };
  return m[t] ?? "bg-emerald-100 text-emerald-800";
}

export default function CampusMapExplorer() {
  const t = useTranslations("common");
  const { state } = useAppState();
  const tt = (key: string, fallback: string) => (t.has(key) ? t(key) : fallback);
  const universityId = resolveUniversityId(state);

  const [raw, setRaw] = useState<CampusMapLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [popularOnly, setPopularOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<"map" | "list">("map");

  useEffect(() => {
    const tmr = window.setTimeout(() => setDebounced(search), 320);
    return () => window.clearTimeout(tmr);
  }, [search]);

  useEffect(() => {
    if (!universityId) {
      setRaw([]);
      setLoading(false);
      setSelectedId(null);
      return;
    }
    setRaw([]);
    let cancelled = false;
    setLoading(true);
    void (async () => {
      const rows = await fetchAllCampusMapLocationsAction(universityId, 500);
      if (cancelled) return;
      setRaw(rows);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [universityId]);

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    return raw.filter((loc) => {
      if (popularOnly && !loc.isPopular) return false;
      if (typeFilter && (loc.type ?? "").toLowerCase() !== typeFilter.toLowerCase()) return false;
      if (!q) return true;
      const name = (loc.name ?? "").toLowerCase();
      const desc = (loc.description ?? "").toLowerCase();
      const slug = (loc.slug ?? "").toLowerCase();
      return name.includes(q) || desc.includes(q) || slug.includes(q);
    });
  }, [raw, debounced, typeFilter, popularOnly]);

  const selected = useMemo(
    () => (selectedId ? filtered.find((l) => l._id === selectedId) ?? raw.find((l) => l._id === selectedId) : null),
    [selectedId, filtered, raw],
  );

  const onSelect = useCallback((id: string) => {
    setSelectedId(id);
    setMobileTab("map");
  }, []);

  const mapLocations = filtered.filter(
    (l) =>
      typeof l.latitude === "number" &&
      typeof l.longitude === "number" &&
      Number.isFinite(l.latitude) &&
      Number.isFinite(l.longitude),
  );

  return (
    <SectionWrapper spacing="none" background="transparent" className="my-0">
      <ContentWrapper maxWidth="max-w-7xl mx-auto" padding="md" className="pb-16 pt-2">
        <AppBreadcrumb
          items={[
            { label: tt("campusMap.home", "Home"), href: "/" },
            { label: tt("campusMap.title", "Campus map") },
          ]}
        />

        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500/15 to-teal-500/10 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-500/20">
              <Sparkles className="h-3.5 w-3.5" />
              {tt("campusMap.badge", "Explore your campus")}
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
              {tt("campusMap.title", "Campus map")}
            </h1>
            <p className="mt-1 max-w-xl text-sm text-gray-600">
              {tt(
                "campusMap.subtitle",
                "Interactive map of halls, food zones, lakes, and landmarks — built for new students and visitors.",
              )}
            </p>
          </div>
        </div>

        {!universityId ? (
          <div className="mt-10 rounded-2xl border border-dashed border-gray-200 bg-gradient-to-b from-gray-50 to-white px-6 py-14 text-center">
            <MapPin className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-base font-semibold text-gray-800">
              {tt("campusMap.pickCampus", "Pick your university")}
            </p>
            <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
              {tt("campusMap.pickCampusHint", "Select your campus from the top bar to load the live map and places.")}
            </p>
          </div>
        ) : (
          <>
            <div className="mt-6">
              <FeatureHeroAds universityId={universityId} />
            </div>

            <div className="mt-8 flex gap-2 rounded-xl bg-gray-100/80 p-1 md:hidden">
              <button
                type="button"
                onClick={() => setMobileTab("map")}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                  mobileTab === "map" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"
                }`}
              >
                {tt("campusMap.tabMap", "Map")}
              </button>
              <button
                type="button"
                onClick={() => setMobileTab("list")}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                  mobileTab === "list" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"
                }`}
              >
                {tt("campusMap.tabList", "Places")}
              </button>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-5 lg:gap-6">
              <div
                className={`lg:col-span-3 ${mobileTab === "map" ? "block" : "hidden"} md:block`}
              >
                <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm ring-1 ring-black/[0.04]">
                  <CampusMapLeaflet locations={mapLocations} selectedId={selectedId} onSelect={onSelect} />
                </div>
                <p className="mt-2 text-center text-[11px] text-gray-400">
                  {tt("campusMap.osmNote", "Map data © OpenStreetMap contributors")}
                </p>
              </div>

              <div
                className={`flex flex-col gap-4 lg:col-span-2 ${mobileTab === "list" ? "block" : "hidden"} lg:block`}
              >
                <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm ring-1 ring-black/[0.04]">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/80 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-[#00A651] focus:bg-white"
                      placeholder={tt("campusMap.searchPh", "Search places…")}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <select
                      className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700"
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                    >
                      {CAMPUS_LOCATION_TYPES.map((x) => (
                        <option key={x || "all"} value={x}>
                          {x ? x.charAt(0).toUpperCase() + x.slice(1) : tt("campusMap.allTypes", "All types")}
                        </option>
                      ))}
                    </select>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={popularOnly}
                        onChange={(e) => setPopularOnly(e.target.checked)}
                        className="rounded border-gray-300 text-[#00A651] focus:ring-[#00A651]"
                      />
                      <Star className="h-3.5 w-3.5 text-amber-500" />
                      {tt("campusMap.popular", "Popular only")}
                    </label>
                  </div>
                </div>

                <div className="max-h-[min(60vh,560px)] space-y-2 overflow-y-auto rounded-2xl border border-gray-200/80 bg-white p-2 shadow-sm ring-1 ring-black/[0.04]">
                  {loading ? (
                    <div className="space-y-2 p-2">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />
                      ))}
                    </div>
                  ) : filtered.length === 0 ? (
                    <p className="px-4 py-10 text-center text-sm text-gray-500">
                      {tt("campusMap.empty", "No places match your filters.")}
                    </p>
                  ) : (
                    filtered.map((loc) => (
                      <button
                        key={loc._id}
                        type="button"
                        onClick={() => onSelect(loc._id)}
                        className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition ${
                          selectedId === loc._id
                            ? "bg-gradient-to-r from-emerald-50 to-teal-50 ring-1 ring-[#00A651]/30"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div
                          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${typeColorClass(loc.type)}`}
                        >
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-gray-900">{loc.name}</span>
                            {loc.isPopular ? (
                              <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-900">
                                Hot
                              </span>
                            ) : null}
                          </div>
                          {loc.type ? (
                            <span className="text-xs capitalize text-gray-500">{loc.type}</span>
                          ) : null}
                          {loc.description ? (
                            <p className="mt-1 line-clamp-2 text-xs text-gray-600">{loc.description}</p>
                          ) : null}
                        </div>
                        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-gray-300" />
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {selected ? (
              <div className="mt-6 rounded-2xl border border-gray-200/80 bg-gradient-to-br from-white to-gray-50/80 p-5 shadow-md ring-1 ring-black/[0.05]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-gray-900">{selected.name}</h2>
                      {selected.type ? (
                        <span
                          className={`rounded-lg px-2 py-0.5 text-xs font-semibold capitalize ${typeColorClass(selected.type)}`}
                        >
                          {selected.type}
                        </span>
                      ) : null}
                    </div>
                    {selected.description ? (
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">{selected.description}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {typeof selected.latitude === "number" && typeof selected.longitude === "number" ? (
                      <a
                        href={`https://www.google.com/maps?q=${selected.latitude},${selected.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#00A651] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-105"
                      >
                        <Compass className="h-4 w-4" />
                        {tt("campusMap.openMaps", "Open in Google Maps")}
                      </a>
                    ) : null}
                    <Link
                      href={`/campus-map/${selected._id}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                    >
                      {tt("campusMap.sharePage", "Share page")}
                    </Link>
                    <button
                      type="button"
                      onClick={() => setSelectedId(null)}
                      className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50"
                      aria-label="Clear"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </>
        )}
      </ContentWrapper>
    </SectionWrapper>
  );
}
