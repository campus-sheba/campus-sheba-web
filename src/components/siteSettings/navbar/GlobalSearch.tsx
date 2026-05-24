/* eslint-disable jsx-a11y/role-has-required-aria-props */
/* eslint-disable jsx-a11y/role-supports-aria-props */
"use client";

import Image from "next/image";
import { useRouter } from "@/i18n/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { fetchSearchSuggestionsAction } from "@/services/search";
import type { SearchCategoryKey, SearchHit } from "@/types/search";
import {
  SEARCH_CATEGORY_ORDER,
  searchCategoryListUrl,
  searchHitHref,
  searchHitTitle,
} from "@/utils/search/searchRoutes";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 350;
const TYPE_CHAR_MS = 52;
const DELETE_CHAR_MS = 32;
const PAUSE_TYPED_MS = 2000;
const PAUSE_EMPTY_MS = 450;

const SEARCH_HINT_KEYS = [
  "searchHintBooks",
  "searchHintFood",
  "searchHintBuySell",
  "searchHintLostFound",
  "searchHintShops",
  "searchHintEmergency",
  "searchHintCampus",
] as const;

function useTypingPlaceholder(phrases: string[], active: boolean) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!active || phrases.length === 0) return;

    const current = phrases[phraseIndex] ?? "";
    let timer: ReturnType<typeof setTimeout>;

    if (!isDeleting && charIndex < current.length) {
      timer = setTimeout(() => setCharIndex((c) => c + 1), TYPE_CHAR_MS);
    } else if (!isDeleting && charIndex === current.length) {
      timer = setTimeout(() => setIsDeleting(true), PAUSE_TYPED_MS);
    } else if (isDeleting && charIndex > 0) {
      timer = setTimeout(() => setCharIndex((c) => c - 1), DELETE_CHAR_MS);
    } else {
      timer = setTimeout(() => {
        setIsDeleting(false);
        setPhraseIndex((i) => (i + 1) % phrases.length);
      }, PAUSE_EMPTY_MS);
    }

    return () => clearTimeout(timer);
  }, [active, phrases, phraseIndex, charIndex, isDeleting]);

  const typed = (phrases[phraseIndex] ?? "").slice(0, charIndex);
  return { typed, phraseIndex };
}

function SearchTypingPlaceholder({
  prefix,
  phrases,
}: {
  prefix: string;
  phrases: string[];
}) {
  const { typed, phraseIndex } = useTypingPlaceholder(phrases, true);

  return (
    <div
      className="pointer-events-none absolute left-9 right-10 top-1/2 z-10 flex min-w-0 -translate-y-1/2 items-center overflow-hidden text-sm leading-none"
      aria-hidden
    >
      {/* <span className="shrink-0 text-neutral-400">{prefix} </span> */}
      <span
        key={phraseIndex}
        className="animate-search-hint-in min-w-0 truncate text-neutral-500"
      >
        {typed}
      </span>
      <span
        className="ml-0.5 inline-block h-[1.05em] w-[2px] shrink-0 animate-pulse bg-[#E30A13]/80"
        aria-hidden
      />
    </div>
  );
}

const CATEGORY_LABEL_KEYS: Record<SearchCategoryKey, string> = {
  books: "searchCatBooks",
  food: "searchCatFood",
  buySell: "searchCatBuySell",
  products: "searchCatProducts",
  lostAndFound: "searchCatLostFound",
  shops: "searchCatShops",
  emergency: "searchCatEmergency",
  campusLocations: "searchCatCampus",
};

type Props = {
  universityId?: string;
  className?: string;
  inputClassName?: string;
  onNavigate?: () => void;
};

export default function GlobalSearch({
  universityId,
  className = "",
  inputClassName = "",
  onNavigate,
}: Props) {
  const t = useTranslations("common.navbar");
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] =
    useState<Awaited<ReturnType<typeof fetchSearchSuggestionsAction>>>(null);

  const hintPhrases = SEARCH_HINT_KEYS.map((key) => t(key));
  const prefix = t("searchPlaceholderPrefix");
  const showTypingPlaceholder = query.length === 0;

  const runSearch = useCallback(
    async (q: string) => {
      if (q.trim().length < MIN_QUERY_LENGTH) {
        setData(null);
        setError(null);
        setLoading(false);
        return;
      }
      if (!universityId) {
        setData(null);
        setError(t("searchSelectCampus"));
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await fetchSearchSuggestionsAction(q, universityId);
        setData(res);
        if (!res) {
          setError(t("searchFailed"));
        }
      } catch {
        setData(null);
        setError(t("searchFailed"));
      } finally {
        setLoading(false);
      }
    },
    [universityId, t],
  );

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      void runSearch(query);
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [query, open, runSearch]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const goToSearchPage = () => {
    const q = query.trim();
    if (q.length < MIN_QUERY_LENGTH) return;
    setOpen(false);
    onNavigate?.();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const onSelectHit = (item: SearchHit) => {
    setOpen(false);
    setQuery("");
    onNavigate?.();
    router.push(searchHitHref(item));
  };

  const buckets = data?.results ?? {};
  const hasResults =
    data != null &&
    SEARCH_CATEGORY_ORDER.some((key) => (buckets[key]?.items?.length ?? 0) > 0);

  const showPanel = open && query.trim().length >= MIN_QUERY_LENGTH;

  const defaultInputClass =
    "h-10 w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-3 text-sm text-neutral-700 outline-none transition-all placeholder:text-transparent focus:border-[#E30A13]/50 focus:ring-2 focus:ring-[#E30A13]/15";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-neutral-400" />
      {showTypingPlaceholder ? (
        <SearchTypingPlaceholder prefix={prefix} phrases={hintPhrases} />
      ) : null}
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            goToSearchPage();
          }
          if (e.key === "Escape") {
            setOpen(false);
            inputRef.current?.blur();
          }
        }}
        placeholder={showTypingPlaceholder ? "" : t("searchPlaceholder")}
        className={inputClassName || defaultInputClass}
        aria-label={t("searchAria")}
        aria-expanded={showPanel}
        aria-controls="global-search-results"
        autoComplete="off"
      />
      {loading ? (
        <Loader2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-neutral-400" />
      ) : null}

      {showPanel ? (
        <div
          id="global-search-results"
          role="listbox"
          className="absolute left-0 right-0 top-full z-[60] mt-2 max-h-[min(70vh,420px)] overflow-y-auto rounded-2xl border border-neutral-100 bg-white py-2 shadow-xl"
        >
          {!universityId ? (
            <p className="px-4 py-3 text-sm text-amber-700">
              {t("searchSelectCampus")}
            </p>
          ) : loading && !data ? (
            <p className="px-4 py-3 text-sm text-neutral-500">
              {t("searchLoading")}
            </p>
          ) : error && !hasResults ? (
            <p className="px-4 py-3 text-sm text-red-600">{error}</p>
          ) : !hasResults ? (
            <p className="px-4 py-3 text-sm text-neutral-500">
              {t("searchNoResults")}
            </p>
          ) : (
            <>
              {SEARCH_CATEGORY_ORDER.map((catKey) => {
                const bucket = buckets[catKey];
                if (!bucket?.items?.length) return null;
                const labelKey = CATEGORY_LABEL_KEYS[catKey];
                return (
                  <div
                    key={catKey}
                    className="border-b border-neutral-50 last:border-0"
                  >
                    <div className="flex items-center justify-between px-4 py-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                        {t(labelKey)}
                        {bucket.total > bucket.items.length
                          ? ` (${bucket.total})`
                          : ""}
                      </p>
                      {bucket.total > bucket.items.length ? (
                        <button
                          type="button"
                          onClick={() => {
                            setOpen(false);
                            onNavigate?.();
                            router.push(searchCategoryListUrl(catKey, query));
                          }}
                          className="text-xs font-semibold text-[#00A651] hover:underline"
                        >
                          {t("searchSeeAll")}
                        </button>
                      ) : null}
                    </div>
                    <ul>
                      {bucket.items.map((item) => (
                        <li key={`${catKey}-${item._id}`}>
                          <button
                            type="button"
                            role="option"
                            onClick={() => onSelectHit(item)}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-neutral-50"
                          >
                            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                              {item.thumbnail ? (
                                <Image
                                  src={item.thumbnail}
                                  alt=""
                                  fill
                                  className="object-cover"
                                  unoptimized={shouldUnoptimizeRemoteImage(
                                    item.thumbnail,
                                  )}
                                />
                              ) : (
                                <span className="flex h-full items-center justify-center text-[10px] text-neutral-300">
                                  —
                                </span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-neutral-900">
                                {searchHitTitle(item)}
                              </p>
                              {item.author ? (
                                <p className="truncate text-xs text-neutral-500">
                                  {item.author}
                                </p>
                              ) : item.type ? (
                                <p className="truncate text-xs text-neutral-500">
                                  {item.type}
                                </p>
                              ) : null}
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
              <div className="border-t border-neutral-100 px-4 py-2">
                <button
                  type="button"
                  onClick={goToSearchPage}
                  className="w-full rounded-lg py-2 text-center text-sm font-semibold text-[#00A651] hover:bg-emerald-50"
                >
                  {t("searchViewAll", { query: data?.query ?? query })}
                </button>
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
