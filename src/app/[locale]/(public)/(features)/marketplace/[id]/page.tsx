"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ShoppingBag } from "lucide-react";
import { addBuySellToCartAction, getBuySellByIdAction, type BuySellItem } from "../actions";

export default function MarketplaceDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = use(params);
  const [product, setProduct] = useState<BuySellItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const result = await getBuySellByIdAction(id);
      if (!mounted) return;
      setProduct(result.success ? result.data : null);
      setLoading(false);
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="cs-container py-8 max-w-3xl">
        <Link href={`/${locale}/marketplace`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6">
          <ChevronLeft className="w-4 h-4" /> Back to Marketplace
        </Link>

        {loading ? (
          <div className="py-12 text-sm text-gray-500">Loading listing...</div>
        ) : !product ? (
          <div className="py-12 text-sm text-red-500">Listing not found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="h-64 sm:h-auto min-h-[280px] bg-gradient-to-br from-emerald-300 to-emerald-600 rounded-2xl flex items-center justify-center overflow-hidden">
              {product.photos?.[0]?.url ? (
                <img src={product.photos[0].url} alt={product.title} className="h-full w-full object-cover" />
              ) : (
                <ShoppingBag className="w-20 h-20 text-white/50" />
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 inline-block bg-blue-100 text-blue-700">
                  {product.condition ?? "N/A"}
                </span>
                <h1 className="text-xl font-bold text-gray-900 mt-1">{product.title}</h1>
                <p className="text-2xl font-bold text-emerald-600 mt-2">৳{(product.price ?? 0).toLocaleString()}</p>
                {product.negotiable ? <p className="text-xs text-amber-600 font-medium">Price is negotiable</p> : null}
              </div>

              <p className="text-sm text-gray-600 leading-relaxed">{product.description ?? "No description available."}</p>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-500 mb-1">Seller</p>
                <p className="font-semibold text-gray-900">{product.owner?.name ?? product.contactName ?? "Seller"}</p>
                <p className="text-xs text-gray-500 mt-1">{product.contactPhone ?? "No phone number"}</p>
              </div>

              {feedback ? <p className="text-sm text-green-600">{feedback}</p> : null}
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    const result = await addBuySellToCartAction(product._id, 1);
                    setFeedback(result.success ? "Added to cart successfully." : result.message ?? "Failed to add to cart.");
                  }}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors"
                >
                  Add to Cart
                </button>
                <Link href={`/${locale}/cart`} className="flex-1 py-3 rounded-xl border border-gray-200 text-center text-sm font-semibold hover:bg-gray-50">
                  Go to Cart
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
