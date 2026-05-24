"use client";

import Image from "next/image";
import { useAppState } from "@/contexts/AppStateContext";
import { useModuleBanners } from "@/modules/home/hooks/useModuleBanners";
import Slider from "@/components/slider/Slider";

export interface Banner {
  src: string;
  alt: string;
}

export interface HeroSliderProps {
  banners: Banner[];
}

function HeroSlider({ banners }: HeroSliderProps) {
  return (
    <div className="w-full relative">
      <Slider
        slidesPerView={1.2}
        spaceBetween={20}
        loop
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{
          el: ".hero-slider-pagination",
          clickable: true,
        }}
        breakpoints={{
          640: { slidesPerView: 1.2 },
          1024: { slidesPerView: 1.6 },
          1280: { slidesPerView: 2 },
        }}
        navigation
        showNavigationButtons
        containerClassName="!overflow-visible"
      >
        {banners.map((banner, idx) => (
          <div
            key={idx}
            className="group relative overflow-hidden rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 h-[240px] sm:h-[280px] md:h-[340px] lg:h-[420px]"
          >
            <Image
              src={banner.src}
              alt={banner.alt}
              fill
              priority={idx === 0}
              className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 60vw"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent opacity-80 pointer-events-none" />
          </div>
        ))}
      </Slider>

      <div className="hero-slider-pagination absolute bottom-4 right-4 z-20 flex items-center gap-2" />
    </div>
  );
}

const BuySellBanner = () => {
  const { state } = useAppState();
  const selectedUniversityId = state.university.selected?._id;
  const { banners, isLoading, error } = useModuleBanners(
    "buy_sell",
    selectedUniversityId,
  );

  const renderSkeleton = () => (
    <div className="relative h-[55vh] w-full animate-pulse bg-gray-100">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
    </div>
  );

  // No banner configured for this module/campus — hide the strip entirely
  // rather than holding a skeleton or erroring out.
  if (error) return null;
  if (isLoading) return renderSkeleton();
  if (banners.length === 0) return null;

  const sliderBanners: Banner[] = banners.map((b) => ({
    src: b.photo?.url || "/placeholder.jpg",
    alt: b.title || "Banner",
  }));

  return (
    <div className="relative mb-10 w-full">
      <HeroSlider banners={sliderBanners} />
    </div>
  );
};

export default BuySellBanner;
