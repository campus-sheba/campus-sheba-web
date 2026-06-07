"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Car,
  Check,
  Clock,
  MapPin,
  MessageCircle,
  Plus,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import TransportSubHeader, {
  TransportFilterPanel,
  TransportSegment,
  transportBtnPrimaryClass,
  transportInputClass,
} from "./TransportSubHeader";
import { MOCK_RIDES } from "../mock/data";
import type { RideOffer } from "@/types/transport";

function minsFromNow(iso: string): number {
  return Math.round((new Date(iso).getTime() - Date.now()) / 60000);
}
function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function RideSharing() {
  const [tab, setTab] = useState<"find" | "offer">("find");
  const [query, setQuery] = useState("");
  const [rides, setRides] = useState<RideOffer[]>(MOCK_RIDES);
  const [confirming, setConfirming] = useState<RideOffer | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rides;
    return rides.filter(
      (r) => r.toName.toLowerCase().includes(q) || r.fromName.toLowerCase().includes(q),
    );
  }, [rides, query]);

  return (
    <SectionWrapper spacing="none" background="transparent" className="my-0">
      <ContentWrapper
        maxWidth="full"
        padding="md"
        className="mx-auto max-w-4xl space-y-5 pb-20 pt-2"
      >
        <TransportSubHeader
          icon={Users}
          title="Ride sharing"
          subtitle="Split the fare with classmates going your way. Post an offer or find a seat."
          breadcrumbLabel="Ride sharing"
          preview
        />

        <TransportFilterPanel>
          <TransportSegment
            value={tab}
            onChange={(id) => setTab(id as "find" | "offer")}
            options={[
              { id: "find", label: "Find a ride" },
              { id: "offer", label: "Offer a ride" },
            ]}
          />
        </TransportFilterPanel>

        {tab === "find" ? (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by destination — e.g. Farmgate, Savar"
                className={`${transportInputClass} py-3 pl-10`}
              />
            </div>

            <div className="space-y-3">
              {filtered.length === 0 ? (
                <Empty />
              ) : (
                filtered.map((r) => (
                  <RideCard key={r.id} ride={r} onRequest={() => setConfirming(r)} />
                ))
              )}
            </div>
          </>
        ) : (
          <OfferForm
            onPost={(offer) => {
              setRides((prev) => [offer, ...prev]);
              setTab("find");
              toast.success("Your ride offer is live. We'll notify matching students.");
            }}
          />
        )}
      </ContentWrapper>

      {confirming ? (
        <ConfirmModal
          ride={confirming}
          onClose={() => setConfirming(null)}
          onConfirmed={() => {
            setRides((prev) =>
              prev.map((x) =>
                x.id === confirming.id ? { ...x, seatsLeft: Math.max(0, x.seatsLeft - 1) } : x,
              ),
            );
          }}
        />
      ) : null}
    </SectionWrapper>
  );
}

function RideCard({ ride, onRequest }: { ride: RideOffer; onRequest: () => void }) {
  const mins = minsFromNow(ride.departAt);
  const soon = mins <= 15;

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-700">
            {ride.host.initials}
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-sm font-bold text-gray-900">
              {ride.host.name}
              <span className="inline-flex items-center gap-0.5 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                <ShieldCheck className="h-3 w-3" /> {ride.host.trustScore}
              </span>
            </p>
            <p className="text-xs text-gray-500">
              ★ {ride.host.rating} · {ride.vehicle}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold tabular-nums text-gray-900">
            {ride.perSeatFare === 0 ? "Free" : `৳${ride.perSeatFare}`}
          </p>
          <p className="text-[11px] text-gray-400">per seat</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm">
        <span className="flex items-center gap-1 font-medium text-gray-700">
          <MapPin className="h-3.5 w-3.5 text-gray-400" /> {ride.fromName}
        </span>
        <span className="text-gray-300">→</span>
        <span className="font-medium text-gray-900">{ride.toName}</span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 font-semibold ${
              soon ? "bg-amber-50 text-amber-800" : "bg-gray-100 text-gray-600"
            }`}
          >
            <Clock className="h-3 w-3" /> {timeLabel(ride.departAt)} · in {mins}m
          </span>
          <span className="inline-flex items-center gap-1 text-gray-500">
            <Users className="h-3 w-3" /> {ride.seatsLeft}/{ride.seatsTotal} left
          </span>
          {ride.recurring ? (
            <span className="rounded-full bg-gray-100 px-2 py-1 font-semibold text-gray-600">
              Daily
            </span>
          ) : null}
        </div>
        <button
          type="button"
          disabled={ride.seatsLeft === 0}
          onClick={onRequest}
          className={`${transportBtnPrimaryClass} px-4 py-1.5 text-xs`}
        >
          {ride.seatsLeft === 0 ? "Full" : "Request seat"}
        </button>
      </div>
      {ride.note ? <p className="mt-2 text-xs text-gray-400">"{ride.note}"</p> : null}
    </div>
  );
}

function OfferForm({ onPost }: { onPost: (o: RideOffer) => void }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [time, setTime] = useState("");
  const [seats, setSeats] = useState(2);
  const [fare, setFare] = useState("");

  const submit = () => {
    if (!from.trim() || !to.trim() || !time.trim()) {
      toast.error("Fill pickup, destination and time.");
      return;
    }
    const [h, m] = time.split(":").map(Number);
    const d = new Date();
    d.setHours(h || 0, m || 0, 0, 0);
    onPost({
      id: `ride-${Date.now()}`,
      host: { name: "You", initials: "YOU", rating: 5, trustScore: 100 },
      fromName: from.trim(),
      toName: to.trim(),
      departAt: d.toISOString(),
      seatsTotal: seats,
      seatsLeft: seats,
      vehicle: "Your ride",
      perSeatFare: Number(fare) || 0,
    });
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <h3 className="text-base font-bold text-gray-900">Post a ride offer</h3>
      <p className="text-sm text-gray-500">Heading somewhere? Offer your empty seats.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Pickup point" value={from} onChange={setFrom} placeholder="Bishmail Gate" />
        <Field label="Destination" value={to} onChange={setTo} placeholder="Farmgate, Dhaka" />
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-gray-600">Departure time</span>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={transportInputClass}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-gray-600">Fare per seat (৳, 0 = free)</span>
          <input
            type="number"
            min={0}
            value={fare}
            onChange={(e) => setFare(e.target.value)}
            placeholder="120"
            className={transportInputClass}
          />
        </label>
      </div>
      <div className="mt-3">
        <span className="text-xs font-semibold text-gray-600">Seats available</span>
        <div className="mt-1.5 flex gap-2">
          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setSeats(n)}
              className={`h-10 w-10 rounded-lg text-sm font-bold transition ${
                seats === n
                  ? "bg-[#00A651] text-white"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <button type="button" onClick={submit} className={`mt-5 w-full ${transportBtnPrimaryClass} py-3`}>
        <Plus className="h-4 w-4" /> Post offer
      </button>
    </div>
  );
}

function ConfirmModal({
  ride,
  onClose,
  onConfirmed,
}: {
  ride: RideOffer;
  onClose: () => void;
  onConfirmed: () => void;
}) {
  const [step, setStep] = useState<"review" | "done">("review");

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">
            {step === "review" ? "Request a seat" : "Request sent"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === "review" ? (
          <>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm">
              <div className="flex items-center gap-2 font-semibold text-gray-900">
                <Car className="h-4 w-4 text-gray-500" /> {ride.fromName} → {ride.toName}
              </div>
              <p className="mt-1 text-gray-500">
                {timeLabel(ride.departAt)} · {ride.vehicle} · with {ride.host.name}
              </p>
              <p className="mt-2 text-lg font-bold text-gray-900">
                {ride.perSeatFare === 0 ? "Free ride" : `৳${ride.perSeatFare} / seat`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setStep("done");
                onConfirmed();
                toast.success("Seat requested — chat opened with the host.");
              }}
              className={`mt-4 w-full ${transportBtnPrimaryClass} py-3 font-bold`}
            >
              <MessageCircle className="h-4 w-4" /> Request &amp; open chat
            </button>
          </>
        ) : (
          <div className="py-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <Check className="h-7 w-7 text-emerald-600" />
            </div>
            <p className="mt-4 font-semibold text-gray-900">{ride.host.name} has been notified</p>
            <p className="mt-1 text-sm text-gray-500">
              Confirm pickup details in chat. You&apos;ll get a reminder 10 minutes before departure.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 w-full rounded-lg bg-gray-900 py-2.5 text-sm font-semibold text-white"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-gray-600">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={transportInputClass}
      />
    </label>
  );
}

function Empty() {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-10 text-center">
      <Users className="mx-auto h-10 w-10 text-gray-300" />
      <p className="mt-3 text-sm font-medium text-gray-700">No rides match your search</p>
      <p className="mt-1 text-sm text-gray-500">Try a different destination, or offer your own ride.</p>
    </div>
  );
}
