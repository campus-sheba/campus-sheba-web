"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, CircleDollarSign, Info, MapPin, Route } from "lucide-react";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import TransportSubHeader, {
  TransportFilterPanel,
  transportInputClass,
} from "./TransportSubHeader";
import { FARE_PLACES, MOCK_FARES } from "../mock/data";
import type { VehicleType } from "@/types/transport";

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
      <ContentWrapper
        maxWidth="full"
        padding="md"
        className="mx-auto max-w-5xl space-y-5 pb-20 pt-2"
      >
        <TransportSubHeader
          icon={CircleDollarSign}
          title="Fare guide"
          subtitle="Verified rates between campus landmarks. Compare before you ride."
          breadcrumbLabel="Fare guide"
          preview
        />

        <TransportFilterPanel title="Route">
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-end">
            <PlaceSelector label="From" value={fromId} onChange={setFromId} exclude={toId} />
            <button
              type="button"
              onClick={swap}
              aria-label="Swap origin and destination"
              className="mx-auto flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 sm:mb-0.5"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </button>
            <PlaceSelector label="To" value={toId} onChange={setToId} exclude={fromId} />
          </div>
        </TransportFilterPanel>

        {match ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <MapPin className="h-4 w-4 text-[#00A651]" />
                {placeName(fromId)}
                <span className="text-gray-300">→</span>
                {placeName(toId)}
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                <Route className="h-3.5 w-3.5" /> ~{match.distanceKm} km
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {match.fares.map((f) => (
                <div
                  key={f.vehicleType}
                  className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-gray-900">{f.vehicleType}</span>
                    {f.shared ? (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
                        Shared OK
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-2xl font-bold tabular-nums text-gray-900">৳{f.min}</span>
                    {f.max > f.min ? (
                      <span className="text-lg font-medium text-gray-400">– ৳{f.max}</span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {f.note ?? "Typical fair fare for this route"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-10 text-center">
            <CircleDollarSign className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-700">No fare data for this pair yet</p>
            <p className="mt-1 text-sm text-gray-500">
              Try Dairy Gate → TSC, Bottle Tree Garden, Shankhachil Lake, Highway or Savar Bazar.
            </p>
          </div>
        )}

        <div className="flex items-start gap-2 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-xs text-gray-600">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
          Fares are community-sourced guidance. Confirm with the driver before riding. Rates may be
          higher at night and during rain.
        </div>
      </ContentWrapper>
    </SectionWrapper>
  );
}

function PlaceSelector({
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
    <label className="flex flex-1 flex-col gap-1.5">
      <span className="text-xs font-semibold text-gray-600">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={transportInputClass}
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
