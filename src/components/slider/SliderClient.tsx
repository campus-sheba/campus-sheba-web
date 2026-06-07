"use client";

import { useId, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Banner } from "@/types/banner";
import BannerLink from "@/components/banner/BannerLink";
import BannerMedia from "@/components/banner/BannerMedia";
import { cn } from "@/utils/utils";

export interface SliderClientProps {
  /** Resolved banners (already priority-sorted by the backend). */
  sliders: Banner[];
  /** Tailwind height classes. */
  sliderHeight?: string;
  /** Crossfade between slides (hero) vs. slide (inline). */
  fade?: boolean;
  /** Rounded corners — off for full-bleed hero. */
  rounded?: boolean;
  /** Round side arrows (matches {@link SliderSkeleton}). */
  showArrows?: boolean;
  /** Bottom gradient scrim (improves text/badge contrast on imagery). */
  showOverlay?: boolean;
  autoplay?: boolean;
  /** Override the dots container position (e.g. hero places them top-right). */
  paginationClassName?: string;
  /** Fired as each slide's media loads (lets the parent gate a shimmer). */
  onImageLoad?: () => void;
  className?: string;
}

/**
 * Reusable banner carousel built on Swiper. Renders each banner as a
 * {@link BannerLink} (redirection per BANNER_PUBLIC_API.md §9) wrapping
 * {@link BannerMedia} (image / GIF / YouTube per §5.4). Serves both the
 * full-bleed home hero (`fade`, `showOverlay`, custom dot position) and inline
 * module sliders (rounded, side arrows, bottom dots).
 */
export default function SliderClient({
  sliders,
  sliderHeight = "h-24 md:h-56 lg:h-96",
  fade = false,
  rounded = true,
  showArrows = true,
  showOverlay = false,
  autoplay = true,
  paginationClassName,
  onImageLoad,
  className,
}: SliderClientProps) {
  // Unique selectors so multiple sliders on one page don't share pagination.
  const uid = useId().replace(/[:]/g, "");
  const dotsClass = `cs-slider-dots-${uid}`;
  const swiperRef = useRef<SwiperType | null>(null);

  if (sliders.length === 0) return null;

  const modules = [Autoplay, Pagination, Navigation];
  if (fade) modules.push(EffectFade);

  const multiple = sliders.length > 1;

  return (
    <div className={cn("relative w-full", sliderHeight, className)}>
      <Swiper
        modules={modules}
        slidesPerView={1}
        spaceBetween={0}
        effect={fade ? "fade" : undefined}
        loop={multiple}
        autoplay={
          autoplay && multiple ? { delay: 5000, disableOnInteraction: false } : false
        }
        pagination={{ clickable: true, el: `.${dotsClass}`, type: "bullets" }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        className="h-full w-full"
      >
        {sliders.map((banner, index) => (
          <SwiperSlide key={banner._id}>
            <BannerLink
              banner={banner}
              className={cn(
                "relative block h-full w-full overflow-hidden",
                rounded && "rounded-2xl",
              )}
            >
              <BannerMedia
                banner={banner}
                priority={index === 0}
                sizes="100vw"
                onLoad={onImageLoad}
              />
              {showOverlay ? (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/50 to-transparent" />
              ) : null}
            </BannerLink>
          </SwiperSlide>
        ))}
      </Swiper>

      {showArrows && multiple ? (
        <>
          <button
            type="button"
            onClick={() => swiperRef.current?.slidePrev()}
            aria-label="Previous"
            className="absolute -left-4 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md transition hover:bg-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => swiperRef.current?.slideNext()}
            aria-label="Next"
            className="absolute -right-4 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md transition hover:bg-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      ) : null}

      <div
        className={cn(
          dotsClass,
          "z-20 flex items-center justify-center gap-2",
          paginationClassName ??
            "absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-1/2",
        )}
      />
    </div>
  );
}
