import { useCallback, useEffect, useRef, useState } from "react";
import { fetchBooksBrowse, type BooksBrowseParams } from "@/services/books";
import type { BookListing, BrowseSegment } from "@/types/book";

type UseBooksBrowseOptions = {
  segment: BrowseSegment;
  universityId?: string;
  debouncedSearch?: string;
  pageSize?: number;
  enabled?: boolean;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  type?: string;
  quality?: string;
  year?: string;
  department?: string;
  semester?: string;
  courseCode?: string;
};

export function useBooksBrowse({
  segment,
  universityId,
  debouncedSearch = "",
  pageSize = 12,
  enabled = true,
  category,
  minPrice,
  maxPrice,
  type,
  quality,
  year,
  department,
  semester,
  courseCode,
}: UseBooksBrowseOptions) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<BookListing[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastActionRef = useRef<"replace" | "append">("replace");

  useEffect(() => {
    lastActionRef.current = "replace";
    setPage(1);
    setItems([]);
  }, [
    segment,
    universityId,
    debouncedSearch,
    pageSize,
    enabled,
    category,
    minPrice,
    maxPrice,
    type,
    quality,
    year,
    department,
    semester,
    courseCode,
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
        const res = await fetchBooksBrowse({
          segment,
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
          semester,
          courseCode,
        });
        if (cancelled) return;
        const rows = Array.isArray(res.data) ? res.data : [];
        setTotal(typeof res.total === "number" ? res.total : rows.length);
        setItems((prev) =>
          lastActionRef.current === "append" && page > 1 ? [...prev, ...rows] : rows,
        );
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
    segment,
    universityId,
    page,
    debouncedSearch,
    pageSize,
    enabled,
    category,
    minPrice,
    maxPrice,
    type,
    quality,
    year,
    department,
    semester,
    courseCode,
  ]);

  const goToPage = useCallback((p: number) => {
    if (p < 1 || isLoading) return;
    lastActionRef.current = "replace";
    setPage(p);
  }, [isLoading]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return { items, total, page, totalPages, isLoading, error, goToPage };
}
