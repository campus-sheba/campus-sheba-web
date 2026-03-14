"use client";

import { cn } from "@/utils/utils";
import type { Article } from "@/types/landing";
import ArticleCard from "../others/ArticleCard";

export interface RightColumnProps {
  articles: Article[];
  className?: string;
}

export default function RightColumn({
  articles,
  className = "",
}: RightColumnProps) {
  return (
    <section className={cn(className)}>
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </section>
  );
}
