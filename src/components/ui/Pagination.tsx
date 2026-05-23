"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export type PaginationProps = {
  /** 1-based current page. */
  page: number;
  /** Total number of pages. */
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Disable controls while a fetch is in flight. */
  disabled?: boolean;
  className?: string;
};

/**
 * Compact numbered pagination with first/last anchoring and ellipses, e.g.
 * `‹ 1 … 4 [5] 6 … 20 ›`. Brand-green active page. Shared across dashboard
 * list tables so paging looks and behaves identically everywhere.
 */
export default function Pagination({
  page,
  totalPages,
  onPageChange,
  disabled = false,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const go = (next: number) => {
    if (disabled) return;
    const clamped = Math.min(Math.max(next, 1), totalPages);
    if (clamped !== page) onPageChange(clamped);
  };

  // Build a windowed list of pages with ellipsis sentinels (-1).
  const pages: number[] = [];
  const window = 1; // neighbours on each side of current
  for (let p = 1; p <= totalPages; p++) {
    const isEdge = p === 1 || p === totalPages;
    const isNear = Math.abs(p - page) <= window;
    if (isEdge || isNear) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== -1) {
      pages.push(-1);
    }
  }

  const btnBase =
    "flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <nav
      aria-label="Pagination"
      className={`flex items-center justify-center gap-1.5 ${className}`}
    >
      <button
        type="button"
        aria-label="Previous page"
        disabled={disabled || page <= 1}
        onClick={() => go(page - 1)}
        className={`${btnBase} border-gray-200 text-gray-600 hover:bg-gray-50`}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((p, index) =>
        p === -1 ? (
          <span
            key={`ellipsis-${index}`}
            className="px-1.5 text-sm text-gray-400"
            aria-hidden
          >
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            aria-current={p === page ? "page" : undefined}
            disabled={disabled}
            onClick={() => go(p)}
            className={`${btnBase} ${
              p === page
                ? "border-[#00A651] bg-[#00A651] text-white"
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        aria-label="Next page"
        disabled={disabled || page >= totalPages}
        onClick={() => go(page + 1)}
        className={`${btnBase} border-gray-200 text-gray-600 hover:bg-gray-50`}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
