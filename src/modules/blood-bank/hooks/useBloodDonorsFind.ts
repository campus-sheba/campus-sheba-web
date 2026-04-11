import { useCallback, useEffect, useState } from "react";
import { fetchBloodDonorsFind } from "@/services/blood-donor";
import type { BloodDonorRow } from "@/types/blood-donor";

type Options = {
  guestMode: boolean;
  universityId?: string;
  pageSize?: number;
  bloodGroup?: string;
  search?: string;
  hall?: string;
  department?: string;
  campusLocation?: string;
  isAvailable?: boolean;
  enabled?: boolean;
};

export function useBloodDonorsFind({
  guestMode,
  universityId,
  pageSize = 12,
  bloodGroup,
  search,
  hall,
  department,
  campusLocation,
  isAvailable,
  enabled = true,
}: Options) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<BloodDonorRow[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
    setItems([]);
  }, [
    guestMode,
    universityId,
    bloodGroup,
    search,
    hall,
    department,
    campusLocation,
    isAvailable,
    enabled,
    pageSize,
  ]);

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
        const res = await fetchBloodDonorsFind({
          guestMode,
          university: guestMode ? universityId : undefined,
          page,
          limit: pageSize,
          bloodGroup: bloodGroup || undefined,
          search: search?.trim() || undefined,
          hall: hall || undefined,
          department: department || undefined,
          campusLocation: campusLocation?.trim() || undefined,
          isAvailable,
        });
        if (cancelled) return;
        setTotal(res.total);
        setItems((prev) => (page === 1 ? res.data : [...prev, ...res.data]));
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load donors.");
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
    guestMode,
    universityId,
    page,
    pageSize,
    bloodGroup,
    search,
    hall,
    department,
    campusLocation,
    isAvailable,
  ]);

  const loadMore = useCallback(() => {
    if (isLoading || items.length >= total) return;
    setPage((p) => p + 1);
  }, [isLoading, items.length, total]);

  const hasMore = items.length < total;

  return { items, total, isLoading, error, hasMore, loadMore };
}
