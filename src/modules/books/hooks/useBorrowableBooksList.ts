import { useCallback, useEffect, useState } from "react";
import { fetchBorrowableBooks } from "@/services/books";
import type { BookListing } from "@/types/book";

type UseBorrowableBooksListOptions = {
  universityId?: string;
  pageSize?: number;
  semester?: string;
  courseCode?: string;
  quality?: string;
  availabilityStatus?: string;
  allowsExtension?: boolean;
  enabled?: boolean;
};

export function useBorrowableBooksList({
  universityId,
  pageSize = 12,
  semester,
  courseCode,
  quality,
  availabilityStatus = "Available",
  allowsExtension,
  enabled = true,
}: UseBorrowableBooksListOptions) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<BookListing[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
    setItems([]);
  }, [universityId, semester, courseCode, quality, availabilityStatus, allowsExtension, enabled]);

  useEffect(() => {
    if (!enabled || !universityId) {
      setItems([]);
      setTotal(0);
      setIsLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    void (async () => {
      try {
        const res = await fetchBorrowableBooks({
          page,
          limit: pageSize,
          university: universityId,
          semester,
          courseCode,
          quality,
          availabilityStatus,
          allowsExtension,
        });
        if (cancelled) return;
        const rows = Array.isArray(res.data) ? res.data : [];
        setTotal(typeof res.total === "number" ? res.total : rows.length);
        setItems((prev) => (page === 1 ? rows : [...prev, ...rows]));
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load books.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    enabled,
    universityId,
    page,
    pageSize,
    semester,
    courseCode,
    quality,
    availabilityStatus,
    allowsExtension,
  ]);

  const loadMore = useCallback(() => {
    if (isLoading || items.length >= total) return;
    setPage((p) => p + 1);
  }, [isLoading, items.length, total]);

  return { items, total, isLoading, error, hasMore: items.length < total, loadMore };
}
