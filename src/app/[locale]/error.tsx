"use client";

import { useEffect } from "react";

import { Link } from "@/i18n/navigation";

/**
 * Locale-tree error boundary. Renders inside the root layout + i18n provider but
 * replaces the failed route subtree, so the user keeps the document shell while
 * recovering. Root-layout-level failures fall through to `app/global-error.tsx`.
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[locale-error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-bold text-neutral-900">Something went wrong</h1>
      <p className="mt-2 max-w-md text-neutral-500">
        We hit a snag loading this page. Try again, or return home.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center rounded-lg border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
