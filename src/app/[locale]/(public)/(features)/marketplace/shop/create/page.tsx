"use client";

import { useState } from "react";
import Link from "next/link";
import { Store, ChevronLeft, CheckCircle2, Plus, Trash2, Image } from "lucide-react";

const CATEGORIES = ["Electronics", "Books & Stationery", "Clothing", "Furniture", "Sports", "Daily Essentials", "Food & Beverages", "Other"];

export default function CreateShopPage({ params }: { params: { locale: string } }) {
  const locale = (params as { locale: string }).locale || "en";
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [shopName, setShopName] = useState("");
  const [shopDesc, setShopDesc] = useState("");
  const [category, setCategory] = useState("");
  const [products, setProducts] = useState([{ name: "", price: "", description: "" }]);
  const [submitted, setSubmitted] = useState(false);

  const addProduct = () => setProducts((p) => [...p, { name: "", price: "", description: "" }]);
  const removeProduct = (i: number) => setProducts((p) => p.filter((_, idx) => idx !== i));
  const updateProduct = (i: number, key: string, value: string) =>
    setProducts((p) => p.map((item, idx) => idx === i ? { ...item, [key]: value } : item));

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Shop Created!</h2>
          <p className="text-gray-500 text-sm mb-6">Your shop <strong>{shopName}</strong> is under review. It will go live within 24 hours after approval.</p>
          <Link href={`/marketplace`} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#E30A13] text-white font-semibold text-sm hover:bg-red-700">
            Go to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-[#E30A13] to-[#c00910] text-white">
        <div className="cs-container py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <span className="text-red-200 text-sm font-medium">Entrepreneurship</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Start Your Campus Shop</h1>
          <p className="text-red-200 text-sm max-w-lg">Launch your own shop on Campus Sheba and reach thousands of students. Sell products, offer services, grow your business.</p>
        </div>
      </div>

      <div className="cs-container py-8 max-w-2xl">
        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${step >= s ? "bg-[#E30A13] border-[#E30A13] text-white" : "bg-white border-gray-200 text-gray-400"}`}>
                {s}
              </div>
              {s < 3 && <div className={`flex-1 h-0.5 w-12 transition-colors ${step > s ? "bg-[#E30A13]" : "bg-gray-200"}`} />}
            </div>
          ))}
          <span className="ml-2 text-sm text-gray-500">
            {step === 1 ? "Shop Info" : step === 2 ? "Add Products" : "Review & Submit"}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          {step === 1 && (
            <>
              <h2 className="text-lg font-bold text-gray-900">Shop Information</h2>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Shop Name *</label>
                <input value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="e.g. Rakib's Tech Shop" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#E30A13]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Category *</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#E30A13] bg-white">
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Shop Description *</label>
                <textarea value={shopDesc} onChange={(e) => setShopDesc(e.target.value)} placeholder="Describe your shop, what you sell, and why students should buy from you..." rows={4} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#E30A13] resize-none" />
              </div>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center gap-2 text-gray-400 cursor-pointer hover:border-gray-300 transition-colors">
                <Image className="w-8 h-8" />
                <p className="text-sm">Upload shop logo (optional)</p>
                <p className="text-xs text-gray-300">PNG, JPG up to 2 MB</p>
              </div>
              <button disabled={!shopName || !category || !shopDesc} onClick={() => setStep(2)} className="w-full py-3 rounded-xl bg-[#E30A13] text-white font-semibold text-sm hover:bg-red-700 disabled:opacity-50 transition-colors">
                Next: Add Products
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Add Products</h2>
                <button onClick={addProduct} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-700 text-sm font-medium hover:bg-emerald-200 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add More
                </button>
              </div>
              <div className="space-y-4">
                {products.map((p, i) => (
                  <div key={i} className="p-4 rounded-xl border border-gray-100 bg-gray-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500">Product {i + 1}</span>
                      {products.length > 1 && (
                        <button onClick={() => removeProduct(i)} className="text-red-400 hover:text-red-600">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <input value={p.name} onChange={(e) => updateProduct(i, "name", e.target.value)} placeholder="Product name" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#E30A13] bg-white" />
                    <input value={p.price} onChange={(e) => updateProduct(i, "price", e.target.value)} placeholder="Price (৳)" type="number" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#E30A13] bg-white" />
                    <input value={p.description} onChange={(e) => updateProduct(i, "description", e.target.value)} placeholder="Short description" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#E30A13] bg-white" />
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
                  Back
                </button>
                <button disabled={products.some((p) => !p.name || !p.price)} onClick={() => setStep(3)} className="flex-1 py-3 rounded-xl bg-[#E30A13] text-white font-semibold text-sm hover:bg-red-700 disabled:opacity-50 transition-colors">
                  Review Order
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-lg font-bold text-gray-900">Review & Submit</h2>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Shop Name</p>
                  <p className="font-semibold text-gray-900">{shopName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Category</p>
                  <p className="font-semibold text-gray-900">{category}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Description</p>
                  <p className="text-sm text-gray-700">{shopDesc}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2">Products ({products.length})</p>
                  {products.map((p, i) => (
                    <div key={i} className="flex justify-between text-sm text-gray-700 mb-1">
                      <span>{p.name}</span>
                      <span className="font-medium">৳{p.price}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
                Your shop will be reviewed by our team within 24 hours. You&rsquo;ll receive a notification once approved.
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
                  Back
                </button>
                <button onClick={() => setSubmitted(true)} className="flex-1 py-3 rounded-xl bg-[#E30A13] text-white font-semibold text-sm hover:bg-red-700 transition-colors">
                  Submit Shop
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
