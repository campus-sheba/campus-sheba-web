"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeftRight, CircleDollarSign, Info, MapPin } from "lucide-react";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import TransportSubHeader, {
  TransportFilterPanel,
  transportInputClass,
} from "./TransportSubHeader";
import {
  fetchFareMatrixAction,
  fetchTransportLocationsAction,
} from "@/services/transport-fare";
import type {
  FareVehicleType,
  LocationRef,
  TransportFare,
  TransportLocation,
} from "@/types/transport";

const VEHICLE_LABELS: Record<FareVehicleType, string> = {
  pedal_rickshaw: "Rickshaw",
  auto_rickshaw: "Auto rickshaw",
  electric_cart: "E-cart",
};

const VEHICLE_ORDER: FareVehicleType[] = [
  "pedal_rickshaw",
  "auto_rickshaw",
  "electric_cart",
];

function locId(ref: LocationRef | string): string {
  return typeof ref === "string" ? ref : ref._id;
}

export default function FareGuideLive() {
  const [locations, setLocations] = useState<TransportLocation[]>([]);
  const [vehicleType, setVehicleType] =
    useState<FareVehicleType>("pedal_rickshaw");
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");

  const [matrixByType, setMatrixByType] = useState<
    Partial<Record<FareVehicleType, TransportFare[]>>
  >({});

  const [locLoading, setLocLoading] = useState(true);
  const [matrixLoading, setMatrixLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      const res = await fetchTransportLocationsAction();
      if (!active) return;
      if (!res.success) {
        setError(res.message);
        setLocLoading(false);
        return;
      }
      setLocations(res.data);
      if (res.data[0]) setFromId(res.data[0]._id);
      if (res.data[1]) setToId(res.data[1]._id);
      setLocLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (matrixByType[vehicleType]) return;
    let active = true;
    void (async () => {
      setMatrixLoading(true);
      const res = await fetchFareMatrixAction(vehicleType);
      if (!active) return;
      if (res.success) {
        setMatrixByType((prev) => ({ ...prev, [vehicleType]: res.data }));
      } else {
        setError(res.message);
      }
      setMatrixLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [vehicleType, matrixByType]);

  const matrix = useMemo(
    () => matrixByType[vehicleType] ?? [],
    [matrixByType, vehicleType],
  );

  const match = useMemo(
    () =>
      matrix.find(
        (f) => locId(f.fromLocation) === fromId && locId(f.toLocation) === toId,
      ) ?? null,
    [matrix, fromId, toId],
  );

  const reverse = useMemo(
    () =>
      matrix.find(
        (f) => locId(f.fromLocation) === toId && locId(f.toLocation) === fromId,
      ) ?? null,
    [matrix, fromId, toId],
  );

  const locById = (id: string) => locations.find((l) => l._id === id);
  const placeName = (id: string) => locById(id)?.name ?? "—";

  const swap = () => {
    setFromId(toId);
    setToId(fromId);
  };

  const vehicleLabel = VEHICLE_LABELS[vehicleType];
  const samePair = !!fromId && fromId === toId;
  const isLoading = locLoading || matrixLoading;

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
        />

        <TransportFilterPanel title="Route & vehicle">
          <div className="flex flex-wrap gap-2">
            {VEHICLE_ORDER.map((vt) => {
              const selected = vt === vehicleType;
              return (
                <button
                  key={vt}
                  type="button"
                  onClick={() => setVehicleType(vt)}
                  aria-pressed={selected}
                  className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
                    selected
                      ? "bg-[#00A651] text-white"
                      : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {VEHICLE_LABELS[vt]}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-col items-stretch gap-3 sm:flex-row sm:items-end">
            <LocationSelector
              label="From"
              value={fromId}
              onChange={setFromId}
              locations={locations}
              disabled={locLoading}
            />
            <button
              type="button"
              onClick={swap}
              aria-label="Swap origin and destination"
              className="mx-auto flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 sm:mb-0.5"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </button>
            <LocationSelector
              label="To"
              value={toId}
              onChange={setToId}
              locations={locations}
              disabled={locLoading}
            />
          </div>
        </TransportFilterPanel>

        {error ? (
          <EmptyState title="Couldn't load fares" body={error} tone="error" />
        ) : samePair ? (
          <EmptyState
            title="Pick two different stops"
            body="Origin and destination must differ to show a fare."
          />
        ) : isLoading ? (
          <FareCardSkeleton />
        ) : match ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <MapPin className="h-4 w-4 text-[#00A651]" />
                {placeName(fromId)}
                <span className="text-gray-300">→</span>
                {placeName(toId)}
              </div>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                {vehicleLabel}
              </span>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Estimated fare
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-4xl font-bold tabular-nums text-gray-900">
                  ৳{match.fare}
                </span>
                <span className="text-sm text-gray-500">{vehicleLabel.toLowerCase()}</span>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {match.note ?? "Typical fair fare for this route."}
              </p>
              {reverse && reverse.fare !== match.fare ? (
                <p className="mt-3 text-xs text-gray-400">
                  Return ({placeName(toId)} → {placeName(fromId)}): ৳{reverse.fare}
                </p>
              ) : null}
            </div>
          </div>
        ) : (
          <EmptyState
            title="No published fare for this route"
            body={`No ${vehicleLabel.toLowerCase()} fare from ${placeName(
              fromId,
            )} to ${placeName(toId)} yet. Try another stop or vehicle.`}
          />
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

function LocationSelector({
  label,
  value,
  onChange,
  locations,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  locations: TransportLocation[];
  disabled?: boolean;
}) {
  return (
    <label className="flex flex-1 flex-col gap-1.5">
      <span className="text-xs font-semibold text-gray-600">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || locations.length === 0}
        className={transportInputClass}
      >
        {locations.length === 0 ? (
          <option value="">{disabled ? "Loading…" : "No stops"}</option>
        ) : (
          locations.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
              {p.nameBn ? ` · ${p.nameBn}` : ""}
            </option>
          ))
        )}
      </select>
    </label>
  );
}

function FareCardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-12 animate-pulse rounded-xl bg-gray-100" />
      <div className="h-28 animate-pulse rounded-xl bg-gray-100" />
    </div>
  );
}

function EmptyState({
  title,
  body,
  tone = "muted",
}: {
  title: string;
  body: string;
  tone?: "muted" | "error";
}) {
  return (
    <div
      className={`rounded-xl border border-dashed p-10 text-center ${
        tone === "error"
          ? "border-red-200 bg-red-50/50"
          : "border-gray-200 bg-gray-50/50"
      }`}
    >
      <CircleDollarSign
        className={`mx-auto h-10 w-10 ${
          tone === "error" ? "text-red-300" : "text-gray-300"
        }`}
      />
      <p className="mt-3 text-sm font-medium text-gray-700">{title}</p>
      <p className="mt-1 text-sm text-gray-500">{body}</p>
    </div>
  );
}
