import { useCallback, useEffect, useState } from "react";
import { fetchBorrowableBooks, fetchUserBooksList } from "@/services/books";
import type { BookListing } from "@/types/book";

type UseBooksListOptions = {
  universityId?: string;
  debouncedSearch: string;
  pageSize?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  type?: string;
  quality?: string;
  year?: string;
  department?: string;
  semester?: string;
  courseCode?: string;
  language?: string;
  availabilityStatus?: string;
  allowsExtension?: boolean;
  minBorrowDuration?: number;
  maxBorrowDuration?: number;
  /** When true and type is Lending, uses GET /user/books/borrowable */
  useBorrowableEndpoint?: boolean;
  enabled?: boolean;
};

export function useBooksList({
  universityId,
  debouncedSearch,
  pageSize = 12,
  category,
  minPrice,
  maxPrice,
  type,
  quality,
  year,
  department,
  semester,
  courseCode,
  language,
  availabilityStatus,
  allowsExtension,
  minBorrowDuration,
  maxBorrowDuration,
  useBorrowableEndpoint = false,
  enabled = true,
}: UseBooksListOptions) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<BookListing[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isBorrowable =
    useBorrowableEndpoint && (type === "Lending" || !type);

  useEffect(() => {
    setPage(1);
    setItems([]);
  }, [
    universityId,
    debouncedSearch,
    category,
    minPrice,
    maxPrice,
    type,
    quality,
    year,
    department,
    semester,
    courseCode,
    language,
    availabilityStatus,
    allowsExtension,
    minBorrowDuration,
    maxBorrowDuration,
    useBorrowableEndpoint,
    enabled,
  ]);

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

    const listParams = {
      page,
      limit: pageSize,
      university: universityId,
      searchKey: debouncedSearch.trim() || undefined,
      category,
      minPrice,
      maxPrice,
      type: isBorrowable ? undefined : type,
      quality,
      year,
      department,
      semester,
      courseCode,
      language,
      availabilityStatus,
      allowsExtension,
      minBorrowDuration,
      maxBorrowDuration,
    };

    void (async () => {
      try {
        const res = isBorrowable
          ? await fetchBorrowableBooks(listParams)
          : await fetchUserBooksList(listParams);
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
    debouncedSearch,
    pageSize,
    category,
    minPrice,
    maxPrice,
    type,
    quality,
    year,
    department,
    semester,
    courseCode,
    language,
    availabilityStatus,
    allowsExtension,
    minBorrowDuration,
    maxBorrowDuration,
    isBorrowable,
  ]);

  const loadMore = useCallback(() => {
    if (isLoading || items.length >= total) return;
    setPage((p) => p + 1);
  }, [isLoading, items.length, total]);

  const hasMore = items.length < total;

  return { items, total, page, isLoading, error, hasMore, loadMore };
}
