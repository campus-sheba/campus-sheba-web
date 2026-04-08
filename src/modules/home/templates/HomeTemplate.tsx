"use client";

import React from "react";
import Banners from "../components/Banners";
// import {
//   FoodExploreSection,
//   TrendingShopsSection,
//   BooksSectionExpanded,
//   MarketplaceSectionExpanded,
//   EntrepreneurshipSection,
//   BloodBankSection,
//   TuitionSectionExpanded,
//   LostFoundSectionExpanded,
//   DonationSection,
//   JobsSection,
//   DonationAndJobsSection,
//   FeaturedModuleHighlights,
// } from "../components/DynamicSections";
import {
  // BloodWidget,
  CTASection,
  // FAQSection,
  // FeaturesSection,
  HomeModulesOverlay,
  // HowItWorksSection,
  // TestimonialsSection,
  UniversitiesSection,
} from "./homeTemplate.sections";

// ─── MAIN HOME TEMPLATE ───────────────────────────────────────
export default function HomeTemplate() {
  return (
    <div>
      {/* Hero */}
      {/* <HeroSection  /> */}
      <Banners bottomOverlay={<HomeModulesOverlay />} />

      {/* Trust + Navigation */}
      <UniversitiesSection />
    </div>
  );
}

// {/* Entrepreneurship */}
//       <EntrepreneurshipSection />

//       {/* Food & Dining */}
//       <FoodExploreSection  />
//       <TrendingShopsSection />

//       {/* Books */}
//       <BooksSectionExpanded />

//       {/* Marketplace */}
//       <MarketplaceSectionExpanded />

//       {/* Blood Bank */}
//       <BloodBankSection />

//       {/* Tuition */}
//       <TuitionSectionExpanded />

//       {/* Lost & Found */}
//       <LostFoundSectionExpanded />

//       {/* Donation Campaigns */}
//       <DonationSection />

//       {/* Jobs Board */}
//       <JobsSection />

//       {/* Donation + Jobs compact side-by-side widget */}
//       <DonationAndJobsSection />

//       {/* All 10 Module Highlights */}
//       <FeaturedModuleHighlights />

//       {/* Detailed feature breakdowns */}
//       <FeaturesSection />
//       <HowItWorksSection />
//       <TestimonialsSection />
//       <BloodWidget  />
//       <FAQSection />
<CTASection />;
