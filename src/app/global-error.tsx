"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Top-level error boundary. Catches errors thrown in the root layout itself, so
 * it must render its own `<html>`/`<body>` (it replaces the root layout). Kept
 * dependency-free and translation-free so it can render even when app providers
 * are the thing that failed.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
          <h1 className="text-2xl font-bold text-neutral-900">
            Something went wrong
          </h1>
          <p className="mt-2 max-w-md text-neutral-500">
            An unexpected error occurred. You can try again, or head back to the
            homepage.
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
      </body>
    </html>
  );
}
