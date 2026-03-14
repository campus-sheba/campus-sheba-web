"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle2, GraduationCap, BookOpen, Clock, DollarSign, ChevronRight } from "lucide-react";
import Link from "next/link";

const SUBJECTS = ["Math", "Physics", "Chemistry", "Biology", "English", "Bangla", "ICT", "Economics", "Accounting", "Finance", "History", "Geography"];
const LEVELS = ["SSC", "HSC", "O-Level", "A-Level", "University", "Admission Coaching", "IELTS / TOEFL", "Spoken English"];
const DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const CAMPUSES = ["Dhaka University", "BUET", "BRAC University", "NSU", "IUT", "RUET", "CUET", "Jahangirnagar University", "RU", "CU", "KU", "SUST"];

export default function BecomeTutorPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [campus, setCampus] = useState("");
  const [dept, setDept] = useState("");
  const [year, setYear] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [days, setDays] = useState<string[]>([]);
  const [fee, setFee] = useState("");
  const [bio, setBio] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const toggleItem = (arr: string[], setter: (v: string[]) => void, item: string) => {
    setter(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);
  };

  const step1Valid = name && phone && campus && dept && year;
  const step2Valid = subjects.length > 0 && levels.length > 0 && days.length > 0 && fee;
  const step3Valid = bio.length >= 50;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
        <div className="cs-container py-8">
          <Link href="/tuition" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Tutors
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><GraduationCap className="w-5 h-5" /></div>
            <span className="text-amber-100 text-sm font-medium">Tutor Registration</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Become a Campus Tutor</h1>
          <p className="text-amber-100 text-sm max-w-lg">Share your knowledge, earn money, and help fellow students succeed. Join 500+ tutors already teaching on Campus Sheba.</p>
          <div className="mt-5 flex gap-4">
            {[{ value: "500+", label: "Active Tutors" }, { value: "৳800", label: "Avg. Hourly Rate" }, { value: "10k+", label: "Sessions Done" }].map((s) => (
              <div key={s.label} className="bg-white/15 rounded-xl px-4 py-3 text-center">
                <p className="text-lg font-bold">{s.value}</p><p className="text-xs text-amber-200">{s.label}</p>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
            <p className="text-gray-500 text-sm mb-1">Thanks, <strong>{name}</strong>! Your tutor application is under review.</p>
            <p className="text-gray-400 text-sm mb-6">Our team will review your profile and get back to you within 24–48 hours via phone.</p>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[{ icon: <BookOpen className="w-5 h-5" />, label: "Subjects", value: subjects.slice(0, 3).join(", ") + (subjects.length > 3 ? "..." : "") }, { icon: <Clock className="w-5 h-5" />, label: "Available", value: days.slice(0, 2).join(", ") + (days.length > 2 ? "..." : "") }, { icon: <DollarSign className="w-5 h-5" />, label: "Fee", value: `৳${fee}/hr` }].map((item) => (
                <div key={item.label} className="bg-amber-50 rounded-xl p-3 text-center">
                  <div className="text-amber-600 flex justify-center mb-1">{item.icon}</div>
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="text-xs font-semibold text-gray-800 truncate">{item.value}</p>
                </div>
              ))}
            </div>
            <Link href="/tuition" className="px-6 py-3 rounded-xl bg-amber-600 text-white font-semibold text-sm hover:bg-amber-700 inline-block">Browse Tutors</Link>
          </div>
        ) : (
          <>
            {/* Step Indicator */}
            <div className="flex items-center gap-2 mb-8">
              {[1, 2, 3].map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${step >= s ? "bg-amber-600 border-amber-600 text-white" : "bg-white border-gray-200 text-gray-400"}`}>{s}</div>
                  {i < 2 && <div className={`h-0.5 w-10 ${step > s ? "bg-amber-600" : "bg-gray-200"}`} />}
                </div>
              ))}
              <span className="ml-2 text-sm text-gray-500">{step === 1 ? "Personal Info" : step === 2 ? "Teaching Details" : "Bio & Review"}</span>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
              {/* Step 1: Personal Info */}
              {step === 1 && (
                <>
                  <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">Full Name *</label>
                      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-amber-400" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">Phone Number *</label>
                      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-amber-400" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">University / Campus *</label>
                      <select value={campus} onChange={(e) => setCampus(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-amber-400 bg-white appearance-none">
                        <option value="">Select campus</option>
                        {CAMPUSES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">Department *</label>
                      <input value={dept} onChange={(e) => setDept(e.target.value)} placeholder="e.g. Computer Science" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-amber-400" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">Year of Study *</label>
                      <div className="flex gap-2">
                        {["1st Year", "2nd Year", "3rd Year", "4th Year", "Masters", "PhD"].map((y) => (
                          <button key={y} onClick={() => setYear(y)} className={`px-3 py-1.5 rounded-xl text-xs font-medium border-2 transition-colors ${year === y ? "border-amber-600 bg-amber-50 text-amber-700" : "border-gray-200 text-gray-500 hover:border-amber-300"}`}>{y}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button disabled={!step1Valid} onClick={() => setStep(2)} className="w-full py-3 rounded-xl bg-amber-600 text-white font-semibold text-sm disabled:opacity-50 hover:bg-amber-700 flex items-center justify-center gap-2">
                    Next: Teaching Details <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Step 2: Teaching Details */}
              {step === 2 && (
                <>
                  <h2 className="text-lg font-bold text-gray-900">Teaching Details</h2>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-2 block">Subjects You Teach * <span className="text-gray-400 font-normal">({subjects.length} selected)</span></label>
                    <div className="flex flex-wrap gap-2">
                      {SUBJECTS.map((s) => (
                        <button key={s} onClick={() => toggleItem(subjects, setSubjects, s)} className={`px-3 py-1.5 rounded-xl text-xs font-medium border-2 transition-colors ${subjects.includes(s) ? "border-amber-600 bg-amber-50 text-amber-700" : "border-gray-200 text-gray-500 hover:border-amber-300"}`}>{s}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-2 block">Levels You Teach * <span className="text-gray-400 font-normal">({levels.length} selected)</span></label>
                    <div className="flex flex-wrap gap-2">
                      {LEVELS.map((l) => (
                        <button key={l} onClick={() => toggleItem(levels, setLevels, l)} className={`px-3 py-1.5 rounded-xl text-xs font-medium border-2 transition-colors ${levels.includes(l) ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-500 hover:border-blue-300"}`}>{l}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-2 block">Available Days * <span className="text-gray-400 font-normal">({days.length} selected)</span></label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS.map((d) => (
                        <button key={d} onClick={() => toggleItem(days, setDays, d)} className={`px-3 py-1.5 rounded-xl text-xs font-medium border-2 transition-colors ${days.includes(d) ? "border-green-600 bg-green-50 text-green-700" : "border-gray-200 text-gray-500 hover:border-green-300"}`}>{d}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Hourly Rate (৳) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">৳</span>
                      <input type="number" value={fee} onChange={(e) => setFee(e.target.value)} placeholder="e.g. 500" className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-amber-400" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Back</button>
                    <button disabled={!step2Valid} onClick={() => setStep(3)} className="flex-1 py-3 rounded-xl bg-amber-600 text-white font-semibold text-sm disabled:opacity-50 hover:bg-amber-700">
                      Next: Bio
                    </button>
                  </div>
                </>
              )}

              {/* Step 3: Bio */}
              {step === 3 && (
                <>
                  <h2 className="text-lg font-bold text-gray-900">Tell Us About Yourself</h2>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Short Bio * <span className="text-gray-400 font-normal">(min. 50 chars, {bio.length} typed)</span></label>
                    <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Introduce yourself as a tutor. What's your teaching style? What achievements do you have? Why should students choose you?..." rows={5} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-amber-400 resize-none" />
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <p className="text-xs font-semibold text-gray-700">Summary</p>
                    {[["Name", name], ["Campus", campus], ["Dept / Year", `${dept}, ${year}`], ["Subjects", subjects.join(", ") || "–"], ["Levels", levels.join(", ") || "–"], ["Available", days.join(", ") || "–"], ["Fee", fee ? `৳${fee}/hr` : "–"]].map(([k, v]) => (
                      <div key={k} className="flex justify-between text-xs gap-2">
                        <span className="text-gray-500">{k}</span>
                        <span className="text-gray-800 font-medium text-right">{v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Back</button>
                    <button disabled={!step3Valid} onClick={() => setSubmitted(true)} className="flex-1 py-3 rounded-xl bg-amber-600 text-white font-semibold text-sm disabled:opacity-50 hover:bg-amber-700">
                      Submit Application
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
