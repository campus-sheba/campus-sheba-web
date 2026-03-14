"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Search, Star, ArrowUpDown, BookMarked, RotateCcw } from "lucide-react";

const TYPES = ["All", "Buy", "Sell", "Loan", "Swap"];
const SUBJECTS = ["All", "Engineering", "Science", "Business", "Arts & Humanities", "Medical", "Law"];

const BOOKS = [
  { id: "b1", title: "Data Structures and Algorithms", author: "Thomas H. Cormen", subject: "Engineering", type: "Sell", price: 450, rating: 4.9, condition: "Good", poster: "Shahriar Ahmed", campus: "JU", accent: "from-blue-500 to-blue-700" },
  { id: "b2", title: "Fundamentals of Physics", author: "Halliday & Resnick", subject: "Science", type: "Loan", price: 0, rating: 4.7, condition: "Like New", poster: "Nafisa Khanam", campus: "JU", accent: "from-indigo-500 to-indigo-700" },
  { id: "b3", title: "Principles of Economics", author: "N. Gregory Mankiw", subject: "Business", type: "Swap", price: 0, rating: 4.6, condition: "Good", poster: "Raihan Islam", campus: "JU", accent: "from-green-500 to-green-700" },
  { id: "b4", title: "Engineering Mathematics", author: "H.K. Dass", subject: "Engineering", type: "Sell", price: 380, rating: 4.8, condition: "Very Good", poster: "Shirin Akter", campus: "JU", accent: "from-purple-500 to-purple-700" },
  { id: "b5", title: "Gray's Anatomy", author: "Henry Gray", subject: "Medical", type: "Loan", price: 0, rating: 4.9, condition: "Good", poster: "Arif Hossain", campus: "JU", accent: "from-red-500 to-red-700" },
  { id: "b6", title: "Organic Chemistry", author: "Paula Yurkanis Bruice", subject: "Science", type: "Buy", price: 600, rating: 4.5, condition: "Any", poster: "Mim Hoque", campus: "JU", accent: "from-amber-500 to-amber-700" },
  { id: "b7", title: "Advanced Business Management", author: "Cole, G.A.", subject: "Business", type: "Sell", price: 320, rating: 4.4, condition: "Good", poster: "Tanvir Alam", campus: "JU", accent: "from-teal-500 to-teal-700" },
  { id: "b8", title: "Digital Electronics", author: "Morris Mano", subject: "Engineering", type: "Swap", price: 0, rating: 4.6, condition: "Good", poster: "Sadia Islam", campus: "JU", accent: "from-orange-500 to-orange-700" },
];

const TYPE_COLORS: Record<string, string> = {
  Buy: "bg-blue-100 text-blue-700",
  Sell: "bg-green-100 text-green-700",
  Loan: "bg-amber-100 text-amber-700",
  Swap: "bg-purple-100 text-purple-700",
};

export default function BooksPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const [subject, setSubject] = useState("All");

  const filtered = BOOKS.filter(
    (b) =>
      (type === "All" || b.type === type) &&
      (subject === "All" || b.subject === subject) &&
      (b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 text-white">
        <div className="cs-container py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-blue-200 text-sm font-medium">Book Sheba</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Buy, Sell, Loan & Swap Books</h1>
          <p className="text-blue-200 text-sm max-w-lg">Affordable textbooks from fellow students. Save money, help each other, reduce waste.</p>
          <div className="mt-5 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title or author..." className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/15 border border-white/20 text-white placeholder:text-blue-300 text-sm outline-none focus:bg-white/25" />
          </div>
        </div>
      </div>

      <div className="cs-container py-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Books Listed", value: "3,200+", icon: BookOpen },
            { label: "Sold / Loaned", value: "8,900+", icon: BookMarked },
            { label: "Avg. Saving", value: "60%", icon: ArrowUpDown },
            { label: "Swap Deals", value: "450+", icon: RotateCcw },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
              <s.icon className="w-5 h-5 mx-auto mb-1.5 text-blue-500" />
              <p className="text-lg font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {TYPES.map((t) => (
              <button key={t} onClick={() => setType(t)} className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${type === t ? "bg-blue-700 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"}`}>{t}</button>
            ))}
          </div>
          <select value={subject} onChange={(e) => setSubject(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 outline-none bg-white">
            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((b) => (
            <Link key={b.id} href={`books/${b.id}`} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-blue-200 transition-all">
              <div className={`h-24 bg-gradient-to-br ${b.accent} flex items-center justify-center`}>
                <BookOpen className="w-8 h-8 text-white/60" />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{b.title}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${TYPE_COLORS[b.type]}`}>{b.type}</span>
                </div>
                <p className="text-xs text-gray-500">{b.author}</p>
                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-500">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>{b.rating}</span>
                  <span className="text-gray-300">•</span>
                  <span>{b.condition}</span>
                </div>
                <div className="flex items-center justify-between mt-2.5">
                  <span className="text-base font-bold text-gray-900">
                    {b.price > 0 ? `৳${b.price}` : b.type === "Loan" ? "Free Loan" : "Swap"}
                  </span>
                  <span className="text-xs text-gray-400">{b.poster}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No books found</p>
          </div>
        )}
      </div>
    </div>
  );
}
