"use client";

import { useEffect, useState, useTransition } from "react";
import { Link } from "@/i18n/navigation";
import { useAppState } from "@/contexts/AppStateContext";
import { Button } from "@/components/ui";
import {
  deactivateBloodDonorProfileAction,
  getBloodDonorProfileAction,
  registerBloodDonorAction,
  updateBloodDonorProfileAction,
} from "@/services/blood-donor";
import { getUniversityMetadataAction } from "@/services/user";
import type { BloodDonorProfile, DonorAvailabilityStatus } from "@/types/blood-donor";
import { BLOOD_GROUPS } from "@/types/blood-donor";

const AVAILABILITY: DonorAvailabilityStatus[] = ["Available", "Not Available", "Recently Donated"];

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
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-[#00A651]";
const labelClass = "text-xs font-medium text-gray-500";

export default function MyBloodDonorPage() {
  const { state } = useAppState();
  const universityId = state.university.selected?._id ?? state.user.profile?.university?._id;
  const [profile, setProfile] = useState<BloodDonorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [halls, setHalls] = useState<{ _id: string; name: string }[]>([]);
  const [departments, setDepartments] = useState<{ _id: string; name: string }[]>([]);

  const [bloodGroup, setBloodGroup] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [email, setEmail] = useState("");
  const [hall, setHall] = useState("");
  const [department, setDepartment] = useState("");
  const [campusLocation, setCampusLocation] = useState("");
  const [lastDonationDate, setLastDonationDate] = useState("");
  const [emergencyDigits, setEmergencyDigits] = useState("");
  const [notes, setNotes] = useState("");

  const [isAvailable, setIsAvailable] = useState(true);
  const [availabilityStatus, setAvailabilityStatus] = useState<DonorAvailabilityStatus>("Available");

  const loadProfile = async () => {
    setLoading(true);
    setMsg(null);
    const res = await getBloodDonorProfileAction();
    setLoading(false);
    if (res.success && res.data) {
      const p = res.data;
      setProfile(p);
      setBloodGroup(p.bloodGroup ?? "");
      setPhoneDigits(normalizePhoneDigits(p.phoneNumber ?? ""));
      setEmail(p.email ?? "");
      setHall(typeof p.hall === "string" ? p.hall : "");
      setDepartment(typeof p.department === "string" ? p.department : "");
      setCampusLocation(p.campusLocation ?? "");
      setLastDonationDate(p.lastDonationDate ? p.lastDonationDate.slice(0, 10) : "");
      setEmergencyDigits(normalizePhoneDigits(p.emergencyContact ?? ""));
      setNotes(p.notes ?? "");
      setIsAvailable(p.isAvailable !== false);
      setAvailabilityStatus((p.availabilityStatus as DonorAvailabilityStatus) ?? "Available");
    } else {
      setProfile(null);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  useEffect(() => {
    if (!universityId) return;
    void (async () => {
      const res = await getUniversityMetadataAction(universityId);
      if (res.success) {
        setHalls(res.halls);
        setDepartments(res.departments);
      }
    })();
  }, [universityId]);

  const onRegister = () => {
    if (!bloodGroup) {
      setMsg("Blood group is required.");
      return;
    }
    const phone = buildApiPhone(phoneDigits);
    if (phone.length < 10) {
      setMsg("Enter a valid phone number.");
      return;
    }
    startTransition(async () => {
      const res = await registerBloodDonorAction({
        bloodGroup,
        phoneNumber: phone,
        email: email.trim() || undefined,
        hall: hall || undefined,
        department: department || undefined,
        campusLocation: campusLocation.trim() || undefined,
        lastDonationDate: lastDonationDate ? new Date(lastDonationDate).toISOString() : undefined,
        emergencyContact: emergencyDigits ? buildApiPhone(emergencyDigits) : undefined,
        notes: notes.trim() || undefined,
      });
      setMsg(res.success ? "Registered as donor." : res.message);
      if (res.success) void loadProfile();
    });
  };

  const onUpdate = () => {
    const phone = buildApiPhone(phoneDigits);
    startTransition(async () => {
      const res = await updateBloodDonorProfileAction({
        isAvailable,
        availabilityStatus,
        phoneNumber: phone.length >= 10 ? phone : undefined,
        email: email.trim() || undefined,
        hall: hall || undefined,
        department: department || undefined,
        campusLocation: campusLocation.trim() || undefined,
        lastDonationDate: lastDonationDate ? new Date(lastDonationDate).toISOString() : undefined,
        emergencyContact: emergencyDigits ? buildApiPhone(emergencyDigits) : undefined,
        notes: notes.trim() || undefined,
      });
      setMsg(res.success ? "Profile updated." : res.message);
      if (res.success) void loadProfile();
    });
  };

  const onDeactivate = () => {
    if (!window.confirm("Deactivate your donor profile? You can register again later.")) return;
    startTransition(async () => {
      const res = await deactivateBloodDonorProfileAction();
      setMsg(res.success ? "Profile deactivated." : res.message);
      if (res.success) {
        setProfile(null);
        setBloodGroup("");
        setPhoneDigits("");
        setEmail("");
        setHall("");
        setDepartment("");
        setCampusLocation("");
        setLastDonationDate("");
        setEmergencyDigits("");
        setNotes("");
      }
    });
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/blood-bank" className="text-sm font-medium text-gray-500 hover:text-gray-900">
          ← Blood bank
        </Link>
        <h1 className="mt-2 text-xl font-bold text-gray-900">Blood donor profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          {profile
            ? "Update availability and contact details."
            : "Register to appear in campus donor search."}
        </p>
      </div>

      {msg ? (
        <p
          className={`rounded-lg border px-4 py-3 text-sm ${
            msg.includes("failed") || msg.includes("error") || msg.includes("Invalid")
              ? "border-red-100 bg-red-50 text-red-800"
              : "border-emerald-100 bg-emerald-50 text-emerald-900"
          }`}
        >
          {msg}
        </p>
      ) : null}

      <div className="grid gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm md:grid-cols-2">
        <div className="md:col-span-2">
          <label className={labelClass}>Blood group</label>
          <select
            className={`${inputClass} mt-1`}
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
            disabled={Boolean(profile)}
          >
            <option value="">Select</option>
            {BLOOD_GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {profile ? (
          <>
            <div>
              <label className={labelClass}>Available to donate</label>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">isAvailable</span>
              </div>
            </div>
            <div>
              <label className={labelClass}>Availability status</label>
              <select
                className={`${inputClass} mt-1`}
                value={availabilityStatus}
                onChange={(e) => setAvailabilityStatus(e.target.value as DonorAvailabilityStatus)}
              >
                {AVAILABILITY.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </>
        ) : null}

        <div>
          <label className={labelClass}>Phone</label>
          <input
            className={`${inputClass} mt-1`}
            inputMode="numeric"
            value={phoneDigits}
            onChange={(e) => setPhoneDigits(normalizePhoneDigits(e.target.value))}
            placeholder="01XXXXXXXXX"
          />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input
            className={`${inputClass} mt-1`}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {halls.length > 0 ? (
          <div>
            <label className={labelClass}>Hall</label>
            <select className={`${inputClass} mt-1`} value={hall} onChange={(e) => setHall(e.target.value)}>
              <option value="">Optional</option>
              {halls.map((h) => (
                <option key={h._id} value={h._id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {departments.length > 0 ? (
          <div>
            <label className={labelClass}>Department</label>
            <select
              className={`${inputClass} mt-1`}
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="">Optional</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="md:col-span-2">
          <label className={labelClass}>Campus location / room</label>
          <input
            className={`${inputClass} mt-1`}
            value={campusLocation}
            onChange={(e) => setCampusLocation(e.target.value)}
            placeholder="Room 305, hall block…"
          />
        </div>

        <div>
          <label className={labelClass}>Last donation date</label>
          <input
            className={`${inputClass} mt-1`}
            type="date"
            value={lastDonationDate}
            onChange={(e) => setLastDonationDate(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Emergency contact</label>
          <input
            className={`${inputClass} mt-1`}
            inputMode="numeric"
            value={emergencyDigits}
            onChange={(e) => setEmergencyDigits(normalizePhoneDigits(e.target.value))}
            placeholder="01XXXXXXXXX"
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Notes</label>
          <textarea
            className={`${inputClass} mt-1 min-h-[88px]`}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={500}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {profile ? (
          <>
            <Button type="button" onClick={onUpdate} disabled={isPending}>
              {isPending ? "Saving…" : "Save changes"}
            </Button>
            <Button type="button" variant="outline" onClick={onDeactivate} disabled={isPending}>
              Deactivate profile
            </Button>
          </>
        ) : (
          <Button type="button" onClick={onRegister} disabled={isPending}>
            {isPending ? "Submitting…" : "Register as donor"}
          </Button>
        )}
      </div>
    </div>
  );
}
