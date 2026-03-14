"use client";

import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { cn } from "@/utils/utils";

export interface SliderProps {
  children: React.ReactNode;
  className?: string;
  slidesPerView?: number | { [key: number]: number };
  spaceBetween?: number;
  navigation?: boolean;
  pagination?: boolean | object;
  autoplay?: boolean | object;
  loop?: boolean;
  breakpoints?: {
    [key: number]: { slidesPerView?: number; spaceBetween?: number };
  };
  onSlideChange?: (swiper: SwiperType) => void;
  showNavigationButtons?: boolean;
  navigationButtonClassName?: string;
  containerClassName?: string;
}

export default function Slider({
  children,
  className,
  slidesPerView = 1,
  spaceBetween = 0,
  navigation = true,
  pagination = false,
  autoplay = false,
  loop = false,
  breakpoints,
  onSlideChange,
  showNavigationButtons = true,
  navigationButtonClassName,
  containerClassName,
}: SliderProps) {
  const swiperRef = useRef<SwiperType | null>(null);

  const modules = [];
  if (navigation) modules.push(Navigation);
  if (pagination) modules.push(Pagination);
  if (autoplay) modules.push(Autoplay);

  const handlePrev = () => {
    swiperRef.current?.slidePrev();
  };

  const handleNext = () => {
    swiperRef.current?.slideNext();
  };

  const defaultBreakpoints = breakpoints || {
    640: {
      slidesPerView: typeof slidesPerView === "number" ? slidesPerView : 3,
      spaceBetween,
    },
  };

  return (
    <div className={cn("w-full", containerClassName)}>
      <div className="flex items-stretch">
        {showNavigationButtons && navigation && (
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous"
            className={cn(
              "flex w-8 items-center justify-center border border-gray-200 text-gray-500 hover:text-black transition-colors shrink-0",
              navigationButtonClassName,
            )}
          >
            ‹
          </button>
        )}

        <div className="flex-1 overflow-hidden">
          <Swiper
            modules={modules}
            spaceBetween={spaceBetween}
            slidesPerView={
              typeof slidesPerView === "number" ? slidesPerView : 1
            }
            breakpoints={defaultBreakpoints}
            loop={loop}
            autoplay={
              autoplay
                ? typeof autoplay === "object"
                  ? autoplay
                  : { delay: 3000, disableOnInteraction: false }
                : false
            }
            pagination={
              pagination
                ? typeof pagination === "object"
                  ? pagination
                  : { clickable: true }
                : false
            }
            navigation={navigation && !showNavigationButtons}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            onSlideChange={onSlideChange}
            className={cn("!w-full", className)}
          >
            {React.Children.map(children, (child, index) => (
              <SwiperSlide key={index}>{child}</SwiperSlide>
            ))}
          </Swiper>
        </div>

        {showNavigationButtons && navigation && (
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next"
            className={cn(
              "flex w-8 items-center justify-center border border-gray-200 text-gray-500 hover:text-black transition-colors shrink-0",
              navigationButtonClassName,
            )}
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
}
