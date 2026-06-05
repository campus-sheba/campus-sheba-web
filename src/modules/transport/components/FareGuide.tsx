"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, CircleDollarSign, Info, MapPin, Route } from "lucide-react";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import TransportSubHeader from "./TransportSubHeader";
import { FARE_PLACES, MOCK_FARES } from "../mock/data";
import type { VehicleType } from "@/types/transport";

const VEHICLE_META: Record<VehicleType, { emoji: string; tint: string }> = {
  Rickshaw: { emoji: "🛺", tint: "bg-amber-50 text-amber-700 border-amber-200" },
  CNG: { emoji: "🚙", tint: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  Auto: { emoji: "🛺", tint: "bg-sky-50 text-sky-700 border-sky-200" },
  "E-Cart": { emoji: "🚗", tint: "bg-violet-50 text-violet-700 border-violet-200" },
  "Campus Bus": { emoji: "🚌", tint: "bg-rose-50 text-rose-700 border-rose-200" },
};

export default function FareGuide() {
  const [fromId, setFromId] = useState(FARE_PLACES[0].id);
  const [toId, setToId] = useState(FARE_PLACES[1].id);

  const match = useMemo(() => {
    return (
      MOCK_FARES.find((f) => f.fromId === fromId && f.toId === toId) ||
      MOCK_FARES.find((f) => f.fromId === toId && f.toId === fromId) ||
      null
    );
  }, [fromId, toId]);

  const placeName = (id: string) => FARE_PLACES.find((p) => p.id === id)?.name ?? "—";
  const swap = () => {
    setFromId(toId);
    setToId(fromId);
  };

  return (
    <SectionWrapper spacing="none" background="transparent" className="my-0">
      <ContentWrapper maxWidth="full" padding="md" className="mx-auto max-w-5xl space-y-6 pb-16 pt-4">
        <TransportSubHeader
          icon={CircleDollarSign}
          title="Fare Guide"
          subtitle="Know the fair price before you ride. Verified rates between campus landmarks."
          gradient="from-amber-500 to-orange-600"
          preview
        >
          {/* origin/destination selector */}
          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-end">
            <Selector
              label="From"
              value={fromId}
              onChange={setFromId}
              exclude={toId}
            />
            <button
              type="button"
              onClick={swap}
              aria-label="Swap"
              className="mx-auto flex h-10 w-10 flex-shrink-0 items-center justify-center self-center rounded-xl bg-white/20 text-white backdrop-blur transition hover:bg-white/30 sm:mb-0.5"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </button>
            <Selector label="To" value={toId} onChange={setToId} exclude={fromId} />
          </div>
        </TransportSubHeader>

        {/* result */}
        {match ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <MapPin className="h-4 w-4 text-amber-500" />
                {placeName(fromId)}
                <span className="text-gray-300">→</span>
                {placeName(toId)}
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                <Route className="h-3.5 w-3.5" /> ~{match.distanceKm} km
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {match.fares.map((f) => {
                const meta = VEHICLE_META[f.vehicleType];
                return (
                  <div
                    key={f.vehicleType}
                    className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm font-bold text-gray-900">
                        <span className="text-2xl">{meta.emoji}</span>
                        {f.vehicleType}
                      </span>
                      {f.shared ? (
                        <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${meta.tint}`}>
                          Shared OK
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-gray-900">৳{f.min}</span>
                      {f.max > f.min ? (
                        <span className="text-lg font-semibold text-gray-400">– ৳{f.max}</span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {f.note ?? "Typical fair fare for this route"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 p-10 text-center">
            <CircleDollarSign className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-700">No fare data for this pair yet</p>
            <p className="mt-1 text-sm text-gray-500">
              Try Dairy Gate → TSC, Bottle Tree Garden, Shankhachil Lake, Highway or Savar Bazar.
            </p>
          </div>
        )}

        <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
          Fares are community-sourced fair-price guidance. Always confirm with the driver before
          riding. Rates are higher at night and during rain.
        </div>
      </ContentWrapper>
    </SectionWrapper>
  );
}

function Selector({
  label,
  value,
  onChange,
  exclude,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  exclude: string;
}) {
  return (
    <label className="flex flex-1 flex-col gap-1">
      <span className="text-xs font-semibold text-white/85">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border-0 bg-white/95 px-3 py-2.5 text-sm font-medium text-gray-900 shadow-sm outline-none focus:ring-2 focus:ring-white"
      >
        {FARE_PLACES.filter((p) => p.id !== exclude).map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </label>
  );
}
