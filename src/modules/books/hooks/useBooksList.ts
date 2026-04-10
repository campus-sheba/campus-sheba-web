import { useCallback, useEffect, useState } from "react";
import { fetchUserBooksList } from "@/services/books";
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
  enabled = true,
}: UseBooksListOptions) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<BookListing[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    void (async () => {
      try {
        const res = await fetchUserBooksList({
          page,
          limit: pageSize,
          university: universityId,
          searchKey: debouncedSearch.trim() || undefined,
          category,
          minPrice,
          maxPrice,
          type,
          quality,
          year,
          department,
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
    debouncedSearch,
    pageSize,
    category,
    minPrice,
    maxPrice,
    type,
    quality,
    year,
    department,
  ]);

  const loadMore = useCallback(() => {
    if (isLoading || items.length >= total) return;
    setPage((p) => p + 1);
  }, [isLoading, items.length, total]);

  const hasMore = items.length < total;

  return {
    items,
    total,
    page,
    isLoading,
    error,
    hasMore,
    loadMore,
  };
}
