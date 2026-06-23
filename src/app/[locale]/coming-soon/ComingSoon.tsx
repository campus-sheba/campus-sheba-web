"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";

const EMAIL = "support@campussheba.com";

function tobn(v: number | string, locale: string) {
  if (locale !== "bn") return String(v);
  return String(v).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);
}

function getLaunch(): number | null {
  const raw = process.env.NEXT_PUBLIC_LAUNCH_DATE;
  if (!raw) return null;
  const ms = new Date(raw).getTime();
  return isNaN(ms) ? null : ms;
}

export default function ComingSoon() {
  const t = useTranslations("common.comingSoon");
  const locale = useLocale();

  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const launch = useMemo(getLaunch, []);
  const [countdown, setCountdown] = useState<{
    d: number;
    h: number;
    m: number;
    s: number;
  } | null>(null);

  useEffect(() => {
    if (!launch) return;
    const tick = () => {
      const ms = Math.max(0, launch - Date.now());
      setCountdown({
        d: Math.floor(ms / 86400000),
        h: Math.floor((ms / 3600000) % 24),
        m: Math.floor((ms / 60000) % 60),
        s: Math.floor((ms / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [launch]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      toast.error(t("waitlist.invalid"));
      return;
    }
    setBusy(true);
    try {
      // TODO: POST `${process.env.NEXT_PUBLIC_API_URL}/waitlist`  { email: v }
      toast.success(t("waitlist.success"));
      setEmail("");
      setDone(true);
    } finally {
      setBusy(false);
    }
  }

  const otherLocale = locale === "en" ? "bn" : "en";

  return (
    <main className="flex min-h-screen flex-col bg-white text-gray-900">
      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center sm:py-24">
        <div className="mx-auto w-full max-w-2xl">
          {/* Eyebrow */}
          <div className="mb-8 inline-flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E30B12] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#E30B12]" />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E30B12]">
              {t("badge")}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl">
            {t("headlinePre")}{" "}
            <span className="text-[#E30B12]">{t("headlineHighlight")}</span>
            {t("headlinePost")}
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-gray-500">
            {t("subtitle")}
          </p>

          {/* Hero visual */}
          <div className="mx-auto mt-10 max-w-xl">
            <Image
              src="/bg.png"
              alt="Campus Sheba — explore, move, eat, shop, and connect across your campus"
              width={1536}
              height={1024}
              priority
              className="w-full rounded-2xl border border-gray-200"
            />
          </div>

          {/* Pills */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {(["superApp", "forStudents", "bilingual"] as const).map((key) => (
              <span
                key={key}
                className="rounded-full border border-gray-200 px-3.5 py-1.5 text-[12px] font-medium text-gray-600"
              >
                {t(`pills.${key}`)}
              </span>
            ))}
          </div>

          {/* Countdown */}
          {countdown && (
            <div className="mt-14">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                {t("countdown.title")}
              </p>
              <div className="mx-auto grid max-w-md grid-cols-4 gap-px overflow-hidden rounded-xl border border-gray-200 bg-gray-200">
                {(
                  [
                    [countdown.d, t("countdown.days")],
                    [countdown.h, t("countdown.hours")],
                    [countdown.m, t("countdown.minutes")],
                    [countdown.s, t("countdown.seconds")],
                  ] as const
                ).map(([val, label]) => (
                  <div key={label} className="bg-white px-2 py-4">
                    <span className="block text-3xl font-extrabold tabular-nums tracking-tight text-gray-900">
                      {tobn(String(val).padStart(2, "0"), locale)}
                    </span>
                    <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Waitlist */}
          <div className="mx-auto mt-14 max-w-md">
            {done ? (
              <p className="flex items-center justify-center gap-2 text-sm font-medium text-gray-700">
                <span className="text-[#E30B12]">✓</span>{" "}
                {t("waitlist.success")}
              </p>
            ) : (
              <form
                onSubmit={onSubmit}
                className="flex flex-col gap-2.5 sm:flex-row"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("waitlist.placeholder")}
                  className="h-12 flex-1 rounded-lg border border-gray-300 px-4 text-sm outline-none transition-colors focus:border-gray-900"
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="h-12 rounded-lg bg-[#E30B12] px-6 text-[12px] font-semibold uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {busy ? "…" : t("waitlist.button")}
                </button>
              </form>
            )}
            <p className="mt-3 text-[12px] text-gray-400">
              {t("waitlist.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-6 py-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">
            <Link
              href="/privacy-policy"
              className="transition-colors hover:text-gray-900"
            >
              {t("legal.privacyPolicy")}
            </Link>
            <Link
              href="/terms"
              className="transition-colors hover:text-gray-900"
            >
              {t("legal.termsOfService")}
            </Link>
            <Link
              href="/delete-account"
              className="transition-colors hover:text-gray-900"
            >
              {t("legal.accountDeletion")}
            </Link>
            <a
              href={`mailto:${EMAIL}`}
              className="transition-colors hover:text-gray-900"
            >
              {t("legal.support")}
            </a>
          </nav>
          <p className="text-[12px] text-gray-400">
            © {tobn(2026, locale)} Campus Sheba
          </p>
        </div>
      </footer>
    </main>
  );
}
