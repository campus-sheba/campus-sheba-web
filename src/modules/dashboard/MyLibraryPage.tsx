"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { BookMarked, Plus } from "lucide-react";
import { Button } from "@/components/ui";
import {
  addToReadingListAction,
  createLibraryProfileAction,
  fetchMyLibraryProfileAction,
  removeFromReadingListAction,
  updateLibraryProfileAction,
  updateReadingListStatusAction,
} from "@/services/user-library";
import type { LibraryVisibility, ReadingStatus, UserLibraryProfile } from "@/types/book";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";

const READING_STATUSES: ReadingStatus[] = ["reading", "completed", "wishlist"];

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#00A651]";

export default function MyLibraryPage() {
  const [profile, setProfile] = useState<UserLibraryProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [visibility, setVisibility] = useState<LibraryVisibility>("public");

  const [addBookId, setAddBookId] = useState("");
  const [addStatus, setAddStatus] = useState<ReadingStatus>("reading");

  const load = useCallback(async () => {
    setLoading(true);
    setMsg(null);
    const res = await fetchMyLibraryProfileAction();
    setLoading(false);
    if (res.success && res.data) {
      setProfile(res.data);
      setDisplayName(res.data.displayName);
      setBio(res.data.bio ?? "");
      setVisibility(res.data.visibility);
    } else {
      setProfile(null);
      if (res.message && !res.message.toLowerCase().includes("not found")) {
        setMsg(res.message);
      }
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const createProfile = () => {
    if (!displayName.trim()) {
      setMsg("Display name is required.");
      return;
    }
    startTransition(async () => {
      const res = await createLibraryProfileAction({
        displayName: displayName.trim(),
        bio: bio.trim() || undefined,
        visibility,
      });
      setMsg(res.success ? "Library profile created." : res.message);
      if (res.success && res.data) {
        setProfile(res.data);
        void load();
      }
    });
  };

  const saveProfile = () => {
    if (!displayName.trim()) {
      setMsg("Display name is required.");
      return;
    }
    startTransition(async () => {
      const res = await updateLibraryProfileAction({
        displayName: displayName.trim(),
        bio: bio.trim() || undefined,
        visibility,
      });
      setMsg(res.success ? "Profile saved." : res.message);
      if (res.success && res.data) setProfile(res.data);
    });
  };

  const addBook = () => {
    const id = addBookId.trim();
    if (!id) {
      setMsg("Enter a book ID from a campus listing.");
      return;
    }
    startTransition(async () => {
      const res = await addToReadingListAction({ bookId: id, status: addStatus });
      setMsg(res.success ? "Added to reading list." : res.message);
      if (res.success) {
        setAddBookId("");
        void load();
      }
    });
  };

  const changeStatus = (bookId: string, status: ReadingStatus) => {
    startTransition(async () => {
      const res = await updateReadingListStatusAction(bookId, { status });
      if (res.success) void load();
      else setMsg(res.message);
    });
  };

  const removeBook = (bookId: string) => {
    startTransition(async () => {
      const res = await removeFromReadingListAction(bookId);
      setMsg(res.success ? "Removed from reading list." : res.message);
      if (res.success) void load();
    });
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/books" className="text-sm font-medium text-gray-500 hover:text-gray-900">
            ← Books
          </Link>
          <h1 className="mt-2 flex items-center gap-2 text-xl font-bold text-gray-900">
            <BookMarked className="h-6 w-6 text-[#00A651]" />
            My library profile
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Showcase what you read and follow other students&apos; bookshelves.
          </p>
        </div>
        {profile ? (
          <Link
            href={`/books/library/${profile._id}`}
            className="text-sm font-semibold text-[#00A651] hover:underline"
          >
            View public profile →
          </Link>
        ) : null}
      </div>

      {msg ? (
        <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm">{msg}</p>
      ) : null}

      <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-sm font-semibold text-gray-900">
          {profile ? "Edit profile" : "Create your library profile"}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium text-gray-500">Display name</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className={`${inputClass} mt-1`}
              placeholder="e.g. Nadia's Bookshelf"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium text-gray-500">Bio</span>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className={`${inputClass} mt-1`}
              placeholder="What you study, genres you love…"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-gray-500">Visibility</span>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as LibraryVisibility)}
              className={`${inputClass} mt-1`}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </label>
          {profile ? (
            <div className="flex items-end text-sm text-gray-600">
              <span>
                Reputation {profile.reputationScore} · {profile.totalBooksShared} books shared ·{" "}
                {profile.followers?.length ?? 0} followers
              </span>
            </div>
          ) : null}
        </div>
        <div className="mt-4">
          {profile ? (
            <Button type="button" uppercase={false} disabled={isPending} onClick={saveProfile}>
              Save profile
            </Button>
          ) : (
            <Button type="button" uppercase={false} disabled={isPending} onClick={createProfile}>
              Create profile
            </Button>
          )}
        </div>
      </div>

      {profile ? (
        <>
          <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-sm font-semibold text-gray-900">Add to reading list</h2>
            <p className="mt-1 text-xs text-gray-500">
              Paste a book ID from any campus listing (URL: /books/[id]).
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                value={addBookId}
                onChange={(e) => setAddBookId(e.target.value)}
                placeholder="Book ID"
                className={inputClass}
              />
              <select
                value={addStatus}
                onChange={(e) => setAddStatus(e.target.value as ReadingStatus)}
                className={`${inputClass} sm:w-40`}
              >
                {READING_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                uppercase={false}
                className="gap-1 shrink-0"
                disabled={isPending}
                onClick={addBook}
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-sm font-semibold text-gray-900">
              Reading list ({profile.readingList?.length ?? 0})
            </h2>
            {!profile.readingList?.length ? (
              <p className="mt-4 text-sm text-gray-500">No books on your reading list yet.</p>
            ) : (
              <ul className="mt-4 divide-y divide-gray-100">
                {profile.readingList.map((entry) => {
                  const book = entry.book;
                  const photo = book?.photos?.[0]?.url;
                  return (
                    <li
                      key={book._id}
                      className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center"
                    >
                      <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded bg-gray-100">
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
                          className="font-semibold text-gray-900 hover:text-[#00A651]"
                        >
                          {book.title}
                        </Link>
                        {book.author ? (
                          <p className="text-xs text-gray-500">{book.author}</p>
                        ) : null}
                        <p className="mt-0.5 text-xs text-gray-400">
                          Added {new Date(entry.addedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={entry.status}
                          onChange={(e) =>
                            changeStatus(book._id, e.target.value as ReadingStatus)
                          }
                          disabled={isPending}
                          className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs"
                        >
                          {READING_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-8 text-xs text-red-600"
                          disabled={isPending}
                          onClick={() => removeBook(book._id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {profile.following?.length ? (
            <div className="rounded-xl border border-gray-200/80 bg-white p-4 text-sm text-gray-600 shadow-sm">
              Following {profile.following.length} librar{profile.following.length === 1 ? "y" : "ies"}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
