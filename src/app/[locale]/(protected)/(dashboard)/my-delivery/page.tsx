import DashboardModulePage from "@/components/dashboard/DashboardModulePage";

export default async function MyDeliveryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <DashboardModulePage
      locale={locale}
      title="Delivery Center"
      subtitle="Track delivery-related activity from one place with a cleaner focused workspace."
      ordersLink="/orders?tab=delivery"
      moduleLink="/delivery"
      moduleLabel="Delivery"
    />
  );
}
