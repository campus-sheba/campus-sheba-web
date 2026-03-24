"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ChevronLeft, MapPin, Clock, DollarSign, CheckCircle2, X, User, Mail, BookOpen, Send } from "lucide-react";

const JOBS: Record<string, {
  id: string; title: string; company: string; type: string; location: string;
  salary: string; deadline: string; skills: string[]; department: string; posted: string;
  description: string; requirements: string[]; responsibilities: string[];
}> = {
  j1: {
    id: "j1", title: "Web Development Intern", company: "TechSoft BD", type: "Internship",
    location: "JU Campus / Remote", salary: "৳8,000/mo", deadline: "Dec 20",
    skills: ["React", "JavaScript", "CSS"], department: "Engineering", posted: "2 days ago",
    description: "TechSoft BD is looking for a passionate web development intern to join our campus team. You will work on real client projects and gain hands-on experience in modern web technologies.",
    requirements: ["Currently enrolled in CSE, EEE, or related program", "Basic knowledge of HTML, CSS, JavaScript", "Familiarity with React is a plus", "Good communication skills"],
    responsibilities: ["Build and maintain UI components", "Collaborate with team on client projects", "Participate in code reviews", "Write clean, well-documented code"],
  },
  j7: {
    id: "j7", title: "Campus Brand Ambassador", company: "Campus Sheba", type: "Part-Time",
    location: "JU Campus", salary: "৳3,000 + bonus", deadline: "Dec 15",
    skills: ["Marketing", "Social Media", "Networking"], department: "Business", posted: "Today",
    description: "Campus Sheba is looking for energetic and motivated students to represent our brand on campus. As a Brand Ambassador, you will promote Campus Sheba services to fellow students and help us grow.",
    requirements: ["Active JU student", "Strong social presence and networking skills", "Self-motivated and target-oriented", "Basic understanding of digital marketing"],
    responsibilities: ["Promote Campus Sheba on campus", "Onboard new users and vendors", "Create social media content", "Report weekly metrics to team"],
  },
};

const TYPE_COLORS: Record<string, string> = {
  "Part-Time": "bg-blue-100 text-blue-700", "Full-Time": "bg-green-100 text-green-700",
  "Freelance": "bg-purple-100 text-purple-700", "Internship": "bg-amber-100 text-amber-700",
};

export default function JobDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = use(params);
  const job = JOBS[id] || JOBS["j1"];
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [applied, setApplied] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="cs-container py-8 max-w-3xl">
        <Link href={`/jobs`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6">
          <ChevronLeft className="w-4 h-4" /> Back to Jobs
        </Link>

        {applied ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
            <p className="text-gray-500 text-sm mb-1">Your application for <strong>{job.title}</strong> at <strong>{job.company}</strong> has been sent.</p>
            <p className="text-gray-400 text-sm mb-6">They will contact you at <strong>{email}</strong> or <strong>{phone}</strong>.</p>
            <Link href={`/jobs`} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-600 text-white font-semibold text-sm hover:bg-sky-700">
              Browse More Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[job.type] || "bg-gray-100 text-gray-700"}`}>{job.type}</span>
                  <h1 className="text-2xl font-bold text-gray-900 mt-2">{job.title}</h1>
                  <p className="text-sky-600 font-semibold mt-0.5">{job.company}</p>
                </div>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 text-white font-semibold text-sm hover:bg-sky-700 transition-colors">
                  <Send className="w-4 h-4" /> Apply Now
                </button>
              </div>

              <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gray-400" />{job.location}</span>
                <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-gray-400" />{job.salary}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-gray-400" />Deadline: {job.deadline}</span>
                <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-gray-400" />{job.department}</span>
              </div>

              <div className="flex gap-1.5 mt-4 flex-wrap">
                {job.skills.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-700 text-xs font-medium">{s}</span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
              <div>
                <h2 className="font-semibold text-gray-900 mb-2">About the Role</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{job.description}</p>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 mb-2">Requirements</h2>
                <ul className="space-y-1.5">
                  {job.requirements.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 flex-shrink-0" />{r}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 mb-2">Responsibilities</h2>
                <ul className="space-y-1.5">
                  {job.responsibilities.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />{r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {showModal && (
          <>
            <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowModal(false)} />
            <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-white rounded-2xl p-6 z-[51] shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Apply for Job</h3>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 mb-4">
                <p className="font-medium text-gray-900 text-sm">{job.title}</p>
                <p className="text-sky-600 text-sm">{job.company} · {job.salary}</p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-sky-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="your@email.com" className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-sky-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Phone *</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-sky-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Cover Letter</label>
                  <textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="Why are you suitable for this role?" rows={4} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-sky-400 resize-none" />
                </div>
                <button disabled={!name || !email || !phone} onClick={() => { setShowModal(false); setApplied(true); }} className="w-full py-3 rounded-xl bg-sky-600 text-white font-semibold text-sm hover:bg-sky-700 disabled:opacity-50 transition-colors">
                  Submit Application
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
