"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <PhoneInputField
        label={t("phoneNumber")}
        placeholder={t("phonePlaceholder")}
        value={form.phone}
        error={errors.phone}
        onChange={(value) =>
          setForm((prev) => ({ ...prev, phone: normalizePhoneDigits(value) }))
        }
      />

      <PinInputField
        label={t("pin")}
        value={form.pin}
        error={errors.pin}
        withIcon
        onChange={(value) => setForm((prev) => ({ ...prev, pin: value }))}
      />

      <FieldError message={errors.general} />

      <AuthSubmitButton
        isPending={isPending}
        pendingText={t("signingIn")}
        idleText={t("signIn")}
      />

      {switchToSignup}
    </form>
  );
}
