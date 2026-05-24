"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { BookOpen, Check, Loader2, Plus, Search, X } from "lucide-react";

import { fetchUserBooksList } from "@/services/books";
import { addToReadingListAction } from "@/services/user-library";
import type { BookListing, ReadingStatus } from "@/types/book";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";

const READING_STATUSES: ReadingStatus[] = ["reading", "completed", "wishlist"];
const MIN_QUERY = 2;
const DEBOUNCE_MS = 300;

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-[#E30B12] focus:ring-2 focus:ring-[#E30B12]/15";

function readingStatusLabel(status: ReadingStatus): string {
  if (status === "reading") return "Reading";
  if (status === "completed") return "Completed";
  return "Wishlist";
}

type ReadingListAddProps = {
  /** Book IDs already on the reading list — used to flag duplicates inline. */
  existingIds: Set<string>;
  /** Called after a book is successfully added, so the parent can refresh. */
  onAdded: () => void;
  /** Surface success/error feedback through the page-level message banner. */
  onMessage: (msg: { ok: boolean; text: string }) => void;
};

/**
 * Type-to-search picker for the reading list. The user searches campus books by
 * title or author and picks one from the dropdown — the book ID is resolved and
 * submitted under the hood, so no one ever has to copy a raw ID.
 */
export default function ReadingListAdd({
  existingIds,
  onAdded,
  onMessage,
}: ReadingListAddProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ReadingStatus>("reading");
  const [results, setResults] = useState<BookListing[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search — fires once the user pauses, and ignores stale responses.
  useEffect(() => {
    const q = query.trim();
    if (q.length < MIN_QUERY) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    let cancelled = false;
    const timer = setTimeout(() => {
      void (async () => {
        try {
          const res = await fetchUserBooksList({ searchKey: q, limit: 8 });
          if (cancelled) return;
          setResults(res.data);
          setOpen(true);
        } catch {
          if (!cancelled) setResults([]);
        } finally {
          if (!cancelled) setSearching(false);
        }
      })();
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  // Dismiss the dropdown when clicking outside the widget.
  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const add = (book: BookListing) => {
    if (existingIds.has(book._id)) {
      onMessage({
        ok: false,
        text: `"${book.title}" is already on your reading list.`,
      });
      return;
    }
    setAddingId(book._id);
    startTransition(async () => {
      const res = await addToReadingListAction({ bookId: book._id, status });
      setAddingId(null);
      if (res.success) {
        onMessage({
          ok: true,
          text: `Added "${book.title}" to your reading list.`,
        });
        setQuery("");
        setResults([]);
        setOpen(false);
        onAdded();
      } else {
        onMessage({ ok: false, text: res.message ?? "Failed to add book." });
      }
    });
  };

  const trimmed = query.trim();

  return (
    <div ref={containerRef} className="relative mt-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            placeholder="Search a book by title or author…"
            className={`${inputClass} pl-9 pr-9`}
            aria-label="Search books to add to your reading list"
          />
          {searching ? (
            <Loader2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
          ) : query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
                setOpen(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ReadingStatus)}
          className={`${inputClass} sm:w-44`}
          aria-label="Reading status for the book you add"
        >
          {READING_STATUSES.map((s) => (
            <option key={s} value={s}>
              {readingStatusLabel(s)}
            </option>
          ))}
        </select>
      </div>

      {open ? (
        <div className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          {trimmed.length < MIN_QUERY ? (
            <p className="px-4 py-3 text-xs text-gray-500">
              Keep typing to search…
            </p>
          ) : searching && results.length === 0 ? (
            <p className="px-4 py-3 text-xs text-gray-500">Searching…</p>
          ) : results.length === 0 ? (
            <p className="px-4 py-3 text-xs text-gray-500">
              No books match &ldquo;{trimmed}&rdquo;.
            </p>
          ) : (
            <ul className="max-h-72 overflow-y-auto py-1">
              {results.map((book) => {
                const photo = book.photos?.[0]?.url;
                const already = existingIds.has(book._id);
                const isAdding = addingId === book._id;
                return (
                  <li key={book._id}>
                    <button
                      type="button"
                      disabled={already || isAdding}
                      onClick={() => add(book)}
                      className="flex w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded bg-gray-100">
                        {photo ? (
                          <Image
                            src={photo}
                            alt={book.title}
                            fill
                            className="object-cover"
                            unoptimized={shouldUnoptimizeRemoteImage(photo)}
                            sizes="36px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-gray-300">
                            <BookOpen className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {book.title}
                        </p>
                        {book.author ? (
                          <p className="truncate text-xs text-gray-500">
                            by {book.author}
                          </p>
                        ) : null}
                      </div>
                      <span className="shrink-0 text-gray-400">
                        {isAdding ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : already ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-600">
                            <Check className="h-3.5 w-3.5" />
                            Added
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#E30B12]">
                            <Plus className="h-3.5 w-3.5" />
                            Add
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
