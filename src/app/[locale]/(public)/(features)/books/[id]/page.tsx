"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronLeft, Phone, CheckCircle2, X, Star, MapPin } from "lucide-react";

const BOOKS: Record<string, {
  id: string; title: string; author: string; subject: string; type: string;
  price: number; rating: number; condition: string; poster: string; campus: string;
  accent: string; description: string; edition: string; buyerPhone?: string;
}> = {
  b1: { id: "b1", title: "Data Structures and Algorithms", author: "Thomas H. Cormen", subject: "Engineering", type: "Sell", price: 450, rating: 4.9, condition: "Good", poster: "Shahriar Ahmed", campus: "JU", accent: "from-blue-500 to-blue-700", description: "Classic algorithms textbook used in CSE departments. Covers sorting, trees, graphs, dynamic programming and more. Some light pencil marks on first 50 pages, otherwise excellent.", edition: "3rd Edition" },
  b2: { id: "b2", title: "Fundamentals of Physics", author: "Halliday & Resnick", subject: "Science", type: "Loan", price: 0, rating: 4.7, condition: "Like New", poster: "Nafisa Khanam", campus: "JU", accent: "from-indigo-500 to-indigo-700", description: "Available for loan for up to 1 semester. Book is in like-new condition, no marks or folds. Please return in same condition.", edition: "10th Edition" },
  b3: { id: "b3", title: "Principles of Economics", author: "N. Gregory Mankiw", subject: "Business", type: "Swap", price: 0, rating: 4.6, condition: "Good", poster: "Raihan Islam", campus: "JU", accent: "from-green-500 to-green-700", description: "Looking to swap for any Marketing or Management textbook of equal value. Book is in good condition with minor highlighting on key chapters.", edition: "8th Edition" },
};

const TYPE_COLORS: Record<string, string> = {
  Buy: "bg-blue-100 text-blue-700", Sell: "bg-green-100 text-green-700",
  Loan: "bg-amber-100 text-amber-700", Swap: "bg-purple-100 text-purple-700",
};

const ACTION_LABELS: Record<string, string> = {
  Buy: "Send Buy Request", Sell: "Buy This Book", Loan: "Request Loan", Swap: "Propose Swap",
};

export default function BookDetailPage({ params }: { params: { id: string; locale: string } }) {
  const { id, locale } = params as { id: string; locale: string };
  const book = BOOKS[id] || BOOKS["b1"];
  const [showModal, setShowModal] = useState(false);
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="cs-container py-8 max-w-3xl">
        <Link href={`/${locale}/books`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6">
          <ChevronLeft className="w-4 h-4" /> Back to Books
        </Link>

        {submitted ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Sent!</h2>
            <p className="text-gray-500 text-sm mb-6">{book.poster} will contact you at <strong>{phone}</strong> to arrange the {book.type === "Sell" ? "purchase" : book.type === "Loan" ? "loan pickup" : "swap"}.</p>
            <Link href={`/${locale}/books`} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-700 text-white font-semibold text-sm hover:bg-blue-800">
              Browse More Books
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className={`h-64 sm:h-auto min-h-[280px] bg-gradient-to-br ${book.accent} rounded-2xl flex flex-col items-center justify-center gap-3`}>
              <BookOpen className="w-16 h-16 text-white/60" />
              <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${TYPE_COLORS[book.type]}`}>{book.type}</span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <div>
                <span className="text-xs text-gray-400">{book.subject} · {book.edition}</span>
                <h1 className="text-xl font-bold text-gray-900 mt-1">{book.title}</h1>
                <p className="text-sm text-gray-500 mt-0.5">{book.author}</p>
                <p className="text-2xl font-bold text-blue-700 mt-2">
                  {book.price > 0 ? `৳${book.price}` : book.type === "Loan" ? "Free Loan" : "Swap"}
                </p>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed">{book.description}</p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>Condition: {book.condition}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{book.campus} Campus</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-500 mb-1">Posted by</p>
                <p className="font-semibold text-gray-900">{book.poster}</p>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setShowModal(true)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-700 text-white font-semibold text-sm hover:bg-blue-800 transition-colors">
                  <BookOpen className="w-4 h-4" />
                  {ACTION_LABELS[book.type]}
                </button>
              </div>
            </div>
          </div>
        )}

        {showModal && (
          <>
            <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowModal(false)} />
            <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-white rounded-2xl p-6 z-[51] shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">{ACTION_LABELS[book.type]}</h3>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 mb-4">
                <p className="font-medium text-gray-900 text-sm">{book.title}</p>
                <p className="text-blue-700 font-bold text-sm">{book.price > 0 ? `৳${book.price}` : book.type}</p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Your Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Message (optional)</label>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={book.type === "Swap" ? "What book are you offering to swap?" : "Any specific message to the poster?"} rows={3} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 resize-none" />
                </div>
                <button disabled={!phone} onClick={() => { setShowModal(false); setSubmitted(true); }} className="w-full py-3 rounded-xl bg-blue-700 text-white font-semibold text-sm hover:bg-blue-800 disabled:opacity-50 transition-colors">
                  Send Request
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
