"use client";

import { useState, useTransition } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { Phone, Lock } from "lucide-react";
import { loginAction } from "./actions";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    phone: "",
    pin: "",
    role: "User",
  });

  const [errors, setErrors] = useState<{
    phone?: string;
    pin?: string;
    general?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.phone) newErrors.phone = "Phone number is required";
    if (!formData.pin) newErrors.pin = "PIN is required";
    if (formData.pin && formData.pin.length < 4) newErrors.pin = "PIN must be at least 4 digits";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    startTransition(async () => {
      const result = await loginAction({
        phone: formData.phone,
        pin: formData.pin,
        role: formData.role,
      });

      if (!result.success) {
        setErrors((prev) => ({ ...prev, general: result.message }));
        return;
      }

      router.push("/profile");
    });
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
     
      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 lg:px-16 lg:py-24 bg-gray-50">
        <div className="w-full max-w-md bg-white p-8 lg:p-10 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Sign in to your account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  placeholder="+8801712345678"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 outline-none text-sm"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
              )}
            </div>

            {/* PIN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PIN
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  placeholder="****"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 outline-none text-sm"
                  value={formData.pin}
                  onChange={(e) =>
                    setFormData({ ...formData, pin: e.target.value })
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
              className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition disabled:opacity-60"
            >
              {isPending ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-gray-500">
            Don’t have an account?{" "}
            <Link href="/signup" className="text-emerald-600 underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
