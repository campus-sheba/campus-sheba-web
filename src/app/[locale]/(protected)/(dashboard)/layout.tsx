import { getMe } from "@/services/auth";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  let user = null;
  try {
    const response = await getMe();
    user = response.data;
  } catch {
    // AuthGuard already handles auth; if getMe fails here, proceed without user
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="cs-container py-6 lg:py-8">
        <div className="flex gap-6 items-start">
          <DashboardSidebar locale={locale} user={user} />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
