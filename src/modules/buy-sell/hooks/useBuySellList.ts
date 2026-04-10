import { useCallback, useEffect, useState } from "react";
import { fetchUserBuySellList } from "@/services/buy-sell";
import type { BuySellListing } from "@/types/buy-sell";

type UseBuySellListOptions = {
  universityId?: string;
  debouncedSearch: string;
  pageSize?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  status?: string;
  negotiable?: boolean;
  enabled?: boolean;
};

export function useBuySellList({
  universityId,
  debouncedSearch,
  pageSize = 12,
  category,
  minPrice,
  maxPrice,
  condition,
  status,
  negotiable,
  enabled = true,
}: UseBuySellListOptions) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<BuySellListing[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
    setItems([]);
  }, [universityId, debouncedSearch, category, minPrice, maxPrice, condition, status, negotiable, enabled]);

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
        const res = await fetchUserBuySellList({
          page,
          limit: pageSize,
          university: universityId,
          searchKey: debouncedSearch.trim() || undefined,
          category,
          minPrice,
          maxPrice,
          condition,
          status,
          negotiable,
        });
        if (cancelled) return;
        setTotal(res.total);
        setItems((prev) => (page === 1 ? res.data : [...prev, ...res.data]));
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load listings.");
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
    condition,
    status,
    negotiable,
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
