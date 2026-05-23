"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Camera,
  CheckCircle2,
  XCircle,
  Mail,
  GraduationCap,
  Home as HomeIcon,
  User as UserIcon,
} from "lucide-react";

import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import { uploadMediaFiles } from "@/lib/media/client";
import { MediaFeatureName } from "@/types/media";
import { resolveProfilePhotoUrl } from "@/utils/media/profilePhoto";
import {
  DashboardProfile,
  ProfilePayload,
  sendUpdateEmailCodeAction,
  updateProfileAction,
  verifyUpdateEmailAction,
} from "@/services/user";

type OptionItem = { _id: string; name: string; code?: string };

type ProfilePageProps = {
  profile: DashboardProfile;
  halls: OptionItem[];
  departments: OptionItem[];
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

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

const INPUT_CLASS =
  "w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-[#00A651] focus:ring-2 focus:ring-[#00A651]/15";

// ── Small presentational helpers (keep the form readable & consistent) ────────

function Card({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: typeof UserIcon;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
        {Icon && <Icon className="h-4 w-4 text-[#00A651]" />}
        {title}
      </h2>
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

function toDateInput(value?: string) {
  if (!value) return "";
  return value.slice(0, 10);
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
  if (typeof value === "object" && "_id" in value && typeof value._id === "string") {
    return value._id;
  }
  return "";
}

export default function ProfilePage({
  profile,
  halls,
  departments,
}: ProfilePageProps) {
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(null);
  const [emailState, setEmailState] = useState({ email: "", code: "", sent: false });

  const university =
    typeof profile.university === "object" ? profile.university : null;
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
      setFeedback(
        result.success
          ? { ok: true, text: "Profile updated successfully." }
          : { ok: false, text: result.message ?? "Update failed." },
      );
    });
  };

  const onSendEmailCode = () => {
    setFeedback(null);
    startTransition(async () => {
      const result = await sendUpdateEmailCodeAction(emailState.email);
      if (result.success) {
        setEmailState((prev) => ({ ...prev, sent: true }));
        setFeedback({ ok: true, text: "Verification code sent." });
      } else {
        setFeedback({ ok: false, text: result.message ?? "Failed to send code." });
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
        setFeedback({ ok: false, text: uploaded.message ?? "Photo upload failed." });
        return;
      }
      const result = await updateProfileAction({
        photo: { url: meta.url, key: meta.key || "profile-photo", size: meta.size },
      });
      if (result.success) {
        setLocalAvatarUrl(meta.url);
        setFeedback({ ok: true, text: "Profile photo updated." });
        router.refresh();
      } else {
        setFeedback({ ok: false, text: result.message ?? "Could not save photo." });
      }
    });
    e.target.value = "";
  };

  const onVerifyEmail = () => {
    setFeedback(null);
    startTransition(async () => {
      const result = await verifyUpdateEmailAction(emailState.email, emailState.code);
      setFeedback(
        result.success
          ? { ok: true, text: "Email updated successfully." }
          : { ok: false, text: result.message ?? "Email verification failed." },
      );
    });
  };

  return (
    <div className="space-y-5 pb-24">
      <AppBreadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/profile" },
          { label: "Profile" },
        ]}
      />

      {/* Profile header */}
      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="relative h-36 w-full bg-gray-100 sm:h-44">
          <Image src={coverPhoto} alt="University cover" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
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
          <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="relative h-20 w-20 shrink-0">
              <div className="relative h-20 w-20 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-sm">
                <Image
                  src={displayAvatar}
                  alt={profile.name || "User avatar"}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              <button
                type="button"
                aria-label="Change profile photo"
                disabled={isPending}
                onClick={() => avatarInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-md transition hover:bg-gray-50 disabled:opacity-50"
              >
                <Camera className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
            <div className="min-w-0 pb-1">
              <h1 className="truncate text-2xl font-bold text-gray-900">
                {profile.name || "Profile"}
              </h1>
              <p className="truncate text-sm text-gray-500">
                {university?.name || "Campus profile"}
                {profile.session ? ` · ${profile.session}` : ""}
              </p>
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-1 gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs text-gray-400">Phone</dt>
              <dd className="font-medium text-gray-800">{profile.phone || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">Email</dt>
              <dd className="truncate font-medium text-gray-800">
                {profile.email || "N/A"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400">Blood group</dt>
              <dd className="font-medium text-gray-800">{profile.blood || "N/A"}</dd>
            </div>
          </dl>
        </div>
      </section>

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
                setEmailState((prev) => ({ ...prev, email: e.target.value }))
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

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-100 bg-white/95 backdrop-blur lg:left-auto lg:right-6 lg:w-auto lg:rounded-t-2xl lg:border lg:px-6">
        <div className="cs-container flex items-center justify-between gap-4 py-3 lg:px-0">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-[#00A651] focus:ring-[#00A651]"
              checked={form.isNotificationEnabled}
              onChange={(e) => set("isNotificationEnabled", e.target.checked)}
            />
            Enable notifications
          </label>
          <div className="flex items-center gap-3">
            {feedback && (
              <span
                className={`hidden items-center gap-1.5 text-xs sm:flex ${
                  feedback.ok ? "text-[#00A651]" : "text-red-600"
                }`}
              >
                {feedback.ok ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                {feedback.text}
              </span>
            )}
            <button
              type="button"
              onClick={onSave}
              disabled={isPending}
              className="rounded-lg bg-[#00A651] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#008541] disabled:opacity-60"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
