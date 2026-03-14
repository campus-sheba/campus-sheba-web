"use client";

import React from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/utils/utils";
import ChevronDownIcon from "@/components/ui/icons/ChevronDownIcon";

export interface NavItemProps {
  label: string;
  href: string;
  showChevron?: boolean;
  className?: string;
}

export default function NavItem({
  label,
  href,
  showChevron = false,
  className,
}: NavItemProps) {
  const pathname = usePathname();
  // Normalize paths for comparison (remove trailing slashes)
  const normalizedPathname = pathname !== "/" ? pathname.replace(/\/$/, "") : "/";
  const normalizedHref = href !== "/" ? href.replace(/\/$/, "") : "/";
  const isActive = normalizedPathname === normalizedHref || normalizedPathname.startsWith(normalizedHref + "/");

  return (
    <li>
      <Link
        href={href}
        className={cn(
          "inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-black hover:text-gray-700 transition-colors",
          isActive && "text-gray-700 underline underline-offset-4",
          className,
        )}
      >
        {label}
        {showChevron && <ChevronDownIcon className="h-3 w-3 -mt-px" />}
      </Link>
    </li>
  );
}
