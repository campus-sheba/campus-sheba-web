"use client";

import { useState, useTransition } from "react";
import { BadgeCheck, GraduationCap, Loader2, ShieldCheck } from "lucide-react";

import {
  sendStudentVerificationCodeAction,
  verifyStudentAccountAction,
} from "@/services/user";

const INPUT_CLASS =
  "w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-[#E30B12] focus:ring-2 focus:ring-[#E30B12]/15";

type StudentVerificationCardProps = {
  /** Whether the account is already a verified student. */
  isVerified?: boolean;
  /** The verified institutional email, when present. */
  studentEmail?: string;
  /** Allowed campus email domains (no leading '@'), for the inline hint. */
  allowedDomains?: string[];
  /** Whether the user has selected a campus yet (verification needs one). */
  hasUniversity?: boolean;
};

/**
 * Self-contained "verify your student account" card. Sends a code to the user's
 * institutional email (validated against the campus domains on the backend),
 * then confirms it. On success it asks the parent route to refresh so the
 * verified badge reflects the new state.
 */
export default function StudentVerificationCard({
  isVerified,
  studentEmail,
  allowedDomains = [],
  hasUniversity = true,
}: StudentVerificationCardProps) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  const domainHint =
    allowedDomains.length > 0
      ? allowedDomains.map((d) => `@${d}`).join(" or ")
      : null;

  const sendCode = () => {
    setFeedback(null);
    startTransition(async () => {
      const res = await sendStudentVerificationCodeAction(email.trim());
      if (res.success) {
        setSent(true);
        setFeedback({
          ok: true,
          text: "We've emailed a verification code to your campus address.",
        });
      } else {
        setFeedback({ ok: false, text: res.message });
      }
    });
  };

  const verify = () => {
    setFeedback(null);
    startTransition(async () => {
      const res = await verifyStudentAccountAction(email.trim(), code.trim());
      if (res.success) {
        setFeedback({
          ok: true,
          text: "Student account verified! Refreshing…",
        });
        // Re-fetch the server component tree so the verified state shows.
        if (typeof window !== "undefined") {
          window.location.reload();
        }
      } else {
        setFeedback({ ok: false, text: res.message });
      }
    });
  };

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
          <ShieldCheck className="h-4 w-4 text-[#E30B12]" />
          Student Verification
        </h2>
        {isVerified ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
            <BadgeCheck className="h-3.5 w-3.5" />
            Verified
          </span>
        ) : null}
      </div>

      <div className="mt-4">
        {isVerified ? (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100">
              <GraduationCap className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                Verified student email
              </p>
              <p className="mt-0.5 truncate text-sm font-medium text-gray-900">
                {studentEmail || "Verified"}
              </p>
            </div>
          </div>
        ) : !hasUniversity ? (
          <p className="rounded-xl border border-amber-100 bg-amber-50/70 px-4 py-3 text-sm text-amber-700">
            Select your campus first, then verify your student email to unlock
            student-only features.
          </p>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Verify your account with your university email
              {domainHint ? (
                <>
                  {" "}
                  (use <span className="font-semibold">{domainHint}</span>)
                </>
              ) : null}
              . We&apos;ll send you a one-time code.
            </p>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-gray-600">
                University email
              </span>
              <input
                type="email"
                className={INPUT_CLASS}
                placeholder={
                  allowedDomains[0]
                    ? `you@${allowedDomains[0]}`
                    : "you@university.edu"
                }
                value={email}
                disabled={isPending}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            {sent ? (
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-gray-600">
                  Verification code
                </span>
                <input
                  inputMode="numeric"
                  className={INPUT_CLASS}
                  placeholder="6-digit code"
                  value={code}
                  disabled={isPending}
                  onChange={(e) => setCode(e.target.value)}
                />
              </label>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={sendCode}
                disabled={isPending || !email.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
              >
                {isPending && !sent ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                {sent ? "Resend code" : "Send code"}
              </button>
              {sent ? (
                <button
                  type="button"
                  onClick={verify}
                  disabled={isPending || !code.trim()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#E30B12] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#c10810] disabled:opacity-60"
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Verify student account
                </button>
              ) : null}
            </div>
          </div>
        )}

        {feedback ? (
          <div
            className={`mt-3 rounded-lg border px-3 py-2 text-sm ${
              feedback.ok
                ? "border-green-100 bg-green-50 text-green-700"
                : "border-red-100 bg-red-50 text-red-700"
            }`}
            role="status"
          >
            {feedback.text}
          </div>
        ) : null}
      </div>
    </section>
  );
}
