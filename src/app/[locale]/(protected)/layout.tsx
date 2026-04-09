import AuthGuard from "@/components/guards/AuthGuard";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
