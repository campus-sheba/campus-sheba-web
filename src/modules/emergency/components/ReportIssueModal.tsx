"use client";

import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import { reportEmergencyContactIssueAction } from "@/services/emergency-contacts";
import type { ContactIssueType } from "@/types/emergency-contact";

const ISSUE_TYPES: { value: ContactIssueType; label: string }[] = [
  { value: "unreachable", label: "Number rings but no one answers" },
  { value: "wrong-number", label: "Number doesn't connect to the service" },
  { value: "service-unavailable", label: "Service has closed or moved" },
  { value: "number-changed", label: "Got a different number from the service" },
  { value: "other", label: "Other issue" },
];

type Props = {
  contactId: string;
  contactName: string;
  onClose: () => void;
};

export default function ReportIssueModal({ contactId, contactName, onClose }: Props) {
  const [issueType, setIssueType] = useState<ContactIssueType>("unreachable");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await reportEmergencyContactIssueAction(contactId, { issueType, notes: notes.trim() || undefined });
    setSubmitting(false);
    if (res.success) {
      setDone(true);
    } else {
      setError(res.message ?? "Failed to submit. Please try again.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <span className="font-bold text-gray-900">Report an issue</span>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        {done ? (
          <div className="px-5 py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="mt-3 font-semibold text-gray-900">Report submitted</p>
            <p className="mt-1 text-sm text-gray-500">Our team will review it shortly.</p>
            <button
              onClick={onClose}
              className="mt-5 rounded-xl bg-[#00A651] px-6 py-2.5 text-sm font-bold text-white hover:brightness-105"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
            <p className="text-sm text-gray-600">
              Reporting an issue with <span className="font-semibold text-gray-900">{contactName}</span>
            </p>

            <div className="space-y-2">
              {ISSUE_TYPES.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition ${
                    issueType === opt.value
                      ? "border-[#00A651] bg-[#00A651]/5 text-gray-900"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="issueType"
                    value={opt.value}
                    checked={issueType === opt.value}
                    onChange={() => setIssueType(opt.value)}
                    className="accent-[#00A651]"
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>

            <div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Additional details (optional)"
                className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-[#00A651] focus:ring-2 focus:ring-[#00A651]/20"
              />
              <p className="mt-1 text-right text-xs text-gray-400">{notes.length}/500</p>
            </div>

            {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p> : null}

            <div className="flex gap-2 pb-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-white hover:bg-amber-600 disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Submit report"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
