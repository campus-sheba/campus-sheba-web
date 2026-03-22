import DashboardModulePage from "@/components/dashboard/DashboardModulePage";

export default async function MyDonationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <DashboardModulePage
      locale={locale}
      title="Donations Center"
      subtitle="Stay on top of your donation activities with a cleaner dedicated module view."
      ordersLink="/orders?tab=donations"
      moduleLink="/donation"
      moduleLabel="Donation"
    />
  );
}
