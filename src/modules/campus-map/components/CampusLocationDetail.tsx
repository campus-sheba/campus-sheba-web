/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import dynamic from "next/dynamic";
import { ArrowLeft, Compass, MapPin } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import { fetchCampusMapLocationByIdAction } from "@/services/campus-map";
import type { CampusMapLocation } from "@/types/campus-map";

const CampusMapLeaflet = dynamic(() => import("./CampusMapLeaflet"), {
  ssr: false,
  loading: () => (
    <div className="h-72 animate-pulse rounded-2xl bg-slate-100" />
  ),
});

export default function CampusLocationDetail() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const [loc, setLoc] = useState<CampusMapLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const onSelect = useCallback(() => {}, []);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void (async () => {
      const res = await fetchCampusMapLocationByIdAction(id);
      if (cancelled) return;
      if (res.success && res.data) {
        setLoc(res.data);
        setError(null);
      } else {
        setLoc(null);
        setError(res.message ?? "Not found.");
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const mapPoints =
    loc &&
    typeof loc.latitude === "number" &&
    typeof loc.longitude === "number" &&
    Number.isFinite(loc.latitude) &&
    Number.isFinite(loc.longitude)
      ? [loc]
      : [];

  const uniName =
    loc && typeof loc.university === "object" && loc.university?.name
      ? loc.university.name
      : null;

  return (
    <SectionWrapper spacing="none" background="transparent" className="my-0">
      <ContentWrapper
        maxWidth="max-w-7xl mx-auto"
        padding="md"
        className="pb-16 pt-2"
      >
        <div className="">
          <AppBreadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Campus map", href: "/campus-map" },
              { label: loc?.name ?? "Place" },
            ]}
          />

         

          {loading ? (
            <div className="mt-8 h-64 animate-pulse rounded-2xl bg-gray-100" />
          ) : error || !loc ? (
            <p className="mt-8 text-sm text-red-600">{error ?? "Not found."}</p>
          ) : (
            <div className="mt-8 space-y-6">
              <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-emerald-50/40 p-6 shadow-sm ring-1 ring-black/[0.04]">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {loc.name}
                  </h1>
                  {loc.type ? (
                    <span className="rounded-lg bg-emerald-100 px-2 py-0.5 text-xs font-bold capitalize text-emerald-900">
                      {loc.type}
                    </span>
                  ) : null}
                  {loc.isPopular ? (
                    <span className="rounded-lg bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900">
                      Popular
                    </span>
                  ) : null}
                </div>
                {uniName ? (
                  <p className="mt-1 text-sm text-gray-500">{uniName}</p>
                ) : null}
                {loc.description ? (
                  <p className="mt-4 text-sm leading-relaxed text-gray-700">
                    {loc.description}
                  </p>
                ) : null}
              </div>

              {mapPoints.length > 0 ? (
                <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-md">
                  <CampusMapLeaflet
                    locations={mapPoints}
                    selectedId={loc._id}
                    onSelect={onSelect}
                  />
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-600">
                  No map coordinates are available for this place yet.
                </p>
              )}

              {mapPoints.length > 0 ? (
                <a
                  href={`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#00A651] px-5 py-3 text-sm font-bold text-white shadow-md hover:brightness-105"
                >
                  <Compass className="h-4 w-4" />
                  Navigate in Google Maps
                </a>
              ) : loc.description ? (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.description)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                >
                  <MapPin className="h-4 w-4 text-[#00A651]" />
                  Search on Maps
                </a>
              ) : null}
            </div>
          )}
        </div>
      </ContentWrapper>
    </SectionWrapper>
  );
}
