import ContentWrapper from "@/components/wrappers/ContentWrapper";
import SliderClient from "@/components/slider/SliderClient";
import SliderSkeleton from "@/components/slider/SliderSkeleton";
import type { Banner } from "@/types/banner";

type SliderSectionProps = {
  sliders?: Banner[];
  loading?: boolean;
  sliderHeight?: string;
};

/**
 * Presentational wrapper for a placement slider: shows a skeleton while
 * loading, the {@link SliderClient} once banners arrive, and renders nothing
 * when a campus has no campaign for the surface (no empty strip / layout gap).
 */
export default function SliderSection({
  sliders = [],
  loading = false,
  sliderHeight,
}: SliderSectionProps) {
  if (!loading && sliders.length === 0) return null;

  return (
    <ContentWrapper className="mt-2" padding="md">
      {loading ? (
        <SliderSkeleton sliderHeight={sliderHeight} />
      ) : (
        <SliderClient sliders={sliders} sliderHeight={sliderHeight} />
      )}
    </ContentWrapper>
  );
}
