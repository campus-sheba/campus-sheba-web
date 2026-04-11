import MyShopHubPage from "@/modules/shop-owner/components/MyShopHubPage";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";

export default function Page() {
  return (
    <div>
      <AppBreadcrumb items={[{ label: "Home", href: "/" }, { label: "Dashboard", href: "/dashboard" }, { label: "My shop" }]} />
      <MyShopHubPage />
    </div>
  );
}
