import MyShopEditPage from "@/modules/shop-owner/components/MyShopEditPage";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div>
      <AppBreadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "My shop", href: "/my-shop" },
          { label: "Shop", href: `/my-shop/${id}` },
          { label: "Edit" },
        ]}
      />
      <MyShopEditPage shopId={id} />
    </div>
  );
}
