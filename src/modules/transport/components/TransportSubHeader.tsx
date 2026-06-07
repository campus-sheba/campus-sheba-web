"use client";

import type { LucideIcon } from "lucide-react";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";

type Props = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  breadcrumbLabel: string;
  preview?: boolean;
};

/** Page hero + breadcrumb shared across Transport sub-modules. */
export default function TransportSubHeader({
  icon: Icon,
  title,
  subtitle,
  breadcrumbLabel,
  preview = false,
}: Props) {
  return (
    <>
      <AppBreadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Transport", href: "/transport" },
          { label: breadcrumbLabel },
        ]}
      />

      <div className="mt-4 rounded-2xl border border-gray-100 bg-gradient-to-br from-emerald-50/40 to-white p-6 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#00A651] text-white shadow-sm">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900 md:text-2xl">{title}</h1>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-600">{subtitle}</p>
            </div>
          </div>
          {preview ? (
            <span className="inline-flex shrink-0 self-start rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 ring-1 ring-gray-200/80">
              Preview
            </span>
          ) : null}
        </div>
      </div>
    </>
  );
}

/** White panel for filters, tabs, and route selectors below the hero. */
export function TransportFilterPanel({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:p-5 ${className}`}
    >
      {title ? (
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">{title}</p>
      ) : null}
      {children}
    </div>
  );
}

/** Neutral segmented control — brand accent on active segment only. */
export function TransportSegment({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            aria-pressed={active}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
              active
                ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200/80"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export const transportInputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#00A651] focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60";

export const transportBtnPrimaryClass =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-[#00A651] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400";

export const transportBtnSecondaryClass =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50";
