import Link from "next/link";
import Image from "next/image";
import type { ModuleOverlayItem } from "../types";

export function ModuleButton({
  label,
  href,
  iconUrl,
  color = "#334155",
  bg = "#F8FAFC",
}: Omit<ModuleOverlayItem, "id">) {
  return (
    <Link
      href={href}
      className="module-card group relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-emerald-100/70 bg-white/90 px-2 py-3 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_65%)] opacity-0 transition group-hover:opacity-100" />
      <div
        className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-white/70 shadow-sm transition-all duration-200 group-hover:-rotate-2 group-hover:scale-110 group-hover:shadow-md md:h-14 md:w-14"
        style={{ background: bg }}
      >
        {iconUrl ? (
          <Image
            src={iconUrl}
            alt={label}
            width={1000}
            height={1000}
            className="h-6 w-6 object-contain md:h-10 md:w-10"
          />
        ) : (
          <span
            className="h-6 w-6 rounded-full md:h-10 md:w-10"
            style={{ backgroundColor: color }}
          />
        )}
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold text-emerald-700 leading-tight md:text-sm">
          {label}
        </p>
      </div>
    </Link>
  );
}
