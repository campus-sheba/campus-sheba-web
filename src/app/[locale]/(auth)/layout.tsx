import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import Logo from "@/components/siteSettings/navbar/Logo";

/**
 * Auth route group shell — mirrors the Campus Sheba mobile design: a clean white
 * canvas with soft brand-red accents, a centred logo, and a single focused card.
 * Chrome-free (no navbar/footer); `proxy.ts` already bounces signed-in users away.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-neutral-50">
      {/* Soft brand blobs (decorative) */}
      <Image
        src="/assets/images/hero-bg.png"
        alt=""
        aria-hidden
        width={520}
        height={480}
        priority
        className="pointer-events-none absolute -right-24 -top-28 w-[34rem] max-w-none opacity-70"
      />
      <Image
        src="/assets/images/hero-bg.png"
        alt=""
        aria-hidden
        width={520}
        height={480}
        className="pointer-events-none absolute -bottom-32 -left-28 w-[30rem] max-w-none opacity-60"
      />

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
  );
}
