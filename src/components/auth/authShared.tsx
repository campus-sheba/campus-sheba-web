"use client";

import { useRef } from "react";
import { Phone, Lock } from "lucide-react";

import { Button } from "@/components/ui";
import { cn } from "@/utils/utils";
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
 * identical without duplicating field logic.
 */

export const OTP_LENGTH = 6;

const FIELD_LABEL_CLASS = "mb-1 block text-sm font-medium text-neutral-700";
const FIELD_ERROR_CLASS = "mt-1 text-xs text-red-500";
const INPUT_BASE_CLASS =
  "w-full border border-neutral-300 rounded-lg py-2.5 outline-none text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600";

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
      <div className="flex items-center overflow-hidden rounded-lg border border-neutral-300 bg-white focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100">
        <span className="inline-flex items-center gap-1 border-r border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm font-semibold text-neutral-700">
          <Phone className="h-4 w-4 text-neutral-400" />
          (+88)
        </span>
        <input
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder={placeholder}
          className="w-full px-3 py-2.5 text-sm outline-none"
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
  className?: string;
  withIcon?: boolean;
  onChange: (value: string) => void;
};

export function PinInputField({
  label,
  value,
  error,
  placeholder = "****",
  className,
  withIcon = false,
  onChange,
}: PinInputFieldProps) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className={cn(withIcon && "relative")}>
        {withIcon && (
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        )}
        <input
          type="password"
          placeholder={placeholder}
          className={cn(INPUT_BASE_CLASS, withIcon ? "pl-10 pr-4" : "px-4", className)}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
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
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        type="text"
        placeholder={placeholder}
        className={cn(INPUT_BASE_CLASS, "px-4")}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
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
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const chars = value.padEnd(OTP_LENGTH, " ").slice(0, OTP_LENGTH).split("");

  const handleDigit = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const next = [...chars];
    next[index] = digit || " ";
    onChange(next.join("").replace(/\s/g, ""));
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
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
    if (index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    onChange(pasted);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex justify-between gap-2">
        {Array.from({ length: OTP_LENGTH }).map((_, index) => (
          <input
            key={index}
            ref={(element) => {
              inputRefs.current[index] = element;
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            className="h-11 w-11 rounded-lg border border-neutral-300 text-center text-base font-semibold text-neutral-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
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
    <Button
      type="submit"
      disabled={isPending}
      variant="secondary"
      fullWidth
      uppercase={false}
      className="rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
    >
      {isPending ? pendingText : idleText}
    </Button>
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
