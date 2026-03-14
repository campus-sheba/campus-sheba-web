"use client";

import { useState } from "react";
import { Minus, Plus, Trash2, ShoppingBag, MapPin, Phone, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";

type CartItem = { id: string; name: string; vendor: string; price: number; qty: number; image: string; type: string };

const INITIAL_ITEMS: CartItem[] = [
  { id: "1", name: "Chicken Burger Meal", vendor: "Campus Bites", price: 180, qty: 2, image: "🍔", type: "delivery" },
  { id: "2", name: "Introduction to Algorithms (3rd Ed.)", vendor: "Rakib's Books", price: 350, qty: 1, image: "📚", type: "books" },
  { id: "3", name: "Wireless Mouse – Logitech M90", vendor: "Marketplace", price: 850, qty: 1, image: "🖱️", type: "marketplace" },
];

type CheckoutStep = "cart" | "address" | "payment" | "success";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>(INITIAL_ITEMS);
  const [step, setStep] = useState<CheckoutStep>("cart");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bkash" | "nagad">("cod");

  const updateQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
      )
    );
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((item) => item.id !== id));

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const deliveryFee = items.length > 0 ? 30 : 0;
  const total = subtotal + deliveryFee;

  const typeColors: Record<string, string> = {
    delivery: "bg-purple-100 text-purple-700",
    books: "bg-blue-100 text-blue-700",
    marketplace: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="cs-container py-4 flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-4 h-4 text-gray-600" /></Link>
          <div>
            <h1 className="font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-xs text-gray-500">{items.length} item{items.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
      </div>

      <div className="cs-container py-6">
        {step === "success" ? (
          <div className="max-w-md mx-auto bg-white rounded-2xl border border-gray-100 p-10 text-center mt-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
            <p className="text-gray-500 text-sm mb-1">Your order has been confirmed.</p>
            <p className="text-gray-400 text-sm mb-6">Estimated delivery: <strong>30–45 minutes</strong></p>
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Delivery To</span><span className="font-medium text-gray-900 text-right max-w-[60%]">{address}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Payment</span><span className="font-medium capitalize">{paymentMethod === "cod" ? "Cash on Delivery" : paymentMethod === "bkash" ? "bKash" : "Nagad"}</span></div>
              <div className="flex justify-between text-sm font-bold"><span>Total Paid</span><span className="text-[#E30A13]">৳{total}</span></div>
            </div>
            <Link href="/" className="px-6 py-3 rounded-xl bg-[#E30A13] text-white font-semibold text-sm hover:bg-red-700 inline-block">Back to Home</Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main panel */}
            <div className="flex-1 min-w-0 space-y-4">
              {/* Step: Cart */}
              {step === "cart" && (
                <>
                  {items.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                      <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium mb-1">Your cart is empty</p>
                      <p className="text-sm text-gray-400 mb-4">Browse our services and add items to your cart</p>
                      <Link href="/" className="px-5 py-2.5 rounded-xl bg-[#E30A13] text-white text-sm font-medium">Explore Services</Link>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
                      {items.map((item) => (
                        <div key={item.id} className="p-4 flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-3xl flex-shrink-0">{item.image}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2 mb-1">
                              <p className="font-medium text-gray-900 text-sm leading-snug flex-1">{item.name}</p>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${typeColors[item.type]}`}>{item.type}</span>
                            </div>
                            <p className="text-xs text-gray-400 mb-2">{item.vendor}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                                <span className="w-6 text-center text-sm font-bold">{item.qty}</span>
                                <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-gray-900">৳{item.price * item.qty}</span>
                                <button onClick={() => removeItem(item.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Step: Address */}
              {step === "address" && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                  <h2 className="font-bold text-gray-900">Delivery Information</h2>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Delivery Address *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Hall name, room number, building..." className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-red-400" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Phone Number *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-red-400" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep("cart")} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600">Back</button>
                    <button disabled={!address || !phone} onClick={() => setStep("payment")} className="flex-1 py-3 rounded-xl bg-[#E30A13] text-white font-semibold text-sm disabled:opacity-50 hover:bg-red-700">Continue to Payment</button>
                  </div>
                </div>
              )}

              {/* Step: Payment */}
              {step === "payment" && (
                <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                  <h2 className="font-bold text-gray-900">Payment Method</h2>
                  <div className="space-y-3">
                    {([["cod", "💵", "Cash on Delivery", "Pay in cash when your order arrives"], ["bkash", "📱", "bKash", "Pay via bKash mobile banking"], ["nagad", "📲", "Nagad", "Pay via Nagad mobile banking"]] as const).map(([id, icon, label, desc]) => (
                      <button key={id} onClick={() => setPaymentMethod(id)} className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 text-left transition-colors ${paymentMethod === id ? "border-[#E30A13] bg-red-50" : "border-gray-200 hover:border-red-200"}`}>
                        <span className="text-2xl">{icon}</span>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{label}</p>
                          <p className="text-xs text-gray-500">{desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep("address")} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600">Back</button>
                    <button onClick={() => setStep("success")} className="flex-1 py-3 rounded-xl bg-[#E30A13] text-white font-semibold text-sm hover:bg-red-700">Place Order — ৳{total}</button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:w-80 space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-3 text-sm mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between gap-2">
                      <span className="text-gray-500 truncate">{item.name} × {item.qty}</span>
                      <span className="font-medium text-gray-900 whitespace-nowrap">৳{item.price * item.qty}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-100 pt-3 flex justify-between"><span className="text-gray-500">Subtotal</span><span>৳{subtotal}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Delivery Fee</span><span>৳{deliveryFee}</span></div>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-base">
                  <span>Total</span><span className="text-[#E30A13]">৳{total}</span>
                </div>
              </div>

              {step === "cart" && items.length > 0 && (
                <button onClick={() => setStep("address")} className="w-full py-3.5 rounded-xl bg-[#E30A13] text-white font-bold text-sm hover:bg-red-700 transition-colors">
                  Proceed to Checkout
                </button>
              )}

              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                <p className="text-xs text-green-700 font-medium">✅ Secure campus-verified checkout</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
