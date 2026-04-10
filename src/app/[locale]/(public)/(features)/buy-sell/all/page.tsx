import BuySellFeed from "@/modules/buy-sell/components/BuySellFeed";
import { PageContentWrapper, SectionWrapper } from "@/components/wrappers";

export default function BuySellAllPage() {
  return (
    <PageContentWrapper spacing="none" className="mt-0">
      <SectionWrapper spacing="none" background="transparent" className="my-0">
        <BuySellFeed />
      </SectionWrapper>
    </PageContentWrapper>
  );
}

