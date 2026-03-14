"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Search, Filter, Star, Heart, ShoppingCart, X, CheckCircle2, MapPin } from "lucide-react";

const CATEGORIES = ["All", "Electronics", "Books & Stationery", "Clothing", "Furniture", "Sports", "Daily Essentials"];

const PRODUCTS = [
  { id: "p1", name: "Casio FX-991EX Calculator", price: 1200, rating: 4.8, category: "Electronics", seller: "Rakib Hassan", campus: "JU", accent: "from-blue-400 to-blue-600", condition: "New" },
  { id: "p2", name: "HP Laptop Bag 15.6\"", price: 650, rating: 4.5, category: "Electronics", seller: "Sadia Islam", campus: "JU", accent: "from-gray-400 to-gray-600", condition: "Like New" },
  { id: "p3", name: "University Hoodie (XL)", price: 850, rating: 4.3, category: "Clothing", seller: "Tariq Aziz", campus: "JU", accent: "from-purple-400 to-purple-600", condition: "New" },
  { id: "p4", name: "Wooden Study Chair", price: 2500, rating: 4.6, category: "Furniture", seller: "Mahmud Khan", campus: "JU", accent: "from-amber-400 to-amber-600", condition: "Good" },
  { id: "p5", name: "Engineering Drawing Set", price: 380, rating: 4.7, category: "Books & Stationery", seller: "Nadia Rahman", campus: "JU", accent: "from-green-400 to-green-600", condition: "New" },
  { id: "p6", name: "Cricket Bat (Kashmir Willow)", price: 1800, rating: 4.4, category: "Sports", seller: "Alim Hossain", campus: "JU", accent: "from-yellow-400 to-yellow-600", condition: "Used" },
  { id: "p7", name: "A4 Spiral Notebooks (10 pack)", price: 250, rating: 4.9, category: "Books & Stationery", seller: "Fariha Akter", campus: "JU", accent: "from-red-400 to-red-600", condition: "New" },
  { id: "p8", name: "Mini Electric Kettle", price: 750, rating: 4.6, category: "Daily Essentials", seller: "Rahim Uddin", campus: "JU", accent: "from-teal-400 to-teal-600", condition: "Like New" },
];

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [wishlist, setWishlist] = useState<string[]>([]);

  const filtered = PRODUCTS.filter(
    (p) =>
      (category === "All" || p.category === category) &&
      p.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white">
        <div className="cs-container py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-emerald-200 text-sm font-medium">Campus Marketplace</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Buy & Sell on Campus</h1>
          <p className="text-emerald-200 text-sm max-w-lg">Buy, sell and trade secondhand items with trusted campus students. Safe deals, campus verified.</p>
          <div className="mt-5 flex gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-300" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/15 border border-white/20 text-white placeholder:text-emerald-300 text-sm outline-none focus:bg-white/25" />
            </div>
            <Link href="marketplace/shop/create" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-emerald-700 font-semibold text-sm hover:bg-emerald-50 transition-colors">
              + Sell Item
            </Link>
          </div>
        </div>
      </div>

      <div className="cs-container py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Active Listings", value: "1,240+" },
            { label: "Happy Buyers", value: "3,800+" },
            { label: "Avg. Response", value: "< 30 min" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
              <p className="text-lg font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-6 no-scrollbar">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCategory(c)} className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${category === c ? "bg-emerald-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-emerald-300"}`}>
              {c}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
              <div className="relative">
                <div className={`h-36 bg-gradient-to-br ${p.accent} flex items-center justify-center`}>
                  <ShoppingBag className="w-10 h-10 text-white/50" />
                </div>
                <button onClick={() => toggleWishlist(p.id)} className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center shadow-sm">
                  <Heart className={`w-4 h-4 ${wishlist.includes(p.id) ? "text-red-500 fill-red-500" : "text-gray-400"}`} />
                </button>
                <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${p.condition === "New" ? "bg-green-100 text-green-700" : p.condition === "Like New" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                  {p.condition}
                </span>
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{p.name}</h3>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-xs text-gray-600">{p.rating}</span>
                  <span className="text-xs text-gray-300">•</span>
                  <span className="text-xs text-gray-400">{p.campus}</span>
                </div>
                <div className="flex items-center justify-between mt-2.5">
                  <p className="text-base font-bold text-gray-900">৳{p.price.toLocaleString()}</p>
                  <Link href={`marketplace/${p.id}`} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors">
                    <ShoppingCart className="w-3 h-3" /> Buy
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No products found</p>
          </div>
        )}
      </div>
    </div>
  );
}
