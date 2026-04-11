"use client";

import { useEffect, useState, useTransition } from "react";
import { getReviewsAction, respondToReviewAction } from "@/services/owner-shop-hub";
import type { Review, ReviewItemType } from "@/types/owner-shop-hub";
import { Star, MessageSquareDashed, Send, Filter, CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button";

const TABS: { id: ReviewItemType; label: string }[] = [
  { id: "shop", label: "Shop reviews" },
  { id: "product", label: "Product reviews" },
  { id: "food", label: "Food reviews" },
  { id: "book", label: "Book reviews" },
];

export default function ShopReviewsTab() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [type, setType] = useState<ReviewItemType>("shop");
  const [rating, setRating] = useState<string>("all");
  const [isVerified, setIsVerified] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");

  useEffect(() => {
    void fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, rating, isVerified, page]);

  async function fetchReviews() {
    setLoading(true);
    const params: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
    };
    if (rating !== "all") params.rating = rating;
    if (isVerified) params.isVerifiedPurchase = "true";

    const res = await getReviewsAction(type, params);
    if (res.success) {
      setReviews(res.data);
    } else {
      setReviews([]);
    }
    setLoading(false);
  }

  function handleRespondSubmit(e: React.FormEvent, reviewId: string) {
    e.preventDefault();
    if (!responseText.trim()) return;

    startTransition(async () => {
      const res = await respondToReviewAction(reviewId, responseText.trim());
      if (res.success) {
        setRespondingTo(null);
        setResponseText("");
        await fetchReviews();
      } else {
        alert(res.message ?? "Failed to submit response.");
      }
    });
  }

  const renderStars = (ratingNum: number) =>
    Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < ratingNum ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`}
      />
    ));

  return (
    <div className="space-y-4">
      <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setType(t.id);
                setPage(1);
              }}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                type === t.id
                  ? "bg-[#00A651] text-white shadow-md shadow-[#00A651]/20"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4 border-t border-gray-50 pt-3">
          <div className="space-y-1">
            <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">
              <Filter className="h-3 w-3" /> Rating
            </label>
            <select
              value={rating}
              onChange={(e) => {
                setRating(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium focus:border-[#00A651] focus:outline-none"
            >
              <option value="all">All ratings</option>
              <option value="5">5 stars</option>
              <option value="4">4 stars</option>
              <option value="3">3 stars</option>
              <option value="2">2 stars</option>
              <option value="1">1 star</option>
            </select>
          </div>

          <label className="mt-5 flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={isVerified}
              onChange={(e) => {
                setIsVerified(e.target.checked);
                setPage(1);
              }}
              className="rounded border-gray-300 text-[#00A651] focus:ring-[#00A651]"
            />
            <span className="text-xs font-bold text-gray-600">Verified purchases only</span>
          </label>
        </div>

        <p className="text-xs text-gray-500">Review APIs are not wired yet; this layout is ready for integration.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-10">
          <span className="mb-3 h-8 w-8 animate-spin rounded-full border-4 border-[#00A651]/20 border-t-[#00A651]" />
          <span className="text-sm font-medium text-gray-500">Loading reviews…</span>
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
            <Star className="h-6 w-6 fill-amber-500/20 text-amber-500" />
          </div>
          <p className="mb-1 text-lg font-bold text-gray-900">No reviews yet</p>
          <p className="text-sm text-gray-500">When customers leave feedback, it will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const date = review.createdAt
              ? new Date(review.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
              : "Recently";

            return (
              <div key={review._id} className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
                      {review.user?.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={review.user.avatar} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-bold text-gray-400">
                          {review.user?.name?.slice(0, 2).toUpperCase() ?? "U"}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{review.user?.name ?? "Unknown user"}</h4>
                      <div className="mt-0.5 flex items-center gap-2">
                        <div className="flex gap-0.5">{renderStars(review.rating ?? 0)}</div>
                        <span className="text-[10px] font-medium text-gray-400">{date}</span>
                      </div>
                    </div>
                  </div>
                  {review.isVerifiedPurchase ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                      <CheckCircle className="h-3 w-3" /> Verified
                    </span>
                  ) : null}
                </div>

                <div className="mb-4 mt-1">
                  <p className="max-w-3xl text-sm leading-relaxed text-gray-700">
                    {review.comment ? (
                      review.comment
                    ) : (
                      <span className="italic text-gray-400">No comment provided.</span>
                    )}
                  </p>
                </div>

                <div className="mt-auto border-t border-gray-50 pt-4">
                  {review.response ? (
                    <div className="relative rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <div className="absolute -left-px -top-2 left-6 h-4 w-4 rotate-45 border-l border-t border-gray-100 bg-gray-50" />
                      <p className="mb-1 text-xs font-bold text-gray-900">Your response</p>
                      <p className="text-sm text-gray-600">{review.response}</p>
                    </div>
                  ) : respondingTo === review._id ? (
                    <form onSubmit={(e) => handleRespondSubmit(e, review._id)} className="flex flex-wrap items-end gap-2">
                      <textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Write your public response…"
                        className="min-h-[40px] max-h-32 flex-1 resize-y rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-[#00A651] focus:outline-none focus:ring-2 focus:ring-[#00A651]/25"
                        required
                      />
                      <Button
                        type="submit"
                        size="sm"
                        uppercase={false}
                        disabled={isPending}
                        className="h-10 shrink-0 !border-0 !bg-[#00A651] !text-white hover:!brightness-110"
                      >
                        {isPending ? "…" : <Send className="h-4 w-4" />}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setRespondingTo(null);
                          setResponseText("");
                        }}
                        className="h-10 shrink-0 px-2"
                      >
                        Cancel
                      </Button>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setRespondingTo(review._id);
                        setResponseText("");
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00A651] transition-colors hover:text-[#008a45]"
                    >
                      <MessageSquareDashed className="h-4 w-4" /> Reply to review
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          <div className="flex items-center justify-between px-2 py-4">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || loading}>
              Previous
            </Button>
            <span className="text-xs font-medium text-gray-500">Page {page}</span>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={reviews.length < limit || loading}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
