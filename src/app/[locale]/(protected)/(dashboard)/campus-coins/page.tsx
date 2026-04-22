import CampusCoinsPage from "@/modules/dashboard/CampusCoinsPage";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";

export default function Page() {
  return (
    <div>
      <AppBreadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Campus Coins" },
        ]}
      />
      <CampusCoinsPage />
    </div>
  );
}
