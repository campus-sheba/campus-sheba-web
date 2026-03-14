"use client";

import { useState } from "react";
import Link from "next/link";
import { Bike, Star, Clock, MapPin, Search, ChevronRight, Plus, Minus, ShoppingCart, X, CheckCircle2, Phone } from "lucide-react";

const CATEGORIES = ["All", "Rice & Curry", "Fast Food", "Snacks", "Drinks", "Desserts", "Healthy"];

const RESTAURANTS = [
  {
    id: "r1", name: "Campus Canteen", rating: 4.5, deliveryTime: "15–25 min", minOrder: 80,
    category: "Rice & Curry", badge: "Popular", badgeColor: "bg-green-100 text-green-700",
    accent: "from-orange-400 to-amber-500",
    menu: [
      { id: "m1", name: "Chicken Fried Rice", price: 120, description: "Special fried rice with chicken" },
      { id: "m2", name: "Dal Bhat Set", price: 60, description: "Dal, rice, vegetable fry" },
      { id: "m3", name: "Egg Curry + Rice", price: 80, description: "2 eggs curry with steamed rice" },
      { id: "m4", name: "Mixed Veg", price: 50, description: "Seasonal vegetables" },
    ],
  },
  {
    id: "r2", name: "Fast Bites Stall", rating: 4.2, deliveryTime: "10–20 min", minOrder: 50,
    category: "Fast Food", badge: "Fast",  badgeColor: "bg-blue-100 text-blue-700",
    accent: "from-red-400 to-orange-400",
    menu: [
      { id: "m5", name: "Chicken Burger", price: 150, description: "Crispy chicken with sauce" },
      { id: "m6", name: "French Fries", price: 70, description: "Crispy salted fries" },
      { id: "m7", name: "Shawarma Roll", price: 130, description: "Grilled chicken in wrap" },
    ],
  },
  {
    id: "r3", name: "Green Bowl", rating: 4.7, deliveryTime: "20–30 min", minOrder: 100,
    category: "Healthy", badge: "Healthy",  badgeColor: "bg-emerald-100 text-emerald-700",
    accent: "from-green-400 to-emerald-500",
    menu: [
      { id: "m8", name: "Grilled Chicken Salad", price: 180, description: "Fresh greens with grilled chicken" },
      { id: "m9", name: "Fruit Bowl", price: 120, description: "Seasonal mixed fruits" },
      { id: "m10", name: "Oats Smoothie", price: 90, description: "Banana, mango, oats blend" },
    ],
  },
  {
    id: "r4", name: "Tea & Snacks Corner", rating: 4.3, deliveryTime: "5–15 min", minOrder: 30,
    category: "Snacks", badge: "Budget",  badgeColor: "bg-amber-100 text-amber-700",
    accent: "from-amber-400 to-yellow-500",
    menu: [
      { id: "m11", name: "Milk Tea", price: 20, description: "Boiled milk tea with ginger" },
      { id: "m12", name: "Singara (2 pcs)", price: 30, description: "Crispy potato-stuffed pastry" },
      { id: "m13", name: "Nimki + Tea", price: 40, description: "Salty snack combo" },
    ],
  },
];

type CartItem = { id: string; name: string; price: number; qty: number };

export default function DeliveryPage({ params }: { params: { locale: string } }) {
  const locale = (params as { locale: string }).locale || "en";
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedRestaurant, setSelectedRestaurant] = useState<typeof RESTAURANTS[0] | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderStep, setOrderStep] = useState<"menu" | "address" | "confirm" | "success">("menu");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const filtered = RESTAURANTS.filter(
    (r) =>
      (category === "All" || r.category === category) &&
      r.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (item: { id: string; name: string; price: number }) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) return prev.map((c) => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === id);
      if (existing && existing.qty > 1) return prev.map((c) => c.id === id ? { ...c, qty: c.qty - 1 } : c);
      return prev.filter((c) => c.id !== id);
    });
  };

  const totalItems = cart.reduce((a, c) => a + c.qty, 0);
  const totalAmount = cart.reduce((a, c) => a + c.price * c.qty, 0);

  const placeOrder = () => {
    if (!address || !phone) return;
    setOrderStep("success");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white">
        <div className="cs-container py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Bike className="w-5 h-5" />
            </div>
            <span className="text-purple-200 text-sm font-medium">Delivery Sheba</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Campus Food Delivery</h1>
          <p className="text-purple-200 text-sm max-w-lg">Order from campus canteens and stalls, delivered to your dorm or classroom within minutes.</p>
          <div className="mt-5 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search restaurants..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/15 border border-white/20 text-white placeholder:text-purple-300 text-sm outline-none focus:bg-white/25"
            />
          </div>
        </div>
      </div>

      <div className="cs-container py-8">
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-6 no-scrollbar">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                category === c ? "bg-purple-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-purple-300"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Restaurant Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((r) => (
            <button
              key={r.id}
              onClick={() => { setSelectedRestaurant(r); setCart([]); setOrderStep("menu"); }}
              className="text-left bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-purple-200 transition-all"
            >
              <div className={`h-28 bg-gradient-to-br ${r.accent} flex items-center justify-center`}>
                <Bike className="w-12 h-12 text-white/60" />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-900 text-sm">{r.name}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${r.badgeColor}`}>{r.badge}</span>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{r.rating}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{r.deliveryTime}</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Min order ৳{r.minOrder}</p>
              </div>
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Bike className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No restaurants found</p>
          </div>
        )}
      </div>

      {/* Restaurant Drawer */}
      {selectedRestaurant && (
        <>
          <div className="fixed inset-0 bg-black/40 z-[70]" onClick={() => setSelectedRestaurant(null)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white z-[71] flex flex-col shadow-2xl">
            {/* Header */}
            <div className={`h-32 bg-gradient-to-br ${selectedRestaurant.accent} p-5 flex flex-col justify-end`}>
              <button onClick={() => setSelectedRestaurant(null)} className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center text-white">
                <X className="w-4 h-4" />
              </button>
              <h2 className="text-xl font-bold text-white">{selectedRestaurant.name}</h2>
              <div className="flex items-center gap-3 text-white/80 text-xs mt-1">
                <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-white" />{selectedRestaurant.rating}</span>
                <span>{selectedRestaurant.deliveryTime}</span>
              </div>
            </div>

            {orderStep === "success" ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Order Placed!</h3>
                <p className="text-gray-500 text-sm mb-1">Your order has been confirmed.</p>
                <p className="text-gray-400 text-xs mb-6">Estimated delivery: {selectedRestaurant.deliveryTime}</p>
                <div className="bg-gray-50 rounded-xl p-4 w-full text-left mb-4">
                  <p className="text-xs text-gray-500 mb-2">Order Summary</p>
                  {cart.map((c) => (
                    <div key={c.id} className="flex justify-between text-sm text-gray-700 mb-1">
                      <span>{c.name} ×{c.qty}</span>
                      <span>৳{c.price * c.qty}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-bold text-gray-900">
                    <span>Total</span><span>৳{totalAmount}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedRestaurant(null)} className="w-full btn-primary py-3">
                  Back to Restaurants
                </button>
              </div>
            ) : orderStep === "address" ? (
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <h3 className="font-semibold text-gray-900">Delivery Details</h3>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Delivery Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. Al Beruni Hall, Room 204" className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100" />
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">Order Summary — ৳{totalAmount}</p>
                  {cart.map((c) => (
                    <div key={c.id} className="flex justify-between text-sm text-gray-700 mb-1">
                      <span>{c.name} ×{c.qty}</span><span>৳{c.price * c.qty}</span>
                    </div>
                  ))}
                </div>
                <button disabled={!address || !phone} onClick={placeOrder} className="w-full btn-primary py-3 disabled:opacity-50">
                  Place Order — ৳{totalAmount}
                </button>
                <button onClick={() => setOrderStep("menu")} className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
                  Back to Menu
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  <h3 className="font-semibold text-gray-900 text-sm">Menu</h3>
                  {selectedRestaurant.menu.map((item) => {
                    const cartItem = cart.find((c) => c.id === item.id);
                    return (
                      <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${selectedRestaurant.accent} flex-shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-400">{item.description}</p>
                          <p className="text-sm font-bold text-purple-600 mt-0.5">৳{item.price}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {cartItem ? (
                            <>
                              <button onClick={() => removeFromCart(item.id)} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-sm font-bold w-4 text-center">{cartItem.qty}</span>
                            </>
                          ) : null}
                          <button onClick={() => addToCart(item)} className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center hover:bg-purple-700">
                            <Plus className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {cart.length > 0 && (
                  <div className="p-4 border-t border-gray-100">
                    <button onClick={() => setOrderStep("address")} className="w-full flex items-center justify-between btn-primary py-3 px-5">
                      <span className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4" />
                        {totalItems} item{totalItems > 1 ? "s" : ""}
                      </span>
                      <span>৳{totalAmount} <ChevronRight className="w-4 h-4 inline" /></span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
