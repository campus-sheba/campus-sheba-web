"use client";

import { useRef, useState } from "react";
import { Phone, Lock, User, Eye, EyeOff, type LucideIcon } from "lucide-react";

import type { University } from "@/types/global";
import {
  getOrCreateDeviceId,
  getStoredPushToken,
  setStoredPushToken,
} from "@/lib/notifications/device";
import { getWebPushToken } from "@/lib/notifications/push";
import { subscribeUserNotificationsAction } from "@/app/actions/notifications";

/**
 * Presentational + pure helpers shared by the auth modal and the dedicated
 * /login and /signup pages, so the two surfaces stay visually and behaviourally
 * identical. Styled to the Campus Sheba mobile design language: clean white
 * cards, icon-prefixed inputs, and full-width brand-red actions.
 */

/** Campus Sheba brand red (matches the logo `#E30B12`). */
export const BRAND_RED = "#E30B12";

export const OTP_LENGTH = 6;

const FIELD_LABEL_CLASS = "mb-1.5 block text-sm font-medium text-neutral-700";
const FIELD_ERROR_CLASS = "mt-1 text-xs text-red-600";
const INPUT_SHELL_CLASS =
  "flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 transition-colors focus-within:border-[#E30B12] focus-within:ring-2 focus-within:ring-[#E30B12]/15";
const INPUT_CLASS =
  "w-full bg-transparent py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400";

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className={FIELD_LABEL_CLASS}>{children}</label>;
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className={FIELD_ERROR_CLASS}>{message}</p>;
}

type PhoneInputFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

export function PhoneInputField({
  label,
  placeholder,
  value,
  error,
  onChange,
}: PhoneInputFieldProps) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className={INPUT_SHELL_CLASS}>
        <Phone className="h-[18px] w-[18px] shrink-0 text-neutral-400" />
        <span className="text-sm font-medium text-neutral-500">+88</span>
        <input
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder={placeholder}
          className={INPUT_CLASS}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
      <FieldError message={error} />
    </div>
  );
}

type PinInputFieldProps = {
  label: string;
  value: string;
  error?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  /** keep API parity with previous callers; lock icon shows by default */
  withIcon?: boolean;
};

export function PinInputField({
  label,
  value,
  error,
  placeholder = "••••",
  onChange,
}: PinInputFieldProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className={INPUT_SHELL_CLASS}>
        <Lock className="h-[18px] w-[18px] shrink-0 text-neutral-400" />
        <input
          type={visible ? "text" : "password"}
          inputMode="numeric"
          placeholder={placeholder}
          className={INPUT_CLASS}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          aria-label={visible ? "Hide PIN" : "Show PIN"}
          className="shrink-0 p-1 text-neutral-400 transition-colors hover:text-neutral-600"
        >
          {visible ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
        </button>
      </div>
      <FieldError message={error} />
    </div>
  );
}

export function TextInputField({
  label,
  placeholder,
  value,
  error,
  icon: Icon = User,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  error?: string;
  icon?: LucideIcon;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className={INPUT_SHELL_CLASS}>
        <Icon className="h-[18px] w-[18px] shrink-0 text-neutral-400" />
        <input
          type="text"
          placeholder={placeholder}
          className={INPUT_CLASS}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
      <FieldError message={error} />
    </div>
  );
}

/** Six-cell one-time-code input that owns its own focus management. */
export function OtpInput({
  value,
  error,
  label,
  onChange,
}: {
  value: string;
  error?: string;
  label: string;
  onChange: (value: string) => void;
}) {
  const chars = value.padEnd(OTP_LENGTH, " ").slice(0, OTP_LENGTH).split("");
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const handleDigit = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const next = [...chars];
    next[index] = digit || " ";
    onChange(next.join("").replace(/\s/g, ""));
    if (digit && index < OTP_LENGTH - 1) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key !== "Backspace") return;
    const next = [...chars];
    if (next[index] !== " ") {
      next[index] = " ";
      onChange(next.join("").replace(/\s/g, ""));
      return;
    }
    if (index > 0) refs.current[index - 1]?.focus();
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    onChange(pasted);
    refs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex justify-between gap-2">
        {Array.from({ length: OTP_LENGTH }).map((_, index) => (
          <input
            key={index}
            ref={(element) => {
              refs.current[index] = element;
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            className="h-12 w-12 rounded-xl border border-neutral-200 text-center text-base font-semibold text-neutral-900 outline-none focus:border-[#E30B12] focus:ring-2 focus:ring-[#E30B12]/15"
            value={chars[index] === " " ? "" : chars[index]}
            onChange={(event) => handleDigit(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
          />
        ))}
      </div>
      <FieldError message={error} />
    </div>
  );
}

export function AuthSubmitButton({
  isPending,
  idleText,
  pendingText,
}: {
  isPending: boolean;
  idleText: string;
  pendingText: string;
}) {
  return (
    <button
      type="submit"
      disabled={isPending}
      className="w-full rounded-xl bg-[#E30B12] py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-sm transition-colors hover:bg-[#c70910] active:brightness-95 disabled:opacity-60"
    >
      {isPending ? pendingText : idleText}
    </button>
  );
}

// ── Pure helpers ─────────────────────────────────────────────────────────────

export function normalizePhoneDigits(value: string): string {
  const onlyDigits = value.replace(/\D/g, "");
  const withoutCountryCode = onlyDigits.startsWith("88")
    ? onlyDigits.slice(2)
    : onlyDigits;
  return withoutCountryCode.slice(0, 11);
}

export function buildFullPhone(digits: string): string {
  return `+88${digits}`;
}

export function validatePhoneNumber(
  phoneDigits: string,
  requiredMsg: string,
  invalidMsg: string,
): string {
  if (!phoneDigits) return requiredMsg;
  if (phoneDigits.length !== 11) return invalidMsg;
  return "";
}

export function validatePin(
  pin: string,
  requiredMsg: string,
  minMsg: string,
  minimumLength = 4,
): string {
  if (!pin) return requiredMsg;
  if (pin.length < minimumLength) return minMsg;
  return "";
}

/** Normalise the (optionally populated) `university` object on an auth profile. */
export function getUniversityFromProfile(profile: unknown): University | null {
  if (!profile || typeof profile !== "object") return null;
  const maybeUniversity = (profile as { university?: unknown }).university;
  if (!maybeUniversity || typeof maybeUniversity !== "object") return null;

  const raw = maybeUniversity as Partial<University> & { _id?: string; shortName?: string };
  if (!raw._id || !raw.name) return null;

  return {
    _id: raw._id,
    name: raw.name,
    shortName: raw.shortName ?? "",
    description: raw.description ?? "",
    establishedYear: raw.establishedYear ?? 0,
    website: raw.website ?? "",
    contactEmail: raw.contactEmail ?? "",
    contactPhone: raw.contactPhone ?? "",
    coverPhoto: raw.coverPhoto ?? "",
    logo: raw.logo ?? "",
    address: raw.address ?? "",
    isPublic: raw.isPublic ?? true,
    isActive: raw.isActive ?? true,
    createdAt: raw.createdAt ?? "",
    updatedAt: raw.updatedAt ?? "",
  };
}

/**
 * Best-effort web-push enrolment after a successful login/signup. Never throws —
 * notifications are a nicety, not a gate on completing auth.
 */
export async function subscribeToPushNotifications(): Promise<void> {
  try {
    const deviceId = getOrCreateDeviceId();
    let token = getStoredPushToken();
    if (!token) {
      token = await getWebPushToken({ requestPermission: true }).catch(() => null);
      if (token) setStoredPushToken(token);
    }
    if (!token) {
      console.warn("[notifications] No push token available; subscribe skipped.");
      return;
    }
    await subscribeUserNotificationsAction({
      token,
      fcmToken: token,
      fcm_token: token,
      platform: "web",
      appChannel: "customer",
      deviceId,
    });
  } catch (error) {
    console.error("[notifications] Post-auth subscribe failed.", error);
  }
}
