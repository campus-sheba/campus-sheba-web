"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";
import { BookMarked, UserPlus, UserMinus } from "lucide-react";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import { Button } from "@/components/ui";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import { useAppState } from "@/contexts/AppStateContext";
import {
  fetchLibraryProfileByIdAction,
  fetchMyLibraryProfileAction,
  followLibraryAction,
  unfollowLibraryAction,
} from "@/services/user-library";
import type { UserLibraryProfile } from "@/types/book";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";

export default function LibraryProfileView() {
  const params = useParams();
  const profileId =
    typeof params?.profileId === "string" ? params.profileId : "";
  const router = useRouter();
  const { state, dispatch } = useAppState();
  const currentUserId = state.user.profile?._id;
  const isLoggedIn = state.auth.isAuthenticated;

  const [profile, setProfile] = useState<UserLibraryProfile | null>(null);
  const [myProfileId, setMyProfileId] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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
      const res = await fetchLibraryProfileByIdAction(profileId);
      if (!res.success || !res.data) {
        setError(res.message ?? "Profile not found or private.");
        setProfile(null);
      } else {
        setProfile(res.data);
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

  return (
    <SectionWrapper spacing="none" background="transparent" className="my-0">
      <ContentWrapper padding="md" className="mx-auto max-w-3xl pb-16 pt-2">
        <AppBreadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Books", href: "/books" },
            { label: "Library", href: "/books" },
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
                    {profile.totalBooksShared} books shared ·{" "}
                    {profile.followers?.length ?? 0} followers
                  </p>
                </div>
              </div>
              {currentUserId && profile.owner !== currentUserId ? (
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
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Reading list
              </h2>
              {!profile.readingList?.length ? (
                <p className="mt-4 text-sm text-gray-500">
                  No books on this reading list yet.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {profile.readingList.map((entry) => {
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
                            <p className="text-xs text-gray-500">
                              {book.author}
                            </p>
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
