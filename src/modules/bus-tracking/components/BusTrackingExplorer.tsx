/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import {
  Bus as BusIcon,
  MapPin,
  Radio,
  ShieldAlert,
  ThumbsDown,
  ThumbsUp,
  UserCircle2,
  X,
} from "lucide-react";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import {
  fetchLiveBusesAction,
  fetchMyBusShareStatusAction,
} from "@/services/bus";
import type { BusShareStatus, LiveBus } from "@/types/bus";
import { useBusTracking } from "../hooks/useBusTracking";
import type { BusMapPoint } from "./BusTrackingMap";

const BusTrackingMap = dynamic(() => import("./BusTrackingMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[min(52vh,520px)] min-h-[300px] w-full items-center justify-center rounded-2xl bg-gray-100 text-sm text-gray-400 md:min-h-[520px]">
      Loading map…
    </div>
  ),
});

const REFRESH_MS = 30000;

export default function BusTrackingExplorer() {
  const [buses, setBuses] = useState<LiveBus[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState<BusShareStatus | null>(null);

  const { state, watchBus, startSharing, leave, vote, dismissNotice } = useBusTracking();

  const loadBuses = useCallback(async () => {
    const res = await fetchLiveBusesAction();
    if (res.success) {
      setBuses(res.data);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadBuses();
    void fetchMyBusShareStatusAction().then((r) => {
      if (r.success && r.data) setShareStatus(r.data);
    });
    const t = setInterval(() => void loadBuses(), REFRESH_MS);
    return () => clearInterval(t);
  }, [loadBuses]);

  // Surface socket notices/warnings as toasts.
  useEffect(() => {
    if (state.notice) {
      toast.info(state.notice);
      dismissNotice();
    }
  }, [state.notice, dismissNotice]);
  useEffect(() => {
    if (state.warning) {
      toast.warning(state.warning);
    }
  }, [state.warning]);
  useEffect(() => {
    if (state.blocked) {
      toast.error("You've been blocked from sharing. See your trust status.");
    }
  }, [state.blocked]);

  const selectedBus = useMemo(
    () => buses.find((b) => b.code === selectedCode) ?? null,
    [buses, selectedCode],
  );

  // Map points — override the selected bus's position with the live stream.
  const points: BusMapPoint[] = useMemo(() => {
    return buses
      .map((b) => {
        const isSelected = b.code === selectedCode;
        const live = isSelected && state.location ? state.location : null;
        const lat = live?.lat ?? b.location?.lat;
        const lng = live?.lng ?? b.location?.lng;
        if (lat == null || lng == null) return null;
        return {
          code: b.code,
          name: b.name,
          lat,
          lng,
          isLive: b.isLive || Boolean(live),
          heading: live?.heading ?? b.location?.heading,
        } as BusMapPoint;
      })
      .filter((p): p is BusMapPoint => p !== null);
  }, [buses, selectedCode, state.location]);

  const handleSelect = useCallback(
    (code: string) => {
      setSelectedCode(code);
      void watchBus(code);
    },
    [watchBus],
  );

  const isSharingSelected = state.role === "share" && state.activeBusCode === selectedCode;

  const handleShare = useCallback(
    (code: string) => {
      if (shareStatus?.blocked) {
        toast.error("You're currently blocked from sharing bus locations.");
        return;
      }
      void startSharing(code);
      toast.success("Sharing your location for this bus. Thank you!");
    },
    [shareStatus, startSharing],
  );

  return (
    <SectionWrapper>
      <ContentWrapper>
        <AppBreadcrumb items={[{ label: "Live Bus", href: "/live-bus" }]} />

        <div className="mb-5 flex flex-col gap-1">
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-gray-900">
            <BusIcon className="h-6 w-6 text-[#00A651]" />
            Live Campus Bus Tracking
          </h1>
          <p className="text-sm text-gray-500">
            See where the shuttles are in real time — or share your location while you ride.
          </p>
        </div>

        {shareStatus?.blocked ? (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <ShieldAlert className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              You are currently blocked from sharing bus locations
              {shareStatus.isPermanent
                ? " permanently."
                : shareStatus.blockedUntil
                  ? ` until ${new Date(shareStatus.blockedUntil).toLocaleString()}.`
                  : "."}{" "}
              You can still view live buses.
            </div>
          </div>
        ) : null}

        {authError ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center text-sm text-amber-900">
            Please sign in to view live campus buses.
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,360px)_1fr]">
            {/* Bus list */}
            <div className="order-2 space-y-3 lg:order-1">
              {loading ? (
                <div className="rounded-xl border border-gray-200/80 bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
                  Loading buses…
                </div>
              ) : buses.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/80 p-8 text-center text-sm text-gray-600">
                  No buses configured for your campus yet.
                </div>
              ) : (
                buses.map((b) => (
                  <BusCard
                    key={b._id}
                    bus={b}
                    selected={b.code === selectedCode}
                    onSelect={() => handleSelect(b.code)}
                  />
                ))
              )}
            </div>

            {/* Map + detail panel */}
            <div className="order-1 space-y-4 lg:order-2">
              <BusTrackingMap points={points} selectedCode={selectedCode} onSelect={handleSelect} />

              {selectedBus ? (
                <SelectedBusPanel
                  bus={selectedBus}
                  hasActiveSharer={state.hasActiveSharer}
                  liveLocation={state.location}
                  reportTotals={state.reportTotals}
                  isSharing={isSharingSelected}
                  canShare={!shareStatus?.blocked}
                  onShare={() => handleShare(selectedBus.code)}
                  onStopShare={leave}
                  onVote={(v) => vote(selectedBus.code, v)}
                />
              ) : (
                <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50/70 p-4 text-center text-sm text-gray-500">
                  Select a bus to view its live location, report accuracy, or start sharing.
                </p>
              )}
            </div>
          </div>
        )}
      </ContentWrapper>
    </SectionWrapper>
  );
}

function BusCard({
  bus,
  selected,
  onSelect,
}: {
  bus: LiveBus;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-xl border p-4 text-left shadow-sm transition ${
        selected ? "border-[#00A651] bg-emerald-50/40" : "border-gray-200/80 bg-white hover:border-gray-300"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-gray-900">{bus.name}</p>
          {bus.route ? <p className="mt-0.5 text-xs text-gray-500">{bus.route}</p> : null}
        </div>
        {bus.isLive ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
            <Radio className="h-3 w-3" /> Live
          </span>
        ) : (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
            Offline
          </span>
        )}
      </div>
      {bus.sharer ? (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-600">
          <UserCircle2 className="h-3.5 w-3.5" />
          Shared by {bus.sharer.name ?? "a student"}
        </p>
      ) : null}
    </button>
  );
}

function SelectedBusPanel({
  bus,
  hasActiveSharer,
  liveLocation,
  reportTotals,
  isSharing,
  canShare,
  onShare,
  onStopShare,
  onVote,
}: {
  bus: LiveBus;
  hasActiveSharer: boolean;
  liveLocation: ReturnType<typeof useBusTracking>["state"]["location"];
  reportTotals: ReturnType<typeof useBusTracking>["state"]["reportTotals"];
  isSharing: boolean;
  canShare: boolean;
  onShare: () => void;
  onStopShare: () => void;
  onVote: (v: "accurate" | "inaccurate") => void;
}) {
  const live = liveLocation ?? (bus.location
    ? { ...bus.location, busId: bus.code, sharer: { userId: "", name: bus.sharer?.name ?? null, photo: null } }
    : null);
  const speedKmh = live ? Math.round((live.speed ?? 0) * 3.6) : null;
  const showSharer = hasActiveSharer || bus.isLive;

  return (
    <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
          <MapPin className="h-4 w-4 text-[#00A651]" />
          {bus.name}
        </h2>
        {isSharing ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            <Radio className="h-3 w-3 animate-pulse" /> You are sharing
          </span>
        ) : null}
      </div>

      {showSharer && live ? (
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <Stat label="Speed" value={speedKmh != null ? `${speedKmh} km/h` : "—"} />
          <Stat
            label="Last update"
            value={live.updatedAt ? new Date(live.updatedAt).toLocaleTimeString() : "—"}
          />
        </div>
      ) : (
        <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-500">
          No one is sharing this bus right now. Riding it? Tap “Share location”.
        </p>
      )}

      {/* Community trust */}
      {showSharer ? (
        <div className="mt-4">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Is this location accurate?
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onVote("accurate")}
              className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              Accurate {reportTotals ? `(${reportTotals.accurate})` : ""}
            </button>
            <button
              type="button"
              onClick={() => onVote("inaccurate")}
              className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
            >
              <ThumbsDown className="h-3.5 w-3.5" />
              Inaccurate {reportTotals ? `(${reportTotals.inaccurate})` : ""}
            </button>
          </div>
        </div>
      ) : null}

      {/* Share controls */}
      <div className="mt-4 border-t border-gray-100 pt-4">
        {isSharing ? (
          <button
            type="button"
            onClick={onStopShare}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
          >
            <X className="h-4 w-4" /> Stop sharing
          </button>
        ) : (
          <button
            type="button"
            disabled={!canShare || (hasActiveSharer && !bus.isLive)}
            onClick={onShare}
            title={hasActiveSharer ? "Someone is already sharing this bus" : undefined}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#00A651] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#008a44] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Radio className="h-4 w-4" />
            {hasActiveSharer ? "Already being shared" : "Share location (I'm on this bus)"}
          </button>
        )}
        <p className="mt-2 text-center text-[11px] text-gray-400">
          Sharing uses your GPS and stops automatically when you reach campus.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50/70 px-3 py-2">
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-0.5 font-semibold text-gray-900">{value}</p>
    </div>
  );
}
