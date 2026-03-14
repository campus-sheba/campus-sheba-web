"use client";

import { Link } from "@/i18n/navigation";
import ArrowRightIcon from "@/components/ui/icons/ArrowRightIcon";
import { Heading } from "@/components/ui/typography";
import type { OpinionItem } from "@/types/landing";
import { opinionData } from "@/data/landing/opinion";
import LeftSection from "../others/LeftSection";

export default function OpinionSection() {
  return (
    <LeftSection title="Opinion" data={opinionData}>
        {(item: OpinionItem) => (
          <Link
            key={item.id}
            href={item.link || `/opinion/${item.id}`}
            className="flex items-start gap-3 border-b border-gray-300 last:border-b-0 pb-4 last:pb-0 hover:text-green-500 transition-colors"
          >
            <ArrowRightIcon className="text-xl w-10 shrink-0" />
            <Heading as="h2" size="sm" weight="semibold" className="mb-0">
              {item.title}
            </Heading>
          </Link>
        )}
    </LeftSection>
  );
}
