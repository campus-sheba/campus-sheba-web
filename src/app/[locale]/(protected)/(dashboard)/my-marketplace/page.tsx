import DashboardModulePage from "@/components/dashboard/DashboardModulePage";

export default async function MyMarketplacePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <DashboardModulePage
      locale={locale}
      title="Marketplace Center"
      subtitle="Manage marketplace purchase flow and seller activity through a dedicated dashboard route."
      ordersLink="/orders?tab=marketplace"
      moduleLink="/marketplace"
      moduleLabel="Marketplace"
    />
  );
}
