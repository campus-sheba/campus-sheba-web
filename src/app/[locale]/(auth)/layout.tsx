import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import Logo from "@/components/siteSettings/navbar/Logo";

/**
 * Auth route group shell — mirrors the Campus Sheba mobile splash design:
 *
 *  ┌───────────────────────────────┬────────────────────────────┐
 *  │ splash-01 brand showcase (lg) │ centred auth card          │
 *  └───────────────────────────────┴────────────────────────────┘
 *
 * On mobile the showcase collapses and `splash-bg` becomes a soft decorative
 * header behind the form. Chrome-free (no navbar/footer); `proxy.ts` already
 * bounces signed-in users away.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen bg-neutral-50 lg:grid-cols-2">
      {/* Brand showcase — desktop only */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-white via-rose-50/40 to-white lg:flex lg:items-center lg:justify-center">
        <Image
          src="/assets/images/splash-01.png"
          alt="Campus Sheba — all campus services in one platform"
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 0px"
          className="object-contain object-center p-8"
        />
        <div className="absolute bottom-8 left-0 right-0 px-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E30B12]/80">
            Your campus. Your world.
          </p>
        </div>
      </aside>

      {/* Form column */}
      <div className="relative flex min-h-screen flex-col">
        {/* Soft decorative backdrop — visible only on mobile */}
        <Image
          src="/assets/images/splash-bg.png"
          alt=""
          aria-hidden
          fill
          priority
          sizes="(max-width: 1023px) 100vw, 0px"
          className="pointer-events-none object-cover opacity-60 lg:hidden"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-neutral-50/70 to-neutral-50 lg:hidden" />

        <header className="relative z-10 px-6 py-5 sm:px-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </header>

        <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-6 sm:px-6">
          <div className="w-full max-w-md">
            <div className="mb-6 flex justify-center">
              <Link href="/" aria-label="Campus Sheba home">
                <Logo />
              </Link>
            </div>
            <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-xl shadow-neutral-200/50 sm:p-8">
              {children}
            </div>
          </div>
        </main>

        <footer className="relative z-10 px-6 py-5 text-center text-xs text-neutral-400 sm:px-10">
          © {new Date().getFullYear()} Campus Sheba. Your Campus. Your World.
        </footer>
      </div>
    </div>
  );
}
