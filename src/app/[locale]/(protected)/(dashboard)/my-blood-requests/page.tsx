import DashboardModulePage from "@/components/dashboard/DashboardModulePage";

export default async function MyBloodRequestsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <DashboardModulePage
      locale={locale}
      title="Blood Requests Center"
      subtitle="Manage your blood-request submissions and status updates from a focused dashboard page."
      ordersLink="/orders?tab=blood"
      moduleLink="/blood-bank"
      moduleLabel="Blood Bank"
    />
  );
}
