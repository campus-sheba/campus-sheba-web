"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { SectionWrapper } from "@/components/wrappers";
import { Heading, Paragraph, Subtitle } from "@/components/ui/typography";
import ClockIcon from "@/components/ui/icons/ClockIcon";
import { cn } from "@/utils/utils";
import type { Article } from "@/types/landing";

interface ArticleCardProps {
  article: Article;
  className?: string;
}

export default function ArticleCard({
  article,
  className = "",
}: ArticleCardProps) {
  return (
    <SectionWrapper
      spacing="md"
      background="white"
      className={cn("px-6 md:px-0 md:pr-6 lg:px-0 lg:pr-0", className)}
    >
      <article className="bg-white">
        <div className="relative w-full h-[200px] sm:h-[240px] overflow-hidden">
          <Link href={`/articles/${article.id}`}>
            <Image
              src={article.image}
              alt={article.title}
              fill
              sizes="(max-width: 640px) 100vw, 600px"
              className="object-cover"
            />
            <span
              className={cn(
                "absolute left-3 top-3 px-2 py-1",
                article.categoryColor,
              )}
            >
              <Subtitle
                size="xs"
                uppercase
                tracking="widest"
                className="text-white"
              >
                {article.category}
              </Subtitle>
            </span>
          </Link>
        </div>

        <div className="px-6 py-5">
          <Link href={`/articles/${article.id}`}>
            <Heading
              as="h2"
              size="lg"
              weight="extrabold"
              className="sm:text-xl hover:text-gray-700 transition-colors"
            >
              {article.title}
            </Heading>
          </Link>

          <div className="mt-3 flex items-center gap-2">
            <Paragraph size="xs" color="light">
              by{" "}
              <span className="font-bold uppercase text-black">
                {article.author}
              </span>
            </Paragraph>
            <div className="flex items-center gap-1 text-gray-500">
              <ClockIcon className="w-3 h-3" />
              <Paragraph size="xs" color="light">
                {article.date}
              </Paragraph>
            </div>
          </div>

          <Paragraph size="sm" color="muted" className="mt-4">
            {article.excerpt}
          </Paragraph>
        </div>
      </article>
    </SectionWrapper>
  );
}
