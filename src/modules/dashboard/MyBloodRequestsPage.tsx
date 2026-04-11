"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui";
import { fetchMyBloodRequestsAction, updateBloodRequestStatusAction } from "@/services/blood-donor";
import type { BloodRequestRow } from "@/types/blood-donor";

export default function MyBloodRequestsPage() {
  const [items, setItems] = useState<BloodRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const load = useCallback(async () => {
    setLoading(true);
    setMsg(null);
    const res = await fetchMyBloodRequestsAction();
    setLoading(false);
    if (res.success) setItems(res.data);
    else setMsg(res.message ?? "Failed to load.");
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const setStatus = (id: string, status: "Fulfilled" | "Cancelled") => {
    startTransition(async () => {
      const res = await updateBloodRequestStatusAction(id, status);
      setMsg(res.success ? `Marked ${status}.` : res.message);
      if (res.success) void load();
    });
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/blood-bank" className="text-sm font-medium text-gray-500 hover:text-gray-900">
            ← Blood bank
          </Link>
          <h1 className="mt-2 text-xl font-bold text-gray-900">My blood requests</h1>
          <p className="mt-1 text-sm text-gray-500">Requests you created. Mark fulfilled when complete.</p>
        </div>
        <Link
          href="/my-blood-requests/new"
          className="inline-flex w-fit items-center rounded-lg bg-[#00A651] px-4 py-2 text-sm font-semibold text-white active:brightness-95"
        >
          New request
        </Link>
      </div>

      {msg ? <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm">{msg}</p> : null}

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
          No requests yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Blood</th>
                <th className="px-4 py-3">Urgency</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r._id} className="border-b border-gray-50">
                  <td className="px-4 py-3 font-semibold text-red-700">{r.bloodGroup}</td>
                  <td className="px-4 py-3">{r.urgencyLevel}</td>
                  <td className="px-4 py-3">{r.patientName ?? "—"}</td>
                  <td className="px-4 py-3 max-w-[200px] truncate" title={r.location}>
                    {r.location ?? "—"}
                  </td>
                  <td className="px-4 py-3">{r.status}</td>
                  <td className="px-4 py-3">
                    {r.status === "Open" ? (
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-8 text-xs"
                          disabled={isPending}
                          onClick={() => setStatus(r._id, "Fulfilled")}
                        >
                          Fulfilled
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-8 text-xs"
                          disabled={isPending}
                          onClick={() => setStatus(r._id, "Cancelled")}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
