"use client";

import { useAppState } from "@/contexts/AppStateContext";
import { useModuleBanners } from "@/modules/home/hooks/useModuleBanners";
import SliderSection from "./SliderSection";

type DynamicSliderProps = {
  /** Module surface key (Feature.key) — e.g. "home", "book", "food", "buy_sell". */
  sliderPlacement?: string;
  sliderHeight?: string;
};

/**
 * Drop-in placement slider: resolves active banners for `sliderPlacement`
 * (scope fallback + platform + date window applied server-side) scoped to the
 * selected campus, then hands them to {@link SliderSection}. Mirrors the
 * data-fetch → section → client/skeleton split used across the app.
 */
export default function DynamicSlider({
  sliderPlacement = "home",
  sliderHeight,
}: DynamicSliderProps) {
  const { state } = useAppState();
  const universityId = state.university.selected?._id;
  const { banners, isLoading } = useModuleBanners(sliderPlacement, universityId);

  return (
    <SliderSection
      sliders={banners}
      loading={isLoading}
      sliderHeight={sliderHeight}
    />
  );
}
