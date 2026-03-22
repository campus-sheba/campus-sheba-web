import DashboardModulePage from "@/components/dashboard/DashboardModulePage";

export default async function MyBooksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <DashboardModulePage
      locale={locale}
      title="Books Center"
      subtitle="Keep all books exchange activity organized in a dedicated and cleaner dashboard section."
      ordersLink="/orders?tab=books"
      moduleLink="/books"
      moduleLabel="Books"
    />
  );
}
