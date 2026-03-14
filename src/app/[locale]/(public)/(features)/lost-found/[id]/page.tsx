"use client";

import { useState } from "react";
import { MapPin, Clock, Phone, Tag, ArrowLeft, CheckCircle2, MessageSquare, AlertTriangle } from "lucide-react";
import Link from "next/link";

const ITEMS: Record<string, {
  id: string; type: "lost" | "found"; title: string; category: string; location: string; time: string;
  description: string; contact: string; reward: string | null; image: string; urgent: boolean;
  postedBy: string; campus: string; detailedLocation: string;
}> = {
  "1": { id: "1", type: "lost", title: "Blue HP Laptop", category: "Electronics", location: "Library, Floor 2", time: "2 hours ago", description: "HP Pavilion 15, blue cover, has a small star sticker on the lid. Last seen near the study tables on Floor 2 of the Central Library. Contains very important academic work. Laptop has a small crack on the bottom-left corner.", contact: "01712345678", reward: "৳500", image: "💻", urgent: true, postedBy: "Arif Hossain", campus: "Dhaka University", detailedLocation: "Central Library, Floor 2, Study Zone B, near Window" },
  "2": { id: "2", type: "found", title: "Student ID Card", category: "ID / Cards", location: "TSC Cafeteria", time: "3 hours ago", description: "Found a student ID card on the floor near the cashier counter at TSC Cafeteria. Name on the card is Md. Karim, Department of CSE, Batch 2021. Please message to claim.", contact: "01898765432", reward: null, image: "🪪", urgent: false, postedBy: "Anonymous", campus: "Dhaka University", detailedLocation: "TSC Cafeteria, near cashier counter" },
  "3": { id: "3", type: "lost", title: "Black Backpack", category: "Bags", location: "Central Field", time: "5 hours ago", description: "Black Reebok backpack containing a laptop, academic books, important personal documents, and a charger. Lost near the central field benches during the afternoon. Very important — please help!", contact: "01756789012", reward: "৳200", image: "🎒", urgent: true, postedBy: "Nahid Islam", campus: "BUET", detailedLocation: "Central Field, near the benches on the east side" },
  "4": { id: "4", type: "found", title: "Glasses – Brown Frame", category: "Accessories", location: "Science Lab Building", time: "1 day ago", description: "Found a pair of prescription glasses with a brown metallic frame near Lab 302 on the third floor of the Science Lab building. Whoever lost it, please come and claim.", contact: "01611223344", reward: null, image: "👓", urgent: false, postedBy: "Anonymous", campus: "Dhaka University", detailedLocation: "Science Lab Building, Floor 3, Room 302" },
};

export default function LostFoundDetailPage({ params }: { params: { id: string } }) {
  const item = ITEMS[params.id];
  const [showContactModal, setShowContactModal] = useState(false);
  const [message, setMessage] = useState("");
  const [myPhone, setMyPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <span className="text-5xl mb-4 block">🔍</span>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Item Not Found</h2>
          <p className="text-gray-500 text-sm mb-4">This listing may have been removed or resolved.</p>
          <Link href="/lost-found" className="px-5 py-2.5 rounded-xl bg-orange-600 text-white text-sm font-medium">Back to Lost & Found</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`${item.type === "lost" ? "bg-gradient-to-br from-red-600 to-rose-700" : "bg-gradient-to-br from-green-600 to-emerald-700"} text-white`}>
        <div className="cs-container py-6">
          <Link href="/lost-found" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Lost &amp; Found
          </Link>
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-5xl">{item.image}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${item.type === "lost" ? "bg-red-500/50" : "bg-green-500/50"}`}>{item.type}</span>
                {item.urgent && <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-yellow-400 text-yellow-900">URGENT</span>}
              </div>
              <h1 className="text-2xl font-bold mb-1">{item.title}</h1>
              <p className="text-white/70 text-sm">{item.category} · Posted {item.time}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="cs-container py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-4">Location Details</h2>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{item.detailedLocation}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.campus}</p>
                </div>
              </div>
            </div>

            {item.reward && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-3">
                <Tag className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="font-bold text-amber-800">Reward Offered: {item.reward}</p>
                  <p className="text-xs text-amber-600">The owner is offering a reward for the safe return of this item.</p>
                </div>
              </div>
            )}

            {item.type === "lost" && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700">If you found this item, please contact the owner immediately. Returning lost items is a community service.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-4">Posted By</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-600">
                  {item.postedBy === "Anonymous" ? "?" : item.postedBy[0]}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{item.postedBy}</p>
                  <p className="text-xs text-gray-500">{item.campus}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <Clock className="w-4 h-4" /> Posted {item.time}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4" /> {item.location}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
              <button onClick={() => setShowContactModal(true)} className="w-full py-3 rounded-xl bg-orange-600 text-white font-semibold text-sm hover:bg-orange-700 flex items-center justify-center gap-2">
                <MessageSquare className="w-4 h-4" />
                {item.type === "lost" ? "I Found This!" : "I Lost This!"}
              </button>
              <a href={`tel:${item.contact}`} className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" /> Call {item.contact}
              </a>
              <Link href="/lost-found" className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Browse All Items
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">{item.type === "lost" ? "Report Found" : "Claim Item"}</h3>
              <button onClick={() => setShowContactModal(false)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400">✕</button>
            </div>
            {submitted ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h4 className="font-bold text-gray-900 mb-1">Message Sent!</h4>
                <p className="text-sm text-gray-500 mb-4">The poster has been contacted. They will reach you on your phone shortly.</p>
                <button onClick={() => { setShowContactModal(false); setSubmitted(false); setMessage(""); setMyPhone(""); }} className="px-5 py-2.5 rounded-xl bg-orange-600 text-white text-sm font-medium">Done</button>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                <p className="text-sm text-gray-600">Regarding: <strong>{item.title}</strong></p>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write a message to the poster..." rows={4} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-400 resize-none" />
                <input value={myPhone} onChange={(e) => setMyPhone(e.target.value)} placeholder="Your phone number for contact" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-400" />
                <button disabled={!message || !myPhone} onClick={() => setSubmitted(true)} className="w-full py-3 rounded-xl bg-orange-600 text-white font-semibold text-sm disabled:opacity-50 hover:bg-orange-700">
                  Send Message
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
