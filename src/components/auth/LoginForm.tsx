"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { loginAction } from "@/app/[locale]/(auth)/login/actions";
import { useAppState } from "@/contexts/AppStateContext";
import type { UserProfile } from "@/types/global";
import {
  AuthSubmitButton,
  FieldError,
  PhoneInputField,
  PinInputField,
  buildFullPhone,
  getUniversityFromProfile,
  normalizePhoneDigits,
  subscribeToPushNotifications,
  validatePhoneNumber,
  validatePin,
} from "@/components/auth/authShared";

type LoginFormProps = {
  /** Called once the session is established and global state is updated. */
  onSuccess?: (profile: UserProfile) => void;
  /** Render the "Sign up" switch link (modal passes a tab switch; pages pass a route). */
  switchToSignup?: React.ReactNode;
};

/**
 * Phone + PIN login, shared by the AuthModal and the /login page.
 * On success it updates AppState, enrols push notifications, and hands the
 * profile back to the caller to decide navigation (close modal vs. redirect).
 */
export default function LoginForm({ onSuccess, switchToSignup }: LoginFormProps) {
  const t = useTranslations("common.authModal");
  const { login, selectUniversity } = useAppState();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({ phone: "", pin: "", role: "User" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const normalizedPhone = normalizePhoneDigits(form.phone);
    const newErrors: Record<string, string> = {};
    const phoneError = validatePhoneNumber(
      normalizedPhone,
      t("phoneRequired"),
      t("phoneInvalid"),
    );
    const pinError = validatePin(form.pin, t("pinRequired"), t("pinMin", { min: 4 }));
    if (phoneError) newErrors.phone = phoneError;
    if (pinError) newErrors.pin = pinError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    startTransition(async () => {
      const result = await loginAction({
        phone: buildFullPhone(normalizedPhone),
        pin: form.pin,
        role: form.role,
      });

      if (!result.success) {
        setErrors({ general: result.message });
        return;
      }

      const profileForState: UserProfile = {
        ...result.profile,
        university: getUniversityFromProfile(result.profile),
      };

      login(profileForState, "session", "session");
      if (profileForState.university) {
        selectUniversity(profileForState.university);
      }
      void subscribeToPushNotifications();

      setForm({ phone: "", pin: "", role: "User" });
      onSuccess?.(profileForState);
    });
  };

  return (
    <div className="relative isolate overflow-hidden rounded-xl">
      {/* Soft splash backdrop — sized to fit the form area */}
      <Image
        src="/assets/images/splash-bg.png"
        alt=""
        aria-hidden
        fill
        sizes="(max-width: 640px) 100vw, 28rem"
        className="pointer-events-none -z-10 object-cover object-center opacity-30"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-white/80 via-white/90 to-white"
      />

      <form onSubmit={handleSubmit} className="relative space-y-4 p-1">
        <PhoneInputField
          label={t("phoneNumber")}
          placeholder={t("phonePlaceholder")}
          value={form.phone}
          error={errors.phone}
          onChange={(value) =>
            setForm((prev) => ({ ...prev, phone: normalizePhoneDigits(value) }))
          }
        />

        <div>
          <PinInputField
            label={t("pin")}
            value={form.pin}
            error={errors.pin}
            onChange={(value) => setForm((prev) => ({ ...prev, pin: value }))}
          />
          <div className="mt-1.5 text-right">
            <button
              type="button"
              onClick={() =>
                toast.info("Password reset is coming soon. Please contact support.")
              }
              className="text-xs font-medium text-[#E30B12] hover:underline"
            >
              {t("forgotPin")}
            </button>
          </div>
        </div>

        <FieldError message={errors.general} />

        <AuthSubmitButton
          isPending={isPending}
          pendingText={t("signingIn")}
          idleText={t("logIn")}
        />

        {switchToSignup}
      </form>
    </div>
  );
}
