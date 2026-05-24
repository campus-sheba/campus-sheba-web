"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { ArrowLeft, Star, Phone, BookOpen, ArrowLeftRight, Gift, Archive, BookmarkPlus } from "lucide-react";
import { toast } from "sonner";
import { Link, useRouter } from "@/i18n/navigation";
import type { AppStateAction } from "@/types/global";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import { Button } from "@/components/ui";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import { ResponsiveCardsGrid } from "@/components/marketplace/ResponsiveCardsGrid";
import { ImageGallery } from "@/components/marketplace/ImageGallery";
import { SectionHeader } from "@/components/marketplace/SectionHeader";
import { buyNowAction } from "@/services/cart";
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
import { addToReadingListAction } from "@/services/user-library";
import type { BookListing, BookReview, BookOwnerRef, ReadingStatus } from "@/types/book";
import { useBooksList } from "@/modules/books/hooks/useBooksList";
import { useAppState } from "@/contexts/AppStateContext";
import BookListingCard from "./BookListingCard";
import { isBookOwner } from "@/modules/orders/orderFulfillment";
import { useTranslations } from "next-intl";

/**
 * MVP pilot scope: only Sell + Showcase flows are exposed in the web.
 * Lend / Swap / Donation panels stay in the code but are hidden behind this
 * flag so the full flow can be re-enabled in a later phase without rework.
 */
const ENABLE_NON_SALE_FLOWS: boolean = false;

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
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#E30B12] focus:outline-none"
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
              <p className="mt-2 text-sm leading-relaxed text-gray-700">
                {rv.comment ?? rv.body}
              </p>
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
  const [msg, setMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Deposit is set by the lender on the listing; borrower cannot alter it.
  const deposit = item.safekeepingCharge ?? 0;
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
            Security deposit: <span className="font-bold">৳{item.safekeepingCharge}</span>
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            {tt(
              "bookDetail.depositHint",
              "Held from your wallet on approval. Refunded on return (less any damage or late fee).",
            )}
          </p>
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
  isOwner,
}: {
  item: BookListing;
  tt: (k: string, f: string) => string;
  isOwner: boolean;
}) {
  if (isOwner) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
        <p className="font-semibold text-gray-900">
          {tt("bookDetail.yourListing", "This is your listing")}
        </p>
        <p className="mt-1 text-gray-600">
          {tt(
            "bookDetail.manageInDashboard",
            "Buyers can purchase from this page. Manage the listing from My Books.",
          )}
        </p>
        <Link
          href={`/my-books/${item._id}/edit`}
          className="mt-3 inline-flex text-sm font-semibold text-[#E30B12] hover:underline"
        >
          {tt("bookDetail.editListing", "Edit listing")}
        </Link>
      </div>
    );
  }
  const router = useRouter();
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const stock = Math.max(0, item.quantity ?? 1);

  const onBuyNow = () => {
    startTransition(async () => {
      setActionMsg(null);
      const res = await buyNowAction({ contentId: item._id, type: "book" });
      if (res.success) {
        emitCartUpdated();
        router.push("/checkout");
        return;
      }
      setActionMsg(
        res.message ?? tt("bookDetail.couldNotCheckout", "Could not start checkout."),
      );
    });
  };

  return (
    <div>
      <Button
        type="button"
        uppercase={false}
        className="gap-2"
        onClick={onBuyNow}
        disabled={isPending || stock < 1}
      >
        {isPending
          ? tt("bookDetail.processing", "Processing…")
          : stock < 1
            ? tt("bookDetail.outOfStock", "Out of stock")
            : tt("bookDetail.buyNow", "Buy now")}
      </Button>
      {actionMsg && (
        <p className="mt-2 text-sm text-gray-600" role="status">
          {actionMsg}
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
          <Link href="/books/donations" className="font-semibold text-[#E30B12] hover:underline">
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

/** Compact "track this book" action — works for any book type, logged-in only. */
function AddToReadingListAction({
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
  const [status, setStatus] = useState<ReadingStatus>("wishlist");
  const [added, setAdded] = useState(false);
  const [isPending, startTransition] = useTransition();

  const onAdd = () => {
    if (!isLoggedIn) {
      onRequireAuth();
      return;
    }
    startTransition(async () => {
      const res = await addToReadingListAction({ bookId, status });
      if (res.success) {
        setAdded(true);
        toast.success(
          tt("bookDetail.addedToReadingList", "Added to your reading list."),
        );
      } else {
        const message =
          (res as { message?: string }).message ??
          tt("bookDetail.readingListFailed", "Could not add to reading list.");
        if (message.toLowerCase().includes("duplicate") || message.includes("409")) {
          setAdded(true);
          toast.info(
            tt("bookDetail.alreadyOnReadingList", "Already on your reading list."),
          );
        } else {
          toast.error(message);
        }
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-100 bg-white px-4 py-3">
      <BookmarkPlus className="h-4 w-4 text-[#E30B12]" />
      <span className="text-sm font-medium text-gray-800">
        {tt("bookDetail.trackThisBook", "Track this book")}
      </span>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as ReadingStatus)}
        disabled={isPending || added}
        className="rounded-lg border border-gray-200 px-2 py-1 text-xs"
        aria-label="Reading status"
      >
        <option value="wishlist">{tt("bookDetail.statusWishlist", "Wishlist")}</option>
        <option value="reading">{tt("bookDetail.statusReading", "Reading")}</option>
        <option value="completed">{tt("bookDetail.statusCompleted", "Completed")}</option>
      </select>
      <Button
        type="button"
        variant="outline"
        uppercase={false}
        className="h-8 shrink-0 text-xs"
        disabled={isPending || added}
        onClick={onAdd}
      >
        {added
          ? tt("bookDetail.onReadingList", "On your list")
          : isPending
            ? tt("bookDetail.adding", "Adding…")
            : tt("bookDetail.addToReadingList", "Add to list")}
      </Button>
    </div>
  );
}

/** MVP fallback for legacy lend/swap/donation listings reached via direct link. */
function UnavailableForPurchasePanel({ tt }: { tt: (k: string, f: string) => string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center gap-2">
        <Archive className="h-4 w-4 text-gray-500" />
        <p className="text-sm font-semibold text-gray-800">
          {tt("bookDetail.notAvailable", "Not available for purchase right now")}
        </p>
      </div>
      <p className="mt-2 text-sm text-gray-600">
        {tt(
          "bookDetail.notAvailableHint",
          "This listing isn't open for transactions yet. Browse books for sale on campus instead.",
        )}{" "}
        <Link href="/books" className="font-semibold text-[#E30B12] hover:underline">
          Browse books →
        </Link>
      </p>
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
        <Link href="/my-library" className="font-semibold text-[#E30B12] hover:underline">
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
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#E30B12]"
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

  const basePrice = item.price ?? 0;
  const displayPrice = (() => {
    if (item.type === "Donation" || item.type === "Library Only") return null;
    const effective =
      item.discountPrice != null &&
      item.discountPrice > 0 &&
      (basePrice <= 0 || item.discountPrice < basePrice)
        ? item.discountPrice
        : basePrice;
    return effective > 0 ? effective : null;
  })();

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
                  <span className="text-3xl font-bold text-[#E30B12]">Free</span>
                ) : (
                  <>
                    <span className="text-3xl font-bold text-[#E30B12]">
                      ৳{displayPrice.toLocaleString()}
                    </span>
                    {item.discountPrice != null &&
                      basePrice > 0 &&
                      item.discountPrice < basePrice && (
                      <span className="text-lg text-gray-400 line-through">
                        ৳{basePrice.toLocaleString()}
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
                      className="flex items-center gap-1 text-xs text-[#E30B12] hover:underline"
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

            {/* Reading list — universal, works for any book type */}
            <AddToReadingListAction
              bookId={item._id}
              isLoggedIn={isLoggedIn}
              onRequireAuth={() =>
                dispatch({ type: "OPEN_AUTH_MODAL", payload: { defaultTab: "login" } })
              }
              tt={tt}
            />

            {/* Action panel based on type — MVP exposes Sell + Showcase only */}
            {item.type === "Selling" && (
              <SellingActionPanel
                item={item}
                tt={tt}
                isOwner={isBookOwner(item, currentUserId)}
              />
            )}
            {(item.type === "Library Only" || item.type === "Request Based") && (
              <LibraryOnlyPanel tt={tt} />
            )}

            {/* Non-sale flows (Lend/Swap/Donation) — hidden for MVP pilot */}
            {ENABLE_NON_SALE_FLOWS && item.type === "Lending" && (
              <LendingActionPanel
                item={item}
                isLoggedIn={isLoggedIn}
                dispatch={dispatch}
                tt={tt}
              />
            )}
            {ENABLE_NON_SALE_FLOWS && item.type === "Swap" && (
              <SwapActionPanel item={item} tt={tt} />
            )}
            {ENABLE_NON_SALE_FLOWS && item.type === "Donation" && (
              <DonationActionPanel
                bookId={item._id}
                isLoggedIn={isLoggedIn}
                onRequireAuth={() =>
                  dispatch({ type: "OPEN_AUTH_MODAL", payload: { defaultTab: "login" } })
                }
                tt={tt}
              />
            )}
            {!ENABLE_NON_SALE_FLOWS &&
              (item.type === "Lending" ||
                item.type === "Swap" ||
                item.type === "Donation") && <UnavailableForPurchasePanel tt={tt} />}
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
                <BookListingCard key={r._id} item={r} currentUserId={currentUserId} />
              ))}
            </ResponsiveCardsGrid>
          </div>
        )}
      </SectionWrapper>
    </ContentWrapper>
  );
}
