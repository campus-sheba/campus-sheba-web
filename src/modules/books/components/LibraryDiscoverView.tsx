"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { BookMarked, Crown, Search, Trophy, Users } from "lucide-react";
import { Link } from "@/i18n/navigation";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import { useAppState } from "@/contexts/AppStateContext";
import {
  fetchLibraryLeaderboardAction,
  listLibraryProfilesAction,
} from "@/services/user-library";
import type {
  LibraryLeaderboardEntry,
  LibraryProfileCard,
  LibrarySortBy,
} from "@/types/book";
import { resolveProfilePhotoUrl } from "@/utils/media/profilePhoto";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";

const RANK_STYLES = [
  "bg-amber-400 text-white", // 1
  "bg-gray-300 text-gray-800", // 2
  "bg-orange-300 text-white", // 3
];

function LeaderboardSection({ universityId }: { universityId?: string }) {
  const [entries, setEntries] = useState<LibraryLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!universityId) {
        if (!cancelled) {
          setEntries([]);
          setLoading(false);
        }
        return;
      }
      if (!cancelled) setLoading(true);
      const res = await fetchLibraryLeaderboardAction({
        university: universityId,
        limit: 5,
      });
      if (cancelled) return;
      setEntries(res.success ? res.data : []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [universityId]);

  if (loading) {
    return (
      <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50/40 p-4">
        <p className="text-sm text-gray-500">Loading top bookshelves…</p>
      </div>
    );
  }
  if (!entries.length) return null;

  return (
    <div className="mt-6 rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/70 to-white p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-amber-500" />
        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700">
          Top bookshelves
        </h2>
      </div>
      <ol className="mt-3 space-y-2">
        {entries.map((entry, i) => (
          <li key={entry._id}>
            <Link
              href={`/books/library/${entry._id}`}
              className="flex items-center gap-3 rounded-xl bg-white/80 px-3 py-2 transition hover:bg-white hover:shadow-sm"
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  RANK_STYLES[i] ?? "bg-gray-100 text-gray-600"
                }`}
              >
                {i === 0 ? <Crown className="h-4 w-4" /> : i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-gray-900">
                  {entry.displayName}
                </p>
                <p className="text-[11px] font-medium text-gray-500">
                  Rep {entry.reputationScore} · {entry.totalBooksShared ?? 0}{" "}
                  shared · {entry.followersCount} followers
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

const SORT_OPTIONS: { value: LibrarySortBy; label: string }[] = [
  { value: "reputation", label: "Reputation" },
  { value: "recent", label: "Recently joined" },
  { value: "followers", label: "Most followed" },
];

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-[#E30B12] focus:ring-2 focus:ring-[#E30B12]/15";

function ownerPhotoUrl(card: LibraryProfileCard): string | null {
  const owner = card.owner;
  if (!owner || typeof owner !== "object" || !("photo" in owner)) return null;
  const url = resolveProfilePhotoUrl(owner.photo);
  return url === "/assets/images/blank-phone.svg" ? null : url;
}

function ownerName(card: LibraryProfileCard): string | undefined {
  const owner = card.owner;
  if (owner && typeof owner === "object" && "name" in owner) {
    return owner.name;
  }
  return undefined;
}

export default function LibraryDiscoverView() {
  const { state } = useAppState();
  const universityId =
    state.university.selected?._id ?? state.user.profile?.university?._id;

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<LibrarySortBy>("reputation");
  const [page, setPage] = useState(1);
  const [cards, setCards] = useState<LibraryProfileCard[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const limit = 20;

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await listLibraryProfilesAction({
      search: debouncedSearch || undefined,
      university: universityId,
      sortBy,
      page,
      limit,
    });
    setLoading(false);
    if (!res.success) {
      setError(res.message ?? "Could not load libraries.");
      setCards([]);
      setTotal(0);
      return;
    }
    setCards(res.data);
    setTotal(res.total);
  }, [debouncedSearch, universityId, sortBy, page]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sortBy, universityId]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <SectionWrapper spacing="none" background="transparent" className="my-0">
      <ContentWrapper padding="md" className="mx-auto max-w-4xl pb-16 pt-2">
        <AppBreadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Books", href: "/books" },
            { label: "Campus libraries" },
          ]}
        />

        <div className="mt-4">
          <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <BookMarked className="h-6 w-6 text-[#E30B12]" />
            Campus libraries
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Discover student bookshelves and reading lists on your campus.
          </p>
        </div>

        {!universityId ? (
          <p className="mt-8 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-600">
            Choose a university in the top bar to browse libraries on your
            campus.
          </p>
        ) : (
          <>
            <LeaderboardSection universityId={universityId} />

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or bio…"
                  className={`${inputClass} pl-9`}
                  aria-label="Search libraries"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as LibrarySortBy)}
                className={`${inputClass} sm:w-44`}
                aria-label="Sort libraries"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {error ? (
              <p className="mt-6 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            {loading ? (
              <p className="mt-8 text-sm text-gray-500">Loading libraries…</p>
            ) : !cards.length ? (
              <p className="mt-8 text-sm text-gray-500">
                No public libraries found. Be the first —{" "}
                <Link
                  href="/my-library"
                  className="font-semibold text-[#E30B12] hover:underline"
                >
                  create yours
                </Link>
                .
              </p>
            ) : (
              <>
                <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                  {cards.map((card) => {
                    const photo = ownerPhotoUrl(card);
                    const name = ownerName(card);
                    return (
                      <li key={card._id}>
                        <Link
                          href={`/books/library/${card._id}`}
                          className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-[#E30B12]/30 hover:shadow-md"
                        >
                          <div className="flex items-start gap-3">
                            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E30B12]/10 text-[#E30B12]">
                              {photo ? (
                                <Image
                                  src={photo}
                                  alt=""
                                  fill
                                  className="object-cover"
                                  unoptimized={shouldUnoptimizeRemoteImage(
                                    photo,
                                  )}
                                />
                              ) : (
                                <BookMarked className="h-5 w-5" />
                              )}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-gray-900">
                                {card.displayName}
                              </p>
                              {name ? (
                                <p className="text-xs text-gray-500">{name}</p>
                              ) : null}
                              {card.bio ? (
                                <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                                  {card.bio}
                                </p>
                              ) : null}
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-gray-600">
                            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-700">
                              Rep {card.reputationScore}
                            </span>
                            <span className="rounded-full bg-sky-50 px-2 py-0.5 text-sky-700">
                              {card.totalBooksShared} shared
                            </span>
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-gray-100 px-2 py-0.5">
                              <Users className="h-3 w-3" />
                              {card.followersCount}
                            </span>
                          </div>
                          <span className="mt-3 text-xs font-semibold text-[#E30B12]">
                            View profile →
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                {totalPages > 1 ? (
                  <div className="mt-6 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-700 disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-500">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-700 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </>
        )}
      </ContentWrapper>
    </SectionWrapper>
  );
}
