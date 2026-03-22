import DashboardModulePage from "@/components/dashboard/DashboardModulePage";

export default async function MyTuitionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <DashboardModulePage
      locale={locale}
      title="Tuition Center"
      subtitle="Track tutoring requests and applications with a dedicated dashboard workflow."
      ordersLink="/orders?tab=tuition"
      moduleLink="/tuition"
      moduleLabel="Tuition"
    />
  );
}
