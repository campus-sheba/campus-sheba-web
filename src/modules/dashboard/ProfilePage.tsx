"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui";

import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import { uploadMediaFiles } from "@/lib/media/client";
import { MediaFeatureName } from "@/types/media";
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
  if (
    typeof value === "object" &&
    "_id" in value &&
    typeof value._id === "string"
  ) {
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
  const [feedback, setFeedback] = useState<string>("");
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(null);
  const [emailState, setEmailState] = useState({
    email: "",
    code: "",
    sent: false,
  });

  const university =
    typeof profile.university === "object" ? profile.university : null;
  const coverPhoto = university?.coverPhoto || "/placeholder.jpg";
  const displayAvatar =
    localAvatarUrl ||
    profile.photo ||
    "/assets/images/blank-phone.svg";

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

  const onSave = () => {
    setFeedback("");
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
          ? "Profile updated successfully."
          : (result.message ?? "Update failed."),
      );
    });
  };

  const onSendEmailCode = () => {
    setFeedback("");
    startTransition(async () => {
      const result = await sendUpdateEmailCodeAction(emailState.email);
      if (result.success) {
        setEmailState((prev) => ({ ...prev, sent: true }));
        setFeedback("Verification code sent.");
      } else {
        setFeedback(result.message ?? "Failed to send code.");
      }
    });
  };

  const onAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFeedback("");
    startTransition(async () => {
      const uploaded = await uploadMediaFiles([file], MediaFeatureName.PROFILE);
      const meta = uploaded.files?.[0];
      if (!uploaded.success || !meta) {
        setFeedback(uploaded.message ?? "Photo upload failed.");
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
        setFeedback("Profile photo updated.");
        router.refresh();
      } else {
        setFeedback(result.message ?? "Could not save photo.");
      }
    });
    e.target.value = "";
  };

  const onVerifyEmail = () => {
    setFeedback("");
    startTransition(async () => {
      const result = await verifyUpdateEmailAction(
        emailState.email,
        emailState.code,
      );
      setFeedback(
        result.success
          ? "Email updated successfully."
          : (result.message ?? "Email verification failed."),
      );
    });
  };

  return (
    <div className="space-y-5">
      <AppBreadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/profile" },
          { label: "Profile" },
        ]}
      />

      <SectionWrapper
        spacing="none"
        background="white"
        className="overflow-hidden rounded-2xl border border-gray-100"
      >
        <div className="relative h-44 w-full bg-gray-100">
          <Image
            src={coverPhoto}
            alt="University cover photo"
            fill
            className="object-cover"
          />
        </div>
        <ContentWrapper className="relative -mt-10 px-6 pb-6">
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            aria-hidden
            onChange={onAvatarFile}
          />
          <div className="flex items-end gap-4">
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
            <div className="pb-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {profile.name || "Profile"}
              </h1>
              <p className="text-sm text-gray-500">
                {university?.name || "Campus profile"}{" "}
                {profile.session ? `- ${profile.session}` : ""}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600 md:grid-cols-3">
            <p>
              <span className="font-medium text-gray-800">Phone:</span>{" "}
              {profile.phone || "N/A"}
            </p>
            <p>
              <span className="font-medium text-gray-800">Email:</span>{" "}
              {profile.email || "N/A"}
            </p>
            <p>
              <span className="font-medium text-gray-800">Blood:</span>{" "}
              {profile.blood || "N/A"}
            </p>
          </div>

          <h2 className="mt-8 text-2xl font-bold text-gray-900">
            Profile Settings
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your personal, academic, and account information.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
              placeholder="Full name"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <select
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
              value={form.gender}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, gender: e.target.value }))
              }
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <select
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
              value={form.blood}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, blood: e.target.value }))
              }
            >
              <option value="">Select blood group</option>
              {BLOOD_GROUPS.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
            <input
              type="date"
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
              value={form.birthDate}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, birthDate: e.target.value }))
              }
            />
            <textarea
              rows={4}
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm md:col-span-2"
              placeholder="Bio"
              value={form.bio}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, bio: e.target.value }))
              }
            />
          </div>

          <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Academic Info
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
              placeholder="Registration No"
              value={form.registrationNo}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, registrationNo: e.target.value }))
              }
            />
            <input
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
              placeholder="Roll Number"
              value={form.rollNumber}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, rollNumber: e.target.value }))
              }
            />
            <input
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
              placeholder="Session"
              value={form.session}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, session: e.target.value }))
              }
            />
            <input
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
              placeholder="Subject"
              value={form.subject}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, subject: e.target.value }))
              }
            />
            <select
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm md:col-span-2"
              value={form.department}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, department: e.target.value }))
              }
            >
              <option value="">Select department</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Residence
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
            <select
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
              value={form.hall}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, hall: e.target.value }))
              }
            >
              <option value="">Select hall</option>
              {halls.map((hall) => (
                <option key={hall._id} value={hall._id}>
                  {hall.name}
                </option>
              ))}
            </select>
            <input
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
              placeholder="Room No"
              value={form.roomNo}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, roomNo: e.target.value }))
              }
            />
            <input
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm md:col-span-2"
              placeholder="Campus"
              value={form.campus}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, campus: e.target.value }))
              }
            />
          </div>

          <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Update Email
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
            <input
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm md:col-span-2"
              placeholder="newemail@example.com"
              value={emailState.email}
              onChange={(e) =>
                setEmailState((prev) => ({ ...prev, email: e.target.value }))
              }
            />
            <Button
              type="button"
              variant="secondary"
              uppercase={false}
              onClick={onSendEmailCode}
              disabled={isPending || !emailState.email}
            >
              Send Code
            </Button>
            <input
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm md:col-span-2"
              placeholder="Verification code"
              value={emailState.code}
              onChange={(e) =>
                setEmailState((prev) => ({ ...prev, code: e.target.value }))
              }
            />
            <Button
              type="button"
              variant="secondary"
              uppercase={false}
              onClick={onVerifyEmail}
              disabled={isPending || !emailState.sent || !emailState.code}
            >
              Verify Email
            </Button>
          </div>

          <div className="mt-8 flex items-center justify-between gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.isNotificationEnabled}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    isNotificationEnabled: e.target.checked,
                  }))
                }
              />
              Enable notifications
            </label>
            <Button
              type="button"
              variant="secondary"
              uppercase={false}
              onClick={onSave}
              disabled={isPending}
            >
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>

          {feedback && <p className="mt-4 text-sm text-gray-600">{feedback}</p>}
        </ContentWrapper>
      </SectionWrapper>
    </div>
  );
}
