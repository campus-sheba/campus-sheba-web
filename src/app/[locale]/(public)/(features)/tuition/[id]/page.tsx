"use client";

import { use, useState } from "react";
import Link from "next/link";
import { GraduationCap, ChevronLeft, Star, MapPin, Clock, BookOpen, CheckCircle2, X, Phone, Calendar } from "lucide-react";

const TUTORS: Record<string, {
  id: string; name: string; subject: string; level: string; rating: number; reviews: number;
  fee: number; campus: string; experience: string; available: string[]; accent: string; bio: string; sessions: number;
}> = {
  t1: { id: "t1", name: "Md. Rakibul Hasan", subject: "Mathematics, Physics", level: "Undergraduate", rating: 4.9, reviews: 48, fee: 500, campus: "JU", experience: "3 years", available: ["Monday", "Wednesday", "Friday"], accent: "from-amber-400 to-orange-500", bio: "CSE 3rd year student. Strong in calculus, mechanics, and linear algebra. 3 years tutoring experience with 120+ successful sessions.", sessions: 120 },
  t2: { id: "t2", name: "Sadia Islam", subject: "English, Bengali", level: "SSC/HSC", rating: 4.7, reviews: 36, fee: 400, campus: "JU", experience: "2 years", available: ["Tuesday", "Thursday", "Saturday"], accent: "from-pink-400 to-rose-500", bio: "English Literature student with 2 years experience coaching SSC students. Specializes in grammar, essay writing, and literature.", sessions: 85 },
  t3: { id: "t3", name: "Prof. Arif Ullah", subject: "Chemistry, Biology", level: "Graduate", rating: 4.8, reviews: 62, fee: 800, campus: "JU", experience: "5 years", available: ["Monday", "Thursday", "Sunday"], accent: "from-green-400 to-emerald-500", bio: "Chemistry MSc student. Specialized in organic and physical chemistry for university level. 200+ sessions completed with 5-star ratings.", sessions: 200 },
  t4: { id: "t4", name: "Tanvir Ahmed", subject: "Computer Science", level: "Undergraduate", rating: 4.6, reviews: 29, fee: 600, campus: "JU", experience: "2 years", available: ["Wednesday", "Friday", "Saturday"], accent: "from-blue-400 to-blue-600", bio: "Software Engineering student. Teaches Data Structures, Algorithms, Python, C++, Web Development basics.", sessions: 74 },
};

export default function TutorDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = use(params);
  const tutor = TUTORS[id] || TUTORS["t1"];
  const [showModal, setShowModal] = useState(false);
  const [phone, setPhone] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [topic, setTopic] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="cs-container py-8 max-w-2xl">
        <Link href={`/tuition`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6">
          <ChevronLeft className="w-4 h-4" /> Back to Tutors
        </Link>

        {submitted ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Booked!</h2>
            <p className="text-gray-500 text-sm mb-1">{tutor.name} will contact you at <strong>{phone}</strong>.</p>
            <p className="text-gray-400 text-sm mb-6">Selected day: <strong>{selectedDay}</strong></p>
            <Link href={`/tuition`} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600">
              Browse More Tutors
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className={`h-28 bg-gradient-to-br ${tutor.accent} flex items-center justify-center`}>
                <GraduationCap className="w-12 h-12 text-white/60" />
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{tutor.name}</h1>
                    <p className="text-gray-500 text-sm">{tutor.subject}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="font-bold text-gray-900">{tutor.rating}</span>
                      <span className="text-sm text-gray-400">({tutor.reviews} reviews)</span>
                    </div>
                    <p className="text-xl font-bold text-amber-600 mt-1">৳{tutor.fee}<span className="text-sm font-normal text-gray-400">/hr</span></p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mt-4 leading-relaxed">{tutor.bio}</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                  {[
                    { icon: MapPin, label: "Campus", value: tutor.campus },
                    { icon: BookOpen, label: "Level", value: tutor.level },
                    { icon: Clock, label: "Experience", value: tutor.experience },
                    { icon: Star, label: "Sessions", value: `${tutor.sessions}+` },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-gray-50 rounded-xl p-3 text-center">
                      <stat.icon className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                      <p className="text-xs text-gray-400">{stat.label}</p>
                      <p className="text-sm font-semibold text-gray-900">{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5">
                  <p className="text-sm font-medium text-gray-700 mb-2">Available Days</p>
                  <div className="flex gap-2 flex-wrap">
                    {tutor.available.map((d) => (
                      <span key={d} className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium">{d}</span>
                    ))}
                  </div>
                </div>

                <button onClick={() => setShowModal(true)} className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-colors">
                  <Calendar className="w-4 h-4" />
                  Book a Session
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
                <h3 className="text-lg font-bold text-gray-900">Book Session</h3>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-amber-50 rounded-xl p-3 mb-4">
                <p className="font-medium text-gray-900 text-sm">{tutor.name}</p>
                <p className="text-amber-600 font-bold text-sm">৳{tutor.fee}/hour</p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Preferred Day</label>
                  <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-amber-400 bg-white">
                    <option value="">Select day</option>
                    {tutor.available.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Topic / Subject Area</label>
                  <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Differential Calculus, Chapter 3" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-amber-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Your Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-amber-400" />
                  </div>
                </div>
                <button disabled={!phone || !selectedDay} onClick={() => { setShowModal(false); setSubmitted(true); }} className="w-full py-3 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 disabled:opacity-50 transition-colors">
                  Confirm Booking
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
