"use client";

import { useState } from "react";
import { Trash2, Calendar, Clock, MapPin, CheckCircle2, ArrowRight } from "lucide-react";

const WASTE_TYPES = [
  { id: "general", label: "General Waste", icon: "🗑️", desc: "Household items, packaging" },
  { id: "recyclable", label: "Recyclable", icon: "♻️", desc: "Paper, plastic, glass, metal" },
  { id: "organic", label: "Organic Waste", icon: "🍂", desc: "Food scraps, garden waste" },
  { id: "electronics", label: "E-Waste", icon: "💻", desc: "Phones, cables, batteries" },
  { id: "medical", label: "Medical Waste", icon: "🏥", desc: "Medicine packs, syringes" },
  { id: "hazardous", label: "Hazardous", icon: "⚠️", desc: "Chemicals, paints, solvents" },
];

const TIME_SLOTS = ["8:00 AM – 10:00 AM", "10:00 AM – 12:00 PM", "12:00 PM – 2:00 PM", "2:00 PM – 4:00 PM", "4:00 PM – 6:00 PM"];

const STATS = [
  { value: "340+", label: "Pickups This Month" },
  { value: "98%", label: "On-Time Rate" },
  { value: "2t+", label: "Waste Recycled" },
];

export default function GarbagePage() {
  const [wasteType, setWasteType] = useState("");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const isValid = wasteType && address && date && timeSlot && phone;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-lime-600 to-green-700 text-white">
        <div className="cs-container py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <span className="text-lime-200 text-sm font-medium">Garbage Collection</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Campus Garbage Collection</h1>
          <p className="text-lime-100 text-sm max-w-lg">Schedule a waste pickup from your room, lab, or campus facility. We support responsible segregation and eco-friendly disposal.</p>
          <div className="mt-5 flex gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="bg-white/15 rounded-xl px-4 py-3 text-center">
                <p className="text-lg font-bold">{s.value}</p>
                <p className="text-xs text-lime-200">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="cs-container py-8 max-w-2xl">
        {submitted ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Pickup Scheduled!</h2>
            <p className="text-gray-500 text-sm mb-1">Our collection team will arrive at your specified slot.</p>
            <p className="text-gray-400 text-sm mb-4">
              <strong>{date}</strong> · <strong>{timeSlot}</strong>
            </p>
            <div className="inline-flex items-center gap-2 bg-lime-50 border border-lime-200 text-lime-700 rounded-xl px-5 py-2 text-sm font-medium mb-6">
              📍 {address}
            </div>
            <br />
            <button onClick={() => { setSubmitted(false); setWasteType(""); setAddress(""); setDate(""); setTimeSlot(""); setPhone(""); setNote(""); }} className="px-6 py-3 rounded-xl bg-lime-600 text-white font-semibold text-sm hover:bg-lime-700">
              Schedule Another Pickup
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
            <h2 className="text-lg font-bold text-gray-900">Schedule a Pickup</h2>

            {/* Waste Type */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Waste Type <span className="text-red-500">*</span></p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {WASTE_TYPES.map((w) => (
                  <button key={w.id} onClick={() => setWasteType(w.id)} className={`p-3 rounded-xl border-2 text-left transition-colors ${wasteType === w.id ? "border-lime-600 bg-lime-50" : "border-gray-200 hover:border-lime-300"}`}>
                    <span className="text-xl">{w.icon}</span>
                    <p className="text-sm font-medium text-gray-900 mt-1">{w.label}</p>
                    <p className="text-xs text-gray-400">{w.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Pickup Location <span className="text-red-500">*</span></p>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. Bijoy Hall, Room 312" className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-lime-400" />
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Date <span className="text-red-500">*</span></p>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-lime-400" />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Time Slot <span className="text-red-500">*</span></p>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-lime-400 appearance-none bg-white">
                    <option value="">Select slot</option>
                    {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Your Phone <span className="text-red-500">*</span></p>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-lime-400" />
            </div>

            {/* Note */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Additional Notes <span className="text-gray-400">(optional)</span></p>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Any special instructions for the collection team..." rows={3} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-lime-400 resize-none" />
            </div>

            <button disabled={!isValid} onClick={() => setSubmitted(true)} className="w-full py-3 rounded-xl bg-lime-600 text-white font-semibold text-sm hover:bg-lime-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              Schedule Pickup <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
