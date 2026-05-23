"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import {
  BookMarked,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Eye,
  Globe,
  Library,
  Lock,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import { Button } from "@/components/ui";
import { deleteBookAction, fetchCreatorOwnBooks } from "@/services/books";
import {
  addToReadingListAction,
  createLibraryProfileAction,
  fetchMyLibraryProfileAction,
  removeFromReadingListAction,
  updateLibraryProfileAction,
  updateReadingListStatusAction,
} from "@/services/user-library";
import type {
  BookListing,
  BookStatus,
  LibraryVisibility,
  ReadingStatus,
  UserLibraryProfile,
} from "@/types/book";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";

const READING_STATUSES: ReadingStatus[] = ["reading", "completed", "wishlist"];

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-[#E30B12] focus:ring-2 focus:ring-[#E30B12]/15";

function statusBadgeClass(status?: BookStatus | string): string {
  switch (status) {
    case "Approved":
      return "bg-green-50 text-green-700";
    case "Pending":
      return "bg-amber-50 text-amber-700";
    case "Rejected":
    case "Suspended":
      return "bg-red-50 text-red-700";
    case "Flagged":
      return "bg-orange-50 text-orange-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

function readingStatusLabel(status: ReadingStatus): string {
  if (status === "reading") return "Reading";
  if (status === "completed") return "Completed";
  return "Wishlist";
}

export default function MyLibraryPage() {
  const [profile, setProfile] = useState<UserLibraryProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Profile form state
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [visibility, setVisibility] = useState<LibraryVisibility>("public");
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Reading list add form
  const [addBookId, setAddBookId] = useState("");
  const [addStatus, setAddStatus] = useState<ReadingStatus>("reading");

  // Shelf (Library Only books)
  const [shelf, setShelf] = useState<BookListing[]>([]);
  const [shelfLoading, setShelfLoading] = useState(false);
  const [shelfTotal, setShelfTotal] = useState(0);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<BookListing | null>(null);

  // Active tab
  const [activeTab, setActiveTab] = useState<
    "shelf" | "reading" | "recommendations" | "followers" | "following"
  >("shelf");

  const loadProfile = useCallback(async () => {
    setLoading(true);
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
        setMsg({ ok: false, text: res.message });
      }
    }
  }, []);

  const loadShelf = useCallback(async () => {
    setShelfLoading(true);
    try {
      const res = await fetchCreatorOwnBooks({
        type: "Library Only",
        page: 1,
        limit: 50,
      });
      setShelf(res.data);
      setShelfTotal(res.total);
    } catch (e) {
      setMsg({
        ok: false,
        text: e instanceof Error ? e.message : "Failed to load shelf.",
      });
    } finally {
      setShelfLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
    void loadShelf();
  }, [loadProfile, loadShelf]);

  const createProfile = () => {
    if (!displayName.trim()) {
      setMsg({ ok: false, text: "Display name is required." });
      return;
    }
    startTransition(async () => {
      const res = await createLibraryProfileAction({
        displayName: displayName.trim(),
        bio: bio.trim() || undefined,
        visibility,
      });
      if (res.success && res.data) {
        setProfile(res.data);
        setIsEditingProfile(false);
        setMsg({ ok: true, text: "Library profile created." });
        void loadProfile();
      } else {
        setMsg({ ok: false, text: res.message ?? "Failed to create profile." });
      }
    });
  };

  const saveProfile = () => {
    if (!displayName.trim()) {
      setMsg({ ok: false, text: "Display name is required." });
      return;
    }
    startTransition(async () => {
      const res = await updateLibraryProfileAction({
        displayName: displayName.trim(),
        bio: bio.trim() || undefined,
        visibility,
      });
      if (res.success && res.data) {
        setProfile(res.data);
        setIsEditingProfile(false);
        setMsg({ ok: true, text: "Profile saved." });
      } else {
        setMsg({ ok: false, text: res.message ?? "Failed to save profile." });
      }
    });
  };

  const cancelEditProfile = () => {
    if (profile) {
      setDisplayName(profile.displayName);
      setBio(profile.bio ?? "");
      setVisibility(profile.visibility);
    }
    setIsEditingProfile(false);
  };

  const addBook = () => {
    const id = addBookId.trim();
    if (!id) {
      setMsg({ ok: false, text: "Enter a book ID from a campus listing." });
      return;
    }
    startTransition(async () => {
      const res = await addToReadingListAction({
        bookId: id,
        status: addStatus,
      });
      if (res.success) {
        setAddBookId("");
        setMsg({ ok: true, text: "Added to reading list." });
        void loadProfile();
      } else {
        setMsg({ ok: false, text: res.message ?? "Failed to add book." });
      }
    });
  };

  const changeStatus = (bookId: string, status: ReadingStatus) => {
    startTransition(async () => {
      const res = await updateReadingListStatusAction(bookId, { status });
      if (res.success) void loadProfile();
      else
        setMsg({ ok: false, text: res.message ?? "Failed to update status." });
    });
  };

  const removeFromReadingList = (bookId: string) => {
    startTransition(async () => {
      const res = await removeFromReadingListAction(bookId);
      if (res.success) {
        setMsg({ ok: true, text: "Removed from reading list." });
        void loadProfile();
      } else {
        setMsg({ ok: false, text: res.message ?? "Failed to remove." });
      }
    });
  };

  const deleteShelfBook = (book: BookListing) => {
    setPendingDeleteId(book._id);
    startTransition(async () => {
      const res = await deleteBookAction(book._id);
      setPendingDeleteId(null);
      setConfirmDelete(null);
      if (res.success) {
        setMsg({ ok: true, text: `Removed "${book.title}" from your shelf.` });
        void loadShelf();
      } else {
        setMsg({ ok: false, text: res.message ?? "Failed to delete book." });
      }
    });
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Loading library…</p>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href="/books"
            className="text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            ← Books
          </Link>
          <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold tracking-tight text-gray-900">
            <BookMarked className="h-6 w-6 text-[#E30B12]" />
            My library
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Showcase your bookshelf, track what you read, and follow other
            students.
          </p>
        </div>
        {profile ? (
          <Link
            href={`/books/library/${profile._id}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#E30B12] hover:underline"
          >
            View public profile
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>

      {msg ? (
        <div
          className={`flex items-start gap-2 rounded-xl border px-4 py-2.5 text-sm ${
            msg.ok
              ? "border-green-100 bg-green-50 text-green-700"
              : "border-red-100 bg-red-50 text-red-700"
          }`}
          role="status"
        >
          {msg.ok ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <X className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <span className="flex-1">{msg.text}</span>
          <button
            type="button"
            onClick={() => setMsg(null)}
            className="text-xs font-semibold opacity-70 hover:opacity-100"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ) : null}

      {/* Profile card */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            <Library className="h-4 w-4 text-[#E30B12]" />
            {profile ? "Library profile" : "Create your library profile"}
          </h2>
          {profile && !isEditingProfile ? (
            <button
              type="button"
              onClick={() => setIsEditingProfile(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
          ) : null}
        </div>

        {profile && !isEditingProfile ? (
          <div className="mt-4 space-y-3">
            <div>
              <p className="text-xl font-bold text-gray-900">
                {profile.displayName}
              </p>
              {profile.bio ? (
                <p className="mt-1 text-sm text-gray-600">{profile.bio}</p>
              ) : (
                <p className="mt-1 text-sm italic text-gray-400">
                  No bio yet — add one so others know what you read.
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                  profile.visibility === "public"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {profile.visibility === "public" ? (
                  <Globe className="h-3 w-3" />
                ) : (
                  <Lock className="h-3 w-3" />
                )}
                {profile.visibility === "public" ? "Public" : "Private"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
                Reputation {profile.reputationScore}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700">
                {profile.totalBooksShared} shared
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-700">
                <UserPlus className="h-3 w-3" />
                {profile.followers?.length ?? 0} followers
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-700">
                Following {profile.following?.length ?? 0}
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-gray-600">
                Display name
              </span>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className={`${inputClass} mt-1`}
                placeholder="e.g. Nadia's Bookshelf"
                maxLength={100}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-gray-600">Bio</span>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className={`${inputClass} mt-1`}
                placeholder="What you study, genres you love…"
                maxLength={500}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-600">
                Visibility
              </span>
              <select
                value={visibility}
                onChange={(e) =>
                  setVisibility(e.target.value as LibraryVisibility)
                }
                className={`${inputClass} mt-1`}
              >
                <option value="public">Public — anyone can view</option>
                <option value="private">Private — only you can view</option>
              </select>
            </label>
            <div className="flex items-end justify-end gap-2 sm:col-span-2">
              {profile && isEditingProfile ? (
                <Button
                  type="button"
                  variant="outline"
                  uppercase={false}
                  disabled={isPending}
                  onClick={cancelEditProfile}
                >
                  Cancel
                </Button>
              ) : null}
              <Button
                type="button"
                uppercase={false}
                disabled={isPending}
                onClick={profile ? saveProfile : createProfile}
              >
                {profile ? "Save profile" : "Create profile"}
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Tabs */}
      {profile ? (
        <>
          {(() => {
            const tabs = [
              {
                id: "shelf" as const,
                label: "My shelf",
                count: shelfTotal,
                icon: BookOpen,
              },
              {
                id: "reading" as const,
                label: "Reading list",
                count: profile.readingList?.length ?? 0,
                icon: BookMarked,
              },
              {
                id: "recommendations" as const,
                label: "Recommendations",
                count: profile.recommendations?.length ?? 0,
                icon: Sparkles,
              },
              {
                id: "followers" as const,
                label: "Followers",
                count: profile.followers?.length ?? 0,
                icon: Users,
              },
              {
                id: "following" as const,
                label: "Following",
                count: profile.following?.length ?? 0,
                icon: UserPlus,
              },
            ];
            return (
              <div
                role="tablist"
                className="-mx-1 flex gap-1 overflow-x-auto rounded-2xl border border-gray-100 bg-white p-1 shadow-sm"
              >
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      role="tab"
                      aria-selected={isActive}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition sm:text-sm ${
                        isActive
                          ? "bg-[#E30B12] text-white shadow-sm"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })()}

          {/* Tab: My shelf */}
          {activeTab === "shelf" ? (
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                    <BookOpen className="h-4 w-4 text-[#E30B12]" />
                    My shelf
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-700">
                      {shelfTotal}
                    </span>
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Library-only books on display — never sold, never lent.
                  </p>
                </div>
                <Link
                  href="/my-books/new?mode=library-only"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#E30B12] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#B70910]"
                >
                  <Plus className="h-4 w-4" />
                  Add to shelf
                </Link>
              </div>

              {shelfLoading ? (
                <p className="mt-6 text-sm text-gray-500">Loading shelf…</p>
              ) : shelf.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-gray-50/60 px-4 py-8 text-center">
                  <BookOpen className="mx-auto h-8 w-8 text-gray-300" />
                  <p className="mt-2 text-sm font-medium text-gray-700">
                    Your shelf is empty
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Add a book as a showcase entry. It won&apos;t be listed for
                    sale.
                  </p>
                  <Link
                    href="/my-books/new?mode=library-only"
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add first book
                  </Link>
                </div>
              ) : (
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {shelf.map((book) => {
                    const photo = book.photos?.[0]?.url;
                    const isDeleting = pendingDeleteId === book._id;
                    return (
                      <li
                        key={book._id}
                        className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50/40 p-3 transition hover:border-gray-200 hover:bg-white"
                      >
                        <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {photo ? (
                            <Image
                              src={photo}
                              alt={book.title}
                              fill
                              className="object-cover"
                              unoptimized={shouldUnoptimizeRemoteImage(photo)}
                              sizes="64px"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-gray-300">
                              <BookOpen className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/books/${book._id}`}
                            className="line-clamp-2 text-sm font-semibold text-gray-900 hover:text-[#E30B12]"
                          >
                            {book.title}
                          </Link>
                          {book.author ? (
                            <p className="mt-0.5 truncate text-xs text-gray-500">
                              by {book.author}
                            </p>
                          ) : null}
                          <div className="mt-1.5 flex flex-wrap items-center gap-1">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusBadgeClass(
                                book.status,
                              )}`}
                            >
                              {String(book.status ?? "Pending")}
                            </span>
                            {book.quality ? (
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-700">
                                {String(book.quality)}
                              </span>
                            ) : null}
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            <Link
                              href={`/books/${book._id}`}
                              className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-50"
                            >
                              <Eye className="h-3 w-3" />
                              View
                            </Link>
                            <Link
                              href={`/my-books/${book._id}/edit`}
                              className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-50"
                            >
                              <Pencil className="h-3 w-3" />
                              Edit
                            </Link>
                            <button
                              type="button"
                              disabled={isPending}
                              onClick={() => setConfirmDelete(book)}
                              className="inline-flex items-center gap-1 rounded-md border border-red-100 bg-white px-2 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                            >
                              <Trash2 className="h-3 w-3" />
                              {isDeleting ? "Removing…" : "Remove"}
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          ) : null}

          {/* Tab: Reading list */}
          {activeTab === "reading" ? (
            <div className="space-y-5">
              <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                  <Plus className="h-4 w-4 text-[#E30B12]" />
                  Add to reading list
                </h2>
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
                    onChange={(e) =>
                      setAddStatus(e.target.value as ReadingStatus)
                    }
                    className={`${inputClass} sm:w-44`}
                  >
                    {READING_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {readingStatusLabel(s)}
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
              </section>

              <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                  <BookMarked className="h-4 w-4 text-[#E30B12]" />
                  Reading list
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-700">
                    {profile.readingList?.length ?? 0}
                  </span>
                </h2>
                {!profile.readingList?.length ? (
                  <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-gray-50/60 px-4 py-8 text-center">
                    <BookMarked className="mx-auto h-8 w-8 text-gray-300" />
                    <p className="mt-2 text-sm font-medium text-gray-700">
                      No books tracked yet
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Add the ID of any campus book to track your reading.
                    </p>
                  </div>
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
                                sizes="48px"
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
                            <p className="mt-0.5 text-xs text-gray-400">
                              Added{" "}
                              {new Date(entry.addedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <select
                              value={entry.status}
                              onChange={(e) =>
                                changeStatus(
                                  book._id,
                                  e.target.value as ReadingStatus,
                                )
                              }
                              disabled={isPending}
                              className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs"
                            >
                              {READING_STATUSES.map((s) => (
                                <option key={s} value={s}>
                                  {readingStatusLabel(s)}
                                </option>
                              ))}
                            </select>
                            <Button
                              type="button"
                              variant="ghost"
                              className="h-8 text-xs text-red-600"
                              disabled={isPending}
                              onClick={() => removeFromReadingList(book._id)}
                            >
                              Remove
                            </Button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </div>
          ) : null}

          {/* Tab: Recommendations */}
          {activeTab === "recommendations" ? (
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                <Sparkles className="h-4 w-4 text-[#E30B12]" />
                Recommendations
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-700">
                  {profile.recommendations?.length ?? 0}
                </span>
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Books your library spotlights for fellow students.
              </p>

              {!profile.recommendations?.length ? (
                <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-gray-50/60 px-4 py-8 text-center">
                  <Sparkles className="mx-auto h-8 w-8 text-gray-300" />
                  <p className="mt-2 text-sm font-medium text-gray-700">
                    No recommendations yet
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Recommendations are curated by Campus Sheba — they&apos;ll
                    appear here once you have books on your shelf.
                  </p>
                </div>
              ) : (
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {profile.recommendations.map((book) => {
                    const photo = book.photos?.[0]?.url;
                    return (
                      <li
                        key={book._id}
                        className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50/40 p-3 transition hover:border-gray-200 hover:bg-white"
                      >
                        <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {photo ? (
                            <Image
                              src={photo}
                              alt={book.title}
                              fill
                              className="object-cover"
                              unoptimized={shouldUnoptimizeRemoteImage(photo)}
                              sizes="64px"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-gray-300">
                              <BookOpen className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/books/${book._id}`}
                            className="line-clamp-2 text-sm font-semibold text-gray-900 hover:text-[#E30B12]"
                          >
                            {book.title}
                          </Link>
                          {book.author ? (
                            <p className="mt-0.5 truncate text-xs text-gray-500">
                              by {book.author}
                            </p>
                          ) : null}
                          {book.type ? (
                            <span className="mt-1.5 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-700">
                              {book.type}
                            </span>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          ) : null}

          {/* Tab: Followers */}
          {activeTab === "followers" ? (
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                <Users className="h-4 w-4 text-[#E30B12]" />
                Followers
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-700">
                  {profile.followers?.length ?? 0}
                </span>
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Students who follow your library.
              </p>

              {!profile.followers?.length ? (
                <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-gray-50/60 px-4 py-8 text-center">
                  <Users className="mx-auto h-8 w-8 text-gray-300" />
                  <p className="mt-2 text-sm font-medium text-gray-700">
                    No followers yet
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Share your library link with friends to grow your following.
                  </p>
                </div>
              ) : (
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {profile.followers.map((followerId) => (
                    <li
                      key={followerId}
                      className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/40 px-3 py-2.5"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E30B12]/10 text-[#E30B12]">
                          <Users className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            Library profile
                          </p>
                          <p className="truncate font-mono text-[11px] text-gray-500">
                            {followerId}
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/books/library/${followerId}`}
                        className="inline-flex shrink-0 items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : null}

          {/* Tab: Following */}
          {activeTab === "following" ? (
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                <UserPlus className="h-4 w-4 text-[#E30B12]" />
                Following
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-700">
                  {profile.following?.length ?? 0}
                </span>
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Libraries you follow.
              </p>

              {!profile.following?.length ? (
                <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-gray-50/60 px-4 py-8 text-center">
                  <UserPlus className="mx-auto h-8 w-8 text-gray-300" />
                  <p className="mt-2 text-sm font-medium text-gray-700">
                    Not following anyone yet
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Visit other students&apos; library profiles to follow them.
                  </p>
                  <Link
                    href="/books"
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    Browse books
                  </Link>
                </div>
              ) : (
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {profile.following.map((followingId) => (
                    <li
                      key={followingId}
                      className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/40 px-3 py-2.5"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E30B12]/10 text-[#E30B12]">
                          <UserPlus className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            Library profile
                          </p>
                          <p className="truncate font-mono text-[11px] text-gray-500">
                            {followingId}
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/books/library/${followingId}`}
                        className="inline-flex shrink-0 items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : null}
        </>
      ) : null}

      {/* Delete confirm modal */}
      {confirmDelete ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => (pendingDeleteId ? undefined : setConfirmDelete(null))}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-gray-900">
              Remove from shelf?
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              <span className="font-medium text-gray-900">
                &ldquo;{confirmDelete.title}&rdquo;
              </span>{" "}
              will be removed from your library shelf. This action cannot be
              undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                disabled={!!pendingDeleteId}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteShelfBook(confirmDelete)}
                disabled={!!pendingDeleteId}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {pendingDeleteId ? "Removing…" : "Remove"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
