"use client";

import { PageContentWrapper, SectionWrapper } from "@/components/wrappers";
import BuySellLanding from "../components/BuySellLanding";

export default function BuySellTemplate() {
  return (
    <PageContentWrapper spacing="none" className="mt-0">
      <SectionWrapper spacing="none" background="transparent" className="my-0">
        <BuySellLanding />
      </SectionWrapper>
    </PageContentWrapper>
  );
}
