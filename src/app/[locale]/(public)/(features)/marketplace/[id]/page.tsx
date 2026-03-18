"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Star, MapPin, Phone, Shield, ChevronLeft, CheckCircle2, X } from "lucide-react";

const PRODUCTS: Record<string, {
  id: string; name: string; price: number; rating: number; category: string;
  seller: string; sellerPhone: string; campus: string; accent: string; condition: string;
  description: string; negotiable: boolean; postedDate: string;
}> = {
  p1: { id: "p1", name: "Casio FX-991EX Calculator", price: 1200, rating: 4.8, category: "Electronics", seller: "Rakib Hassan", sellerPhone: "01XXXXXXXXX", campus: "JU", accent: "from-blue-400 to-blue-600", condition: "New", description: "Brand new Casio FX-991EX scientific calculator, still in box. Purchased but not needed. Supports complex numbers, integration, matrix calculations.", negotiable: false, postedDate: "2 days ago" },
  p2: { id: "p2", name: "HP Laptop Bag 15.6\"", price: 650, rating: 4.5, category: "Electronics", seller: "Sadia Islam", sellerPhone: "01XXXXXXXXX", campus: "JU", accent: "from-gray-400 to-gray-600", condition: "Like New", description: "HP laptop bag for up to 15.6 inch laptops. Multiple compartments. Used only a few times, excellent condition.", negotiable: true, postedDate: "5 days ago" },
};

export default function MarketplaceDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = use(params);
  const product = PRODUCTS[id] || PRODUCTS["p1"];
  const [ordered, setOrdered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [buyerPhone, setBuyerPhone] = useState("");
  const [meetupNote, setMeetupNote] = useState("");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="cs-container py-8 max-w-3xl">
        <Link href={`/${locale}/marketplace`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6">
          <ChevronLeft className="w-4 h-4" /> Back to Marketplace
        </Link>

        {ordered ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Sent!</h2>
            <p className="text-gray-500 text-sm mb-1">Your purchase request has been sent to {product.seller}.</p>
            <p className="text-gray-400 text-sm mb-6">They will contact you at <strong>{buyerPhone}</strong> to arrange the meetup.</p>
            <Link href={`/${locale}/marketplace`} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700">
              Browse More Items
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Product Image */}
            <div className={`h-64 sm:h-auto min-h-[280px] bg-gradient-to-br ${product.accent} rounded-2xl flex items-center justify-center`}>
              <ShoppingBag className="w-20 h-20 text-white/50" />
            </div>

            {/* Product Info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 inline-block ${product.condition === "New" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                  {product.condition}
                </span>
                <h1 className="text-xl font-bold text-gray-900 mt-1">{product.name}</h1>
                <p className="text-2xl font-bold text-emerald-600 mt-2">৳{product.price.toLocaleString()}</p>
                {product.negotiable && <p className="text-xs text-amber-600 font-medium">Price is negotiable</p>}
              </div>

              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span>Campus-verified seller</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{product.campus} Campus</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>{product.rating} rating • Posted {product.postedDate}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-500 mb-1">Seller</p>
                <p className="font-semibold text-gray-900">{product.seller}</p>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setShowModal(true)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors">
                  <ShoppingBag className="w-4 h-4" />
                  Buy Now
                </button>
                <a href={`tel:${product.sellerPhone}`} className="w-12 h-12 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Buy Modal */}
        {showModal && (
          <>
            <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowModal(false)} />
            <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-white rounded-2xl p-6 z-51 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Confirm Purchase</h3>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 mb-4">
                <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                <p className="text-emerald-600 font-bold">৳{product.price.toLocaleString()}</p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Your Phone Number</label>
                  <input value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} placeholder="01XXXXXXXXX" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Meetup Note (optional)</label>
                  <input value={meetupNote} onChange={(e) => setMeetupNote(e.target.value)} placeholder="e.g. Available at 3 PM near Library" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-emerald-400" />
                </div>
                <button disabled={!buyerPhone} onClick={() => { setShowModal(false); setOrdered(true); }} className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                  Send Purchase Request
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
