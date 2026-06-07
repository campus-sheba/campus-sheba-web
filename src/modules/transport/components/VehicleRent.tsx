"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Bus,
  Check,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  Star,
  Wallet,
  X,
} from "lucide-react";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import TransportSubHeader, { transportBtnPrimaryClass } from "./TransportSubHeader";
import { MOCK_RENTALS } from "../mock/data";
import type { RentVehicle } from "@/types/transport";

export default function VehicleRent() {
  const [booking, setBooking] = useState<RentVehicle | null>(null);

  return (
    <SectionWrapper spacing="none" background="transparent" className="my-0">
      <ContentWrapper
        maxWidth="full"
        padding="md"
        className="mx-auto max-w-6xl space-y-6 pb-20 pt-2"
      >
        <TransportSubHeader
          icon={Bus}
          title="Vehicle rent"
          subtitle="Rent a cycle, e-cart, or scooter by the hour or day. Pay from your wallet and return when done."
          breadcrumbLabel="Vehicle rent"
          preview
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_RENTALS.map((v) => (
            <div
              key={v.id}
              className="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                  <Bus className="h-5 w-5" />
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    v.available
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {v.available ? "Available" : "Booked"}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-gray-900">{v.name}</h3>
                  <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-gray-600">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {v.rating}
                  </span>
                </div>
                <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="h-3 w-3" /> {v.location}
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {v.perks.map((p) => (
                    <span
                      key={p}
                      className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600"
                    >
                      {p}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <span className="text-xl font-bold tabular-nums text-gray-900">
                      ৳{v.pricePerUnit}
                    </span>
                    <span className="text-sm text-gray-400"> / {v.unitLabel}</span>
                  </div>
                  <span className="text-[11px] text-gray-400">+ ৳{v.deposit} deposit</span>
                </div>

                <button
                  type="button"
                  disabled={!v.available}
                  onClick={() => setBooking(v)}
                  className={`mt-4 w-full ${transportBtnPrimaryClass}`}
                >
                  {v.available ? "Rent now" : "Currently booked"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </ContentWrapper>

      {booking ? <BookingModal vehicle={booking} onClose={() => setBooking(null)} /> : null}
    </SectionWrapper>
  );
}

function BookingModal({ vehicle, onClose }: { vehicle: RentVehicle; onClose: () => void }) {
  const [qty, setQty] = useState(1);
  const [done, setDone] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const walletBalance = 1500;
  const rental = vehicle.pricePerUnit * qty;
  const total = rental + vehicle.deposit;
  const enough = walletBalance >= total;

  const confirm = () => {
    if (!enough) {
      toast.error("Insufficient wallet balance for this booking.");
      return;
    }
    setBookingId(`VR-${Math.floor(Math.random() * 9000 + 1000)}`);
    setDone(true);
    toast.success("Vehicle booked! Deposit held, refunded on return.");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">{vehicle.name}</h3>
            <p className="text-sm text-gray-500">{vehicle.location}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          {done ? (
            <div className="py-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                <Check className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900">Booking confirmed</h3>
              <p className="mt-1 text-sm text-gray-500">
                {vehicle.name} reserved for {qty} {vehicle.unitLabel}
                {qty > 1 ? "s" : ""}. Show this receipt at{" "}
                {vehicle.location.split("·")[0].trim()}.
              </p>
              <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-3 text-left text-xs text-gray-600">
                <Row label="Booking ID" value={bookingId} />
                <Row label="Paid from wallet" value={`৳${total}`} />
                <Row label="Refundable deposit" value={`৳${vehicle.deposit}`} />
              </div>
              <button
                type="button"
                onClick={onClose}
                className="mt-5 w-full rounded-lg bg-gray-900 py-2.5 text-sm font-semibold text-white"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Duration ({vehicle.unitLabel}s)
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center text-xl font-bold text-gray-900">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.min(14, q + 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-5 space-y-1.5 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm">
                <Row label={`Rental (${qty} × ৳${vehicle.pricePerUnit})`} value={`৳${rental}`} />
                <Row label="Refundable deposit" value={`৳${vehicle.deposit}`} />
                <div className="my-1 border-t border-gray-200" />
                <Row label="Total" value={`৳${total}`} bold />
              </div>

              <div
                className={`mt-3 flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm ${
                  enough
                    ? "border-emerald-100 bg-emerald-50 text-emerald-800"
                    : "border-red-100 bg-red-50 text-red-700"
                }`}
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <Wallet className="h-4 w-4" /> Wallet balance
                </span>
                <span className="font-bold">৳{walletBalance}</span>
              </div>

              <button
                type="button"
                onClick={confirm}
                className={`mt-5 w-full ${transportBtnPrimaryClass} py-3 font-bold`}
              >
                <ShieldCheck className="h-4 w-4" /> Confirm &amp; pay ৳{total}
              </button>
              <p className="mt-2 text-center text-[11px] text-gray-400">
                Deposit is auto-refunded to your wallet on timely return.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={bold ? "font-bold text-gray-900" : "text-gray-500"}>{label}</span>
      <span className={bold ? "font-bold text-gray-900" : "font-medium text-gray-700"}>
        {value}
      </span>
    </div>
  );
}
