/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useAppState } from "@/contexts/AppStateContext";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import { fetchHomeFeedAction } from "@/services/home";
import type { HomeFeed } from "@/types/home";
import HomeFeedSection from "./HomeFeedSection";

function FeedSkeleton() {
  return (
    <div className="space-y-10">
      {Array.from({ length: 3 }).map((_, row) => (
        <div key={row}>
          <div className="mb-3 h-6 w-44 animate-pulse rounded bg-gray-200" />
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-56 w-44 shrink-0 animate-pulse rounded-2xl bg-gray-100" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Server-driven home screen. Renders the ordered `sections` from
 * `GET /user/home/feed`, one generic renderer per `type`. Resilient by design:
 * we render whatever shelves arrive and never block on `failedSections`.
 */
export default function ServerDrivenHomeFeed() {
  const { state } = useAppState();
  const universityId = state.university.selected?._id;
  const isAuthed = state.auth.isAuthenticated;
  // Guests must scope by campus; authed users are scoped by their JWT.
  const ready = isAuthed || Boolean(universityId);

  const [feed, setFeed] = useState<HomeFeed | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) {
      setFeed(null);
      setLoading(false);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    void fetchHomeFeedAction({ platform: "web_app", universityId })
      .then((res) => {
        if (cancelled) return;
        if (res.success) setFeed(res.data);
        else setError(res.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ready, universityId, isAuthed]);

  const sections = feed?.sections ?? [];

  return (
    <SectionWrapper spacing="none" background="transparent" className="my-0 py-6 md:py-10">
      <ContentWrapper maxWidth="max-w-7xl mx-auto" padding="none" className="px-4 md:px-8">
        {!ready ? (
          <p className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
            Select your university in the header to see your campus home.
          </p>
        ) : loading && sections.length === 0 ? (
          <FeedSkeleton />
        ) : error && sections.length === 0 ? (
          <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-6 text-center text-sm text-red-700">
            {error}
          </p>
        ) : sections.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
            Nothing to show yet — check back soon.
          </p>
        ) : (
          <div className="space-y-10 md:space-y-12">
            {sections.map((section) => (
              <HomeFeedSection key={section.key} section={section} />
            ))}
          </div>
        )}
      </ContentWrapper>
    </SectionWrapper>
  );
}
