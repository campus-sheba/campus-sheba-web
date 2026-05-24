import { useEffect, useState } from "react";
import { fetchBluebookHomeFeed } from "@/services/books";
import type { BluebookHomeFeed } from "@/types/book";

export function useBluebookHomeFeed(universityId?: string, enabled = true) {
  const [feed, setFeed] = useState<BluebookHomeFeed | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !universityId) {
      setFeed(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    void (async () => {
      try {
        const data = await fetchBluebookHomeFeed(universityId);
        if (!cancelled) setFeed(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load home feed.");
          setFeed(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [universityId, enabled]);

  return { feed, isLoading, error };
}
