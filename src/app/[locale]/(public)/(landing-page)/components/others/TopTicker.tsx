"use client";

import React from "react";
import Image from "next/image";
import { SectionWrapper } from "@/components/wrappers";
import { Paragraph } from "@/components/ui/typography";
import { cn } from "@/utils/utils";
import type { TickerItem } from "@/types/landing";
import Slider from "@/components/slider/Slider";

export interface TopTickerProps {
  items: TickerItem[];
  className?: string;
}

export default function TopTicker({ items, className = "" }: TopTickerProps) {
  return (
    <SectionWrapper
      spacing="none"
      background="white"
      className={cn("p-3", className)}
    >
      <Slider
        slidesPerView={1}
        spaceBetween={0}
        breakpoints={{
          640: {
            slidesPerView: 3,
            spaceBetween: 0,
          },
        }}
        navigation={true}
        showNavigationButtons={true}
        containerClassName="w-full"
      >
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 px-4 py-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden">
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <Paragraph size="xs" weight="semibold" className="leading-snug">
              {item.title}
            </Paragraph>
          </div>
        ))}
      </Slider>
    </SectionWrapper>
  );
}
