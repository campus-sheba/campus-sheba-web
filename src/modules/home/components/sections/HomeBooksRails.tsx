"use client";

import { BookOpen } from "lucide-react";
import { SectionHeader } from "@/components/marketplace/SectionHeader";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import { useAppState } from "@/contexts/AppStateContext";
import { useTranslations } from "next-intl";
import { ResponsiveCardsGrid } from "@/components/marketplace/ResponsiveCardsGrid";
import BookListingCard from "@/modules/books/components/BookListingCard";
import { useBooksList } from "@/modules/books/hooks/useBooksList";

const PAGE_SIZE = 8;

function BooksRow({
  title,
  subtitle,
  viewAllHref,
  universityId,
  type,
  emptyHint,
}: {
  title: string;
  subtitle: string;
  viewAllHref: string;
  universityId?: string;
  type?: "Selling" | "Lending" | "Donation";
  emptyHint: string;
}) {
  const { items, isLoading, error } = useBooksList({
    universityId,
    debouncedSearch: "",
    pageSize: PAGE_SIZE,
    type,
  });

  return (
    <SectionWrapper spacing="sm" background="transparent" className="my-0">
      <SectionHeader
        title={title}
        subtitle={subtitle}
        viewAllHref={viewAllHref}
      />
      {error ? (
        <p className="mt-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {isLoading && items.length === 0 ? (
        <div className="mt-4 hidden md:grid lg:hidden gap-4 grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-2xl bg-gray-100"
            />
          ))}
        </div>
      ) : null}
      {isLoading && items.length === 0 ? (
        <div className="mt-4 hidden lg:grid gap-4 grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-2xl bg-gray-100"
            />
          ))}
        </div>
      ) : null}
      {isLoading && items.length === 0 ? (
        <div className="mt-4 md:hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-2xl bg-gray-100"
              style={{
                display: "inline-block",
                width: "calc(42.86% - 10px)",
                marginRight: "16px",
              }}
            />
          ))}
        </div>
      ) : null}
      {items.length === 0 && !isLoading ? (
        <p className="mt-4 rounded-xl border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
          {emptyHint}
        </p>
      ) : null}
      {items.length > 0 ? (
        <div className="mt-4">
          <ResponsiveCardsGrid>
            {items.slice(0, PAGE_SIZE).map((item) => (
              <BookListingCard key={item._id} item={item} />
            ))}
          </ResponsiveCardsGrid>
        </div>
      ) : null}
    </SectionWrapper>
  );
}

export function HomeBooksRails() {
  const t = useTranslations("common");
  const tt = (key: string, fallback: string) =>
    t.has(key) ? t(key) : fallback;
  const { state } = useAppState();
  const universityId = state.university.selected?._id;

  if (!universityId) {
    return (
      <section id="home-books" aria-labelledby="home-books-heading">
        <SectionWrapper
          spacing="none"
          background="transparent"
          className="my-0 bg-white py-12 md:py-16"
        >
          <ContentWrapper
            maxWidth="max-w-7xl mx-auto"
            padding="none"
            className=""
          >
            <div className="flex items-start gap-4 rounded-2xl border border-dashed border-gray-200 bg-sky-50/40 p-8">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-800">
                <BookOpen className="h-6 w-6" aria-hidden />
              </div>
              <div>
                <h2
                  id="home-books-heading"
                  className="text-lg font-bold text-gray-900 md:text-xl"
                >
                  {tt(
                    "homeRails.booksTitle",
                    "Book Sheba — sell, lend, donate",
                  )}
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  {tt(
                    "homeRails.booksNeedCampus",
                    "Choose your university to see books for sale, lending, and free donations from your campus.",
                  )}
                </p>
              </div>
            </div>
          </ContentWrapper>
        </SectionWrapper>
      </section>
    );
  }

  return (
    <section id="home-books" aria-labelledby="home-books-heading">
      <SectionWrapper
        spacing="none"
        background="transparent"
        className="my-0 bg-white py-12 md:py-16"
      >
        <ContentWrapper
          maxWidth="max-w-7xl mx-auto"
          padding="none"
          className="px-4 md:px-8 lg:px-0"
        >
          <div className="border-b border-gray-100 pb-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">
              {tt("homeRails.booksKicker", "Book Sheba")}
            </p>
            <h2
              id="home-books-heading"
              className="mt-2 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl"
            >
              {tt(
                "homeRails.booksHeadline",
                "Textbooks: buy, borrow, or grab a donation",
              )}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-gray-600 md:text-base">
              {tt(
                "homeRails.booksIntro",
                "Three rails tuned to how students actually move books — paid resale, short-term lending, and community giveaways.",
              )}
            </p>
          </div>

          <div className="mt-10 space-y-12">
            <BooksRow
              title={tt("homeRails.booksSell", "Books for sale")}
              subtitle={tt(
                "homeRails.booksSellSub",
                "Buy textbooks and notes from students on your campus.",
              )}
              viewAllHref="/books/all?type=Selling"
              universityId={universityId}
              type="Selling"
              emptyHint={tt(
                "homeRails.booksEmptySell",
                "No books listed for sale right now.",
              )}
            />
            <BooksRow
              title={tt("homeRails.booksLend", "Books to borrow")}
              subtitle={tt(
                "homeRails.booksLendSub",
                "Lend listings for a period — ideal for a single semester.",
              )}
              viewAllHref="/books/all?type=Lending"
              universityId={universityId}
              type="Lending"
              emptyHint={tt(
                "homeRails.booksEmptyLend",
                "No lend listings yet.",
              )}
            />
            <BooksRow
              title={tt("homeRails.booksDonate", "Free books & donations")}
              subtitle={tt(
                "homeRails.booksDonateSub",
                "Donated titles — pay it forward when you are done reading.",
              )}
              viewAllHref="/books/all?type=Donation"
              universityId={universityId}
              type="Donation"
              emptyHint={tt(
                "homeRails.booksEmptyDonate",
                "No donation listings yet.",
              )}
            />
          </div>
        </ContentWrapper>
      </SectionWrapper>
    </section>
  );
}
