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
  TrendingUp,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import { Button } from "@/components/ui";
import ReadingListAdd from "@/modules/dashboard/ReadingListAdd";
import { getAddressesAction } from "@/services/addresses";
import {
  deleteBookAction,
  fetchCreatorOwnBooks,
  promoteBookAction,
} from "@/services/books";
import {
  createLibraryProfileAction,
  fetchLibraryFollowersAction,
  fetchLibraryFollowingAction,
  fetchMyLibraryProfileAction,
  removeFromReadingListAction,
  updateLibraryProfileAction,
  updateReadingListStatusAction,
} from "@/services/user-library";
import type { LibraryFollowEntry } from "@/types/book";
import type { UserAddress } from "@/types/address";
import type {
  BookListing,
  BookStatus,
  LibraryVisibility,
  PromoteBookPayload,
  PromoteBookType,
  ReadingStatus,
  UserLibraryProfile,
} from "@/types/book";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";

const PROMOTE_TYPES: PromoteBookType[] = [
  "Selling",
  "Lending",
  "Donation",
  "Swap",
];

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

  // Shelf (Library Only books)
  const [shelf, setShelf] = useState<BookListing[]>([]);
  const [shelfLoading, setShelfLoading] = useState(false);
  const [shelfTotal, setShelfTotal] = useState(0);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<BookListing | null>(null);

  // Promote (showcase → transactional)
  const [promoteTarget, setPromoteTarget] = useState<BookListing | null>(null);
  const [pickupAddresses, setPickupAddresses] = useState<UserAddress[]>([]);
  const [promoteForm, setPromoteForm] = useState<{
    type: PromoteBookType;
    addressId: string;
    contactName: string;
    contactPhone: string;
    price: string;
    discountPrice: string;
    borrowDuration: string;
    safekeepingCharge: string;
  }>({
    type: "Selling",
    addressId: "",
    contactName: "",
    contactPhone: "",
    price: "",
    discountPrice: "",
    borrowDuration: "14",
    safekeepingCharge: "",
  });

  // Active tab
  const [activeTab, setActiveTab] = useState<
    "shelf" | "reading" | "recommendations" | "followers" | "following"
  >("shelf");

  const [followers, setFollowers] = useState<LibraryFollowEntry[]>([]);
  const [following, setFollowing] = useState<LibraryFollowEntry[]>([]);
  const [socialLoading, setSocialLoading] = useState(false);

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
        shelfStatus: "on_shelf",
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

  useEffect(() => {
    if (!profile?._id) return;
    if (activeTab !== "followers" && activeTab !== "following") return;
    let cancelled = false;
    setSocialLoading(true);
    void (async () => {
      const res =
        activeTab === "followers"
          ? await fetchLibraryFollowersAction(profile._id, { page: 1, limit: 50 })
          : await fetchLibraryFollowingAction(profile._id, { page: 1, limit: 50 });
      if (cancelled) return;
      if (activeTab === "followers") {
        setFollowers(res.success ? res.data : []);
      } else {
        setFollowing(res.success ? res.data : []);
      }
      setSocialLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [activeTab, profile?._id]);

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

  const openPromote = (book: BookListing) => {
    setPromoteTarget(book);
    setPromoteForm({
      type: "Selling",
      addressId: "",
      contactName: profile?.displayName ?? "",
      contactPhone: "",
      price: "",
      discountPrice: "",
      borrowDuration: "14",
      safekeepingCharge: "",
    });
    void (async () => {
      const res = await getAddressesAction("PICKUP");
      const list = res.success ? res.data : [];
      setPickupAddresses(list);
      const preferred = list.find((a) => a.isDefault) ?? list[0];
      if (preferred) {
        setPromoteForm((prev) => ({ ...prev, addressId: preferred._id }));
      }
    })();
  };

  const submitPromote = () => {
    if (!promoteTarget) return;
    const f = promoteForm;
    if (!f.addressId) {
      setMsg({ ok: false, text: "Select a pickup address." });
      return;
    }
    if (!f.contactName.trim() || !f.contactPhone.trim()) {
      setMsg({ ok: false, text: "Contact name and phone are required." });
      return;
    }
    if ((f.type === "Selling" || f.type === "Swap") && !f.price.trim()) {
      setMsg({ ok: false, text: "Price is required for this listing type." });
      return;
    }
    if (f.type === "Lending" && !f.borrowDuration.trim()) {
      setMsg({ ok: false, text: "Borrow duration is required for lending." });
      return;
    }

    const payload: PromoteBookPayload = {
      type: f.type,
      addressId: f.addressId,
      contactName: f.contactName.trim(),
      contactPhone: f.contactPhone.trim(),
    };
    if (f.type === "Selling" || f.type === "Swap") {
      payload.price = Number(f.price);
      if (f.type === "Selling" && f.discountPrice.trim()) {
        payload.discountPrice = Number(f.discountPrice);
      }
    }
    if (f.type === "Lending") {
      payload.borrowDuration = Number(f.borrowDuration);
      if (f.safekeepingCharge.trim()) {
        payload.safekeepingCharge = Number(f.safekeepingCharge);
      }
    }

    const target = promoteTarget;
    startTransition(async () => {
      const res = await promoteBookAction(target._id, payload);
      if (res.success) {
        setPromoteTarget(null);
        setMsg({
          ok: true,
          text: `"${target.title}" promoted to ${f.type}. It's pending re-approval.`,
        });
        void loadShelf();
      } else {
        setMsg({ ok: false, text: res.message ?? "Failed to promote book." });
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
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/books/libraries"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-gray-900"
          >
            <Users className="h-3.5 w-3.5" />
            Discover libraries
          </Link>
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
                              onClick={() => openPromote(book)}
                              className="inline-flex items-center gap-1 rounded-md border border-[#E30B12]/30 bg-white px-2 py-1 text-[11px] font-semibold text-[#E30B12] hover:bg-[#E30B12]/5 disabled:opacity-60"
                            >
                              <TrendingUp className="h-3 w-3" />
                              Promote
                            </button>
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
                  Search any campus book by title or author and pick it to track
                  your reading.
                </p>
                <ReadingListAdd
                  existingIds={
                    new Set(
                      (profile.readingList ?? []).map((entry) => entry.book._id),
                    )
                  }
                  onAdded={() => void loadProfile()}
                  onMessage={setMsg}
                />
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
                      Search any campus book above to start tracking your
                      reading.
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

              {socialLoading ? (
                <p className="mt-6 text-sm text-gray-500">Loading followers…</p>
              ) : !followers.length ? (
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
                  {followers.map((entry) => (
                    <li
                      key={entry._id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/40 px-3 py-2.5"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E30B12]/10 text-[#E30B12]">
                          <Users className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {entry.displayName}
                          </p>
                          {entry.bio ? (
                            <p className="truncate text-[11px] text-gray-500">
                              {entry.bio}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <Link
                        href={`/books/library/${entry._id}`}
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

              {socialLoading ? (
                <p className="mt-6 text-sm text-gray-500">Loading following…</p>
              ) : !following.length ? (
                <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-gray-50/60 px-4 py-8 text-center">
                  <UserPlus className="mx-auto h-8 w-8 text-gray-300" />
                  <p className="mt-2 text-sm font-medium text-gray-700">
                    Not following anyone yet
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Visit other students&apos; library profiles to follow them.
                  </p>
                  <Link
                    href="/books/libraries"
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    Discover libraries
                  </Link>
                </div>
              ) : (
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {following.map((entry) => (
                    <li
                      key={entry._id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/40 px-3 py-2.5"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E30B12]/10 text-[#E30B12]">
                          <UserPlus className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {entry.displayName}
                          </p>
                          {entry.bio ? (
                            <p className="truncate text-[11px] text-gray-500">
                              {entry.bio}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <Link
                        href={`/books/library/${entry._id}`}
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

      {/* Promote modal */}
      {promoteTarget ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
          onClick={() => (isPending ? undefined : setPromoteTarget(null))}
        >
          <div
            className="max-h-full w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900">
                  <TrendingUp className="h-4 w-4 text-[#E30B12]" />
                  Promote book
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  List &ldquo;{promoteTarget.title}&rdquo; for sale, lending,
                  donation, or swap. It will be re-reviewed before going live.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPromoteTarget(null)}
                disabled={isPending}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="text-xs font-medium text-gray-600">
                  Listing type
                </span>
                <select
                  value={promoteForm.type}
                  onChange={(e) =>
                    setPromoteForm((prev) => ({
                      ...prev,
                      type: e.target.value as PromoteBookType,
                    }))
                  }
                  className={`${inputClass} mt-1`}
                >
                  {PROMOTE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-medium text-gray-600">
                  Pickup address
                </span>
                <select
                  value={promoteForm.addressId}
                  onChange={(e) =>
                    setPromoteForm((prev) => ({
                      ...prev,
                      addressId: e.target.value,
                    }))
                  }
                  className={`${inputClass} mt-1`}
                >
                  <option value="">Select a pickup address</option>
                  {pickupAddresses.map((addr) => (
                    <option key={addr._id} value={addr._id}>
                      {addr.address}
                    </option>
                  ))}
                </select>
                {pickupAddresses.length === 0 ? (
                  <Link
                    href="/my-addresses"
                    className="mt-1 inline-block text-xs font-semibold text-[#E30B12] hover:underline"
                  >
                    Add a pickup address →
                  </Link>
                ) : null}
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-medium text-gray-600">
                    Contact name
                  </span>
                  <input
                    value={promoteForm.contactName}
                    onChange={(e) =>
                      setPromoteForm((prev) => ({
                        ...prev,
                        contactName: e.target.value,
                      }))
                    }
                    className={`${inputClass} mt-1`}
                    placeholder="Your name"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-gray-600">
                    Contact phone
                  </span>
                  <input
                    value={promoteForm.contactPhone}
                    onChange={(e) =>
                      setPromoteForm((prev) => ({
                        ...prev,
                        contactPhone: e.target.value,
                      }))
                    }
                    className={`${inputClass} mt-1`}
                    placeholder="01XXXXXXXXX"
                  />
                </label>
              </div>

              {promoteForm.type === "Selling" ||
              promoteForm.type === "Swap" ? (
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-xs font-medium text-gray-600">
                      Price (৳)
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={promoteForm.price}
                      onChange={(e) =>
                        setPromoteForm((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }))
                      }
                      className={`${inputClass} mt-1`}
                      placeholder="0"
                    />
                  </label>
                  {promoteForm.type === "Selling" ? (
                    <label className="block">
                      <span className="text-xs font-medium text-gray-600">
                        Discount price (optional)
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={promoteForm.discountPrice}
                        onChange={(e) =>
                          setPromoteForm((prev) => ({
                            ...prev,
                            discountPrice: e.target.value,
                          }))
                        }
                        className={`${inputClass} mt-1`}
                        placeholder="Less than price"
                      />
                    </label>
                  ) : null}
                </div>
              ) : null}

              {promoteForm.type === "Lending" ? (
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-xs font-medium text-gray-600">
                      Borrow duration (days)
                    </span>
                    <input
                      type="number"
                      min="1"
                      value={promoteForm.borrowDuration}
                      onChange={(e) =>
                        setPromoteForm((prev) => ({
                          ...prev,
                          borrowDuration: e.target.value,
                        }))
                      }
                      className={`${inputClass} mt-1`}
                      placeholder="14"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-gray-600">
                      Safekeeping charge (৳)
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={promoteForm.safekeepingCharge}
                      onChange={(e) =>
                        setPromoteForm((prev) => ({
                          ...prev,
                          safekeepingCharge: e.target.value,
                        }))
                      }
                      className={`${inputClass} mt-1`}
                      placeholder="Optional"
                    />
                  </label>
                </div>
              ) : null}

              {promoteForm.type === "Donation" ? (
                <p className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
                  Donation listings are free — no price needed.
                </p>
              ) : null}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPromoteTarget(null)}
                disabled={isPending}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitPromote}
                disabled={isPending}
                className="rounded-lg bg-[#E30B12] px-4 py-2 text-sm font-semibold text-white hover:bg-[#B70910] disabled:opacity-60"
              >
                {isPending ? "Promoting…" : "Promote"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
