"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  Armchair,
  Check,
  Clock,
  Download,
  MapPin,
  Star,
  Ticket,
  X,
} from "lucide-react";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import TransportSubHeader from "./TransportSubHeader";
import { INTERCITY_DESTINATIONS, MOCK_TRIPS } from "../mock/data";
import type { IntercityTrip } from "@/types/transport";

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function IntercityTicket() {
  const [destination, setDestination] = useState("");
  const [selectedTrip, setSelectedTrip] = useState<IntercityTrip | null>(null);

  const trips = useMemo(() => {
    if (!destination) return MOCK_TRIPS;
    return MOCK_TRIPS.filter((t) => t.toName === destination);
  }, [destination]);

  return (
    <SectionWrapper spacing="none" background="transparent" className="my-0">
      <ContentWrapper maxWidth="full" padding="md" className="mx-auto max-w-5xl space-y-6 pb-16 pt-4">
        <TransportSubHeader
          icon={Ticket}
          title="Intercity Ticket"
          subtitle="Book your trip home with a live seat map. E-ticket delivered instantly."
          gradient="from-blue-500 to-indigo-600"
          preview
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <label className="flex flex-1 flex-col gap-1">
              <span className="text-xs font-semibold text-white/85">From</span>
              <div className="flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2.5 text-sm font-medium text-gray-900">
                <MapPin className="h-4 w-4 text-blue-500" /> JU (Dairy Gate)
              </div>
            </label>
            <ArrowRight className="mx-auto hidden h-5 w-5 self-center text-white/80 sm:mb-2.5 sm:block" />
            <label className="flex flex-1 flex-col gap-1">
              <span className="text-xs font-semibold text-white/85">To</span>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full rounded-xl border-0 bg-white/95 px-3 py-2.5 text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-white"
              >
                <option value="">All destinations</option>
                {INTERCITY_DESTINATIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </TransportSubHeader>

        <div className="space-y-3">
          {trips.map((t) => (
            <TripCard key={t.id} trip={t} onSelect={() => setSelectedTrip(t)} />
          ))}
        </div>
      </ContentWrapper>

      {selectedTrip ? (
        <SeatBookingFlow trip={selectedTrip} onClose={() => setSelectedTrip(null)} />
      ) : null}
    </SectionWrapper>
  );
}

function TripCard({ trip, onSelect }: { trip: IntercityTrip; onSelect: () => void }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900">{trip.operator}</span>
          <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
            {trip.coachType}
          </span>
          <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-amber-600">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {trip.rating}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <div className="text-center">
            <p className="text-lg font-extrabold text-gray-900">{timeLabel(trip.departAt)}</p>
            <p className="text-[11px] text-gray-400">{trip.fromName}</p>
          </div>
          <div className="flex flex-col items-center text-gray-300">
            <span className="text-[10px] text-gray-400">{trip.durationLabel}</span>
            <div className="my-0.5 h-px w-16 bg-gray-200" />
            <Clock className="h-3 w-3" />
          </div>
          <div className="text-center">
            <p className="text-lg font-extrabold text-gray-900">{timeLabel(trip.arriveAt)}</p>
            <p className="text-[11px] text-gray-400">{trip.toName}</p>
          </div>
        </div>
        <p className="mt-2 flex items-center gap-1 text-xs text-gray-500">
          <MapPin className="h-3 w-3" /> Boarding: {trip.boardingPoint} ·{" "}
          <span className={trip.seatsLeft <= 8 ? "font-semibold text-rose-600" : ""}>
            {trip.seatsLeft} seats left
          </span>
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-3 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
        <div className="text-right">
          <span className="text-xl font-extrabold text-gray-900">৳{trip.fare}</span>
          <p className="text-[11px] text-gray-400">per seat</p>
        </div>
        <button
          type="button"
          onClick={onSelect}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Select seats
        </button>
      </div>
    </div>
  );
}

// --- Seat map + checkout + e-ticket ---
const ROWS = 10;
const COLS = ["A", "B", "C", "D"];
// Deterministic "booked" seats per trip for a realistic map.
function bookedSet(tripId: string): Set<string> {
  const set = new Set<string>();
  let seed = tripId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let r = 1; r <= ROWS; r++) {
    for (const c of COLS) {
      if (rand() < 0.32) set.add(`${r}${c}`);
    }
  }
  return set;
}

function SeatBookingFlow({ trip, onClose }: { trip: IntercityTrip; onClose: () => void }) {
  const [step, setStep] = useState<"seats" | "ticket">("seats");
  const booked = useMemo(() => bookedSet(trip.id), [trip.id]);
  const [selected, setSelected] = useState<string[]>([]);
  const [ticketId, setTicketId] = useState("");

  const toggle = (seat: string) => {
    if (booked.has(seat)) return;
    setSelected((prev) =>
      prev.includes(seat) ? prev.filter((s) => s !== seat) : prev.length >= 4 ? prev : [...prev, seat],
    );
  };
  const total = selected.length * trip.fare;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
          <div>
            <p className="text-sm font-bold text-gray-900">
              {step === "seats" ? "Choose your seats" : "Your e-ticket"}
            </p>
            <p className="text-xs text-gray-500">
              {trip.operator} · {trip.fromName} → {trip.toName} · {timeLabel(trip.departAt)}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === "seats" ? (
          <>
            <div className="flex-1 overflow-y-auto p-5">
              <Legend />
              {/* coach */}
              <div className="mx-auto mt-4 max-w-xs rounded-2xl border-2 border-gray-200 bg-gray-50 p-4">
                <div className="mb-3 flex items-center justify-between text-[11px] font-semibold uppercase text-gray-400">
                  <span>Front · Driver</span>
                  <span>🚌</span>
                </div>
                <div className="space-y-2">
                  {Array.from({ length: ROWS }, (_, i) => i + 1).map((row) => (
                    <div key={row} className="flex items-center justify-center gap-2">
                      {COLS.slice(0, 2).map((c) => (
                        <Seat key={c} id={`${row}${c}`} booked={booked} selected={selected} onClick={toggle} />
                      ))}
                      <span className="w-6 text-center text-[10px] text-gray-300">{row}</span>
                      {COLS.slice(2).map((c) => (
                        <Seat key={c} id={`${row}${c}`} booked={booked} selected={selected} onClick={toggle} />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-gray-500">Seats: </span>
                  <span className="font-bold text-gray-900">
                    {selected.length ? selected.join(", ") : "none"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-extrabold text-gray-900">৳{total}</span>
                </div>
              </div>
              <button
                type="button"
                disabled={selected.length === 0}
                onClick={() => {
                  setTicketId(`CS-${Math.floor(Math.random() * 900000 + 100000)}`);
                  setStep("ticket");
                  toast.success("Payment successful — e-ticket sent via SMS.");
                }}
                className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400"
              >
                {selected.length === 0
                  ? "Select at least one seat"
                  : `Pay ৳${total} with SSLCommerz`}
              </button>
            </div>
          </>
        ) : (
          <ETicket trip={trip} seats={selected} total={total} ticketId={ticketId} onClose={onClose} />
        )}
      </div>
    </div>
  );
}

function Seat({
  id,
  booked,
  selected,
  onClick,
}: {
  id: string;
  booked: Set<string>;
  selected: string[];
  onClick: (id: string) => void;
}) {
  const isBooked = booked.has(id);
  const isSel = selected.includes(id);
  return (
    <button
      type="button"
      disabled={isBooked}
      onClick={() => onClick(id)}
      title={id}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border text-[10px] font-bold transition ${
        isBooked
          ? "cursor-not-allowed border-gray-200 bg-gray-200 text-gray-300"
          : isSel
            ? "border-blue-600 bg-blue-600 text-white shadow"
            : "border-gray-200 bg-white text-gray-500 hover:border-blue-400 hover:bg-blue-50"
      }`}
    >
      <Armchair className="h-3.5 w-3.5" />
    </button>
  );
}

function Legend() {
  const items = [
    { label: "Available", cls: "border-gray-200 bg-white" },
    { label: "Selected", cls: "border-blue-600 bg-blue-600" },
    { label: "Booked", cls: "border-gray-200 bg-gray-200" },
  ];
  return (
    <div className="flex items-center justify-center gap-4">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-1.5 text-[11px] text-gray-500">
          <span className={`h-4 w-4 rounded border ${i.cls}`} /> {i.label}
        </span>
      ))}
    </div>
  );
}

function ETicket({
  trip,
  seats,
  total,
  ticketId,
  onClose,
}: {
  trip: IntercityTrip;
  seats: string[];
  total: number;
  ticketId: string;
  onClose: () => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="mb-4 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
          <Check className="h-7 w-7 text-emerald-600" />
        </div>
        <h3 className="mt-3 text-lg font-bold text-gray-900">Booking confirmed</h3>
        <p className="text-sm text-gray-500">E-ticket delivered in-app &amp; via SMS.</p>
      </div>

      {/* ticket stub */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-white">
          <span className="font-bold">{trip.operator}</span>
          <span className="rounded bg-white/20 px-2 py-0.5 text-xs font-semibold">{trip.coachType}</span>
        </div>
        <div className="grid grid-cols-2 gap-y-3 p-5 text-sm">
          <Cell label="From" value={trip.fromName} />
          <Cell label="To" value={trip.toName} />
          <Cell label="Departure" value={timeLabel(trip.departAt)} />
          <Cell label="Arrival" value={timeLabel(trip.arriveAt)} />
          <Cell label="Seats" value={seats.join(", ")} />
          <Cell label="Boarding" value={trip.boardingPoint} />
        </div>
        {/* perforation */}
        <div className="relative border-t-2 border-dashed border-gray-200">
          <span className="absolute -left-2 -top-2 h-4 w-4 rounded-full bg-black/40" />
          <span className="absolute -right-2 -top-2 h-4 w-4 rounded-full bg-black/40" />
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-gray-400">Ticket ID</p>
            <p className="font-mono text-sm font-bold text-gray-900">{ticketId}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wide text-gray-400">Paid</p>
            <p className="text-lg font-extrabold text-gray-900">৳{total}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={() => toast.info("E-ticket PDF download starting…")}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          <Download className="h-4 w-4" /> Download PDF
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-xl bg-gray-900 py-2.5 text-sm font-semibold text-white"
        >
          Done
        </button>
      </div>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-gray-400">{label}</p>
      <p className="font-semibold text-gray-900">{value}</p>
    </div>
  );
}
