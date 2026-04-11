import WalletPage from "@/modules/dashboard/WalletPage";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";

export default function Page() {
  return (
    <div>
      <AppBreadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Dashboard", href: "/dashboard" }, { label: "Wallet" }]}
      />
      <WalletPage />
    </div>
  );
}
