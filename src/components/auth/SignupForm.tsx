"use client";

import { Fragment, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Check, ChevronLeft } from "lucide-react";

import { Link } from "@/i18n/navigation";

import {
  completeSignupAction,
  sendOtpAction,
  verifyOtpAction,
} from "@/app/[locale]/(auth)/signup/actions";
import { useAppState } from "@/contexts/AppStateContext";
import type { UserProfile } from "@/types/global";
import {
  AuthSubmitButton,
  FieldError,
  OTP_LENGTH,
  OtpInput,
  PhoneInputField,
  PinInputField,
  TextInputField,
  buildFullPhone,
  getUniversityFromProfile,
  normalizePhoneDigits,
  subscribeToPushNotifications,
  validatePhoneNumber,
  validatePin,
} from "@/components/auth/authShared";

type SignupStep = "phone" | "otp" | "details";

const STEP_ORDER: SignupStep[] = ["phone", "otp", "details"];

type SignupFormProps = {
  onSuccess?: (profile: UserProfile) => void;
  switchToLogin?: React.ReactNode;
};

/** Compact 3-dot progress so students always know where they are in signup. */
function StepProgress({ current }: { current: SignupStep }) {
  const t = useTranslations("common.authModal");
  const labels: Record<SignupStep, string> = {
    phone: t("stepPhone"),
    otp: t("stepVerify"),
    details: t("stepProfile"),
  };
  const currentIndex = STEP_ORDER.indexOf(current);

  return (
    <div className="flex items-center justify-center">
      {STEP_ORDER.map((step, index) => {
        const isDone = index < currentIndex;
        const isActive = index === currentIndex;
        return (
          <Fragment key={step}>
            <div className="flex flex-col items-center gap-1">
              <span
                className={[
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  isDone
                    ? "bg-[#E30B12] text-white"
                    : isActive
                      ? "border-2 border-[#E30B12] text-[#E30B12]"
                      : "border-2 border-neutral-200 text-neutral-400",
                ].join(" ")}
              >
                {isDone ? <Check className="h-4 w-4" /> : index + 1}
              </span>
              <span
                className={[
                  "text-[11px] font-medium",
                  isActive ? "text-[#E30B12]" : "text-neutral-400",
                ].join(" ")}
              >
                {labels[step]}
              </span>
            </div>
            {index < STEP_ORDER.length - 1 && (
              <span
                className={[
                  "mx-1 mb-4 h-0.5 w-8 rounded-full transition-colors sm:w-12",
                  index < currentIndex ? "bg-[#E30B12]" : "bg-neutral-200",
                ].join(" ")}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

/**
 * Three-step signup (phone → OTP → details), shared by the AuthModal and the
 * /signup page. A university must be selected first (the global university
 * selector handles that for guests); on success it mirrors LoginForm's behaviour.
 */
export default function SignupForm({ onSuccess, switchToLogin }: SignupFormProps) {
  const t = useTranslations("common.authModal");
  const { state, login, selectUniversity } = useAppState();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<SignupStep>("phone");
  const [agreed, setAgreed] = useState(false);
  const [form, setForm] = useState({
    phone: "",
    otp: "",
    name: "",
    pin: "",
    confirmPin: "",
    role: "User",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handlePhoneSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedPhone = normalizePhoneDigits(form.phone);
    const phoneError = validatePhoneNumber(
      normalizedPhone,
      t("phoneRequired"),
      t("phoneInvalid"),
    );
    if (phoneError) {
      setErrors({ phone: phoneError });
      return;
    }
    setErrors({});

    startTransition(async () => {
      const result = await sendOtpAction({
        phone: buildFullPhone(normalizedPhone),
        role: form.role,
      });
      if (!result.success) {
        setErrors({ phone: result.message });
        return;
      }
      setForm((prev) => ({ ...prev, phone: normalizedPhone, otp: "" }));
      setStep("otp");
    });
  };

  const handleOtpSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.otp) {
      setErrors({ otp: t("otpRequired") });
      return;
    }
    if (form.otp.length !== OTP_LENGTH) {
      setErrors({ otp: t("otpMustBe", { length: OTP_LENGTH }) });
      return;
    }
    setErrors({});

    startTransition(async () => {
      const result = await verifyOtpAction({
        phone: buildFullPhone(form.phone),
        code: form.otp,
      });
      if (!result.success) {
        setErrors({ otp: result.message });
        return;
      }
      setStep("details");
    });
  };

  const handleDetailsSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.name) newErrors.name = t("nameRequired");
    const pinError = validatePin(form.pin, t("pinRequired"), t("pinMin", { min: 4 }));
    if (pinError) newErrors.pin = pinError;
    if (!form.confirmPin) newErrors.confirmPin = t("confirmPinRequired");
    if (form.pin !== form.confirmPin) newErrors.confirmPin = t("pinsNoMatch");
    if (!agreed) newErrors.agree = t("agreeRequired");
    if (!state.university.selected?._id) {
      newErrors.general = t("selectUniversityBeforeSignup");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    startTransition(async () => {
      const result = await completeSignupAction({
        phone: buildFullPhone(form.phone),
        university: state.university.selected!._id,
        name: form.name,
        role: form.role,
        pin: form.pin,
      });
      if (!result.success) {
        setErrors({ general: result.message });
        return;
      }

      const profileForState: UserProfile = {
        ...result.profile,
        university: getUniversityFromProfile(result.profile) ?? state.university.selected,
      };

      login(profileForState, "session", "session");
      if (profileForState.university) {
        selectUniversity(profileForState.university);
      }
      void subscribeToPushNotifications();

      setForm({ phone: "", otp: "", name: "", pin: "", confirmPin: "", role: "User" });
      onSuccess?.(profileForState);
    });
  };

  return (
    <div className="space-y-5">
      <StepProgress current={step} />

      {step !== "phone" && (
        <button
          type="button"
          onClick={() => setStep("phone")}
          className="inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900"
        >
          <ChevronLeft className="h-4 w-4" />
          {t("back")}
        </button>
      )}

      {step === "phone" && (
        <form onSubmit={handlePhoneSubmit} className="space-y-4">
          <PhoneInputField
            label={t("phoneNumber")}
            placeholder={t("phonePlaceholder")}
            value={form.phone}
            error={errors.phone}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, phone: normalizePhoneDigits(value) }))
            }
          />
          <AuthSubmitButton
            isPending={isPending}
            pendingText={t("sending")}
            idleText={t("sendOtp")}
          />
          {switchToLogin}
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleOtpSubmit} className="space-y-4">
          <OtpInput
            label={t("enterOtp")}
            value={form.otp}
            error={errors.otp}
            onChange={(value) => setForm((prev) => ({ ...prev, otp: value }))}
          />
          <AuthSubmitButton
            isPending={isPending}
            pendingText={t("verifying")}
            idleText={t("verifyOtp")}
          />
        </form>
      )}

      {step === "details" && (
        <form onSubmit={handleDetailsSubmit} className="space-y-4">
          <TextInputField
            label={t("fullName")}
            placeholder={t("yourName")}
            value={form.name}
            error={errors.name}
            onChange={(value) => setForm((prev) => ({ ...prev, name: value }))}
          />
          <PinInputField
            label={t("createPin")}
            value={form.pin}
            error={errors.pin}
            onChange={(value) => setForm((prev) => ({ ...prev, pin: value }))}
          />
          <PinInputField
            label={t("confirmPin")}
            value={form.confirmPin}
            error={errors.confirmPin}
            onChange={(value) => setForm((prev) => ({ ...prev, confirmPin: value }))}
          />

          <div>
            <label className="flex items-start gap-2.5 text-xs text-neutral-600">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-[#E30B12] focus:ring-[#E30B12]"
              />
              <span>
                {t("agreement")}{" "}
                <Link href="/terms-condition" className="font-medium text-[#E30B12] hover:underline">
                  {t("termsConditions")}
                </Link>{" "}
                {t("and")}{" "}
                <Link href="/privacy-policy" className="font-medium text-[#E30B12] hover:underline">
                  {t("privacyPolicy")}
                </Link>
              </span>
            </label>
            <FieldError message={errors.agree} />
          </div>

          <AuthSubmitButton
            isPending={isPending}
            pendingText={t("creating")}
            idleText={t("createAccount")}
          />
          <FieldError message={errors.general} />
        </form>
      )}
    </div>
  );
}
