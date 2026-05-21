"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { ArrowLeft, ShoppingCart, Star, Phone, BookOpen, ArrowLeftRight, Gift, Archive } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import type { AppStateAction } from "@/types/global";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import { Button } from "@/components/ui";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import { ResponsiveCardsGrid } from "@/components/marketplace/ResponsiveCardsGrid";
import { ImageGallery } from "@/components/marketplace/ImageGallery";
import { SectionHeader } from "@/components/marketplace/SectionHeader";
import { addToCartAction } from "@/services/cart";
import { emitCartUpdated } from "@/lib/cartEvents";
import { fetchUserBookById } from "@/services/books";
import { requestBookBorrowAction } from "@/services/book-borrowing";
import {
  fetchAvailableDonations,
  requestDonationAction,
} from "@/services/book-donations";
import {
  fetchBookReviews,
  submitBookReviewAction,
  deleteBookReviewAction,
} from "@/services/book-reviews";
import type { BookListing, BookReview, BookOwnerRef } from "@/types/book";
import { useBooksList } from "@/modules/books/hooks/useBooksList";
import { useAppState } from "@/contexts/AppStateContext";
import BookListingCard from "./BookListingCard";
import { useTranslations } from "next-intl";

// ── Star rating display ────────────────────────────────────────────────────────

function StarDisplay({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const sz = size === "lg" ? "h-5 w-5" : "h-3.5 w-3.5";
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 12 12"
          className={`${sz} ${i < full ? "text-amber-400" : i === full && half ? "text-amber-300" : "text-gray-200"}`}
          fill="currentColor"
        >
          <path d="M6 1l1.2 3.6H11L8.1 6.9l1 3.1L6 8.2 2.9 10l1-3.1L1 4.6h3.8z" />
        </svg>
      ))}
    </span>
  );
}

function StarInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <span className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i + 1)}
          onMouseEnter={() => setHover(i + 1)}
          onMouseLeave={() => setHover(0)}
          className="focus:outline-none"
          aria-label={`Rate ${i + 1}`}
        >
          <Star
            className={`h-6 w-6 transition ${(hover || value) > i ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
          />
        </button>
      ))}
    </span>
  );
}

// ── Type badge ─────────────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: BookListing["type"] }) {
  const map: Record<string, { label: string; color: string }> = {
    Lending: { label: "Lending", color: "bg-sky-50 text-sky-800" },
    Donation: { label: "Donation", color: "bg-violet-50 text-violet-800" },
    Swap: { label: "Swap", color: "bg-orange-50 text-orange-800" },
    "Library Only": { label: "Library Only", color: "bg-gray-100 text-gray-700" },
    "Request Based": { label: "Request Based", color: "bg-amber-50 text-amber-800" },
    Selling: { label: "Selling", color: "bg-emerald-50 text-emerald-800" },
  };
  const cfg = map[type] ?? map.Selling;
  return (
    <span className={`w-fit rounded-md px-2.5 py-1 text-xs font-semibold ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

// ── Reviews section ────────────────────────────────────────────────────────────

function ReviewsSection({
  bookId,
  currentUserId,
  tt,
}: {
  bookId: string;
  currentUserId?: string;
  tt: (key: string, fallback: string) => string;
}) {
  const [reviews, setReviews] = useState<BookReview[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setIsLoading(true);
      const res = await fetchBookReviews(bookId, 1, 10);
      if (!cancelled) {
        setReviews(Array.isArray(res.data) ? res.data : []);
        setTotal(res.total ?? 0);
        setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bookId]);

  const handleSubmit = () => {
    if (rating === 0) {
      setSubmitMsg("Please choose a star rating.");
      return;
    }
    if (!body.trim()) {
      setSubmitMsg("Please write a short review.");
      return;
    }
    setSubmitMsg(null);
    startTransition(async () => {
      const res = await submitBookReviewAction({ bookId, rating, body: body.trim() });
      if (res.success && res.review) {
        setReviews((prev) => [res.review as BookReview, ...prev]);
        setTotal((t) => t + 1);
        setRating(0);
        setBody("");
        setSubmitMsg(tt("bookDetail.reviewSubmitted", "Review submitted — thank you!"));
      } else {
        setSubmitMsg(
          (res as { message?: string }).message ??
            tt("bookDetail.reviewFailed", "Could not submit review."),
        );
      }
    });
  };

  const handleDelete = (reviewId: string) => {
    startTransition(async () => {
      const res = await deleteBookReviewAction(reviewId);
      if (res.success) {
        setReviews((prev) => prev.filter((r) => r._id !== reviewId));
        setTotal((t) => Math.max(0, t - 1));
      }
    });
  };

  return (
    <div className="mt-3 rounded-xl border border-gray-100 bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">
          {tt("bookDetail.reviews", "Reviews")}
          {total > 0 && (
            <span className="ml-1 text-sm font-normal text-gray-500">({total})</span>
          )}
        </h3>
      </div>

      {currentUserId && (
        <div className="mt-4 space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-800">
            {tt("bookDetail.leaveReview", "Leave a review")}
          </p>
          <StarInput value={rating} onChange={setRating} />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder={tt(
              "bookDetail.reviewPlaceholder",
              "Describe the book condition, your experience with the owner…",
            )}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#00A651] focus:outline-none"
          />
          <Button
            type="button"
            uppercase={false}
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending
              ? tt("bookDetail.submitting", "Submitting…")
              : tt("bookDetail.submitReview", "Submit review")}
          </Button>
          {submitMsg && (
            <p className="text-sm text-gray-700" role="status">
              {submitMsg}
            </p>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">
          {tt("bookDetail.noReviews", "No reviews yet. Be the first!")}
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          {reviews.map((rv) => (
            <div key={rv._id} className="rounded-xl border border-gray-100 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {rv.reviewer.profilePhoto ? (
                    <img
                      src={rv.reviewer.profilePhoto}
                      alt={rv.reviewer.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600">
                      {rv.reviewer.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{rv.reviewer.name}</p>
                    <div className="flex items-center gap-1.5">
                      <StarDisplay rating={rv.rating} />
                      {rv.isVerifiedBorrower && (
                        <span className="rounded bg-green-50 px-1.5 py-0.5 text-[10px] font-semibold text-green-700">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {currentUserId === rv.reviewer._id && (
                  <button
                    type="button"
                    onClick={() => handleDelete(rv._id)}
                    disabled={isPending}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">{rv.body}</p>
              <p className="mt-1 text-[11px] text-gray-400">
                {new Date(rv.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Action panels by type ──────────────────────────────────────────────────────

function LendingActionPanel({
  item,
  isLoggedIn,
  dispatch,
  tt,
}: {
  item: BookListing;
  isLoggedIn: boolean;
  dispatch: (a: AppStateAction) => void;
  tt: (k: string, f: string) => string;
}) {
  const [dueDate, setDueDate] = useState("");
  const [borrowNote, setBorrowNote] = useState("");
  const [deposit, setDeposit] = useState(item.safekeepingCharge ?? 0);
  const [msg, setMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const available = item.availabilityStatus === "Available" || !item.availabilityStatus;

  const onRequest = () => {
    if (!isLoggedIn) {
      dispatch({ type: "OPEN_AUTH_MODAL", payload: { defaultTab: "login" } });
      return;
    }
    if (!dueDate) {
      setMsg(tt("bookDetail.pickDueDate", "Choose a return date."));
      return;
    }
    setMsg(null);
    startTransition(async () => {
      const res = await requestBookBorrowAction({
        bookId: item._id,
        requestedDueDate: new Date(dueDate).toISOString(),
        requestMessage: borrowNote.trim() || undefined,
        securityDeposit: deposit,
      });
      setMsg(
        res.success
          ? tt("bookDetail.borrowRequestSent", "Borrow request sent!")
          : (res as { message?: string }).message ??
              tt("bookDetail.borrowFailed", "Could not send request."),
      );
    });
  };

  if (!available) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
        <p className="font-semibold text-gray-800">
          {item.availabilityStatus === "Borrowed"
            ? tt("bookDetail.currentlyBorrowed", "Currently borrowed")
            : tt("bookDetail.currentlyReserved", "Currently reserved")}
        </p>
        <p className="mt-1">
          {tt("bookDetail.checkBack", "Check back later or contact the owner.")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-sky-100 bg-sky-50/50 p-4">
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-sky-700" />
        <p className="text-sm font-semibold text-gray-900">
          {tt("bookDetail.requestBorrow", "Request to borrow")}
        </p>
      </div>

      {item.borrowDuration != null && (
        <p className="text-xs text-gray-600">
          Max {item.borrowDuration} days
          {item.allowsExtension &&
            item.maxExtensionDuration != null &&
            ` · Extension up to +${item.maxExtensionDuration}d allowed`}
        </p>
      )}

      {item.safekeepingCharge != null && item.safekeepingCharge > 0 && (
        <div className="rounded-lg border border-sky-100 bg-white p-3 text-sm">
          <p className="font-medium text-gray-800">
            Security deposit: ৳{item.safekeepingCharge}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            Refunded on return. Deducted for damage or late return.
          </p>
          <label className="mt-2 block text-xs font-medium text-gray-600">
            Deposit amount
            <input
              type="number"
              min={0}
              value={deposit}
              onChange={(e) => setDeposit(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </label>
        </div>
      )}

      <label className="block text-xs font-medium text-gray-600">
        {tt("bookDetail.returnBy", "Preferred return date")}
        <input
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
      </label>
      <label className="block text-xs font-medium text-gray-600">
        {tt("bookDetail.message", "Message to owner (optional)")}
        <textarea
          value={borrowNote}
          onChange={(e) => setBorrowNote(e.target.value)}
          rows={2}
          placeholder="e.g. I'm in CSE 3rd year and need this for my OS mid…"
          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
      </label>
      <Button type="button" uppercase={false} onClick={onRequest} disabled={isPending}>
        {isPending
          ? tt("bookDetail.sending", "Sending…")
          : tt("bookDetail.sendBorrowRequest", "Send borrow request")}
      </Button>
      {msg && (
        <p className="text-sm text-gray-700" role="status">
          {msg}
        </p>
      )}
    </div>
  );
}

function SellingActionPanel({
  item,
  tt,
}: {
  item: BookListing;
  tt: (k: string, f: string) => string;
}) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [cartMsg, setCartMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const stock = Math.max(0, item.quantity ?? 1);
  const maxQty = stock > 0 ? stock : 1;

  const addToCart = async () => {
    const res = await addToCartAction({ contentId: item._id, type: "book", quantity });
    if (res.success) {
      emitCartUpdated();
      setCartMsg(tt("bookDetail.addedToCart", "Added to cart."));
      return true;
    }
    setCartMsg(
      (res as { message?: string }).message ??
        tt("bookDetail.couldNotAddToCart", "Could not add to cart."),
    );
    return false;
  };

  return (
    <div className="flex items-start gap-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="rounded border border-gray-300 px-2.5 py-1 text-sm"
        >
          -
        </button>
        <span className="min-w-6 text-center text-sm font-semibold">{quantity}</span>
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
          className="rounded border border-gray-300 px-2.5 py-1 text-sm"
        >
          +
        </button>
      </div>
      <div className="flex flex-1 flex-wrap gap-3 pt-0.5">
        <Button
          type="button"
          variant="secondary"
          uppercase={false}
          className="gap-2"
          onClick={() => startTransition(async () => { setCartMsg(null); await addToCart(); })}
          disabled={isPending || stock < 1}
        >
          <ShoppingCart className="h-4 w-4" />
          {isPending
            ? tt("bookDetail.adding", "Adding…")
            : stock < 1
              ? tt("bookDetail.outOfStock", "Out of stock")
              : tt("bookDetail.addToCart", "Add to cart")}
        </Button>
        <Button
          type="button"
          uppercase={false}
          className="gap-2"
          onClick={() =>
            startTransition(async () => {
              setCartMsg(null);
              const ok = await addToCart();
              if (ok) router.push("/cart");
            })
          }
          disabled={isPending || stock < 1}
        >
          {isPending ? tt("bookDetail.processing", "Processing…") : tt("bookDetail.buyNow", "Buy now")}
        </Button>
      </div>
      {cartMsg && (
        <p className="w-full text-sm text-gray-600" role="status">
          {cartMsg}
        </p>
      )}
    </div>
  );
}

function SwapActionPanel({ item, tt }: { item: BookListing; tt: (k: string, f: string) => string }) {
  return (
    <div className="rounded-xl border border-orange-100 bg-orange-50/40 p-4">
      <div className="flex items-center gap-2">
        <ArrowLeftRight className="h-4 w-4 text-orange-600" />
        <p className="text-sm font-semibold text-gray-900">
          {tt("bookDetail.swapInfo", "Available for swap")}
        </p>
      </div>
      <p className="mt-2 text-sm text-gray-600">
        {tt(
          "bookDetail.swapContact",
          "Contact the owner to propose a swap. Use the phone or email below.",
        )}
      </p>
    </div>
  );
}

function DonationActionPanel({
  bookId,
  isLoggedIn,
  onRequireAuth,
  tt,
}: {
  bookId: string;
  isLoggedIn: boolean;
  onRequireAuth: () => void;
  tt: (k: string, f: string) => string;
}) {
  const [donationId, setDonationId] = useState<string | null>(null);
  const [queueCount, setQueueCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const res = await fetchAvailableDonations(1, 50);
        const match = (res.data ?? []).find((d) => {
          const b = d.book;
          const id = typeof b === "object" && b?._id ? b._id : typeof b === "string" ? b : null;
          return id === bookId;
        });
        if (!cancelled) {
          setDonationId(match?._id ?? null);
          setQueueCount(match?.queue?.length ?? 0);
        }
      } catch {
        if (!cancelled) setDonationId(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bookId, isLoggedIn]);

  const onRequest = () => {
    if (!isLoggedIn) {
      onRequireAuth();
      return;
    }
    if (!donationId) {
      setMsg(
        tt(
          "bookDetail.donationNotQueued",
          "This donation is not in the queue yet. Contact the donor or check /books/donations.",
        ),
      );
      return;
    }
    startTransition(async () => {
      const res = await requestDonationAction(donationId, message.trim() || undefined);
      setMsg(
        res.success
          ? tt("bookDetail.donationRequestSent", "Request sent! The donor will pick someone from the queue.")
          : (res as { message?: string }).message ??
              tt("bookDetail.donationRequestFailed", "Could not send request."),
      );
    });
  };

  return (
    <div className="space-y-3 rounded-xl border border-violet-100 bg-violet-50/40 p-4">
      <div className="flex items-center gap-2">
        <Gift className="h-4 w-4 text-violet-600" />
        <p className="text-sm font-semibold text-gray-900">
          {tt("bookDetail.donationInfo", "This book is a free donation")}
        </p>
      </div>
      {loading ? (
        <p className="text-sm text-gray-500">{tt("bookDetail.loading", "Loading…")}</p>
      ) : donationId ? (
        <>
          <p className="text-sm text-gray-600">
            {queueCount > 0
              ? `${queueCount} request(s) in queue. Join the queue below.`
              : tt(
                  "bookDetail.donationQueueEmpty",
                  "No requests yet — be the first in the queue.",
                )}
          </p>
          <label className="block text-xs font-medium text-gray-600">
            {tt("bookDetail.donationMessage", "Message to donor (optional)")}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </label>
          <Button type="button" uppercase={false} onClick={onRequest} disabled={isPending}>
            {isPending
              ? tt("bookDetail.sending", "Sending…")
              : tt("bookDetail.requestDonation", "Request this donation")}
          </Button>
        </>
      ) : (
        <p className="text-sm text-gray-600">
          {tt(
            "bookDetail.donationBrowseQueue",
            "Browse the donation queue or contact the donor below.",
          )}{" "}
          <Link href="/books/donations" className="font-semibold text-[#00A651] hover:underline">
            Donation queue →
          </Link>
        </p>
      )}
      {msg ? (
        <p className="text-sm text-gray-700" role="status">
          {msg}
        </p>
      ) : null}
    </div>
  );
}

function LibraryOnlyPanel({ tt }: { tt: (k: string, f: string) => string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center gap-2">
        <Archive className="h-4 w-4 text-gray-500" />
        <p className="text-sm font-semibold text-gray-800">
          {tt("bookDetail.libraryOnly", "Personal collection — not for sale or lending")}
        </p>
      </div>
      <p className="mt-2 text-sm text-gray-600">
        {tt(
          "bookDetail.libraryOnlyHint",
          "This is a showcase listing. Browse reading lists on student library profiles.",
        )}{" "}
        <Link href="/my-library" className="font-semibold text-[#00A651] hover:underline">
          My library →
        </Link>
      </p>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function BookDetail() {
  const t = useTranslations("common");
  const { state, dispatch } = useAppState();
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const [item, setItem] = useState<BookListing | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isLoggedIn = state.auth.isAuthenticated;
  const currentUserId = state.user.profile?._id;

  const tt = (key: string, fallback: string) => (t.has(key) ? t(key) : fallback);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    void (async () => {
      try {
        const data = await fetchUserBookById(id);
        if (!cancelled) {
          setItem(data);
          setError(data ? null : "Book not found.");
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load book.");
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const images = item?.photos?.length
    ? item.photos.map((p) => p.url).filter(Boolean)
    : ["/placeholder.jpg"];

  const relatedCategoryId =
    item && typeof item.category === "object" && item.category && "_id" in item.category
      ? (item.category as { _id: string })._id
      : typeof item?.category === "string"
        ? item.category
        : undefined;

  const universityId = state.university.selected?._id;
  const { items: relatedRaw } = useBooksList({
    universityId,
    debouncedSearch: "",
    pageSize: 8,
    category: relatedCategoryId,
  });
  const related = relatedRaw.filter((x) => x._id !== item?._id).slice(0, 8);

  if (!id) {
    return (
      <ContentWrapper maxWidth="max-w-7xl mx-auto" padding="lg">
        <p className="text-sm text-gray-600">{tt("bookDetail.invalid", "Invalid book.")}</p>
      </ContentWrapper>
    );
  }

  if (error && !item) {
    return (
      <ContentWrapper maxWidth="max-w-7xl mx-auto" padding="lg">
        <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
        <Link
          href="/books"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#00A651]"
        >
          <ArrowLeft className="h-4 w-4" />
          {tt("bookDetail.backToBooks", "Back to books")}
        </Link>
      </ContentWrapper>
    );
  }

  if (!item) {
    return (
      <ContentWrapper maxWidth="max-w-7xl mx-auto" padding="lg">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-2/3 rounded-lg bg-gray-100" />
          <div className="aspect-[4/3] w-full max-w-xl rounded-2xl bg-gray-100" />
        </div>
      </ContentWrapper>
    );
  }

  const categoryLabel =
    typeof item.category === "object" && item.category && "title" in item.category
      ? (item.category as { title: string }).title
      : tt("bookDetail.campusBooks", "Campus books");

  const owner = typeof item.owner === "object" ? (item.owner as BookOwnerRef) : null;
  const sellerName = owner?.name || item.contactName || tt("bookDetail.owner", "Owner");
  const sellerPhone = owner?.phone || item.contactPhone;
  const sellerPhoto = owner?.profilePhoto;

  const description = item.description || tt("bookDetail.defaultDescription", "Campus textbook listing. Contact the owner for pickup or details.");
  const quality = item.quality || "—";

  const deptLabel =
    typeof item.department === "object" && item.department && "name" in item.department
      ? (item.department as { name?: string }).name
      : typeof item.department === "string"
        ? item.department
        : "—";

  const displayPrice =
    item.type === "Donation" || item.type === "Library Only" || item.price === 0
      ? null
      : item.discountPrice != null && item.discountPrice < item.price
        ? item.discountPrice
        : item.price;

  return (
    <ContentWrapper maxWidth="max-w-7xl mx-auto" padding="md">
      <AppBreadcrumb
        items={[
          { label: tt("bookDetail.home", "Home"), href: "/" },
          { label: tt("bookDetail.books", "Books"), href: "/books" },
          { label: item.title },
        ]}
      />

      <SectionWrapper
        spacing="sm"
        background="white"
        className="mt-6 rounded-2xl border border-gray-100 p-4 md:p-6"
      >
        <div className="grid gap-8 lg:grid-cols-2">
          <ImageGallery title={item.title} images={images} />

          <div className="flex flex-col gap-4">
            {/* Badges row */}
            <div className="flex flex-wrap gap-2">
              <TypeBadge type={item.type} />
              <span className="w-fit rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800">
                {categoryLabel}
              </span>
              {item.isFeatured && (
                <span className="w-fit rounded-md bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800">
                  ⭐ Featured
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">{item.title}</h1>
            {item.author && <p className="text-sm text-gray-600">{item.author}</p>}

            {/* Price / lending terms */}
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <div className="flex flex-wrap items-baseline gap-3">
                {displayPrice == null ? (
                  <span className="text-3xl font-bold text-[#00A651]">Free</span>
                ) : (
                  <>
                    <span className="text-3xl font-bold text-[#00A651]">
                      ৳{displayPrice.toLocaleString()}
                    </span>
                    {item.discountPrice != null && item.discountPrice < item.price && (
                      <span className="text-lg text-gray-400 line-through">
                        ৳{item.price.toLocaleString()}
                      </span>
                    )}
                  </>
                )}
                <span className="text-sm text-gray-500">{quality}</span>
              </div>

              {item.rating != null && item.rating > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <StarDisplay rating={item.rating} size="sm" />
                  <span className="text-sm font-semibold text-gray-800">{item.rating.toFixed(1)}</span>
                  {item.reviewCount != null && (
                    <span className="text-sm text-gray-400">({item.reviewCount} reviews)</span>
                  )}
                </div>
              )}

              {item.type === "Lending" && (
                <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600">
                  {item.borrowDuration != null && (
                    <span>Borrow up to {item.borrowDuration} days.</span>
                  )}
                  {item.allowsExtension && (
                    <span>
                      Extensions allowed
                      {item.maxExtensionDuration != null
                        ? ` (max +${item.maxExtensionDuration}d)`
                        : ""}
                      .
                    </span>
                  )}
                  {item.safekeepingCharge != null && item.safekeepingCharge > 0 && (
                    <span>৳{item.safekeepingCharge} refundable deposit.</span>
                  )}
                </div>
              )}
            </div>

            {/* Owner / contact */}
            <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-700">
              <p className="mb-2 font-medium text-gray-900">
                {tt("bookDetail.contact", "Contact")}
              </p>
              <div className="flex items-center gap-3">
                {sellerPhoto ? (
                  <img
                    src={sellerPhoto}
                    alt={sellerName}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-600">
                    {sellerName.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">{sellerName}</p>
                  {sellerPhone && (
                    <a
                      href={`tel:${sellerPhone}`}
                      className="flex items-center gap-1 text-xs text-[#00A651] hover:underline"
                    >
                      <Phone className="h-3 w-3" />
                      {sellerPhone}
                    </a>
                  )}
                  {item.contactEmail && (
                    <p className="text-xs text-gray-500">{item.contactEmail}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Action panel based on type */}
            {item.type === "Lending" && (
              <LendingActionPanel
                item={item}
                isLoggedIn={isLoggedIn}
                dispatch={dispatch}
                tt={tt}
              />
            )}
            {item.type === "Selling" && <SellingActionPanel item={item} tt={tt} />}
            {item.type === "Swap" && <SwapActionPanel item={item} tt={tt} />}
            {item.type === "Donation" && (
              <DonationActionPanel
                bookId={item._id}
                isLoggedIn={isLoggedIn}
                onRequireAuth={() =>
                  dispatch({ type: "OPEN_AUTH_MODAL", payload: { defaultTab: "login" } })
                }
                tt={tt}
              />
            )}
            {(item.type === "Library Only" || item.type === "Request Based") && (
              <LibraryOnlyPanel tt={tt} />
            )}
          </div>
        </div>
      </SectionWrapper>

      {/* Description & Details */}
      <SectionWrapper spacing="sm" background="transparent" className="mt-6">
        <details open className="rounded-xl border border-gray-100 bg-white p-4">
          <summary className="cursor-pointer list-none font-semibold text-gray-900">
            {tt("bookDetail.description", "Description")}
          </summary>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
            {description}
          </p>
        </details>
        <details className="mt-3 rounded-xl border border-gray-100 bg-white p-4">
          <summary className="cursor-pointer list-none font-semibold text-gray-900">
            {tt("bookDetail.details", "Details")}
          </summary>
          <div className="mt-3 grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
            {[
              ["Subject", item.subject],
              ["Course", item.courseCode],
              ["Semester", item.semester],
              ["Edition", item.edition],
              ["Publisher", item.publisher],
              ["Language", item.language],
              ["Year purchased", item.buyingYear],
              ["Department", deptLabel],
            ].map(
              ([label, val]) =>
                val && (
                  <p key={label as string}>
                    <span className="text-gray-500">{label}:</span> {val}
                  </p>
                ),
            )}
          </div>
        </details>

        {/* Reviews */}
        <ReviewsSection bookId={item._id} currentUserId={currentUserId} tt={tt} />
      </SectionWrapper>

      {/* Related books */}
      <SectionWrapper spacing="sm" background="transparent" className="mt-6">
        <SectionHeader
          title={tt("bookDetail.related", "Related books")}
          subtitle={tt("bookDetail.relatedSub", "More you may like.")}
          viewAllHref={
            relatedCategoryId
              ? `/books/all?category=${encodeURIComponent(relatedCategoryId)}`
              : "/books/all"
          }
        />
        {related.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
            {tt("bookDetail.noRelated", "No related books yet.")}
          </p>
        ) : (
          <div className="mt-4">
            <ResponsiveCardsGrid>
              {related.map((r) => (
                <BookListingCard key={r._id} item={r} />
              ))}
            </ResponsiveCardsGrid>
          </div>
        )}
      </SectionWrapper>
    </ContentWrapper>
  );
}
