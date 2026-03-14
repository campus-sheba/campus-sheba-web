"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { Heading } from "@/components/ui/typography";
import type { LatestArticle } from "@/types/landing";
import { latestData } from "@/data/landing/latest";
import LeftSection from "../others/LeftSection";

export default function LatestSection() {
  return (
    <div>
      <LeftSection title="Latest" data={latestData}>
        {(item: LatestArticle) => (
          <Link
            key={item.id}
            href={item.link}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-[150px] h-[100px] shrink-0 relative overflow-hidden">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
              />
            </div>
            <Heading
              as="h2"
              size="sm"
              weight="bold"
              className="text-sm sm:text-base"
            >
              {item.title}
            </Heading>
          </Link>
        )}
      </LeftSection>
    </div>
  );
}
