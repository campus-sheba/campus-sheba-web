"use client";

import { Link } from "@/i18n/navigation";

type Props = {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
};

export function SectionHeader({ title, subtitle, viewAllHref, viewAllLabel = "View all" }: Props) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-gray-900 sm:text-xl">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p> : null}
      </div>
      {viewAllHref ? (
        <Link href={viewAllHref} className="text-sm font-semibold text-[#00A651] hover:underline">
          {viewAllLabel} →
        </Link>
      ) : null}
    </div>
  );
}

