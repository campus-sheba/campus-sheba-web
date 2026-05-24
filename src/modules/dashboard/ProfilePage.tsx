"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Bell,
  BellOff,
  Building2,
  CalendarDays,
  Camera,
  CheckCircle2,
  Copy,
  Droplets,
  GraduationCap,
  Hash,
  Home as HomeIcon,
  IdCard,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
  Users,
  X,
  XCircle,
} from "lucide-react";

import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import StudentVerificationCard from "@/modules/dashboard/StudentVerificationCard";
import { uploadMediaFiles } from "@/lib/media/client";
import { MediaFeatureName } from "@/types/media";
import { resolveProfilePhotoUrl } from "@/utils/media/profilePhoto";
import {
  DashboardProfile,
  ProfilePayload,
  getUniversityMetadataAction,
  sendUpdateEmailCodeAction,
  updateProfileAction,
  verifyUpdateEmailAction,
} from "@/services/user";

type OptionItem = { _id: string; name: string; code?: string };

type ProfilePageProps = {
  profile: DashboardProfile;
  /** Optional seed; when omitted they're lazy-loaded for the edit form only. */
  halls?: OptionItem[];
  departments?: OptionItem[];
};

type FormState = {
  name: string;
  bio: string;
  gender: string;
  blood: string;
  birthDate: string;
  accountType: string;
  isNotificationEnabled: boolean;
  registrationNo: string;
  rollNumber: string;
  session: string;
  subject: string;
  department: string;
  hall: string;
  roomNo: string;
  campus: string;
};

const BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

const INPUT_CLASS =
  "w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-[#E30B12] focus:ring-2 focus:ring-[#E30B12]/15";

function Card({
  title,
  icon: Icon,
  action,
  children,
}: {
  title: string;
  icon?: typeof UserIcon;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
          {Icon && <Icon className="h-4 w-4 text-[#E30B12]" />}
          {title}
        </h2>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs font-medium text-gray-600">{label}</span>
      {children}
    </label>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  className = "",
  action,
}: {
  icon?: typeof UserIcon;
  label: string;
  value?: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  const isEmpty =
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim() === "");
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3 ${className}`}
    >
      {Icon && (
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#E30B12] shadow-sm ring-1 ring-gray-100">
          <Icon className="h-4 w-4" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
          {label}
        </p>
        <p
          className={`mt-0.5 truncate text-sm ${
            isEmpty ? "italic text-gray-400" : "font-medium text-gray-900"
          }`}
        >
          {isEmpty ? "Not set" : value}
        </p>
      </div>
      {action}
    </div>
  );
}

function toDateInput(value?: string) {
  if (!value) return "";
  return value.slice(0, 10);
}

function formatDate(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function resolveMetadataId(value: unknown, options: OptionItem[]): string {
  if (!value) return "";
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    const byId = options.find((item) => item._id === value);
    if (byId) return byId._id;
    const byNameOrCode = options.find(
      (item) =>
        item.name.toLowerCase() === normalized ||
        item.code?.toLowerCase() === normalized,
    );
    return byNameOrCode?._id ?? "";
  }
  if (
    typeof value === "object" &&
    "_id" in value &&
    typeof value._id === "string"
  ) {
    return value._id;
  }
  return "";
}

function resolveMetadataName(value: unknown, fallback?: string): string {
  if (value && typeof value === "object" && "name" in value) {
    const name = (value as { name?: unknown }).name;
    if (typeof name === "string" && name.trim()) return name;
  }
  if (typeof value === "string" && value.trim()) return value;
  return fallback?.trim() || "";
}

export default function ProfilePage({
  profile,
  halls: initialHalls,
  departments: initialDepartments,
}: ProfilePageProps) {
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(null);
  const [emailState, setEmailState] = useState({
    email: "",
    code: "",
    sent: false,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Edit-form dropdown options. Seeded from props when provided, otherwise
  // lazy-loaded on the client so the initial navigation isn't blocked on a
  // second API round-trip. The department/hall *values* come pre-resolved from
  // the populated profile objects, so the view never needs these arrays.
  const [halls, setHalls] = useState<OptionItem[]>(initialHalls ?? []);
  const [departments, setDepartments] = useState<OptionItem[]>(
    initialDepartments ?? [],
  );
  const [metadataLoaded, setMetadataLoaded] = useState(
    Boolean(initialHalls && initialDepartments),
  );

  const university =
    typeof profile.university === "object" ? profile.university : null;
  const universityId = university?._id;

  useEffect(() => {
    if (metadataLoaded || !isEditing) return;
    let active = true;
    void (async () => {
      const result = await getUniversityMetadataAction(universityId);
      if (!active) return;
      setHalls(result.halls);
      setDepartments(result.departments);
      setMetadataLoaded(true);
    })();
    return () => {
      active = false;
    };
  }, [isEditing, metadataLoaded, universityId]);
  const coverPhotoRaw = university?.coverPhoto as
    | string
    | { url?: string }
    | null
    | undefined;
  const coverPhoto =
    (typeof coverPhotoRaw === "string"
      ? coverPhotoRaw.trim()
      : coverPhotoRaw?.url?.trim()) || "/placeholder.jpg";
  const displayAvatar = localAvatarUrl || resolveProfilePhotoUrl(profile.photo);

  const initialForm = useMemo<FormState>(
    () => ({
      name: profile.name ?? "",
      bio: profile.bio ?? "",
      gender: profile.gender ?? "",
      blood: profile.blood ?? "",
      birthDate: toDateInput(profile.birthDate),
      accountType: profile.accountType ?? "Personal",
      isNotificationEnabled: Boolean(profile.isNotificationEnabled),
      registrationNo: profile.registrationNo ?? "",
      rollNumber: profile.rollNumber ?? "",
      session: profile.session ?? "",
      subject: profile.subject ?? "",
      department: resolveMetadataId(profile.department, departments),
      hall: resolveMetadataId(profile.hall ?? profile.hallName, halls),
      roomNo: profile.roomNo ?? "",
      campus: profile.campus ?? "",
    }),
    [departments, halls, profile],
  );

  const [form, setForm] = useState<FormState>(initialForm);
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const departmentName = resolveMetadataName(profile.department);
  const hallName = resolveMetadataName(profile.hall, profile.hallName);
  const memberSince = formatDate(profile.createdAt);
  const dob = formatDate(profile.birthDate);

  const onSave = () => {
    setFeedback(null);
    startTransition(async () => {
      const payload: ProfilePayload = {
        name: form.name,
        bio: form.bio,
        gender: form.gender || undefined,
        blood: form.blood || undefined,
        birthDate: form.birthDate || undefined,
        accountType: form.accountType || undefined,
        isNotificationEnabled: form.isNotificationEnabled,
        registrationNo: form.registrationNo || undefined,
        rollNumber: form.rollNumber || undefined,
        session: form.session || undefined,
        subject: form.subject || undefined,
        department: form.department || undefined,
        hall: form.hall || undefined,
        roomNo: form.roomNo || undefined,
        campus: form.campus || undefined,
      };

      const result = await updateProfileAction(payload);
      if (result.success) {
        setFeedback({ ok: true, text: "Profile updated successfully." });
        setIsEditing(false);
        router.refresh();
      } else {
        setFeedback({ ok: false, text: result.message ?? "Update failed." });
      }
    });
  };

  const onCancel = () => {
    setForm(initialForm);
    setEmailState({ email: "", code: "", sent: false });
    setFeedback(null);
    setIsEditing(false);
  };

  const onSendEmailCode = () => {
    setFeedback(null);
    startTransition(async () => {
      const result = await sendUpdateEmailCodeAction(emailState.email);
      if (result.success) {
        setEmailState((prev) => ({ ...prev, sent: true }));
        setFeedback({ ok: true, text: "Verification code sent." });
      } else {
        setFeedback({
          ok: false,
          text: result.message ?? "Failed to send code.",
        });
      }
    });
  };

  const onAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFeedback(null);
    startTransition(async () => {
      const uploaded = await uploadMediaFiles([file], MediaFeatureName.PROFILE);
      const meta = uploaded.files?.[0];
      if (!uploaded.success || !meta) {
        setFeedback({
          ok: false,
          text: uploaded.message ?? "Photo upload failed.",
        });
        return;
      }
      const result = await updateProfileAction({
        photo: {
          url: meta.url,
          key: meta.key || "profile-photo",
          size: meta.size,
        },
      });
      if (result.success) {
        setLocalAvatarUrl(meta.url);
        setFeedback({ ok: true, text: "Profile photo updated." });
        router.refresh();
      } else {
        setFeedback({
          ok: false,
          text: result.message ?? "Could not save photo.",
        });
      }
    });
    e.target.value = "";
  };

  const onVerifyEmail = () => {
    setFeedback(null);
    startTransition(async () => {
      const result = await verifyUpdateEmailAction(
        emailState.email,
        emailState.code,
      );
      if (result.success) {
        setFeedback({ ok: true, text: "Email updated successfully." });
        setEmailState({ email: "", code: "", sent: false });
        router.refresh();
      } else {
        setFeedback({
          ok: false,
          text: result.message ?? "Email verification failed.",
        });
      }
    });
  };

  const onCopyReferral = async () => {
    if (!profile.referralCode) return;
    try {
      await navigator.clipboard.writeText(profile.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-5 pb-6">
      <AppBreadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/profile" },
          { label: "Profile" },
        ]}
      />

      {/* Profile header */}
      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="relative h-40 w-full bg-gray-100 sm:h-52">
          <Image
            src={coverPhoto}
            alt="University cover"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
        </div>
        <div className="relative px-5 pb-5 sm:px-6 sm:pb-6">
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            aria-hidden
            onChange={onAvatarFile}
          />
          {/* Top row: avatar (overlaps cover) + right-aligned actions */}
          {/* Header content */}
          <div className="-mt-9 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            {/* Left side */}
            <div className="flex min-w-0 flex-1 gap-4">
              {/* Avatar */}
              <div className="relative h-24 w-24 shrink-0">
                <div className="relative h-24 w-24 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-md">
                  <Image
                    src={displayAvatar}
                    alt={profile.name || "User avatar"}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>

                <button
                  type="button"
                  aria-label="Change profile photo"
                  disabled={isPending}
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#E30B12] text-white shadow-md transition hover:bg-[#B70910] disabled:opacity-50"
                >
                  <Camera className="h-4 w-4" strokeWidth={2.2} />
                </button>
              </div>

              {/* Name + meta */}
              <div className="min-w-0 flex-1 pt-10">
                <h1 className="truncate text-xl font-bold text-gray-900 sm:text-[26px]">
                  {profile.name || "Welcome"}
                </h1>

                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500">
                  {departmentName && (
                    <span className="inline-flex items-center gap-1">
                      <GraduationCap className="h-3.5 w-3.5" />
                      <span className="truncate">{departmentName}</span>
                    </span>
                  )}

                  {profile.session && (
                    <span className="inline-flex items-center gap-1">
                      <span className="h-1 w-1 rounded-full bg-gray-300" />
                      Session {profile.session}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="flex flex-wrap items-center gap-3 lg:justify-end">
              {university?.name && (
                <div className="inline-flex items-center gap-2 rounded-full border border-gray-100 bg-gray-50 px-3 py-2">
                  {university.logo && (
                    <Image
                      src={university.logo}
                      alt={university.name}
                      width={20}
                      height={20}
                      className="h-5 w-5 rounded-full object-contain"
                    />
                  )}

                  <span className="whitespace-nowrap text-sm font-semibold text-gray-700">
                    {university.shortName || university.name}
                  </span>
                </div>
              )}

              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#E30B12] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#B70910]"
                >
                  <Pencil className="h-4 w-4" />
                  Edit Profile
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Quick stat tiles */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-rose-50 to-white p-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                Blood group
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-base font-bold text-gray-900">
                <Droplets className="h-4 w-4 text-[#E30B12]" />
                {profile.blood || "—"}
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-amber-50 to-white p-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                Referral code
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-base font-bold text-gray-900">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span className="truncate">{profile.referralCode || "—"}</span>
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-sky-50 to-white p-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                Referrals
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-base font-bold text-gray-900">
                <Users className="h-4 w-4 text-sky-500" />
                {profile.totalReferrals ?? 0}
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-emerald-50 to-white p-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                Member since
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-base font-bold text-gray-900">
                <CalendarDays className="h-4 w-4 text-emerald-500" />
                <span className="truncate">{memberSince || "—"}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm ${
            feedback.ok
              ? "border-green-100 bg-green-50 text-green-700"
              : "border-red-100 bg-red-50 text-red-700"
          }`}
          role="status"
        >
          {feedback.ok ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {isEditing ? (
        <>
          {/* Personal information */}
          <Card title="Personal Information" icon={UserIcon}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Full name">
                <input
                  className={INPUT_CLASS}
                  placeholder="Your full name"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </Field>
              <Field label="Gender">
                <select
                  className={INPUT_CLASS}
                  value={form.gender}
                  onChange={(e) => set("gender", e.target.value)}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </Field>
              <Field label="Blood group">
                <select
                  className={INPUT_CLASS}
                  value={form.blood}
                  onChange={(e) => set("blood", e.target.value)}
                >
                  <option value="">Select blood group</option>
                  {BLOOD_GROUPS.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Date of birth">
                <input
                  type="date"
                  className={INPUT_CLASS}
                  value={form.birthDate}
                  onChange={(e) => set("birthDate", e.target.value)}
                />
              </Field>
              <Field label="Bio" className="md:col-span-2">
                <textarea
                  rows={3}
                  className={INPUT_CLASS}
                  placeholder="Tell others a little about yourself"
                  value={form.bio}
                  onChange={(e) => set("bio", e.target.value)}
                />
              </Field>
            </div>
          </Card>

          {/* Academic information */}
          <Card title="Academic Information" icon={GraduationCap}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Registration No">
                <input
                  className={INPUT_CLASS}
                  placeholder="Registration number"
                  value={form.registrationNo}
                  onChange={(e) => set("registrationNo", e.target.value)}
                />
              </Field>
              <Field label="Roll number">
                <input
                  className={INPUT_CLASS}
                  placeholder="Roll number"
                  value={form.rollNumber}
                  onChange={(e) => set("rollNumber", e.target.value)}
                />
              </Field>
              <Field label="Session">
                <input
                  className={INPUT_CLASS}
                  placeholder="e.g. 2021-22"
                  value={form.session}
                  onChange={(e) => set("session", e.target.value)}
                />
              </Field>
              <Field label="Subject">
                <input
                  className={INPUT_CLASS}
                  placeholder="Subject"
                  value={form.subject}
                  onChange={(e) => set("subject", e.target.value)}
                />
              </Field>
              <Field label="Department" className="md:col-span-2">
                <select
                  className={INPUT_CLASS}
                  value={form.department}
                  onChange={(e) => set("department", e.target.value)}
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </Card>

          {/* Residence */}
          <Card title="Residence" icon={HomeIcon}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Hall">
                <select
                  className={INPUT_CLASS}
                  value={form.hall}
                  onChange={(e) => set("hall", e.target.value)}
                >
                  <option value="">Select hall</option>
                  {halls.map((hall) => (
                    <option key={hall._id} value={hall._id}>
                      {hall.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Room No">
                <input
                  className={INPUT_CLASS}
                  placeholder="Room number"
                  value={form.roomNo}
                  onChange={(e) => set("roomNo", e.target.value)}
                />
              </Field>
              <Field label="Campus" className="md:col-span-2">
                <input
                  className={INPUT_CLASS}
                  placeholder="Campus"
                  value={form.campus}
                  onChange={(e) => set("campus", e.target.value)}
                />
              </Field>
            </div>
          </Card>

          {/* Email */}
          <Card title="Update Email" icon={Mail}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="New email" className="sm:col-span-2">
                <input
                  className={INPUT_CLASS}
                  placeholder="newemail@example.com"
                  value={emailState.email}
                  onChange={(e) =>
                    setEmailState((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                />
              </Field>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={onSendEmailCode}
                  disabled={isPending || !emailState.email}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  Send Code
                </button>
              </div>
              <Field label="Verification code" className="sm:col-span-2">
                <input
                  className={INPUT_CLASS}
                  placeholder="Enter the 6-digit code"
                  value={emailState.code}
                  onChange={(e) =>
                    setEmailState((prev) => ({ ...prev, code: e.target.value }))
                  }
                />
              </Field>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={onVerifyEmail}
                  disabled={isPending || !emailState.sent || !emailState.code}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  Verify Email
                </button>
              </div>
            </div>
          </Card>

          {/* Inline save panel */}
          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex items-start gap-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#E30B12] focus:ring-[#E30B12]"
                  checked={form.isNotificationEnabled}
                  onChange={(e) =>
                    set("isNotificationEnabled", e.target.checked)
                  }
                />
                <span className="flex flex-col">
                  <span className="font-medium text-gray-900">
                    Enable notifications
                  </span>
                  <span className="text-xs text-gray-500">
                    Get updates about your orders, requests, and campus
                    activity.
                  </span>
                </span>
              </label>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isPending}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onSave}
                  disabled={isPending}
                  className="rounded-lg bg-[#E30B12] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#B70910] disabled:opacity-60"
                >
                  {isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </section>
        </>
      ) : (
        <>
          {/* Personal information (view) */}
          <Card title="Personal Information" icon={UserIcon}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <InfoRow icon={UserIcon} label="Full name" value={profile.name} />
              <InfoRow
                icon={BadgeCheck}
                label="Gender"
                value={profile.gender}
              />
              <InfoRow
                icon={Droplets}
                label="Blood group"
                value={profile.blood}
              />
              <InfoRow icon={CalendarDays} label="Date of birth" value={dob} />
              <InfoRow icon={Phone} label="Phone" value={profile.phone} />
              <InfoRow icon={Mail} label="Email" value={profile.email} />
              {profile.bio ? (
                <div className="rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3 md:col-span-2">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                    Bio
                  </p>
                  <p className="mt-1 whitespace-pre-line text-sm text-gray-800">
                    {profile.bio}
                  </p>
                </div>
              ) : (
                <InfoRow
                  icon={UserIcon}
                  label="Bio"
                  value=""
                  className="md:col-span-2"
                />
              )}
            </div>
          </Card>

          {/* Academic information (view) */}
          <Card title="Academic Information" icon={GraduationCap}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <InfoRow
                icon={Building2}
                label="University"
                value={university?.name}
                className="md:col-span-2"
              />
              <InfoRow
                icon={GraduationCap}
                label="Department"
                value={departmentName}
              />
              <InfoRow icon={IdCard} label="Subject" value={profile.subject} />
              <InfoRow
                icon={Hash}
                label="Registration No"
                value={profile.registrationNo}
              />
              <InfoRow
                icon={Hash}
                label="Roll number"
                value={profile.rollNumber}
              />
              <InfoRow
                icon={CalendarDays}
                label="Session"
                value={profile.session}
              />
            </div>
          </Card>

          {/* Residence (view) */}
          <Card title="Residence" icon={HomeIcon}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <InfoRow icon={HomeIcon} label="Hall" value={hallName} />
              <InfoRow icon={Hash} label="Room No" value={profile.roomNo} />
              <InfoRow
                icon={MapPin}
                label="Campus"
                value={profile.campus}
                className="md:col-span-2"
              />
            </div>
          </Card>

          {/* Activity & preferences (view) */}
          <Card title="Account & Activity" icon={ShieldCheck}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <InfoRow
                icon={Sparkles}
                label="Referral code"
                value={profile.referralCode}
                action={
                  profile.referralCode ? (
                    <button
                      type="button"
                      onClick={onCopyReferral}
                      aria-label="Copy referral code"
                      className="ml-2 inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          Copy
                        </>
                      )}
                    </button>
                  ) : undefined
                }
              />
              <InfoRow
                icon={Users}
                label="Total referrals"
                value={String(profile.totalReferrals ?? 0)}
              />
              <InfoRow
                icon={profile.isNotificationEnabled ? Bell : BellOff}
                label="Notifications"
                value={profile.isNotificationEnabled ? "Enabled" : "Disabled"}
              />
              <InfoRow
                icon={CalendarDays}
                label="Member since"
                value={memberSince}
              />
            </div>
          </Card>

          <StudentVerificationCard
            isVerified={profile.isStudentVerified}
            studentEmail={profile.studentEmail}
            allowedDomains={university?.studentEmailDomains ?? []}
            hasUniversity={Boolean(profile.university)}
          />
        </>
      )}
    </div>
  );
}
