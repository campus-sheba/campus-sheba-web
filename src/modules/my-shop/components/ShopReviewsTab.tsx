"use client";

import { useEffect, useState, useTransition } from "react";
import {
  getReviewsAction,
  respondToReviewAction,
  type Review,
  type ReviewItemType,
} from "@/app/[locale]/(protected)/(dashboard)/my-shop/actions";
import { Star, MessageSquareDashed, Send, Filter, CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button";

const TABS: { id: ReviewItemType; label: string }[] = [
  { id: "shop", label: "Shop Reviews" },
  { id: "product", label: "Product Reviews" },
  { id: "food", label: "Food Reviews" },
  { id: "book", label: "Book Reviews" },
];

export default function ShopReviewsTab() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Filters State
  const [type, setType] = useState<ReviewItemType>("shop");
  const [rating, setRating] = useState<string>("all");
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Response State
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");

  useEffect(() => {
    fetchReviews();
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
      const res = await respondToReviewAction(reviewId, responseText);
      if (res.success) {
        setRespondingTo(null);
        setResponseText("");
        await fetchReviews();
      } else {
        alert(res.message || "Failed to submit response.");
      }
    });
  }

  // Helper
  const renderStars = (ratingNum: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < ratingNum ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"
        }`}
      />
    ));
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      
      {/* Settings / Filters header */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        {/* Top bar: Type Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => { setType(t.id); setPage(1); }}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                type === t.id
                  ? "bg-[#E30A13] text-white shadow-md shadow-[#E30A13]/20"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Bottom bar: Filters */}
        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-gray-50">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1"><Filter className="w-3 h-3"/> Rating Filter</label>
            <select
              value={rating}
              onChange={(e) => { setRating(e.target.value); setPage(1); }}
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#E30A13]"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer mt-5">
            <div className={`w-8 h-4 rounded-full relative transition-colors ${isVerified ? "bg-[#E30A13]" : "bg-gray-300"}`}>
              <span className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${isVerified ? "translate-x-4" : "translate-x-0"}`} />
            </div>
            <input type="checkbox" checked={isVerified} onChange={(e) => { setIsVerified(e.target.checked); setPage(1); }} className="hidden" />
            <span className="text-xs font-bold text-gray-600">Verified Purchases Only</span>
          </label>
        </div>
      </div>

      {loading ? (
        <div className="py-10 flex flex-col items-center justify-center">
          <span className="w-8 h-8 border-4 border-[#E30A13]/20 border-t-[#E30A13] rounded-full animate-spin mb-3" />
          <span className="text-sm font-medium text-gray-500">Loading reviews...</span>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-gray-300">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-6 h-6 text-amber-500 fill-amber-500/20" />
          </div>
          <p className="text-gray-900 font-bold text-lg mb-1">No reviews yet</p>
          <p className="text-gray-500 text-sm">When customers leave feedback, it will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const date = review.createdAt ? new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recently';
            
            return (
              <div key={review._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden">
                      {review.user?.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={review.user.avatar} alt="User" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">
                          {review.user?.name?.slice(0, 2).toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{review.user?.name || "Unknown User"}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex gap-0.5">{renderStars(review.rating || 0)}</div>
                        <span className="text-[10px] font-medium text-gray-400">{date}</span>
                      </div>
                    </div>
                  </div>
                  {review.isVerifiedPurchase && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-blue-50 text-blue-700">
                      <CheckCircle className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>

                <div className="mt-1 mb-4">
                  <p className="text-sm text-gray-700 leading-relaxed max-w-3xl">
                    {review.comment ? review.comment : <span className="text-gray-400 italic">No comment provided.</span>}
                  </p>
                </div>

                {/* Response Structure */}
                <div className="mt-auto pt-4 border-t border-gray-50">
                  {review.response ? (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 relative">
                      <div className="absolute -top-2 left-6 w-4 h-4 bg-gray-50 border-t border-l border-gray-100 rotate-45" />
                      <p className="text-xs font-bold text-gray-900 mb-1">Your Response</p>
                      <p className="text-sm text-gray-600">{review.response}</p>
                    </div>
                  ) : respondingTo === review._id ? (
                    <form onSubmit={(e) => handleRespondSubmit(e, review._id)} className="flex items-end gap-2 animate-in slide-in-from-top-2">
                       <textarea
                         value={responseText}
                         onChange={(e) => setResponseText(e.target.value)}
                         placeholder="Write your public response to this review..."
                         className="flex-1 min-h-[40px] max-h-32 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E30A13]/30 focus:border-[#E30A13] transition resize-y"
                         required
                       />
                       <Button type="submit" size="sm" uppercase={false} disabled={isPending} className="!bg-[#E30A13] border-none shadow-sm pb-1 shrink-0 h-10">
                         {isPending ? "..." : <Send className="w-4 h-4" />}
                       </Button>
                       <Button type="button" variant="ghost" size="sm" onClick={() => { setRespondingTo(null); setResponseText(""); }} className="h-10 px-2 shrink-0">
                         Cancel
                       </Button>
                    </form>
                  ) : (
                    <button
                      onClick={() => { setRespondingTo(review._id); setResponseText(""); }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E30A13] hover:text-[#c40810] transition-colors"
                    >
                      <MessageSquareDashed className="w-4 h-4" /> Reply to Review
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          
          <div className="flex justify-between items-center py-4 px-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading}>Previous</Button>
            <span className="text-xs font-medium text-gray-500">Page {page}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={reviews.length < limit || loading}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
