"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Link } from "@/i18n/navigation";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import { Button } from "@/components/ui";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import { cancelParcelAction, fetchParcelByIdAction } from "@/services/parcel";
import type { Parcel } from "@/types/parcel";

function locLabel(loc: Parcel["pickupLocation"]): string {
  if (!loc) return "—";
  if (typeof loc === "string") return loc;
  return loc.name ?? "—";
}

export default function ParcelDetail() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    void (async () => {
      const res = await fetchParcelByIdAction(id);
      if (cancelled) return;
      if (res.success && res.data) {
        setParcel(res.data);
        setError(null);
      } else {
        setParcel(null);
        setError(res.message ?? "Not found.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const onCancel = () => {
    if (!parcel) return;
    startTransition(async () => {
      const res = await cancelParcelAction(parcel._id);
      setMsg(res.success ? "Parcel cancelled." : res.message);
      if (res.success) {
        const r = await fetchParcelByIdAction(parcel._id);
        if (r.success && r.data) setParcel(r.data);
      }
    });
  };

  if (!id) {
    return (
      <ContentWrapper maxWidth="max-w-7xl mx-auto" padding="md">
        <p className="text-sm text-gray-600">Invalid parcel.</p>
      </ContentWrapper>
    );
  }

  if (error && !parcel) {
    return (
      <ContentWrapper maxWidth="max-w-7xl mx-auto" padding="md">
        <p className="text-sm text-red-600">{error}</p>
        <Link href="/my-parcels" className="mt-4 inline-block text-sm font-semibold text-[#00A651] hover:underline">
          ← My parcels
        </Link>
      </ContentWrapper>
    );
  }

  if (!parcel) {
    return (
      <ContentWrapper maxWidth="max-w-7xl mx-auto" padding="md">
        <p className="text-sm text-gray-500">Loading…</p>
      </ContentWrapper>
    );
  }

  const canCancel = parcel.status && parcel.status !== "Delivered" && parcel.status !== "Cancelled";

  return (
    <ContentWrapper maxWidth="max-w-7xl mx-auto" padding="md">
      <AppBreadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "My parcels", href: "/my-parcels" },
          { label: parcel.parcelId ?? "Parcel" },
        ]}
      />

      <Link href="/my-parcels" className="mt-4 inline-block text-sm font-medium text-gray-600 hover:text-gray-900">
        ← My parcels
      </Link>

      <SectionWrapper spacing="sm" background="white" className="mt-6 rounded-2xl border border-gray-100 p-4 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Parcel</p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">{parcel.parcelId ?? parcel._id}</h1>
            <p className="mt-2 inline-block rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800">{parcel.status}</p>
          </div>
          {parcel.deliveryFee != null && (
            <div className="text-right">
              <p className="text-xs text-gray-500">Delivery fee</p>
              <p className="text-xl font-bold text-[#00A651]">৳{parcel.deliveryFee.toLocaleString()}</p>
            </div>
          )}
        </div>

        <div className="mt-8 grid gap-6 border-t border-gray-100 pt-6 md:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Pickup</h2>
            <p className="mt-1 text-sm text-gray-600">{locLabel(parcel.pickupLocation)}</p>
            <p className="mt-2 text-sm text-gray-700">{parcel.pickupDetails}</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Delivery</h2>
            <p className="mt-1 text-sm text-gray-600">{locLabel(parcel.deliveryLocation)}</p>
            <p className="mt-2 text-sm text-gray-700">{parcel.deliveryDetails}</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Recipient</h2>
            <p className="mt-1 text-sm text-gray-700">{parcel.recipientName}</p>
            <p className="text-sm text-gray-600">{parcel.recipientPhone}</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Package</h2>
            <p className="mt-1 text-sm text-gray-700">
              {parcel.size}
              {parcel.estimatedWeight ? ` · ${parcel.estimatedWeight}` : ""}
            </p>
            {parcel.description ? <p className="mt-2 text-sm text-gray-600">{parcel.description}</p> : null}
            <p className="mt-2 text-sm text-gray-600">Payment: {parcel.paymentMethod}</p>
            {parcel.codAmount != null ? (
              <p className="text-sm text-gray-600">COD: ৳{parcel.codAmount.toLocaleString()}</p>
            ) : null}
          </div>
        </div>

        {msg ? <p className="mt-6 rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-800">{msg}</p> : null}

        {canCancel ? (
          <div className="mt-6 border-t border-gray-100 pt-6">
            <Button type="button" variant="outline" disabled={isPending} onClick={onCancel}>
              Cancel parcel
            </Button>
          </div>
        ) : null}
      </SectionWrapper>
    </ContentWrapper>
  );
}
