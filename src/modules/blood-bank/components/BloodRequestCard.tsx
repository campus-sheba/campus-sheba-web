"use client";

import { Phone } from "lucide-react";
import { useState, useTransition } from "react";
import { useAppState } from "@/contexts/AppStateContext";
import { respondToBloodRequestAction } from "@/services/blood-donor";
import type { BloodRequestRow } from "@/types/blood-donor";

function urgencyClass(u: string | undefined): string {
  const x = (u ?? "").toLowerCase();
  if (x === "urgent") return "bg-red-100 text-red-800";
  if (x === "moderate") return "bg-amber-100 text-amber-900";
  return "bg-gray-100 text-gray-700";
}

function statusClass(s: string | undefined): string {
  const x = (s ?? "").toLowerCase();
  if (x === "active") return "bg-emerald-50 text-emerald-800";
  if (x === "partially fulfilled") return "bg-blue-50 text-blue-800";
  if (x === "fulfilled") return "bg-gray-100 text-gray-600";
  if (x === "expired" || x === "cancelled") return "bg-red-50 text-red-700";
  if (x === "pending moderation") return "bg-amber-50 text-amber-800";
  return "bg-gray-100 text-gray-700";
}

export default function BloodRequestCard({ row }: { row: BloodRequestRow }) {
  const { state, dispatch } = useAppState();
  const isAuth = state.auth.isAuthenticated;
  const [responded, setResponded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const isActive = row.status === "Active" || row.status === "Open";
  const canRespond = isActive && isAuth && !responded;

  const onRespond = () => {
    if (!isAuth) {
      dispatch({ type: "OPEN_AUTH_MODAL", payload: { defaultTab: "login" } });
      return;
    }
    startTransition(async () => {
      const res = await respondToBloodRequestAction(row._id, "I Can Help");
      if (res.success) setResponded(true);
      else setErr(res.message ?? "Failed");
    });
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition hover:border-gray-200 hover:shadow-md md:p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-red-50 px-2 py-1 text-[10px] font-bold text-red-700 md:text-xs">
          {row.bloodGroup}
        </span>
        <span className={`rounded-md px-2 py-1 text-[10px] font-semibold md:text-[11px] ${urgencyClass(row.urgencyLevel)}`}>
          {row.urgencyLevel}
        </span>
        {row.status ? (
          <span className={`rounded-md px-2 py-1 text-[10px] font-semibold md:text-[11px] ${statusClass(row.status)}`}>
            {row.status}
          </span>
        ) : null}
      </div>

      {row.patientName ? (
        <p className="mt-2 text-[11px] font-semibold text-gray-900 md:text-sm">{row.patientName}</p>
      ) : null}
      {row.hospital ? (
        <p className="mt-1 text-[11px] text-gray-700 md:text-sm">{row.hospital}</p>
      ) : null}
      {row.location ? (
        <p className="mt-1 text-[10px] text-gray-600 md:text-xs">{row.location}</p>
      ) : null}

      <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-gray-500 md:text-xs">
        {row.requiredUnits != null ? (
          <span>
            {row.fulfilledUnits != null
              ? `${row.fulfilledUnits}/${row.requiredUnits} units`
              : `${row.requiredUnits} unit${row.requiredUnits !== 1 ? "s" : ""} needed`}
          </span>
        ) : null}
        {row.requestedBy?.name ? <span>By {row.requestedBy.name}</span> : null}
      </div>

      {row.contactNumber ? (
        <a
          href={`tel:${row.contactNumber.replace(/\s/g, "")}`}
          className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-[#00A651] hover:underline md:text-sm"
        >
          <Phone className="h-3.5 w-3.5" />
          {row.contactNumber}
        </a>
      ) : null}

      {canRespond || responded ? (
        <div className="mt-3">
          {responded ? (
            <span className="inline-block rounded-lg bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700">
              ✓ Response sent
            </span>
          ) : (
            <button
              type="button"
              disabled={isPending}
              onClick={onRespond}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {isPending ? "Sending…" : "I Can Help"}
            </button>
          )}
          {err ? <p className="mt-1 text-[10px] text-red-600">{err}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
