import Link from "next/link";

/**
 * Root 404 — rendered by the root layout for paths that never reach the locale
 * tree (e.g. a malformed/locale-less URL). Locale-aware 404s are handled by
 * `app/[locale]/not-found.tsx`; this one stays translation-free on purpose.
 */
export default function RootNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-extrabold text-neutral-900 sm:text-7xl">404</p>
      <h1 className="mt-4 text-2xl font-bold text-neutral-800">
        We can&rsquo;t find that page
      </h1>
      <p className="mt-2 max-w-md text-neutral-500">
        The page you&rsquo;re trying to reach may have been moved, renamed, or is
        no longer available.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
      >
        Back to Home
      </Link>
    </div>
  );
}
