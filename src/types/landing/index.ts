export type GridItem = {
  id: number | string;
  image: any; // Next.js imported image or string
  alt?: string;
  link?: string;
};

export type TickerItem = {
  id: number | string;
  title: string;
  image: any; // Next.js imported image
};

export type FeaturedArticle = {
  category: string;
  title: string;
  author: string;
  date: string;
  comments: number;
  excerpt: string;
  image: any; // Next.js imported image
};

export type LatestArticle = {
  id: number | string;
  title: string;
  image: any; // Next.js imported image
  link: string;
};

export type OpinionItem = {
  id: number | string;
  title: string;
  link?: string;
};

export type Article = {
  id: number | string;
  category: string;
  categoryColor: string;
  title: string;
  author: string;
  date: string;
  excerpt: string;
  image: any; // Next.js imported image
};
