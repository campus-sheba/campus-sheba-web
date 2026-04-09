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
      className="module-card group flex flex-col items-center justify-center gap-3 rounded-xl border border-gray-200 p-1 py-3 text-center transition hover:shadow-lg md:p-4"
    >
      <div
        className="flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-200 group-hover:scale-110 group-hover:shadow-md md:h-14 md:w-14"
        style={{ background: bg }}
      >
        {iconUrl ? (
          <Image
            src={iconUrl}
            alt={label}
            width={28}
            height={28}
            className="h-5 w-5 object-contain md:h-7 md:w-7"
          />
        ) : (
          <span
            className="h-5 w-5 rounded-full md:h-7 md:w-7"
            style={{ backgroundColor: color }}
          />
        )}
      </div>
      <div className="text-center">
        <p className="text-xs md:text-sm font-semibold text-neutral-800 leading-tight">
          {label}
        </p>
      </div>
    </Link>
  );
}
