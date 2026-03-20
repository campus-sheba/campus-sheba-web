"use client";

import { useState, useTransition } from "react";
import { Phone, Lock, ChevronLeft } from "lucide-react";
import { loginAction } from "@/app/[locale]/(auth)/login/actions";
import { useAppState } from "@/contexts/AppStateContext";

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
  const { login } = useAppState();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"login" | "signup">(defaultTab);

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

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!loginForm.phone) newErrors.phone = "Phone number is required";
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
        phone: loginForm.phone,
        pin: loginForm.pin,
        role: loginForm.role,
      });

      if (!result.success) {
        setErrors({ general: result.message });
        return;
      }

      // TODO: Fetch user profile and update global state
      // For now, just close the modal
      onClose();
      setLoginForm({ phone: "", pin: "", role: "User" });
    });
  };

  const handleSignupPhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!signupForm.phone) newErrors.phone = "Phone number is required";
    // TODO: Send OTP to phone number
    // For now, just move to next step
    if (Object.keys(newErrors).length === 0) {
      setSignupStep("otp");
      setErrors({});
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
      setSignupStep("details");
      setErrors({});
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

    if (Object.keys(newErrors).length === 0) {
      // TODO: Call signup API
      setErrors({});
      onClose();
      setSignupStep("phone");
      setSignupForm({
        phone: "",
        otp: "",
        name: "",
        pin: "",
        confirmPin: "",
        role: "User",
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
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="tel"
                    placeholder="+8801712345678"
                    className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 outline-none text-sm"
                    value={loginForm.phone}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, phone: e.target.value })
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
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <input
                    type="tel"
                    placeholder="+8801712345678"
                    className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 outline-none text-sm"
                    value={signupForm.phone}
                    onChange={(e) =>
                      setSignupForm({ ...signupForm, phone: e.target.value })
                    }
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 text-white rounded-lg font-semibold text-sm hover:bg-emerald-700 transition"
              >
                Send OTP
              </button>
            </form>
          )}

          {activeTab === "signup" && signupStep === "otp" && (
            <form onSubmit={handleSignupOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Enter OTP
                </label>
                <input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 outline-none text-sm"
                  value={signupForm.otp}
                  onChange={(e) =>
                    setSignupForm({ ...signupForm, otp: e.target.value })
                  }
                />
                {errors.otp && (
                  <p className="text-xs text-red-500 mt-1">{errors.otp}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 text-white rounded-lg font-semibold text-sm hover:bg-emerald-700 transition"
              >
                Verify OTP
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
                className="w-full py-2.5 bg-emerald-600 text-white rounded-lg font-semibold text-sm hover:bg-emerald-700 transition"
              >
                Create Account
              </button>
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
