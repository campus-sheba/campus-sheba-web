import AuthGuard from "@/components/guards/AuthGuard";
import SiteChrome from "@/components/layouts/SiteChrome";

/**
 * Protected route group. Two layers of defence:
 *  1. `proxy.ts` redirects unauthenticated requests to `/login?callbackUrl=…`
 *     before this even renders (and silently refreshes expiring sessions).
 *  2. `AuthGuard` re-validates server-side via `getMe()` so a session that dies
 *     mid-visit degrades gracefully instead of rendering stale private data.
 *
 * Chrome wraps the guard so the navbar/footer stay put if the session expires.
 */
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteChrome>
      <AuthGuard>{children}</AuthGuard>
    </SiteChrome>
  );
}
