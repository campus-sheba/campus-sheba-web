"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

interface ResponsiveCardsGridProps {
  children: React.ReactNode[];
}

export function ResponsiveCardsGrid({ children }: ResponsiveCardsGridProps) {
  return (
    <>
      {/* Small device: Swiper with 2 full + 1/3 of next visible */}
      <div className="md:hidden">
        <Swiper
          slidesPerView={2.33}
          spaceBetween={16}
          grabCursor={true}
          className="[&_.swiper-wrapper]:items-stretch [&_.swiper-slide]:!h-auto"
        >
          {children.map((child, index) => (
            <SwiperSlide key={index}>
              <div className="h-full [&>*]:h-full [&_h2]:text-sm [&_h3]:text-sm [&_p]:text-xs [&_span]:text-xs">
                {child}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Medium device: 5 columns grid */}
      <div className="hidden md:grid lg:hidden auto-rows-fr gap-4 grid-cols-5">
        {children.map((child, index) => (
          <div key={index} className="h-full [&>*]:h-full">
            {child}
          </div>
        ))}
      </div>

      {/* Large device: 6 columns grid */}
      <div className="hidden lg:grid auto-rows-fr gap-4 grid-cols-6">
        {children.map((child, index) => (
          <div key={index} className="h-full [&>*]:h-full">
            {child}
          </div>
        ))}
      </div>
    </>
  );
}
