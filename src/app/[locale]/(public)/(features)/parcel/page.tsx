"use client";

import { useState } from "react";
import { Package, MapPin, Phone, Weight, CheckCircle2, ArrowRight } from "lucide-react";

const SIZES = [
  { id: "small", label: "Small", desc: "Up to 2 kg", price: 30, icon: "📦" },
  { id: "medium", label: "Medium", desc: "2–5 kg", price: 60, icon: "📦" },
  { id: "large", label: "Large", desc: "5–15 kg", price: 100, icon: "📦" },
  { id: "xl", label: "Extra Large", desc: "15+ kg", price: 150, icon: "📦" },
];

export default function ParcelPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [size, setSize] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [senderAddress, setSenderAddress] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const selectedSize = SIZES.find((s) => s.id === size);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-violet-600 to-violet-800 text-white">
        <div className="cs-container py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <span className="text-violet-200 text-sm font-medium">Parcel Delivery</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Send Parcels on Campus</h1>
          <p className="text-violet-200 text-sm max-w-lg">Send any package to any dormitory, faculty area, or location on campus. Fast, reliable, campus-verified delivery.</p>
          <div className="mt-5 grid grid-cols-3 gap-3 max-w-sm">
            {[{ label: "Delivered Today", value: "120+" }, { label: "On-Time Rate", value: "98%" }, { label: "Max Delivery", value: "60 min" }].map((s) => (
              <div key={s.label} className="bg-white/15 rounded-xl p-3 text-center">
                <p className="text-lg font-bold">{s.value}</p>
                <p className="text-xs text-violet-200">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="cs-container py-8 max-w-xl">
        {submitted ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Parcel Booked!</h2>
            <p className="text-gray-500 text-sm mb-1">Your parcel delivery has been confirmed.</p>
            <p className="text-gray-400 text-sm mb-1">From: <strong>{senderAddress}</strong></p>
            <p className="text-gray-400 text-sm mb-6">To: <strong>{receiverAddress}</strong></p>
            <div className="inline-block bg-violet-50 border border-violet-200 rounded-xl px-6 py-3 mb-6">
              <p className="text-xs text-violet-500">Total Charge</p>
              <p className="text-2xl font-bold text-violet-700">৳{selectedSize?.price}</p>
            </div>
            <br />
            <button onClick={() => { setSubmitted(false); setStep(1); setSize(""); setSenderPhone(""); setSenderAddress(""); setReceiverName(""); setReceiverPhone(""); setReceiverAddress(""); setNote(""); }} className="px-6 py-3 rounded-xl bg-violet-600 text-white font-semibold text-sm hover:bg-violet-700">
              Send Another Parcel
            </button>
          </div>
        ) : (
          <>
            {/* Step Indicator */}
            <div className="flex items-center gap-2 mb-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${step >= s ? "bg-violet-600 border-violet-600 text-white" : "bg-white border-gray-200 text-gray-400"}`}>{s}</div>
                  {s < 3 && <div className={`h-0.5 w-10 transition-colors ${step > s ? "bg-violet-600" : "bg-gray-200"}`} />}
                </div>
              ))}
              <span className="ml-2 text-sm text-gray-500">
                {step === 1 ? "Parcel Size" : step === 2 ? "Sender & Receiver" : "Review Order"}
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
              {step === 1 && (
                <>
                  <h2 className="text-lg font-bold text-gray-900">Select Parcel Size</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {SIZES.map((s) => (
                      <button key={s.id} onClick={() => setSize(s.id)} className={`p-4 rounded-xl border-2 text-left transition-colors ${size === s.id ? "border-violet-600 bg-violet-50" : "border-gray-200 hover:border-violet-300"}`}>
                        <span className="text-2xl">{s.icon}</span>
                        <p className="font-semibold text-gray-900 mt-1">{s.label}</p>
                        <p className="text-xs text-gray-500">{s.desc}</p>
                        <p className="text-violet-600 font-bold mt-1">৳{s.price}</p>
                      </button>
                    ))}
                  </div>
                  <button disabled={!size} onClick={() => setStep(2)} className="w-full py-3 rounded-xl bg-violet-600 text-white font-semibold text-sm hover:bg-violet-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  <h2 className="text-lg font-bold text-gray-900">Sender & Receiver Details</h2>
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-700">Sender (You)</p>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input value={senderPhone} onChange={(e) => setSenderPhone(e.target.value)} placeholder="Your phone number" className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-violet-400" />
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input value={senderAddress} onChange={(e) => setSenderAddress(e.target.value)} placeholder="Your pickup location (e.g. Al Beruni Hall, Room 204)" className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-violet-400" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700 mt-2">Receiver</p>
                    <input value={receiverName} onChange={(e) => setReceiverName(e.target.value)} placeholder="Receiver's name" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-violet-400" />
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input value={receiverPhone} onChange={(e) => setReceiverPhone(e.target.value)} placeholder="Receiver's phone" className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-violet-400" />
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input value={receiverAddress} onChange={(e) => setReceiverAddress(e.target.value)} placeholder="Delivery location (e.g. Rokeya Hall, Room 118)" className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-violet-400" />
                    </div>
                    <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Special instructions (optional)" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-violet-400" />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Back</button>
                    <button disabled={!senderPhone || !senderAddress || !receiverName || !receiverPhone || !receiverAddress} onClick={() => setStep(3)} className="flex-1 py-3 rounded-xl bg-violet-600 text-white font-semibold text-sm hover:bg-violet-700 disabled:opacity-50 transition-colors">
                      Review Order
                    </button>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <h2 className="text-lg font-bold text-gray-900">Review Your Order</h2>
                  <div className="space-y-3">
                    {[
                      { label: "Package Size", value: `${selectedSize?.label} (${selectedSize?.desc})` },
                      { label: "Pickup From", value: senderAddress },
                      { label: "Sender Phone", value: senderPhone },
                      { label: "Deliver To", value: receiverAddress },
                      { label: "Receiver", value: `${receiverName} · ${receiverPhone}` },
                      { label: "Note", value: note || "None" },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between gap-3 text-sm">
                        <span className="text-gray-500">{item.label}</span>
                        <span className="font-medium text-gray-900 text-right">{item.value}</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-100 pt-3 flex justify-between text-base font-bold">
                      <span>Total</span><span className="text-violet-600">৳{selectedSize?.price}</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Back</button>
                    <button onClick={() => setSubmitted(true)} className="flex-1 py-3 rounded-xl bg-violet-600 text-white font-semibold text-sm hover:bg-violet-700 transition-colors">
                      Place Order — ৳{selectedSize?.price}
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
