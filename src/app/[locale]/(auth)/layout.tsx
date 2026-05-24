import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import Logo from "@/components/siteSettings/navbar/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        {/* =========================================
           LEFT SHOWCASE SECTION
        ========================================= */}
        <aside className="relative hidden overflow-hidden bg-white lg:block">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="/assets/images/splash-bg.png"
              alt="Campus Sheba"
              fill
              priority
              sizes="50vw"
              className="object-cover object-center"
            />
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10" />

          {/* Decorative Blur */}
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-[#E30B12]/10 blur-3xl" />
          <div className="absolute -right-20 top-20 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

          {/* Content */}
          <div className="relative z-10 flex h-full flex-col justify-between p-14">
            {/* Logo */}
            <div>
              <Logo />
            </div>

            {/* Bottom Content */}
            <div className="max-w-xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-14 rounded-full bg-[#E30B12]" />
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#E30B12]">
                  Your Campus. Your World.
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* =========================================
           RIGHT AUTH SECTION
        ========================================= */}
        <section className="relative flex min-h-screen flex-col overflow-hidden bg-[#FAFAFA]">
          {/* Mobile Background */}
          <div className="absolute inset-0 opacity-[0.05] lg:hidden">
            <Image
              src="/assets/images/splash-bg.png"
              alt=""
              fill
              priority
              className="object-cover"
            />
          </div>

          {/* Top Blur */}
          <div className="absolute left-1/2 top-0 h-[350px] w-[350px] -translate-x-1/2 rounded-full bg-[#E30B12]/5 blur-3xl" />

          {/* Header */}
          <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition-all duration-200 hover:text-black"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
          </header>

          {/* Main */}
          <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-10">
            <div className="w-full max-w-[460px]">
              {/* Mobile Logo */}
              <div className="mb-8 flex justify-center lg:hidden">
                <Logo />
              </div>

              {/* Auth Card */}
              <div className="rounded-[32px] border border-neutral-200/70 bg-white p-8 shadow-[0_20px_80px_rgba(0,0,0,0.06)] backdrop-blur sm:p-10">
                {children}
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="relative z-10 px-6 pb-6 text-center text-xs text-neutral-400">
            © {new Date().getFullYear()} Campus Sheba. Your Campus. Your World.
          </footer>
        </section>
      </div>
    </div>
  );
}
