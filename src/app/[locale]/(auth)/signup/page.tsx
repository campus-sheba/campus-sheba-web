"use client";

import { useState, useTransition } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { completeSignupAction, sendOtpAction, verifyOtpAction } from "./actions";

type SignupStep = "send-otp" | "verify-otp" | "complete";

export default function SignupPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<SignupStep>("send-otp");

  const [form, setForm] = useState({
    phone: "",
    role: "User",
    code: "",
    university: "",
    name: "",
    pin: "",
  });

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSendOtp = () => {
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const result = await sendOtpAction({ phone: form.phone, role: form.role });
        
      if (!result.success) {
        setError(result.message);
        return;
      }

      setMessage(result.message);
      setStep("verify-otp");
    });
  };

  const onVerifyOtp = () => {
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const result = await verifyOtpAction({ phone: form.phone, code: form.code });

      if (!result.success) {
        setError(result.message);
        return;
      }

      setMessage(result.message);
      setStep("complete");
    });
  };

  const onCompleteSignup = () => {
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const result = await completeSignupAction({
        phone: form.phone,
        university: form.university,
        name: form.name,
        role: form.role,
        pin: form.pin,
      });

      if (!result.success) {
        setError(result.message);
        return;
      }

      setMessage(result.message || "Signup completed. Please login.");
      router.push("/login");
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Create your account</h1>
        <p className="mt-1 text-sm text-gray-500">Phone + OTP + PIN onboarding</p>

        <div className="mt-6 flex items-center gap-2 text-xs font-medium">
          <span className={`rounded-full px-3 py-1 ${step === "send-otp" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>1. Send OTP</span>
          <span className={`rounded-full px-3 py-1 ${step === "verify-otp" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>2. Verify OTP</span>
          <span className={`rounded-full px-3 py-1 ${step === "complete" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>3. Complete</span>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              placeholder="+8801712345678"
              disabled={step !== "send-otp"}
            />
          </div>

          

          {step === "verify-otp" && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">OTP Code</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                placeholder="123456"
              />
            </div>
          )}

          {step === "complete" && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">University ID</label>
                <input
                  type="text"
                  value={form.university}
                  onChange={(e) => setForm({ ...form, university: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  placeholder="681677f803e61fa66526fa41"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">PIN</label>
                <input
                  type="password"
                  value={form.pin}
                  onChange={(e) => setForm({ ...form, pin: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  placeholder="1234"
                />
              </div>
            </>
          )}
        </div>

        {message && <p className="mt-4 text-sm text-emerald-600">{message}</p>}
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex gap-3">
          {step === "send-otp" && (
            <button
              onClick={onSendOtp}
              disabled={isPending || !form.phone}
              className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {isPending ? "Sending..." : "Send OTP"}
            </button>
          )}

          {step === "verify-otp" && (
            <button
              onClick={onVerifyOtp}
              disabled={isPending || !form.code}
              className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {isPending ? "Verifying..." : "Verify OTP"}
            </button>
          )}

          {step === "complete" && (
            <button
              onClick={onCompleteSignup}
              disabled={isPending || !form.name || !form.university || !form.pin}
              className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {isPending ? "Completing..." : "Complete Signup"}
            </button>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account? <Link href="/login" className="text-emerald-600 underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
