"use client";

import type { LucideIcon } from "lucide-react";
import { ChevronLeft, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";

type Props = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  /** Tailwind gradient classes for the header background. */
  gradient: string;
  preview?: boolean;
  children?: React.ReactNode;
};

/** Consistent gradient header used across every Transport sub-module. */
export default function TransportSubHeader({
  icon: Icon,
  title,
  subtitle,
  gradient,
  preview = false,
  children,
}: Props) {
  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} p-6 text-white shadow-lg md:p-8`}>
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-8 h-44 w-44 rounded-full bg-black/10 blur-2xl" />

      <div className="relative">
        <Link
          href="/transport"
          className="inline-flex items-center gap-1 text-sm font-medium text-white/80 transition hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" /> Transport
        </Link>

        <div className="mt-3 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight md:text-2xl">{title}</h1>
              <p className="mt-0.5 max-w-xl text-sm text-white/85">{subtitle}</p>
            </div>
          </div>
          {preview ? (
            <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold backdrop-blur">
              <Sparkles className="h-3 w-3" /> Preview
            </span>
          ) : null}
        </div>

        {children ? <div className="mt-5">{children}</div> : null}
      </div>
    </div>
  );
}
