"use client";

import Link from "next/link";
import React from "react";
import { ChevronDown, Droplets, MapPin } from "lucide-react";
import {
  CAMPUS_LOCATION_GROUPS,
  CAMPUSES,
  CampusLocationGroup,
  DEFAULT_CAMPUS_LOCATION_GROUPS,
} from "./navbar.constants";

type CampusTopbarProps = {
  locale: string;
  campusRef: React.RefObject<HTMLDivElement | null>;
  campusOpen: boolean;
  selectedCampusSummary: string | null;
  selectedCampusShort: string | null;
  draftCampus: string | null;
  draftCampusLocation: string | null;
  onToggleCampusPicker: () => void;
  onSelectCampus: (campusName: string) => void;
  onSelectLocation: (location: string) => void;
  onSaveCampus: () => void;
  onLanguageChange: (newLocale: string) => void;
};

export default function CampusTopbar({
  locale,
  campusRef,
  campusOpen,
  selectedCampusSummary,
  selectedCampusShort,
  draftCampus,
  draftCampusLocation,
  onToggleCampusPicker,
  onSelectCampus,
  onSelectLocation,
  onSaveCampus,
  onLanguageChange,
}: CampusTopbarProps) {
  const activeCampusId = CAMPUSES.find(
    (campus) => campus.name === draftCampus,
  )?.id;
  const activeLocationGroups: CampusLocationGroup[] = activeCampusId
    ? (CAMPUS_LOCATION_GROUPS[activeCampusId] ?? DEFAULT_CAMPUS_LOCATION_GROUPS)
    : [];

  // Derive short name from draftCampus when prop is missing (e.g. from localStorage)
  const displayShort =
    selectedCampusShort ??
    (draftCampus ? CAMPUSES.find((c) => c.name === draftCampus)?.short : null);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[51] flex items-center bg-white/95 backdrop-blur-sm border-b border-brand-green-DEFAULT/10 text-brand-navy-DEFAULT"
      style={{ height: "var(--topbar-height)" }}
      id="campus-topbar"
    >
      <div className="cs-container flex items-center justify-between h-full">
        <div className="relative" ref={campusRef}>
          <button
            onClick={onToggleCampusPicker}
            className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-brand-navy-DEFAULT transition-colors"
            aria-label="Select campus"
            aria-expanded={campusOpen}
          >
            <MapPin
              className="w-3 h-3 text-[#00A651] flex-shrink-0"
              strokeWidth={2.5}
            />
            {selectedCampusSummary ? (
              <>
                <span className="min-w-0 md:hidden inline-block max-w-[100px] truncate text-brand-navy-DEFAULT font-semibold">
                  {displayShort ?? selectedCampusSummary}
                </span>
                <span className="hidden md:inline min-w-0 max-w-[180px] lg:max-w-[320px] truncate text-brand-navy-DEFAULT font-semibold">
                  {selectedCampusSummary}
                </span>
              </>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                Select Your Campus
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              </span>
            )}
            <ChevronDown
              className={`w-3 h-3 text-neutral-400 transition-transform duration-200 flex-shrink-0 ${campusOpen ? "rotate-180" : ""}`}
            />
          </button>

          {campusOpen && (
            <div className="absolute top-full left-0 mt-2 w-[92vw] max-w-4xl rounded-2xl border border-neutral-100 bg-white shadow-2xl overflow-hidden z-[60]">
              <div className="grid lg:grid-cols-[280px,1fr]">
                <div className="border-b lg:border-b-0 lg:border-r border-neutral-100 bg-neutral-50/80 p-4">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.18em]">
                    University
                  </p>
                  <p className="text-xs text-neutral-500 mt-1 mb-3">
                    Select your university first.
                  </p>
                  <div className="space-y-2">
                    {CAMPUSES.map((campus) => (
                      <button
                        key={campus.id}
                        onClick={() => onSelectCampus(campus.name)}
                        className={`w-full rounded-xl border px-3 py-3 text-left transition-all ${
                          draftCampus === campus.name
                            ? "border-brand-green-DEFAULT bg-brand-green-DEFAULT/10"
                            : "border-neutral-200 bg-white hover:border-brand-green-DEFAULT/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-green-DEFAULT/10 text-[11px] font-bold text-brand-green-DEFAULT">
                            {campus.short}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-brand-navy-DEFAULT">
                              {campus.name}
                            </p>
                            <p className="text-[11px] text-neutral-500">
                              {campus.location}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.18em]">
                        Campus Location
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        Pick your hall, landmark, or student zone inside campus.
                      </p>
                    </div>
                    <button
                      onClick={onSaveCampus}
                      disabled={!draftCampus || !draftCampusLocation}
                      className="inline-flex items-center rounded-xl bg-[#E30A13] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
                    >
                      Save Campus
                    </button>
                  </div>

                  {draftCampus ? (
                    <div className="max-h-[420px] overflow-y-auto pr-1 space-y-4">
                      {activeLocationGroups.map((group) => (
                        <div key={group.title}>
                          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                            {group.title}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {group.items.map((item) => (
                              <button
                                key={item}
                                onClick={() => onSelectLocation(item)}
                                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                                  draftCampusLocation === item
                                    ? "border-brand-green-DEFAULT bg-brand-green-DEFAULT text-white"
                                    : "border-neutral-200 bg-white text-neutral-600 hover:border-brand-green-DEFAULT/30 hover:text-brand-navy-DEFAULT"
                                }`}
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 text-center">
                      <div>
                        <p className="text-sm font-semibold text-brand-navy-DEFAULT">
                          Choose a university first
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">
                          Then we will show the relevant campus locations.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <select
            value={locale}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="text-xs font-medium text-neutral-500 bg-transparent border-none focus:outline-none cursor-pointer hover:text-brand-navy-DEFAULT transition-colors appearance-none"
            aria-label="Select language"
            id="topbar-language-select"
          >
            <option value="en" className="bg-white text-neutral-900">
              EN
            </option>
            <option value="bn" className="bg-white text-neutral-900">
              বাং
            </option>
          </select>
          <div className="w-px h-3.5 bg-neutral-200" />
          <Link
            href={`/${locale}/login?redirect=/marketplace/shop/create`}
            className="rounded-lg border border-red-100 bg-red-50 px-2.5 py-1 text-xs font-medium text-[#E30A13] transition-colors hover:bg-red-100 hover:text-red-700"
          >
            Be a Provider
          </Link>
          <Link
            href={`/${locale}/blood-bank`}
            id="topbar-sos-btn"
            className="flex items-center gap-1 rounded-lg border border-red-100 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600 transition-colors hover:bg-red-100 hover:text-red-700"
            title="Emergency Blood Request"
          >
            <Droplets className="w-3 h-3" strokeWidth={2.5} />
            <span>SOS</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
