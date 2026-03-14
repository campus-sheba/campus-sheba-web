"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { SectionWrapper } from "@/components/wrappers";
import { cn } from "@/utils/utils";
import type { GridItem } from "@/types/landing";

interface TwoUpGridProps {
  items: GridItem[];
  className?: string;
}

export default function TwoUpGrid({ items, className = "" }: TwoUpGridProps) {
  return (
    <SectionWrapper spacing="md" background="transparent" className={className}>
      <div className="grid grid-cols-2 gap-2 lg:gap-4">
        {items.map((item) => (
          <Link key={item.id} href={`/articles/grid/${item.id}`}>
            <div className="border border-gray-200 bg-white hover:border-gray-300 transition-colors relative h-48 sm:h-56 overflow-hidden">
              <Image
                src={item.image}
                alt={item.alt || "Featured image"}
                fill
                sizes="(max-width: 640px) 50vw, 300px"
                className="object-cover"
              />
            </div>
          </Link>
        ))}
      </div>
    </SectionWrapper>
  );
}
