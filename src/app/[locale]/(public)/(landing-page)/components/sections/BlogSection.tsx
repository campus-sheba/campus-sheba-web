"use client";

import {
  middleFeatured,
  middleTicker,
  middleTwoUp,
} from "@/data/landing/middle";
import TopTicker from "../others/TopTicker";
import FeaturedCard from "../others/FeaturedCard";
import TwoUpGrid from "../others/TwoUpGrid";

export default function BlogSection() {
  return (
    <section className="">
      <TopTicker items={middleTicker} />
      <FeaturedCard data={middleFeatured} />
      <TwoUpGrid items={middleTwoUp} />
    </section>
  );
}
