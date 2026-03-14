import { redirect } from "@/i18n/navigation";
import { isAuthenticated, refreshAuth } from "@/services/auth";

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  let authenticated = await isAuthenticated();

  if (!authenticated) {
    try {
      await refreshAuth();
    } catch {
      // Ignore refresh failure for public auth pages.
    }

    authenticated = await isAuthenticated();
  }

  if (authenticated) {
    redirect({ href: "/profile", locale });
  }

  return <>{children}</>;
}
