"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Search, Filter, Star, Heart, ShoppingCart, X, CheckCircle2, MapPin } from "lucide-react";
import { useParams } from "next/navigation";
import { getBuySellListingsAction, type BuySellItem } from "./actions";
import { useAppState } from "@/contexts/AppStateContext";

export default function MarketplacePage() {
  const params = useParams();
  const locale = params.locale as string;
  const { state } = useAppState();
  const selectedUniversityId = state.university.selected?._id;
  const [products, setProducts] = useState<BuySellItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const result = await getBuySellListingsAction({
        page: 1,
        limit: 30,
        ...(selectedUniversityId ? { university: selectedUniversityId } : {}),
      });
      if (!mounted) return;
      if (!result.success) {
        setError(result.message ?? "Failed to load listings");
      } else {
        setProducts(result.data.data);
      }
      setLoading(false);
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [selectedUniversityId]);

  const categories = useMemo(() => {
    const dynamic = Array.from(
      new Set(
        products
          .map((product) => product.category?.title)
          .filter((title): title is string => Boolean(title)),
      ),
    );
    return ["All", ...dynamic];
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter(
      (p) =>
        (category === "All" || p.category?.title === category) &&
        p.title.toLowerCase().includes(search.toLowerCase()),
    );
  }, [products, category, search]);

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
            { label: "Active Listings", value: String(products.length) },
            { label: "Flow", value: "BuySell" },
            { label: "Checkout", value: "Cart + Summary" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
              <p className="text-lg font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-6 no-scrollbar">
          {categories.map((c) => (
            <button key={c} onClick={() => setCategory(c)} className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${category === c ? "bg-emerald-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-emerald-300"}`}>
              {c}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? <div className="text-center py-12 text-sm text-gray-500">Loading listings...</div> : null}
        {error ? <div className="text-center py-12 text-sm text-red-500">{error}</div> : null}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <div key={p._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
              <div className="relative">
                <div className="h-36 bg-gradient-to-br from-emerald-300 to-emerald-600 flex items-center justify-center">
                  {p.photos?.[0]?.url ? (
                    <img src={p.photos[0].url} alt={p.title} className="h-full w-full object-cover" />
                  ) : (
                    <ShoppingBag className="w-10 h-10 text-white/50" />
                  )}
                </div>
                <button onClick={() => toggleWishlist(p._id)} className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center shadow-sm">
                  <Heart className={`w-4 h-4 ${wishlist.includes(p._id) ? "text-red-500 fill-red-500" : "text-gray-400"}`} />
                </button>
                <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  {p.condition ?? "N/A"}
                </span>
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{p.title}</h3>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400 opacity-30" />
                  <span className="text-xs text-gray-600">{p.owner?.name ?? p.contactName ?? "Seller"}</span>
                  <span className="text-xs text-gray-300">•</span>
                  <span className="text-xs text-gray-400">{p.category?.title ?? "General"}</span>
                </div>
                <div className="flex items-center justify-between mt-2.5">
                  <p className="text-base font-bold text-gray-900">৳{(p.price ?? 0).toLocaleString()}</p>
                  <Link href={`/${locale}/marketplace/${p._id}`} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors">
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
