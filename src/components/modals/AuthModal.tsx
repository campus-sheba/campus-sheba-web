"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Phone, Lock, ChevronLeft } from "lucide-react";
import { loginAction } from "@/app/[locale]/(auth)/login/actions";
import {
  completeSignupAction,
  sendOtpAction,
  verifyOtpAction,
} from "@/app/[locale]/(auth)/signup/actions";
import { useAppState } from "@/contexts/AppStateContext";
import { University, UserProfile } from "@/types/global";
import { Button, Paragraph, Title } from "@/components/ui";
import { SectionWrapper } from "@/components/wrappers";
import { cn } from "@/utils/utils";

type AuthTab = "login" | "signup";
type SignupStep = "phone" | "otp" | "details";

const OTP_LENGTH = 6;

const FIELD_LABEL_CLASS = "mb-1 block text-sm font-medium text-neutral-700";
const FIELD_ERROR_CLASS = "mt-1 text-xs text-red-500";

const INPUT_BASE_CLASS =
  "w-full border border-neutral-300 rounded-lg py-2.5 outline-none text-sm focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600";

type FieldLabelProps = {
  children: React.ReactNode;
};

function FieldLabel({ children }: FieldLabelProps) {
  return <label className={FIELD_LABEL_CLASS}>{children}</label>;
}

type FieldErrorProps = {
  message?: string;
};

function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;
  return <p className={FIELD_ERROR_CLASS}>{message}</p>;
}

type PhoneInputFieldProps = {
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

function PhoneInputField({ value, error, onChange }: PhoneInputFieldProps) {
  return (
    <div>
      <FieldLabel>Phone Number</FieldLabel>
      <div className="flex items-center overflow-hidden rounded-lg border border-neutral-300 bg-white focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100">
        <span className="inline-flex items-center gap-1 border-r border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm font-semibold text-neutral-700">
          <Phone className="h-4 w-4 text-neutral-400" />
          (+88)
        </span>
        <input
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="01XXXXXXXXX"
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

function PinInputField({
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

type AuthSubmitButtonProps = {
  isPending: boolean;
  idleText: string;
  pendingText: string;
};

function AuthSubmitButton({
  isPending,
  idleText,
  pendingText,
}: AuthSubmitButtonProps) {
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

const validatePhoneNumber = (phoneDigits: string) => {
  if (!phoneDigits) return "Phone number is required";
  if (phoneDigits.length !== 11) return "Phone number must be 11 digits";
  return "";
};

const validatePin = (pin: string, minimumLength = 4) => {
  if (!pin) return "PIN is required";
  if (pin.length < minimumLength) {
    return `PIN must be at least ${minimumLength} digits`;
  }
  return "";
};

type AuthModalProps = {
  isOpen: boolean;
  defaultTab?: AuthTab;
  onClose: () => void;
};

export default function AuthModal({
  isOpen,
  defaultTab = "login",
  onClose,
}: AuthModalProps) {
  const { state, login, selectUniversity } = useAppState();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<AuthTab>(defaultTab);
  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Login state
  const [loginForm, setLoginForm] = useState({
    phone: "",
    pin: "",
    role: "User",
  });

  // Signup state
  const [signupStep, setSignupStep] = useState<SignupStep>("phone");
  const [signupForm, setSignupForm] = useState({
    phone: "",
    otp: "",
    name: "",
    pin: "",
    confirmPin: "",
    role: "User",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveTab(defaultTab);
    setErrors({});
    setSignupStep("phone");
  }, [defaultTab, isOpen]);

  const normalizePhoneDigits = (value: string) => {
    const onlyDigits = value.replace(/\D/g, "");
    const withoutCountryCode = onlyDigits.startsWith("88")
      ? onlyDigits.slice(2)
      : onlyDigits;
    return withoutCountryCode.slice(0, 11);
  };

  const buildFullPhone = (digits: string) => `+88${digits}`;

  const handleOtpDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const current = signupForm.otp.padEnd(OTP_LENGTH, " ").slice(0, OTP_LENGTH).split("");
    current[index] = digit || " ";
    const nextOtp = current.join("").replace(/\s/g, "");

    setSignupForm((prev) => ({ ...prev, otp: nextOtp }));

    if (digit && index < OTP_LENGTH - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Backspace") return;

    const current = signupForm.otp.padEnd(OTP_LENGTH, " ").slice(0, OTP_LENGTH).split("");

    if (current[index] !== " ") {
      current[index] = " ";
      setSignupForm((prev) => ({
        ...prev,
        otp: current.join("").replace(/\s/g, ""),
      }));
      return;
    }

    if (index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedDigits = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    setSignupForm((prev) => ({ ...prev, otp: pastedDigits }));

    const focusIndex = Math.min(pastedDigits.length, OTP_LENGTH - 1);
    otpInputRefs.current[focusIndex]?.focus();
  };

  const getUniversityFromProfile = (profile: unknown): University | null => {
    if (!profile || typeof profile !== "object") return null;
    const maybeUniversity = (profile as { university?: unknown }).university;
    if (!maybeUniversity || typeof maybeUniversity !== "object") return null;

    const raw = maybeUniversity as Partial<University> & {
      _id?: string;
      shortName?: string;
    };

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
  };

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    const normalizedPhone = normalizePhoneDigits(loginForm.phone);
    const phoneError = validatePhoneNumber(normalizedPhone);
    const pinError = validatePin(loginForm.pin);

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
        pin: loginForm.pin,
        role: loginForm.role,
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
      setLoginForm({ phone: "", pin: "", role: "User" });
    });
  };

  const handleSignupPhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    const normalizedPhone = normalizePhoneDigits(signupForm.phone);
    const phoneError = validatePhoneNumber(normalizedPhone);

    if (phoneError) newErrors.phone = phoneError;
    if (Object.keys(newErrors).length === 0) {
      const fullPhone = buildFullPhone(normalizedPhone);
      setErrors({});

      startTransition(async () => {
        const result = await sendOtpAction({
          phone: fullPhone,
          role: signupForm.role,
        });

        if (!result.success) {
          setErrors({ phone: result.message });
          return;
        }

        setSignupForm((prev) => ({ ...prev, phone: normalizedPhone, otp: "" }));
        setSignupStep("otp");
      });
    } else {
      setErrors(newErrors);
    }
  };

  const handleSignupOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!signupForm.otp) newErrors.otp = "OTP is required";
    if (signupForm.otp && signupForm.otp.length !== OTP_LENGTH)
      newErrors.otp = `OTP must be ${OTP_LENGTH} digits`;

    if (Object.keys(newErrors).length === 0) {
      setErrors({});

      startTransition(async () => {
        const result = await verifyOtpAction({
          phone: buildFullPhone(signupForm.phone),
          code: signupForm.otp,
        });

        if (!result.success) {
          setErrors({ otp: result.message });
          return;
        }

        setSignupStep("details");
      });
    } else {
      setErrors(newErrors);
    }
  };

  const handleSignupDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!signupForm.name) newErrors.name = "Name is required";
    const pinError = validatePin(signupForm.pin);
    if (pinError) newErrors.pin = pinError;
    if (!signupForm.confirmPin)
      newErrors.confirmPin = "Confirm PIN is required";
    if (signupForm.pin !== signupForm.confirmPin)
      newErrors.confirmPin = "PINs do not match";
    if (!state.university.selected?._id) {
      newErrors.general = "Please select your university before signup.";
    }

    if (Object.keys(newErrors).length === 0) {
      setErrors({});

      startTransition(async () => {
        const result = await completeSignupAction({
          phone: buildFullPhone(signupForm.phone),
          university: state.university.selected!._id,
          name: signupForm.name,
          role: signupForm.role,
          pin: signupForm.pin,
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

        setSignupForm({
          phone: "",
          otp: "",
          name: "",
          pin: "",
          confirmPin: "",
          role: "User",
        });
      });
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-900/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <SectionWrapper
          spacing="none"
          background="transparent"
          className="my-0 border-b border-neutral-100 px-6 py-4"
        >
          <div className="flex items-center justify-between">
            {activeTab === "signup" && signupStep !== "phone" && (
              <button
                onClick={() => setSignupStep("phone")}
                className="text-neutral-600 hover:text-neutral-900"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            {!(activeTab === "signup" && signupStep !== "phone") && (
              <div />
            )}
            <Title as="h2" size="lg" weight="semibold" className="text-neutral-900">
              {activeTab === "login" ? "Sign In" : "Create Account"}
            </Title>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600"
            >
              ✕
            </button>
          </div>
        </SectionWrapper>

        {/* Body */}
        <SectionWrapper spacing="none" background="transparent" className="my-0 p-6">
          {activeTab === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <PhoneInputField
                value={loginForm.phone}
                error={errors.phone}
                onChange={(value) =>
                  setLoginForm((prev) => ({
                    ...prev,
                    phone: normalizePhoneDigits(value),
                  }))
                }
              />

              <PinInputField
                label="PIN"
                value={loginForm.pin}
                error={errors.pin}
                withIcon
                onChange={(value) =>
                  setLoginForm((prev) => ({ ...prev, pin: value }))
                }
              />

              <FieldError message={errors.general} />

              <AuthSubmitButton
                isPending={isPending}
                pendingText="Signing in..."
                idleText="Sign In"
              />
            </form>
          )}

          {activeTab === "signup" && signupStep === "phone" && (
            <form onSubmit={handleSignupPhoneSubmit} className="space-y-4">
              <PhoneInputField
                value={signupForm.phone}
                error={errors.phone}
                onChange={(value) =>
                  setSignupForm((prev) => ({
                    ...prev,
                    phone: normalizePhoneDigits(value),
                  }))
                }
              />

              <AuthSubmitButton
                isPending={isPending}
                pendingText="Sending..."
                idleText="Send OTP"
              />
            </form>
          )}

          {activeTab === "signup" && signupStep === "otp" && (
            <form onSubmit={handleSignupOtpSubmit} className="space-y-4">
              <div>
                <FieldLabel>Enter OTP</FieldLabel>
                <div className="flex justify-between gap-2">
                  {Array.from({ length: OTP_LENGTH }).map((_, index) => {
                    const otpChars = signupForm.otp
                      .padEnd(OTP_LENGTH, " ")
                      .slice(0, OTP_LENGTH)
                      .split("");
                    return (
                      <input
                        key={index}
                        ref={(element) => {
                          otpInputRefs.current[index] = element;
                        }}
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={1}
                        className="h-11 w-11 rounded-lg border border-neutral-300 text-center text-base font-semibold text-neutral-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                        value={otpChars[index] === " " ? "" : otpChars[index]}
                        onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={handleOtpPaste}
                      />
                    );
                  })}
                </div>
                <FieldError message={errors.otp} />
              </div>

              <AuthSubmitButton
                isPending={isPending}
                pendingText="Verifying..."
                idleText="Verify OTP"
              />
            </form>
          )}

          {activeTab === "signup" && signupStep === "details" && (
            <form onSubmit={handleSignupDetailsSubmit} className="space-y-4">
              <div>
                <FieldLabel>Full Name</FieldLabel>
                <input
                  type="text"
                  placeholder="Your name"
                  className={cn(INPUT_BASE_CLASS, "px-4")}
                  value={signupForm.name}
                  onChange={(e) =>
                    setSignupForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
                <FieldError message={errors.name} />
              </div>

              <PinInputField
                label="Create PIN"
                value={signupForm.pin}
                error={errors.pin}
                onChange={(value) =>
                  setSignupForm((prev) => ({ ...prev, pin: value }))
                }
              />

              <PinInputField
                label="Confirm PIN"
                value={signupForm.confirmPin}
                error={errors.confirmPin}
                onChange={(value) =>
                  setSignupForm((prev) => ({ ...prev, confirmPin: value }))
                }
              />

              <AuthSubmitButton
                isPending={isPending}
                pendingText="Creating..."
                idleText="Create Account"
              />

              <FieldError message={errors.general} />
            </form>
          )}

          {/* Tab Switcher */}
          {activeTab === "login" ? (
            <Paragraph className="mt-4 text-center text-xs text-neutral-600" color="default">
              Don&apos;t have an account?{" "}
              <button
                onClick={() => {
                  setActiveTab("signup");
                  setErrors({});
                }}
                className="text-emerald-600 font-semibold hover:underline"
              >
                Sign up
              </button>
            </Paragraph>
          ) : (
            <Paragraph className="mt-4 text-center text-xs text-neutral-600" color="default">
              Already have an account?{" "}
              <button
                onClick={() => {
                  setActiveTab("login");
                  setErrors({});
                }}
                className="text-emerald-600 font-semibold hover:underline"
              >
                Sign in
              </button>
            </Paragraph>
          )}
        </SectionWrapper>
      </div>
    </div>
  );
}
