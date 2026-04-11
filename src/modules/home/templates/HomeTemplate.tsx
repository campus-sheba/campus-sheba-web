"use client";

import Banners from "../components/Banners";
import { FeaturesSection } from "../components/Features";
import { HomePageContent } from "../components/HomePageContent";
import { UniversitiesSection } from "../components/UniversitySection";
import { PageContentWrapper, SectionWrapper } from "@/components/wrappers";

export default function HomeTemplate() {
  return (
    <PageContentWrapper spacing="none" className="mt-0">
      <SectionWrapper spacing="none" background="transparent" className="my-0">
        <Banners bottomOverlay={<FeaturesSection />} />
      </SectionWrapper>
      <HomePageContent />
      <UniversitiesSection />
    </PageContentWrapper>
  );
}
