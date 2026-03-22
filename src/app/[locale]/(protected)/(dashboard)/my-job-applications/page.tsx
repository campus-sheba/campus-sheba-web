import DashboardModulePage from "@/components/dashboard/DashboardModulePage";

export default async function MyJobApplicationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <DashboardModulePage
      locale={locale}
      title="Job Applications Center"
      subtitle="Monitor your job application journey from one dedicated professional dashboard page."
      ordersLink="/orders?tab=jobs"
      moduleLink="/jobs"
      moduleLabel="Jobs"
    />
  );
}
