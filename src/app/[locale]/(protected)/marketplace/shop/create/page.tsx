import CreateShopWizard from "@/modules/shop-create/components/CreateShopWizard";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";

export default function CreateShopPage() {
  return (
    <SectionWrapper spacing="none" background="transparent" className="my-0 min-h-[60vh] bg-gray-50/80">
      <ContentWrapper maxWidth="max-w-7xl mx-auto" padding="md" className="pb-16 pt-4 md:pt-8">
        <AppBreadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Create shop" },
          ]}
        />
        <CreateShopWizard />
      </ContentWrapper>
    </SectionWrapper>
  );
}
