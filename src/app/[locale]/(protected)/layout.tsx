import AuthGuard from "@/components/guards/AuthGuard";

export default async function ProtectedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <AuthGuard locale={locale}>{children}</AuthGuard>;
}
