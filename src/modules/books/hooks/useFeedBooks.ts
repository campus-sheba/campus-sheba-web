import { useEffect, useState } from "react";
import {
  fetchSeniorPicksFeed,
  fetchSemesterFeed,
  fetchDepartmentFeed,
} from "@/services/books";
import type { BookListing } from "@/types/book";

type FeedType = "senior-picks" | "semester" | "department";

type UseFeedBooksOptions = {
  feed: FeedType;
  deptId?: string;
  pageSize?: number;
  enabled?: boolean;
};

export function useFeedBooks({
  feed,
  deptId,
  pageSize = 8,
  enabled = true,
}: UseFeedBooksOptions) {
  const [items, setItems] = useState<BookListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setItems([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    void (async () => {
      try {
        let res;
        if (feed === "senior-picks") {
          res = await fetchSeniorPicksFeed(1, pageSize);
        } else if (feed === "semester") {
          res = await fetchSemesterFeed(1, pageSize);
        } else if (feed === "department" && deptId) {
          res = await fetchDepartmentFeed(deptId, 1, pageSize);
        } else {
          res = { data: [] as BookListing[], total: 0, page: 1, limit: pageSize };
        }
        if (!cancelled) {
          setItems(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load feed.");
          setItems([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [feed, deptId, pageSize, enabled]);

  return { items, isLoading, error };
}
