"use client";
import Banners from "../components/Banners";

import {
 
  HomeModulesOverlay,
 
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
