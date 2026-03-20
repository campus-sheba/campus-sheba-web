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

type AuthModalProps = {
  isOpen: boolean;
  defaultTab?: "login" | "signup";
  onClose: () => void;
};

export default function AuthModal({
  isOpen,
  defaultTab = "login",
  onClose,
}: AuthModalProps) {
  const { state, login, selectUniversity } = useAppState();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"login" | "signup">(defaultTab);
  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Login state
  const [loginForm, setLoginForm] = useState({
    phone: "",
    pin: "",
    role: "User",
  });

  // Signup state
  const [signupStep, setSignupStep] = useState<"phone" | "otp" | "details">("phone");
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
    const current = signupForm.otp.padEnd(6, " ").slice(0, 6).split("");
    current[index] = digit || " ";
    const nextOtp = current.join("").replace(/\s/g, "");

    setSignupForm({ ...signupForm, otp: nextOtp });

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Backspace") return;

    const current = signupForm.otp.padEnd(6, " ").slice(0, 6).split("");

    if (current[index] !== " ") {
      current[index] = " ";
      setSignupForm({ ...signupForm, otp: current.join("").replace(/\s/g, "") });
      return;
    }

    if (index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedDigits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    setSignupForm({ ...signupForm, otp: pastedDigits });

    const focusIndex = Math.min(pastedDigits.length, 5);
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

    if (!normalizedPhone) newErrors.phone = "Phone number is required";
    if (normalizedPhone && normalizedPhone.length !== 11) {
      newErrors.phone = "Phone number must be 11 digits";
    }
    if (!loginForm.pin) newErrors.pin = "PIN is required";
    if (loginForm.pin && loginForm.pin.length < 4)
      newErrors.pin = "PIN must be at least 4 digits";

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

    if (!normalizedPhone) newErrors.phone = "Phone number is required";
    if (normalizedPhone && normalizedPhone.length !== 11) {
      newErrors.phone = "Phone number must be 11 digits";
    }
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

        setSignupForm({ ...signupForm, phone: normalizedPhone, otp: "" });
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
    if (signupForm.otp && signupForm.otp.length !== 6)
      newErrors.otp = "OTP must be 6 digits";

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
    if (!signupForm.pin) newErrors.pin = "PIN is required";
    if (signupForm.pin && signupForm.pin.length < 4)
      newErrors.pin = "PIN must be at least 4 digits";
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
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
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
          <h2 className="text-lg font-semibold text-neutral-900">
            {activeTab === "login" ? "Sign In" : "Create Account"}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {activeTab === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Phone Number
                </label>
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
                    className="w-full px-3 py-2.5 outline-none text-sm"
                    value={loginForm.phone}
                    onChange={(e) =>
                      setLoginForm({
                        ...loginForm,
                        phone: normalizePhoneDigits(e.target.value),
                      })
                    }
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                )}
              </div>

              {/* PIN */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  PIN
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="password"
                    placeholder="****"
                    className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 outline-none text-sm"
                    value={loginForm.pin}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, pin: e.target.value })
                    }
                  />
                </div>
                {errors.pin && (
                  <p className="text-xs text-red-500 mt-1">{errors.pin}</p>
                )}
              </div>

              {errors.general && (
                <p className="text-xs text-red-500">{errors.general}</p>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2.5 bg-emerald-600 text-white rounded-lg font-semibold text-sm hover:bg-emerald-700 transition disabled:opacity-60"
              >
                {isPending ? "Signing in..." : "Sign In"}
              </button>
            </form>
          )}

          {activeTab === "signup" && signupStep === "phone" && (
            <form onSubmit={handleSignupPhoneSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Phone Number
                </label>
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
                    className="w-full px-3 py-2.5 outline-none text-sm"
                    value={signupForm.phone}
                    onChange={(e) =>
                      setSignupForm({
                        ...signupForm,
                        phone: normalizePhoneDigits(e.target.value),
                      })
                    }
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2.5 bg-emerald-600 text-white rounded-lg font-semibold text-sm hover:bg-emerald-700 transition"
              >
                {isPending ? "Sending..." : "Send OTP"}
              </button>
            </form>
          )}

          {activeTab === "signup" && signupStep === "otp" && (
            <form onSubmit={handleSignupOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Enter OTP
                </label>
                <div className="flex justify-between gap-2">
                  {Array.from({ length: 6 }).map((_, index) => {
                    const otpChars = signupForm.otp.padEnd(6, " ").slice(0, 6).split("");
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
                {errors.otp && (
                  <p className="text-xs text-red-500 mt-1">{errors.otp}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2.5 bg-emerald-600 text-white rounded-lg font-semibold text-sm hover:bg-emerald-700 transition"
              >
                {isPending ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
          )}

          {activeTab === "signup" && signupStep === "details" && (
            <form onSubmit={handleSignupDetailsSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 outline-none text-sm"
                  value={signupForm.name}
                  onChange={(e) =>
                    setSignupForm({ ...signupForm, name: e.target.value })
                  }
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Create PIN
                </label>
                <input
                  type="password"
                  placeholder="****"
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 outline-none text-sm"
                  value={signupForm.pin}
                  onChange={(e) =>
                    setSignupForm({ ...signupForm, pin: e.target.value })
                  }
                />
                {errors.pin && (
                  <p className="text-xs text-red-500 mt-1">{errors.pin}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Confirm PIN
                </label>
                <input
                  type="password"
                  placeholder="****"
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 outline-none text-sm"
                  value={signupForm.confirmPin}
                  onChange={(e) =>
                    setSignupForm({
                      ...signupForm,
                      confirmPin: e.target.value,
                    })
                  }
                />
                {errors.confirmPin && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.confirmPin}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2.5 bg-emerald-600 text-white rounded-lg font-semibold text-sm hover:bg-emerald-700 transition"
              >
                {isPending ? "Creating..." : "Create Account"}
              </button>

              {errors.general && (
                <p className="text-xs text-red-500">{errors.general}</p>
              )}
            </form>
          )}

          {/* Tab Switcher */}
          {activeTab === "login" ? (
            <p className="mt-4 text-xs text-center text-neutral-600">
              Don&lsquo;t have an account?{" "}
              <button
                onClick={() => {
                  setActiveTab("signup");
                  setErrors({});
                }}
                className="text-emerald-600 font-semibold hover:underline"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p className="mt-4 text-xs text-center text-neutral-600">
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
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
