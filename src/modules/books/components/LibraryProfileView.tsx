"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";
import { BookMarked, BookOpen, UserPlus, UserMinus } from "lucide-react";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import { Button } from "@/components/ui";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import { useAppState } from "@/contexts/AppStateContext";
import {
  fetchLibraryHubAction,
  fetchMyLibraryProfileAction,
  followLibraryAction,
  unfollowLibraryAction,
} from "@/services/user-library";
import {
  resolveLibraryOwnerId,
  type BookListing,
  type LibraryHubData,
  type ReadingListEntry,
} from "@/types/book";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";

type ShelfTab = "showcase" | "promoted" | "soldOut";

function booksForTab(hub: LibraryHubData | null, tab: ShelfTab): BookListing[] {
  if (!hub) return [];
  if (tab === "showcase") return hub.shelves.showcase ?? [];
  if (tab === "promoted") return hub.shelves.promoted ?? [];
  return hub.shelves.soldOut ?? [];
}

function allReadingEntries(hub: LibraryHubData | null): ReadingListEntry[] {
  if (!hub) return [];
  const grouped = hub.readingListByStatus;
  if (!grouped) return hub.profile.readingList ?? [];
  return [
    ...(grouped.reading ?? []),
    ...(grouped.completed ?? []),
    ...(grouped.wishlist ?? []),
  ];
}

export default function LibraryProfileView() {
  const params = useParams();
  const profileId =
    typeof params?.profileId === "string" ? params.profileId : "";
  const router = useRouter();
  const { state, dispatch } = useAppState();
  const currentUserId = state.user.profile?._id;
  const isLoggedIn = state.auth.isAuthenticated;

  const [hub, setHub] = useState<LibraryHubData | null>(null);
  const [myProfileId, setMyProfileId] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [shelfTab, setShelfTab] = useState<ShelfTab>("showcase");

  const load = useCallback(async () => {
    if (!profileId) return;
    setLoading(true);
    setError(null);
    try {
      if (isLoggedIn) {
        const mine = await fetchMyLibraryProfileAction();
        if (mine.success && mine.data) {
          setMyProfileId(mine.data._id);
          if (mine.data._id === profileId) {
            router.replace("/my-library");
            return;
          }
          setIsFollowing(mine.data.following?.includes(profileId) ?? false);
        }
      }
      const res = await fetchLibraryHubAction(profileId);
      if (!res.success || !res.data) {
        setError(res.message ?? "Profile not found or private.");
        setHub(null);
      } else {
        setHub(res.data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, [profileId, isLoggedIn, router]);

  useEffect(() => {
    void load();
  }, [load]);

  const profile = hub?.profile ?? null;
  const shelfBooks = booksForTab(hub, shelfTab);
  const readingList = allReadingEntries(hub);
  const followerCount =
    profile?.followersCount ?? profile?.followers?.length ?? 0;

  const toggleFollow = () => {
    if (!isLoggedIn) {
      dispatch({ type: "OPEN_AUTH_MODAL", payload: { defaultTab: "login" } });
      return;
    }
    if (!myProfileId) {
      setMsg("Create your library profile first at My Library.");
      return;
    }
    startTransition(async () => {
      const res = isFollowing
        ? await unfollowLibraryAction(profileId)
        : await followLibraryAction(profileId);
      setMsg(
        res.success
          ? isFollowing
            ? "Unfollowed."
            : "Following!"
          : res.message,
      );
      if (res.success) {
        setIsFollowing(!isFollowing);
        void load();
      }
    });
  };

  const shelfTabs: { id: ShelfTab; label: string }[] = [
    { id: "showcase", label: "Showcase" },
    { id: "promoted", label: "Listed for sale" },
    { id: "soldOut", label: "Sold out" },
  ];

  return (
    <SectionWrapper spacing="none" background="transparent" className="my-0">
      <ContentWrapper padding="md" className="mx-auto max-w-3xl pb-16 pt-2">
        <AppBreadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Books", href: "/books" },
            { label: "Libraries", href: "/books/libraries" },
          ]}
        />

        {loading ? (
          <p className="mt-8 text-sm text-gray-500">Loading profile…</p>
        ) : error ? (
          <div className="mt-8 rounded-xl border border-red-100 bg-red-50 px-4 py-6 text-center">
            <p className="text-sm text-red-700">{error}</p>
            <Link
              href="/books"
              className="mt-3 inline-block text-sm font-semibold text-[#E30B12]"
            >
              ← Back to books
            </Link>
          </div>
        ) : profile ? (
          <div className="mt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E30B12]/10 text-[#E30B12]">
                  <BookMarked className="h-6 w-6" />
                </span>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {profile.displayName}
                  </h1>
                  {profile.bio ? (
                    <p className="mt-2 text-sm text-gray-600">{profile.bio}</p>
                  ) : null}
                  <p className="mt-2 text-xs text-gray-500">
                    Reputation {profile.reputationScore} ·{" "}
                    {profile.totalBooksShared} books shared · {followerCount}{" "}
                    followers
                  </p>
                  {profile.badges?.length ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {profile.badges.map((badge) => (
                        <span
                          key={badge}
                          className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800"
                        >
                          {badge.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
              {currentUserId &&
              resolveLibraryOwnerId(profile.owner) !== currentUserId ? (
                <Button
                  type="button"
                  variant={isFollowing ? "outline" : "primary"}
                  uppercase={false}
                  className="gap-2 shrink-0"
                  disabled={isPending}
                  onClick={toggleFollow}
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="h-4 w-4" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Follow
                    </>
                  )}
                </Button>
              ) : null}
            </div>

            {msg ? (
              <p className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                {msg}
              </p>
            ) : null}

            <section className="mt-10">
              <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-2">
                {shelfTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setShelfTab(tab.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      shelfTab === tab.id
                        ? "bg-[#E30B12] text-white"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <h2 className="mt-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                <BookOpen className="h-4 w-4 text-[#E30B12]" />
                Bookshelf
              </h2>

              {!shelfBooks.length ? (
                <p className="mt-4 text-sm text-gray-500">
                  No books in this section yet.
                </p>
              ) : (
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {shelfBooks.map((book) => {
                    const photo = book.photos?.[0]?.url;
                    return (
                      <li
                        key={book._id}
                        className="flex gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm"
                      >
                        <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {photo ? (
                            <Image
                              src={photo}
                              alt={book.title}
                              fill
                              className="object-cover"
                              unoptimized={shouldUnoptimizeRemoteImage(photo)}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-gray-300">
                              <BookOpen className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/books/${book._id}`}
                            className="line-clamp-2 font-semibold text-gray-900 hover:text-[#E30B12]"
                          >
                            {book.title}
                          </Link>
                          {book.author ? (
                            <p className="text-xs text-gray-500">{book.author}</p>
                          ) : null}
                          {book.price != null && book.price > 0 ? (
                            <p className="mt-1 text-xs font-semibold text-[#E30B12]">
                              ৳{book.price.toLocaleString()}
                            </p>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section className="mt-10">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Reading list
              </h2>
              {!readingList.length ? (
                <p className="mt-4 text-sm text-gray-500">
                  No books on this reading list yet.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {readingList.map((entry) => {
                    const book = entry.book;
                    const photo = book?.photos?.[0]?.url;
                    return (
                      <li
                        key={`${book._id}-${entry.status}`}
                        className="flex gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm"
                      >
                        <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {photo ? (
                            <Image
                              src={photo}
                              alt={book.title}
                              fill
                              className="object-cover"
                              unoptimized={shouldUnoptimizeRemoteImage(photo)}
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/books/${book._id}`}
                            className="font-semibold text-gray-900 hover:text-[#E30B12]"
                          >
                            {book.title}
                          </Link>
                          {book.author ? (
                            <p className="text-xs text-gray-500">{book.author}</p>
                          ) : null}
                          <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium capitalize text-gray-700">
                            {entry.status}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>
        ) : null}
      </ContentWrapper>
    </SectionWrapper>
  );
}
