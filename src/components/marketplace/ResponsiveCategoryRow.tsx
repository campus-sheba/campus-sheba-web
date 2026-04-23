"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";

type Props = {
  children: React.ReactNode[];
  className?: string;
};

export function ResponsiveCategoryRow({ children, className }: Props) {
  return (
    <Swiper
      modules={[FreeMode]}
      freeMode={{ enabled: true, sticky: false, momentum: true }}
      slidesPerView="auto"
      centeredSlides={false}
      watchOverflow={true}
      spaceBetween={8}
      grabCursor={true}
      className={`[&_.swiper-slide]:!w-auto ${className ?? ""}`}
    >
      {children.map((child, index) => (
        <SwiperSlide key={index} className="!w-auto">
          <div className="inline-flex w-fit">{child}</div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
