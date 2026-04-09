import { getMe } from "@/services/auth";
import DashboardSidebar from "@/modules/dashboard/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  let user = null;
  try {
    const response = await getMe();
    user = response.data;
  } catch {
    // AuthGuard already handles auth; if getMe fails here, proceed without user
  }

  return (
    <div className="bg-gray-50 lg:h-[calc(100vh-var(--navbar-height)-var(--topbar-height))] lg:overflow-hidden">
      <div className="cs-container py-6 lg:h-full lg:py-6">
        <div className="flex gap-6 items-start lg:h-full">
          <DashboardSidebar user={user} />
          <main className="flex-1 min-w-0 lg:h-full lg:overflow-y-auto lg:pr-1 scrollbar-hide">{children}</main>
        </div>
      </div>
    </div>
  );
}
