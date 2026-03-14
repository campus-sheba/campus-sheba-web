"use client";

import React from "react";
import { CAMPUS_LOCATION_GROUPS, CAMPUSES, CampusLocationGroup, DEFAULT_CAMPUS_LOCATION_GROUPS } from "./navbar.constants";

type CampusSetupModalProps = {
  open: boolean;
  draftCampus: string | null;
  draftCampusLocation: string | null;
  onSelectCampus: (campusName: string) => void;
  onSelectLocation: (location: string) => void;
  onSave: () => void;
};

export default function CampusSetupModal({
  open,
  draftCampus,
  draftCampusLocation,
  onSelectCampus,
  onSelectLocation,
  onSave,
}: CampusSetupModalProps) {
  if (!open) return null;

  const activeCampusId = CAMPUSES.find((campus) => campus.name === draftCampus)?.id;
  const activeLocationGroups: CampusLocationGroup[] = activeCampusId
    ? (CAMPUS_LOCATION_GROUPS[activeCampusId] ?? DEFAULT_CAMPUS_LOCATION_GROUPS)
    : [];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-brand-navy-DEFAULT/45 px-4 backdrop-blur-sm">
      <div className="w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/30 bg-white shadow-2xl">
        <div className="grid lg:grid-cols-[320px,1fr]">
          <div className="border-b lg:border-b-0 lg:border-r border-neutral-100 bg-gradient-to-br from-brand-green-DEFAULT/8 via-white to-red-50 p-6">
            <span className="inline-flex rounded-full border border-brand-green-DEFAULT/15 bg-brand-green-DEFAULT/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-green-DEFAULT">
              Campus Setup
            </span>
            <h2 className="mt-4 font-display text-2xl font-bold text-brand-navy-DEFAULT">Tell us where you study</h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-500">
              Campus Sheba uses your university and in-campus location to personalize delivery, listings, blood requests, and nearby services.
            </p>

            <div className="mt-6 space-y-3 rounded-2xl border border-neutral-100 bg-white p-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-400">Step 1</p>
                <p className="mt-1 text-sm font-semibold text-brand-navy-DEFAULT">Choose your university</p>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-400">Step 2</p>
                <p className="mt-1 text-sm font-semibold text-brand-navy-DEFAULT">Select your hall, landmark, or student hub</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4">
              <p className="text-xs font-semibold text-[#E30A13]">Required before browsing</p>
              <p className="mt-1 text-xs leading-relaxed text-neutral-600">
                We need this once on first visit so your feed, food spots, halls, and emergency support stay campus-specific.
              </p>
            </div>
          </div>

          <div className="p-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-400">University</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {CAMPUSES.map((campus) => (
                  <button
                    key={campus.id}
                    onClick={() => onSelectCampus(campus.name)}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      draftCampus === campus.name
                        ? "border-brand-green-DEFAULT bg-brand-green-DEFAULT/10 shadow-sm"
                        : "border-neutral-200 bg-white hover:border-brand-green-DEFAULT/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green-DEFAULT/10 text-xs font-bold text-brand-green-DEFAULT">
                        {campus.short}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-brand-navy-DEFAULT">{campus.name}</p>
                        <p className="mt-1 text-xs text-neutral-500">{campus.location}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between gap-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-400">Campus Location</p>
                {draftCampusLocation && (
                  <span className="rounded-full bg-brand-green-DEFAULT/10 px-3 py-1 text-[11px] font-semibold text-brand-green-DEFAULT">
                    {draftCampusLocation}
                  </span>
                )}
              </div>

              {draftCampus ? (
                <div className="mt-3 max-h-[360px] space-y-4 overflow-y-auto pr-1">
                  {activeLocationGroups.map((group) => (
                    <div key={group.title}>
                      <p className="mb-2 text-xs font-semibold text-neutral-500">{group.title}</p>
                      <div className="flex flex-wrap gap-2">
                        {group.items.map((item) => (
                          <button
                            key={item}
                            onClick={() => onSelectLocation(item)}
                            className={`rounded-full border px-3 py-2 text-xs font-medium transition-all ${
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
                <div className="mt-3 flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 text-center">
                  <div>
                    <p className="text-sm font-semibold text-brand-navy-DEFAULT">Select your university first</p>
                    <p className="mt-1 text-xs text-neutral-500">We will then show the halls, landmarks, and student spots from that campus.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-neutral-100 pt-5">
              <button
                onClick={onSave}
                disabled={!draftCampus || !draftCampusLocation}
                className="inline-flex items-center rounded-xl bg-[#E30A13] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
              >
                Continue to Campus Sheba
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
