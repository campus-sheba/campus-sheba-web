"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, Search, Star, MapPin, BookOpen, Clock } from "lucide-react";

const SUBJECTS = ["All", "Mathematics", "Physics", "Chemistry", "Biology", "English", "Bengali", "Computer Science", "Economics", "Engineering"];
const LEVELS = ["All", "SSC/HSC", "Undergraduate", "Graduate", "Professional"];

const TUTORS = [
  { id: "t1", name: "Md. Rakibul Hasan", subject: "Mathematics, Physics", level: "Undergraduate", rating: 4.9, reviews: 48, fee: 500, perHour: true, campus: "JU", experience: "3 years", available: ["Mon", "Wed", "Fri"], accent: "from-amber-400 to-orange-500", bio: "CSE 3rd year student. Strong in calculus, mechanics, and linear algebra. 3 years tutoring experience.", sessions: 120 },
  { id: "t2", name: "Sadia Islam", subject: "English, Bengali", level: "SSC/HSC", rating: 4.7, reviews: 36, fee: 400, perHour: true, campus: "JU", experience: "2 years", available: ["Tue", "Thu", "Sat"], accent: "from-pink-400 to-rose-500", bio: "English Literature student with 2 years experience coaching SSC students.", sessions: 85 },
  { id: "t3", name: "Prof. Arif Ullah", subject: "Chemistry, Biology", level: "Graduate", rating: 4.8, reviews: 62, fee: 800, perHour: true, campus: "JU", experience: "5 years", available: ["Mon", "Thu", "Sun"], accent: "from-green-400 to-emerald-500", bio: "Chemistry MSc student. Specialized in organic and physical chemistry for university level.", sessions: 200 },
  { id: "t4", name: "Tanvir Ahmed", subject: "Computer Science", level: "Undergraduate", rating: 4.6, reviews: 29, fee: 600, perHour: true, campus: "JU", experience: "2 years", available: ["Wed", "Fri", "Sat"], accent: "from-blue-400 to-blue-600", bio: "Software Engineering student. Teaches Data Structures, Algorithms, Python, C++.", sessions: 74 },
  { id: "t5", name: "Farida Khanam", subject: "Economics", level: "Undergraduate", rating: 4.5, reviews: 21, fee: 450, perHour: true, campus: "JU", experience: "1.5 years", available: ["Mon", "Tue", "Thu"], accent: "from-purple-400 to-purple-600", bio: "Economics 4th year. Specializes in micro/macroeconomics and econometrics.", sessions: 52 },
  { id: "t6", name: "Nabil Hossain", subject: "Engineering Drawing, CAD", level: "Undergraduate", rating: 4.8, reviews: 33, fee: 550, perHour: true, campus: "JU", experience: "2.5 years", available: ["Tue", "Sat", "Sun"], accent: "from-teal-400 to-teal-600", bio: "Civil Engineering student, expert in AutoCAD and engineering drafting.", sessions: 90 },
];

export default function TuitionPage() {
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("All");
  const [level, setLevel] = useState("All");

  const filtered = TUTORS.filter(
    (t) =>
      (subject === "All" || t.subject.includes(subject)) &&
      (level === "All" || t.level === level) &&
      (t.name.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
        <div className="cs-container py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-amber-100 text-sm font-medium">Tuition Sheba</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Find or Become a Tutor</h1>
          <p className="text-amber-100 text-sm max-w-lg">Connect with skilled campus tutors for personalized sessions. Affordable, flexible, and campus-verified.</p>
          <div className="mt-5 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-300" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or subject..." className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/15 border border-white/20 text-white placeholder:text-amber-300 text-sm outline-none focus:bg-white/25" />
          </div>
        </div>
      </div>

      <div className="cs-container py-8">
        <div className="flex gap-3 flex-wrap mb-6">
          <select value={subject} onChange={(e) => setSubject(e.target.value)} className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 outline-none bg-white focus:border-amber-400">
            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={level} onChange={(e) => setLevel(e.target.value)} className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 outline-none bg-white focus:border-amber-400">
            {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <Link href="tuition/become-tutor" className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition-colors">
            + Become a Tutor
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all">
              <div className={`h-20 bg-gradient-to-br ${t.accent} flex items-center justify-center`}>
                <GraduationCap className="w-8 h-8 text-white/60" />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{t.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{t.subject}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-bold text-gray-900">{t.rating}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{t.campus}</span>
                  <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{t.level}</span>
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>Available: {t.available.join(", ")}</span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div>
                    <span className="text-lg font-bold text-amber-600">৳{t.fee}</span>
                    <span className="text-xs text-gray-400">/hr</span>
                  </div>
                  <Link href={`tuition/${t.id}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-colors">
                    Book Session
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No tutors found</p>
          </div>
        )}
      </div>
    </div>
  );
}
