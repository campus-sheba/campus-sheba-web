import { useCallback, useEffect, useState } from "react";
import { fetchBloodRequestsPublic } from "@/services/blood-donor";
import type { BloodRequestRow } from "@/types/blood-donor";

type Options = {
  guestMode: boolean;
  universityId?: string;
  pageSize?: number;
  status?: string;
  enabled?: boolean;
};

export function useBloodRequestsList({
  guestMode,
  universityId,
  pageSize = 12,
  status,
  enabled = true,
}: Options) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<BloodRequestRow[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
    setItems([]);
  }, [guestMode, universityId, status, enabled, pageSize]);

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
        const res = await fetchBloodRequestsPublic({
          guestMode,
          university: guestMode ? universityId : undefined,
          page,
          limit: pageSize,
          status: status || undefined,
        });
        if (cancelled) return;
        setTotal(res.total);
        setItems((prev) => (page === 1 ? res.data : [...prev, ...res.data]));
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load requests.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, guestMode, universityId, page, pageSize, status]);

  const loadMore = useCallback(() => {
    if (isLoading || items.length >= total) return;
    setPage((p) => p + 1);
  }, [isLoading, items.length, total]);

  const hasMore = items.length < total;

  return { items, total, isLoading, error, hasMore, loadMore };
}
