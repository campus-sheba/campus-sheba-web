"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Search, Target, Users, Calendar, ChevronRight } from "lucide-react";

const CATEGORIES = ["All", "Education", "Health & Medical", "Disaster Relief", "Environment", "Sports & Culture", "Community"];

const CAMPAIGNS = [
  { id: "c1", title: "Books for Underprivileged Children", category: "Education", raised: 45000, goal: 80000, donors: 128, daysLeft: 12, organizer: "JU Social Club", accent: "from-blue-400 to-blue-600", urgent: false },
  { id: "c2", title: "Emergency Medical Fund — Rashida", category: "Health & Medical", raised: 62000, goal: 100000, donors: 245, daysLeft: 3, organizer: "JU Student Council", accent: "from-red-400 to-red-600", urgent: true },
  { id: "c3", title: "Tree Plantation Drive 2025", category: "Environment", raised: 18500, goal: 50000, donors: 74, daysLeft: 20, organizer: "Green Earth JU", accent: "from-green-400 to-green-600", urgent: false },
  { id: "c4", title: "Sports Equipment for Village School", category: "Sports & Culture", raised: 31000, goal: 40000, donors: 96, daysLeft: 8, organizer: "CS Sports Club", accent: "from-amber-400 to-amber-600", urgent: false },
  { id: "c5", title: "Flood Relief Sylhet 2025", category: "Disaster Relief", raised: 89000, goal: 200000, donors: 412, daysLeft: 5, organizer: "Humanity First BD", accent: "from-teal-400 to-teal-600", urgent: true },
  { id: "c6", title: "Winter Clothes for Homeless", category: "Community", raised: 27000, goal: 35000, donors: 88, daysLeft: 15, organizer: "JU Volunteer Group", accent: "from-violet-400 to-violet-600", urgent: false },
];

export default function DonationPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = CAMPAIGNS.filter(
    (c) =>
      (category === "All" || c.category === category) &&
      c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-green-600 to-green-800 text-white">
        <div className="cs-container py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <span className="text-green-200 text-sm font-medium">Donation Hub</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Campus Donation Campaigns</h1>
          <p className="text-green-200 text-sm max-w-lg">Support meaningful causes within and around your campus. Every contribution makes a difference.</p>
          <div className="mt-5 grid grid-cols-3 gap-3 max-w-sm">
            {[{ label: "Lives Touched", value: "5,200+" }, { label: "Campaigns", value: "38" }, { label: "Total Raised", value: "৳12L+" }].map((s) => (
              <div key={s.label} className="bg-white/15 rounded-xl p-3 text-center">
                <p className="text-lg font-bold">{s.value}</p>
                <p className="text-xs text-green-200">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="cs-container py-8">
        <div className="flex gap-3 flex-wrap mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search campaigns..." className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-400 bg-white" />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setCategory(c)} className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${category === c ? "bg-green-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-green-300"}`}>{c}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c) => {
            const progress = Math.round((c.raised / c.goal) * 100);
            return (
              <div key={c.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                <div className={`h-28 bg-gradient-to-br ${c.accent} flex items-center justify-center relative`}>
                  <Heart className="w-10 h-10 text-white/60" />
                  {c.urgent && (
                    <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">URGENT</span>
                  )}
                </div>
                <div className="p-4">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{c.category}</span>
                  <h3 className="font-semibold text-gray-900 mt-0.5 leading-tight line-clamp-2">{c.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">by {c.organizer}</p>

                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>৳{c.raised.toLocaleString()} raised</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{c.donors} donors</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{c.daysLeft} days left</span>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <Link href={`donation/${c.id}`} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors">
                      <Heart className="w-3.5 h-3.5" /> Donate
                    </Link>
                    <Link href={`donation/${c.id}`} className="w-10 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500">
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No campaigns found</p>
          </div>
        )}
      </div>
    </div>
  );
}
