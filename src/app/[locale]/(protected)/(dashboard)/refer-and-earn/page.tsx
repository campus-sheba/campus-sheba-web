import ReferAndEarnPage from "@/modules/dashboard/ReferAndEarnPage";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";

export default function Page() {
  return (
    <div>
      <AppBreadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Refer & Earn" },
        ]}
      />
      <ReferAndEarnPage />
    </div>
  );
}
