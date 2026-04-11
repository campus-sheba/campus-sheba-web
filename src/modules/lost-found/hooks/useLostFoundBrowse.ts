import { useCallback, useEffect, useState } from "react";
import { fetchLostFoundBrowse } from "@/services/lost-and-found";
import type { LostFoundPost } from "@/types/lost-and-found";

type Options = {
  guestMode: boolean;
  universityId?: string;
  debouncedTitle: string;
  category?: string;
  type?: LostFoundPost["type"] | "";
  pageSize?: number;
  enabled?: boolean;
};

export function useLostFoundBrowse({
  guestMode,
  universityId,
  debouncedTitle,
  category,
  type,
  pageSize = 12,
  enabled = true,
}: Options) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<LostFoundPost[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
    setItems([]);
  }, [guestMode, universityId, debouncedTitle, category, type, enabled]);

  useEffect(() => {
    if (!enabled) {
      setItems([]);
      setTotal(0);
      setIsLoading(false);
      return;
    }
    if (guestMode && !universityId) {
      setItems([]);
      setTotal(0);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    void (async () => {
      try {
        const res = await fetchLostFoundBrowse({
          guestMode,
          university: guestMode ? universityId : undefined,
          page,
          limit: pageSize,
          title: debouncedTitle.trim() || undefined,
          category: category || undefined,
          type: type || undefined,
        });
        if (cancelled) return;
        setTotal(res.total);
        setItems((prev) => (page === 1 ? res.data : [...prev, ...res.data]));
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, guestMode, universityId, page, debouncedTitle, category, type, pageSize]);

  const loadMore = useCallback(() => {
    if (isLoading || items.length >= total) return;
    setPage((p) => p + 1);
  }, [isLoading, items.length, total]);

  const hasMore = items.length < total;

  return { items, total, isLoading, error, hasMore, loadMore };
}
