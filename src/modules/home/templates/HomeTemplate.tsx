"use client";
import Banners from "../components/Banners";
import { PageContentWrapper, SectionWrapper } from "@/components/wrappers";

import { UniversitiesSection } from "../components/UniversitySection";
import { FeaturesSection } from "../components/Features";

// ─── MAIN HOME TEMPLATE ───────────────────────────────────────
export default function HomeTemplate() {
  return (
    <PageContentWrapper spacing="none" className="mt-0">
      <SectionWrapper spacing="none" background="transparent" className="my-0">
        <Banners bottomOverlay={<FeaturesSection />} />
      </SectionWrapper>
      <UniversitiesSection />
    </PageContentWrapper>
  );
}
