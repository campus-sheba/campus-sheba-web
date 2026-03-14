"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { SectionWrapper } from "@/components/wrappers";
import { Heading, Paragraph, Subtitle } from "@/components/ui/typography";
import Button from "@/components/ui/Button";
import ClockIcon from "@/components/ui/icons/ClockIcon";
import CommentIcon from "@/components/ui/icons/CommentIcon";
import type { FeaturedArticle } from "@/types/landing";

interface FeaturedCardProps {
  data: FeaturedArticle;
  className?: string;
}

export default function FeaturedCard({
  data,
  className = "",
}: FeaturedCardProps) {
  return (
    <SectionWrapper spacing="md" background="white" border className={className}>
      <article className="border border-gray-200 bg-white">
      <div className="w-full z-1 relative h-[280px] sm:h-[380px] overflow-hidden">
        <Link href={`/articles/featured`}>
          <Image
            src={data.image}
            alt={data.title}
            fill
            sizes="(max-width: 640px) 100vw, 800px"
            className="object-cover"
          />
        </Link>
      </div>

      <div className="lg:relative lg:h-[250px] w-full px-6 py-6">
        <div className="lg:absolute left-6 right-6 bg-white lg:px-6 lg:py-4 -top-16 z-10">
          <Subtitle size="xs" uppercase tracking="widest" color="muted">
            {data.category}
          </Subtitle>

          <Link href={`/articles/featured`}>
            <Heading
              as="h2"
              size="2xl"
              weight="extrabold"
              className="mt-3 sm:text-[28px] hover:text-gray-700 transition-colors"
            >
              {data.title}
            </Heading>
          </Link>

          <div className="mt-3 flex flex-wrap items-center gap-3 lg:gap-6">
            <Paragraph size="xs" color="light">
              by{" "}
              <span className="font-bold uppercase text-black">
                {data.author}
              </span>{" "}
              and 2 others
            </Paragraph>
            <div className="flex items-center gap-1 text-gray-500">
              <ClockIcon className="w-3 h-3" />
              <Paragraph size="xs" color="light">
                {data.date}
              </Paragraph>
            </div>
            <div className="text-gray-500 flex items-center gap-1">
              <CommentIcon className="w-4 h-4" />
              <Paragraph size="xs" color="light">
                {data.comments}
              </Paragraph>
            </div>
          </div>

          <Paragraph size="sm" color="muted" className="mt-4">
            {data.excerpt}
          </Paragraph>

          <Link href={`/articles/featured`}>
            <Button variant="primary" size="sm" className="mt-6">
              Read More
            </Button>
          </Link>
        </div>
      </div>
    </article>
    </SectionWrapper>
  );
}
