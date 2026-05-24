"use client";

import { useState, useTransition } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui";
import { createBloodRequestAction } from "@/services/blood-donor";
import { BLOOD_GROUPS, URGENCY_LEVELS, type BloodRequestUrgency } from "@/types/blood-donor";

const URGENCY_HINTS: Record<string, string> = {
  Urgent: "Auto-published immediately, notifies donors now",
  Moderate: "Goes to moderation queue, active within 24h",
  Planned: "Goes to moderation queue, active within 72h",
};

function normalizePhoneDigits(value: string): string {
  const onlyDigits = value.replace(/\D/g, "");
  const withoutCountryCode = onlyDigits.startsWith("88") ? onlyDigits.slice(2) : onlyDigits;
  return withoutCountryCode.slice(0, 11);
}

function buildApiPhone(digits: string): string {
  if (digits.length === 11 && digits.startsWith("01")) return `+88${digits}`;
  return digits.replace(/\s/g, "");
}

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-[#E30B12]";
const labelClass = "text-xs font-medium text-gray-500";

export default function MyBloodRequestCreatePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [bloodGroup, setBloodGroup] = useState("");
  const [urgencyLevel, setUrgencyLevel] = useState<BloodRequestUrgency>("Moderate");
  const [hospital, setHospital] = useState("");
  const [location, setLocation] = useState("");
  const [contactDigits, setContactDigits] = useState("");
  const [patientName, setPatientName] = useState("");
  const [requiredUnits, setRequiredUnits] = useState("1");
  const [additionalInfo, setAdditionalInfo] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bloodGroup) {
      setError("Blood group is required.");
      return;
    }
    if (location.trim().length < 5) {
      setError("Location must be at least 5 characters.");
      return;
    }
    const contact = buildApiPhone(contactDigits);
    if (contact.length < 10) {
      setError("Enter a valid contact number.");
      return;
    }
    const units = Math.min(10, Math.max(1, Number(requiredUnits) || 1));
    setError(null);
    startTransition(async () => {
      const res = await createBloodRequestAction({
        bloodGroup,
        urgencyLevel,
        hospital: hospital.trim() || undefined,
        location: location.trim(),
        contactNumber: contact,
        patientName: patientName.trim() || undefined,
        requiredUnits: units,
        additionalInfo: additionalInfo.trim() || undefined,
      });
      if (!res.success) {
        setError(res.message);
        return;
      }
      router.push("/my-blood-requests");
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/my-blood-requests" className="text-sm font-medium text-gray-500 hover:text-gray-900">
          ← My requests
        </Link>
        <h1 className="mt-2 text-xl font-bold text-gray-900">Emergency blood request</h1>
        <p className="mt-1 text-sm text-gray-500">This notifies donors on your campus. Use accurate contact details.</p>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      ) : null}

      <form onSubmit={onSubmit} className="grid gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm md:grid-cols-2">
        <div>
          <label className={labelClass}>Blood group required</label>
          <select
            className={`${inputClass} mt-1`}
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
            required
          >
            <option value="">Select</option>
            {BLOOD_GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Urgency</label>
          <select
            className={`${inputClass} mt-1`}
            value={urgencyLevel}
            onChange={(e) => setUrgencyLevel(e.target.value as BloodRequestUrgency)}
          >
            {URGENCY_LEVELS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          {URGENCY_HINTS[urgencyLevel] ? (
            <p className="mt-1 text-[11px] text-gray-500">{URGENCY_HINTS[urgencyLevel]}</p>
          ) : null}
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Hospital (optional)</label>
          <input className={`${inputClass} mt-1`} value={hospital} onChange={(e) => setHospital(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Location / ward / address</label>
          <textarea
            className={`${inputClass} mt-1 min-h-[80px]`}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            minLength={5}
            maxLength={300}
          />
        </div>
        <div>
          <label className={labelClass}>Contact number</label>
          <input
            className={`${inputClass} mt-1`}
            inputMode="numeric"
            value={contactDigits}
            onChange={(e) => setContactDigits(normalizePhoneDigits(e.target.value))}
            placeholder="01XXXXXXXXX"
            required
          />
        </div>
        <div>
          <label className={labelClass}>Patient name (optional)</label>
          <input className={`${inputClass} mt-1`} value={patientName} onChange={(e) => setPatientName(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Units required</label>
          <input
            className={`${inputClass} mt-1`}
            type="number"
            min={1}
            max={10}
            value={requiredUnits}
            onChange={(e) => setRequiredUnits(e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Additional info</label>
          <textarea
            className={`${inputClass} mt-1 min-h-[100px]`}
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            maxLength={1000}
          />
        </div>
        <div className="md:col-span-2 flex flex-wrap gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Submitting…" : "Submit request"}
          </Button>
          <Link href="/my-blood-requests" className="inline-flex items-center text-sm font-semibold text-gray-600 hover:text-gray-900">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
