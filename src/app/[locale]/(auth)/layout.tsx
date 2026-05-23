import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  HeartPulse,
  MapPin,
  Package,
  ShoppingBag,
  UtensilsCrossed,
} from "lucide-react";

import Logo from "@/components/siteSettings/navbar/Logo";

/**
 * Auth route group shell — a split-screen experience:
 *  • Left  (lg+): branded, student-facing showcase of what Campus Sheba offers.
 *  • Right (all): the focused login/signup card (the page `children`).
 *
 * Deliberately chrome-free (no navbar/footer); `proxy.ts` already bounces
 * signed-in users away from these routes, so this only renders for guests.
 */

const FEATURES = [
  { icon: UtensilsCrossed, label: "Food Delivery", hint: "From campus favourites" },
  { icon: BookOpen, label: "Books", hint: "Buy, lend & donate" },
  { icon: ShoppingBag, label: "Marketplace", hint: "Student shops & deals" },
  { icon: HeartPulse, label: "Blood Bank", hint: "Find donors fast" },
  { icon: Package, label: "Parcel", hint: "Send across campus" },
  { icon: MapPin, label: "Campus Map", hint: "Discover every spot" },
] as const;

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* ── Brand showcase (large screens) ─────────────────────────────────── */}
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#0d1b2a] p-10 text-white lg:flex xl:p-14">
        {/* Decorative gradient + glow blobs */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#00a651]/30 via-[#0d1b2a] to-[#0d1b2a]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#00a651]/30 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-[#f5a623]/20 blur-3xl"
          aria-hidden
        />

        <div className="relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-3 py-2 shadow-sm"
          >
            <Logo />
          </Link>

          <h1 className="mt-12 max-w-md text-4xl font-extrabold leading-tight xl:text-5xl">
            Your Campus.
            <br />
            <span className="text-[#5ee8a0]">Your World.</span>
          </h1>
          <p className="mt-4 max-w-md text-base text-white/70">
            One account for everything campus life — food, books, the
            marketplace, blood bank, parcels and more, all in a single app built
            for students.
          </p>

          <ul className="mt-10 grid max-w-md grid-cols-2 gap-3">
            {FEATURES.map(({ icon: Icon, label, hint }) => (
              <li
                key={label}
                className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm transition-colors hover:bg-white/10"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#00a651]/20 text-[#5ee8a0]">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{label}</span>
                  <span className="block truncate text-xs text-white/50">{hint}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 mt-10 flex items-center gap-4">
          <Image
            src="/assets/images/hero-app-preview.png"
            alt="Campus Sheba app preview"
            width={120}
            height={120}
            className="hidden h-20 w-auto rounded-xl shadow-2xl ring-1 ring-white/10 xl:block"
          />
          <p className="text-sm text-white/60">
            Trusted by students across campuses.
            <br />
            <span className="font-semibold text-white/80">
              Join your community today.
            </span>
          </p>
        </div>
      </aside>

      {/* ── Auth form column ───────────────────────────────────────────────── */}
      <main className="flex w-full flex-col lg:w-1/2">
        <header className="flex items-center justify-between px-6 py-5 sm:px-10">
          {/* Compact brand for mobile (left panel hidden there) */}
          <Link href="/" className="inline-flex items-center lg:invisible">
            <Logo />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-10">
          <div className="w-full max-w-md rounded-2xl border border-neutral-100 bg-white p-6 shadow-xl sm:p-8">
            {children}
          </div>
        </div>

        <footer className="px-6 py-5 text-center text-xs text-neutral-400 sm:px-10">
          © {new Date().getFullYear()} Campus Sheba. Your Campus. Your World.
        </footer>
      </main>
    </div>
  );
}
