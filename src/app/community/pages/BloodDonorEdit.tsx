"use client";

import {
  AlertTriangle,
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Droplets,
  Eye,
  EyeOff,
  Heart,
} from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";
import { Link } from "@/i18n/navigation";
import { useAppState } from "@/contexts/AppStateContext";
import { Button } from "@/components/ui";
import {
  deactivateBloodDonorProfileAction,
  fetchDonationHistoryAction,
  fetchEligibilityAction,
  getBloodDonorProfileAction,
  registerBloodDonorAction,
  toggleAvailabilityAction,
  updateBloodDonorProfileAction,
} from "@/services/blood-donor";
import { getUniversityMetadataAction } from "@/services/user";
import type {
  BloodDonorProfile,
  DonationHistory,
  DonorEligibility,
} from "@/types/blood-donor";
import {
  BLOOD_GROUPS,
  CONTACT_PREFERENCES,
  DONATION_TYPES,
} from "@/types/blood-donor";

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-[#00A651]";
const labelClass = "text-xs font-medium text-gray-500";

function normalizePhoneDigits(value: string): string {
  const onlyDigits = value.replace(/\D/g, "");
  const withoutCC = onlyDigits.startsWith("88") ? onlyDigits.slice(2) : onlyDigits;
  return withoutCC.slice(0, 11);
}

function buildApiPhone(digits: string): string {
  if (digits.length === 11 && digits.startsWith("01")) return `+88${digits}`;
  return digits.replace(/\s/g, "");
}

function EligibilityPanel({ items }: { items: DonorEligibility[] }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900">Donation eligibility</h3>
      <div className="mt-3 space-y-2">
        {items.map((e) => (
          <div
            key={e.donationType}
            className={`flex items-start gap-3 rounded-lg px-3 py-2.5 ${e.eligible ? "bg-emerald-50" : "bg-amber-50"}`}
          >
            {e.eligible ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            )}
            <div>
              <p className="text-sm font-semibold text-gray-900">{e.donationType}</p>
              {e.reason ? <p className="mt-0.5 text-xs text-gray-600">{e.reason}</p> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HistoryTimeline({ items }: { items: DonationHistory[] }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900">Donation history</h3>
      <div className="mt-3 space-y-4">
        {items.map((h) => (
          <div key={h._id} className="relative flex gap-3 pb-4">
            <div className="flex flex-col items-center">
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${h.milestoneBadge ? "bg-amber-100" : "bg-red-50"}`}>
                {h.milestoneBadge ? (
                  <Award className="h-4 w-4 text-amber-600" />
                ) : (
                  <Droplets className="h-4 w-4 text-red-400" />
                )}
              </div>
              <div className="mt-1 w-px flex-1 bg-gray-100" />
            </div>
            <div className="min-w-0 pb-2">
              <p className="text-sm font-semibold text-gray-900">
                {h.donationType ?? "Donation"}
                {h.units && h.units > 1 ? ` · ${h.units} units` : ""}
              </p>
              {h.milestoneBadge ? (
                <p className="mt-0.5 inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                  <Award className="h-3 w-3" />
                  {h.milestoneBadge}
                </p>
              ) : null}
              {h.centre ? <p className="mt-0.5 text-xs text-gray-600">{h.centre}</p> : null}
              {h.donationDate ? (
                <p className="mt-0.5 text-[11px] text-gray-400">
                  {new Date(h.donationDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              ) : null}
              {h.gratitudeNote ? (
                <blockquote className="mt-1.5 rounded-md bg-gray-50 px-3 py-2 text-[11px] italic text-gray-600">
                  &ldquo;{h.gratitudeNote}&rdquo;
                </blockquote>
              ) : null}
              <div className="mt-1 flex gap-3 text-[10px] text-gray-400">
                {h.donorConfirmed ? <span className="text-emerald-600">✓ You confirmed</span> : null}
                {h.requesterConfirmed ? <span className="text-emerald-600">✓ Recipient confirmed</span> : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BloodDonorEdit() {
  const { state } = useAppState();
  const universityId =
    state.university.selected?._id ??
    (typeof state.user.profile?.university === "object" && state.user.profile.university
      ? state.user.profile.university._id
      : undefined);

  const [profile, setProfile] = useState<BloodDonorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [halls, setHalls] = useState<{ _id: string; name: string }[]>([]);
  const [departments, setDepartments] = useState<{ _id: string; name: string }[]>([]);
  const [eligibility, setEligibility] = useState<DonorEligibility[]>([]);
  const [history, setHistory] = useState<DonationHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Form state
  const [bloodGroup, setBloodGroup] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [weight, setWeight] = useState("");
  const [donationType, setDonationType] = useState("");
  const [contactPreference, setContactPreference] = useState("");
  const [privacySetting, setPrivacySetting] = useState("Public");
  const [hall, setHall] = useState("");
  const [department, setDepartment] = useState("");
  const [campusLocation, setCampusLocation] = useState("");
  const [lastDonationDate, setLastDonationDate] = useState("");
  const [emergencyDigits, setEmergencyDigits] = useState("");
  const [notes, setNotes] = useState("");

  // Availability state
  const [isAvailable, setIsAvailable] = useState(true);
  const [unavailableUntil, setUnavailableUntil] = useState("");

  const loadProfile = useCallback(async () => {
    setLoading(true);
    const res = await getBloodDonorProfileAction();
    setLoading(false);
    if (res.success && res.data) {
      const p = res.data;
      setProfile(p);
      setBloodGroup(p.bloodGroup ?? "");
      setPhoneDigits(normalizePhoneDigits(p.phoneNumber ?? ""));
      setEmail(p.email ?? "");
      setDateOfBirth(p.dateOfBirth ? p.dateOfBirth.slice(0, 10) : "");
      setWeight(p.weight ? String(p.weight) : "");
      setDonationType(p.donationType ?? "");
      setContactPreference(p.contactPreference ?? "");
      setPrivacySetting(p.privacySetting ?? "Public");
      setHall(typeof p.hall === "string" ? p.hall : "");
      setDepartment(typeof p.department === "string" ? p.department : "");
      setCampusLocation(p.campusLocation ?? "");
      setLastDonationDate(p.lastDonationDate ? p.lastDonationDate.slice(0, 10) : "");
      setEmergencyDigits(normalizePhoneDigits(p.emergencyContact ?? ""));
      setNotes(p.notes ?? "");
      setIsAvailable(p.isAvailable !== false);
    } else {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

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

  useEffect(() => {
    if (!profile) return;
    void (async () => {
      const [eligRes, histRes] = await Promise.all([
        fetchEligibilityAction(),
        fetchDonationHistoryAction({ page: 1, limit: 20 }),
      ]);
      if (eligRes.success) setEligibility(eligRes.data);
      if (histRes.success) setHistory(histRes.data.data);
    })();
  }, [profile]);

  const flash = (text: string, ok = true) => setMsg({ text, ok });

  const onRegister = () => {
    if (!bloodGroup) { flash("Blood group is required.", false); return; }
    const phone = buildApiPhone(phoneDigits);
    if (phone.length < 10) { flash("Enter a valid phone number.", false); return; }
    startTransition(async () => {
      const res = await registerBloodDonorAction({
        bloodGroup,
        phoneNumber: phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : undefined,
        weight: weight ? Number(weight) : undefined,
        donationType: donationType || undefined,
        contactPreference: contactPreference || undefined,
        privacySetting: privacySetting || undefined,
        email: email.trim() || undefined,
        hall: hall || undefined,
        department: department || undefined,
        campusLocation: campusLocation.trim() || undefined,
        lastDonationDate: lastDonationDate ? new Date(lastDonationDate).toISOString() : undefined,
        emergencyContact: emergencyDigits ? buildApiPhone(emergencyDigits) : undefined,
        notes: notes.trim() || undefined,
      });
      flash(res.success ? "Successfully registered as a donor." : (res.message ?? "Registration failed."), res.success);
      if (res.success) void loadProfile();
    });
  };

  const onUpdate = () => {
    startTransition(async () => {
      const phone = buildApiPhone(phoneDigits);
      const res = await updateBloodDonorProfileAction({
        weight: weight ? Number(weight) : undefined,
        donationType: donationType || undefined,
        contactPreference: contactPreference || undefined,
        privacySetting: privacySetting || undefined,
        phoneNumber: phone.length >= 10 ? phone : undefined,
        email: email.trim() || undefined,
        hall: hall || undefined,
        department: department || undefined,
        campusLocation: campusLocation.trim() || undefined,
        lastDonationDate: lastDonationDate ? new Date(lastDonationDate).toISOString() : undefined,
        emergencyContact: emergencyDigits ? buildApiPhone(emergencyDigits) : undefined,
        notes: notes.trim() || undefined,
      });
      flash(res.success ? "Profile updated." : (res.message ?? "Update failed."), res.success);
      if (res.success) void loadProfile();
    });
  };

  const onToggleAvailability = () => {
    startTransition(async () => {
      const payload = isAvailable
        ? { isAvailable: false, unavailableUntil: unavailableUntil ? new Date(unavailableUntil).toISOString() : undefined }
        : { isAvailable: true };
      const res = await toggleAvailabilityAction(payload);
      flash(res.success ? "Availability updated." : (res.message ?? "Failed."), res.success);
      if (res.success) void loadProfile();
    });
  };

  const onDeactivate = () => {
    if (!window.confirm("Deactivate your donor profile? You can register again later.")) return;
    startTransition(async () => {
      const res = await deactivateBloodDonorProfileAction();
      flash(res.success ? "Profile deactivated." : (res.message ?? "Failed."), res.success);
      if (res.success) { setProfile(null); setBloodGroup(""); setPhoneDigits(""); }
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-100" />
        <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/blood-bank" className="text-sm font-medium text-gray-500 hover:text-gray-900">
          ← Blood bank
        </Link>
        <h1 className="mt-2 text-xl font-bold text-gray-900">
          {profile ? "Blood donor profile" : "Register as donor"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {profile
            ? `${profile.donationCount ?? 0} donation${profile.donationCount !== 1 ? "s" : ""} · ${profile.bloodGroup}`
            : "Register to appear in campus donor search and receive notifications for blood requests."}
        </p>
      </div>

      {msg ? (
        <p className={`rounded-lg border px-4 py-3 text-sm ${msg.ok ? "border-emerald-100 bg-emerald-50 text-emerald-900" : "border-red-100 bg-red-50 text-red-800"}`}>
          {msg.text}
        </p>
      ) : null}

      {/* Profile form */}
      <div className="grid gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm md:grid-cols-2">
        <div className="md:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Basic info</p>
        </div>

        <div>
          <label className={labelClass}>Blood group</label>
          <select
            className={`${inputClass} mt-1`}
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
            disabled={Boolean(profile)}
          >
            <option value="">Select</option>
            {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          {profile ? <p className="mt-1 text-[11px] text-gray-400">Blood group cannot be changed after registration.</p> : null}
        </div>

        <div>
          <label className={labelClass}>Phone number</label>
          <input
            className={`${inputClass} mt-1`}
            inputMode="numeric"
            value={phoneDigits}
            onChange={(e) => setPhoneDigits(normalizePhoneDigits(e.target.value))}
            placeholder="01XXXXXXXXX"
          />
        </div>

        {!profile ? (
          <>
            <div>
              <label className={labelClass}>Date of birth (for eligibility check)</label>
              <input
                className={`${inputClass} mt-1`}
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Weight (kg)</label>
              <input
                className={`${inputClass} mt-1`}
                type="number"
                min={30}
                max={300}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Min 50 kg to donate"
              />
            </div>
          </>
        ) : (
          <div>
            <label className={labelClass}>Weight (kg)</label>
            <input
              className={`${inputClass} mt-1`}
              type="number"
              min={30}
              max={300}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
        )}

        <div>
          <label className={labelClass}>Email (optional)</label>
          <input
            className={`${inputClass} mt-1`}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Donation preferences</p>
        </div>

        <div>
          <label className={labelClass}>Donation type</label>
          <select className={`${inputClass} mt-1`} value={donationType} onChange={(e) => setDonationType(e.target.value)}>
            <option value="">Any</option>
            {DONATION_TYPES.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div>
          <label className={labelClass}>Contact preference</label>
          <select className={`${inputClass} mt-1`} value={contactPreference} onChange={(e) => setContactPreference(e.target.value)}>
            <option value="">Not specified</option>
            {CONTACT_PREFERENCES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className={labelClass}>Privacy</label>
          <div className="mt-1 flex gap-2">
            {(["Public", "Anonymous"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPrivacySetting(p)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-semibold transition ${
                  privacySetting === p
                    ? "border-[#00A651] bg-[#00A651]/5 text-[#00A651]"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {p === "Public" ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                {p}
              </button>
            ))}
          </div>
          <p className="mt-1 text-[11px] text-gray-400">
            {privacySetting === "Anonymous" ? "Only blood group and availability will be shown." : "Your name and contact will be visible to others."}
          </p>
        </div>

        <div className="md:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Location</p>
        </div>

        {halls.length > 0 ? (
          <div>
            <label className={labelClass}>Hall</label>
            <select className={`${inputClass} mt-1`} value={hall} onChange={(e) => setHall(e.target.value)}>
              <option value="">Optional</option>
              {halls.map((h) => <option key={h._id} value={h._id}>{h.name}</option>)}
            </select>
          </div>
        ) : null}

        {departments.length > 0 ? (
          <div>
            <label className={labelClass}>Department</label>
            <select className={`${inputClass} mt-1`} value={department} onChange={(e) => setDepartment(e.target.value)}>
              <option value="">Optional</option>
              {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
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

        <div className="md:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Medical</p>
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
          <label className={labelClass}>Notes (visible to requesters)</label>
          <textarea
            className={`${inputClass} mt-1 min-h-[80px]`}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={500}
            placeholder="Available on weekends, prefer DMCH…"
          />
          <p className="mt-0.5 text-right text-[11px] text-gray-400">{notes.length}/500</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {profile ? (
          <Button type="button" onClick={onUpdate} disabled={isPending}>
            {isPending ? "Saving…" : "Save changes"}
          </Button>
        ) : (
          <Button type="button" onClick={onRegister} disabled={isPending}>
            {isPending ? "Submitting…" : "Register as donor"}
          </Button>
        )}
      </div>

      {/* Availability toggle — only shown when registered */}
      {profile ? (
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Availability</h3>
              <p className="mt-0.5 text-xs text-gray-500">
                Current status:{" "}
                <span className={`font-semibold ${profile.isAvailable ? "text-emerald-700" : "text-gray-600"}`}>
                  {profile.availabilityStatus ?? (profile.isAvailable ? "Available" : "Not Available")}
                </span>
              </p>
              {profile.temporarilyUnavailableUntil ? (
                <p className="mt-0.5 flex items-center gap-1 text-[11px] text-amber-700">
                  <Clock className="h-3 w-3" />
                  Until {new Date(profile.temporarilyUnavailableUntil).toLocaleDateString("en-GB")}
                </p>
              ) : null}
            </div>
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${profile.isAvailable ? "bg-emerald-100" : "bg-gray-100"}`}>
              <Heart className={`h-5 w-5 ${profile.isAvailable ? "text-emerald-600" : "text-gray-400"}`} />
            </div>
          </div>

          {profile.isAvailable ? (
            <div className="mt-4 space-y-3">
              <div>
                <label className={labelClass}>Mark unavailable until (optional)</label>
                <input
                  className={`${inputClass} mt-1`}
                  type="date"
                  value={unavailableUntil}
                  onChange={(e) => setUnavailableUntil(e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                />
                <p className="mt-0.5 text-[11px] text-gray-400">Leave blank for indefinite. System auto-restores on the date.</p>
              </div>
              <Button type="button" variant="outline" onClick={onToggleAvailability} disabled={isPending}>
                {isPending ? "Updating…" : "Mark unavailable"}
              </Button>
            </div>
          ) : (
            <div className="mt-4">
              <Button type="button" onClick={onToggleAvailability} disabled={isPending}>
                {isPending ? "Updating…" : "Mark available"}
              </Button>
            </div>
          )}
        </div>
      ) : null}

      {/* Eligibility panel */}
      {profile && eligibility.length > 0 ? (
        <EligibilityPanel items={eligibility} />
      ) : null}

      {/* Donation history */}
      {profile && history.length > 0 ? (
        <div>
          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            className="flex w-full items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm hover:bg-gray-50"
          >
            <span className="text-sm font-bold text-gray-900">
              Donation history ({history.length})
            </span>
            {showHistory ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
          </button>
          {showHistory ? (
            <div className="mt-2">
              <HistoryTimeline items={history} />
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Deactivate */}
      {profile ? (
        <div className="rounded-xl border border-dashed border-gray-200 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Danger zone</p>
          <p className="mt-1 text-sm text-gray-600">Deactivating removes you from the donor directory. You can re-register later.</p>
          <button
            type="button"
            onClick={onDeactivate}
            disabled={isPending}
            className="mt-3 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Deactivate profile
          </button>
        </div>
      ) : null}
    </div>
  );
}
