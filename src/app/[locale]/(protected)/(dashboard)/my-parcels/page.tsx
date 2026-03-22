import DashboardModulePage from "@/components/dashboard/DashboardModulePage";

export default async function MyParcelsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <DashboardModulePage
      locale={locale}
      title="Parcels Center"
      subtitle="Manage parcel movement requests from a dedicated page designed for quick review."
      ordersLink="/orders?tab=parcels"
      moduleLink="/parcel"
      moduleLabel="Parcel"
    />
  );
}
