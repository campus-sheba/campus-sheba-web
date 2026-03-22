"use client";

import { ChevronRight, Home } from "lucide-react";
import { Link } from "@/i18n/navigation";

export type AppBreadcrumbItem = {
  label: string;
  href?: string;
};

type AppBreadcrumbProps = {
  items: AppBreadcrumbItem[];
  className?: string;
};

export default function AppBreadcrumb({ items, className = "" }: AppBreadcrumbProps) {
  if (!items?.length) return null;

  return (
    <nav aria-label="Breadcrumb" className={`mb-3 ${className}`.trim()}>
      <ol className="flex flex-wrap items-center gap-1 text-sm text-gray-500">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {item.href && !isLast ? (
                <Link href={item.href} className="inline-flex items-center gap-1.5 hover:text-gray-800 transition-colors">
                  {index === 0 ? <Home className="w-3.5 h-3.5" /> : null}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={isLast ? "font-semibold text-gray-900" : "inline-flex items-center gap-1.5"}
                >
                  {index === 0 ? <Home className="w-3.5 h-3.5" /> : null}
                  <span>{item.label}</span>
                </span>
              )}

              {!isLast ? <ChevronRight className="w-3.5 h-3.5 text-gray-400" /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
