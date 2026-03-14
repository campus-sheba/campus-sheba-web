"use client";

import { useState } from "react";
import Link from "next/link";
import { Briefcase, Search, MapPin, Clock, DollarSign, Filter } from "lucide-react";

const JOB_TYPES = ["All", "Part-Time", "Full-Time", "Freelance", "Internship", "Remote"];
const DEPARTMENTS = ["All", "Engineering", "Business", "Arts", "Medical", "Science", "Education"];

const JOBS = [
  { id: "j1", title: "Web Development Intern", company: "TechSoft BD", type: "Internship", location: "JU Campus / Remote", salary: "৳8,000/mo", deadline: "Dec 20", skills: ["React", "JavaScript", "CSS"], department: "Engineering", posted: "2 days ago" },
  { id: "j2", title: "Content Writer (Part-Time)", company: "MediaHub BD", type: "Part-Time", location: "Remote", salary: "৳300/article", deadline: "Dec 25", skills: ["Writing", "Bengali", "SEO"], department: "Arts", posted: "3 days ago" },
  { id: "j3", title: "Math Tutor (Online)", company: "EduTech Platform", type: "Freelance", location: "Online", salary: "৳500/hr", deadline: "Jan 5", skills: ["Mathematics", "Teaching"], department: "Education", posted: "Today" },
  { id: "j4", title: "Data Entry Operator", company: "FinanceCorps", type: "Part-Time", location: "Dhaka (Nearby)", salary: "৳6,000/mo", deadline: "Dec 28", skills: ["Excel", "Data Entry", "Typing"], department: "Business", posted: "1 week ago" },
  { id: "j5", title: "Research Assistant", company: "JU Science Dept.", type: "Part-Time", location: "JU Campus", salary: "৳5,000/mo", deadline: "Dec 18", skills: ["Research", "Lab Work", "Report Writing"], department: "Science", posted: "3 days ago" },
  { id: "j6", title: "Graphic Designer", company: "CreativeStudio", type: "Freelance", location: "Remote", salary: "Negotiable", deadline: "Dec 22", skills: ["Photoshop", "Figma", "Canva"], department: "Arts", posted: "4 days ago" },
  { id: "j7", title: "Campus Brand Ambassador", company: "Campus Sheba", type: "Part-Time", location: "JU Campus", salary: "৳3,000 + bonus", deadline: "Dec 15", skills: ["Marketing", "Social Media", "Networking"], department: "Business", posted: "Today", featured: true },
];

const TYPE_COLORS: Record<string, string> = {
  "Part-Time": "bg-blue-100 text-blue-700",
  "Full-Time": "bg-green-100 text-green-700",
  "Freelance": "bg-purple-100 text-purple-700",
  "Internship": "bg-amber-100 text-amber-700",
  "Remote": "bg-teal-100 text-teal-700",
};

export default function JobsPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const [dept, setDept] = useState("All");

  const filtered = JOBS.filter(
    (j) =>
      (type === "All" || j.type === type) &&
      (dept === "All" || j.department === dept) &&
      (j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-sky-600 to-sky-800 text-white">
        <div className="cs-container py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-sky-200 text-sm font-medium">Campus Jobs</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Find Campus Opportunities</h1>
          <p className="text-sky-200 text-sm max-w-lg">Part-time jobs, internships, and freelance gigs curated for campus students. Earn while you learn.</p>
          <div className="mt-5 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-300" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search jobs or companies..." className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/15 border border-white/20 text-white placeholder:text-sky-300 text-sm outline-none focus:bg-white/25" />
          </div>
        </div>
      </div>

      <div className="cs-container py-8">
        <div className="flex gap-3 flex-wrap mb-6">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {JOB_TYPES.map((t) => (
              <button key={t} onClick={() => setType(t)} className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${type === t ? "bg-sky-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-sky-300"}`}>{t}</button>
            ))}
          </div>
          <select value={dept} onChange={(e) => setDept(e.target.value)} className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 outline-none bg-white focus:border-sky-400">
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">{filtered.length} job{filtered.length !== 1 ? "s" : ""} found</p>
          <span className="text-xs text-gray-400 flex items-center gap-1"><Filter className="w-3 h-3" />Sorted by latest</span>
        </div>

        <div className="space-y-3">
          {filtered.map((j) => (
            <Link key={j.id} href={`jobs/${j.id}`} className={`block bg-white rounded-2xl border ${(j as typeof j & { featured?: boolean }).featured ? "border-sky-300 shadow-sm" : "border-gray-100"} p-5 hover:shadow-md transition-all`}>
              {(j as typeof j & { featured?: boolean }).featured && (
                <div className="flex items-center gap-1.5 text-sky-600 text-xs font-semibold mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                  Featured Opportunity
                </div>
              )}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{j.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{j.company}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{j.location}</span>
                    <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{j.salary}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Deadline: {j.deadline}</span>
                  </div>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {j.skills.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600 text-xs">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[j.type] || "bg-gray-100 text-gray-700"}`}>{j.type}</span>
                  <span className="text-xs text-gray-400">{j.posted}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No jobs found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
