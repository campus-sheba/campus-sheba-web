"use client";

import { ContentWrapper } from "@/components/wrappers";
import LatestSection from "./sections/LatestSection";
import OpinionSection from "./sections/OpinionSection";
import BlogSection from "./sections/BlogSection";
import RightColumn from "./sections/RightColumn";
import { rightSectionArticles } from "@/data/landing/right";

export default function LandingPage() {
  return (
    <ContentWrapper maxWidth="container" padding="sm" className="">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10 max-w-[1600px] mx-auto">
        {/* Left Column */}
        <aside className="order-2 md:col-span-1 lg:col-span-1 lg:order-1 md:px-0 lg:px-0 space-y-6">
          <LatestSection />
          <OpinionSection />
        </aside>

        {/* Middle Column */}
        <section className="md:col-span-2 order-1 lg:col-span-2 lg:order-2 md:px-0 lg:px-0">
          <BlogSection />
        </section>

        {/* Right Column */}
        <aside className="order-3 md:col-span-1 lg:col-span-1 lg:order-3">
          <RightColumn articles={rightSectionArticles} />
        </aside>
      </div>
    </ContentWrapper>
  );
}
