"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  MapPin,
  Clock,
  Eye,
  Tag,
  CheckCircle2,
  X,
} from "lucide-react";
import Link from "next/link";
import { FaArrowLeftLong } from "react-icons/fa6";
import { IoInfinite, IoKeySharp } from "react-icons/io5";
import {
  MdAccountBalanceWallet,
  MdLaptopWindows,
  MdPhoneAndroid,
} from "react-icons/md";
import { SiBookstack } from "react-icons/si";

const ITEMS = [
  {
    id: "1",
    type: "lost",
    title: "Blue HP Laptop",
    category: "Electronics",
    location: "Library, Floor 2",
    time: "2 hours ago",
    description:
      "HP Pavilion 15, blue color, has a star sticker. Lost near the study tables.",
    contact: "01712345678",
    reward: "500",
    image: "💻",
    urgent: true,
  },
  {
    id: "2",
    type: "found",
    title: "Student ID Card",
    category: "ID / Cards",
    location: "TSC Cafeteria",
    time: "3 hours ago",
    description:
      "Found a student ID card near the cashier counter. Name: Md. Karim, Dept: CSE.",
    contact: "01898765432",
    reward: null,
    image: "🪪",
    urgent: false,
  },
  {
    id: "3",
    type: "lost",
    title: "Black Backpack",
    category: "Bags",
    location: "Central Field",
    time: "5 hours ago",
    description:
      "Black Reebok backpack with laptop, books, and documents inside. Very important.",
    contact: "01756789012",
    reward: "200",
    image: "🎒",
    urgent: true,
  },
  {
    id: "4",
    type: "found",
    title: "Glasses – Brown Frame",
    category: "Accessories",
    location: "Science Lab Building",
    time: "1 day ago",
    description:
      "Found a pair of prescription glasses with brown frame near Lab 302.",
    contact: "01611223344",
    reward: null,
    image: "👓",
    urgent: false,
  },
  {
    id: "5",
    type: "lost",
    title: "Calculator (Casio FX-991)",
    category: "Electronics",
    location: "Math Dept Classroom",
    time: "2 days ago",
    description:
      "Scientific calculator, has initials 'S.A.' written on the back.",
    contact: "01900112233",
    reward: "100",
    image: "🔢",
    urgent: false,
  },
  {
    id: "6",
    type: "found",
    title: "Wallet – Dark Brown",
    category: "Accessories",
    location: "Bus Stop, Gate 2",
    time: "2 days ago",
    description:
      "Found a dark brown leather wallet with some cash and cards. No ID inside.",
    contact: "01811223344",
    reward: null,
    image: "👛",
    urgent: false,
  },
  {
    id: "7",
    type: "lost",
    title: "Umbrella – Red & White",
    category: "Accessories",
    location: "Department Building A",
    time: "3 days ago",
    description:
      "Red and white striped umbrella. Very sentimental. Please return if found.",
    contact: "01734455667",
    reward: null,
    image: "☂️",
    urgent: false,
  },
  {
    id: "8",
    type: "found",
    title: "USB Flash Drive (32GB)",
    category: "Electronics",
    location: "Computer Lab 1",
    time: "4 days ago",
    description:
      "Found a SanDisk 32GB USB drive near PC-14. Has academic files.",
    contact: "01677889900",
    reward: null,
    image: "💾",
    urgent: false,
  },
];

const CATEGORIES = [
  { title: "All", value: "all", icon: <IoInfinite /> },
  { title: "Phone", value: "phone", icon: <MdPhoneAndroid /> },
  { title: "Bags", value: "bags", icon: <MdAccountBalanceWallet /> },
  { title: "Books", value: "books", icon: <SiBookstack /> },
  { title: "ID / Cards", value: "id-cards", icon: <IoKeySharp /> },
  { title: "Electronics", value: "electronics", icon: <MdLaptopWindows /> },
  { title: "Documents", value: "documents", icon: <SiBookstack /> },
];

type ReportForm = {
  title: string;
  category: string;
  location: string;
  description: string;
  phone: string;
  reward: string;
};

export default function LostFoundPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "lost" | "found">("all");
  const [category, setCategory] = useState("All");
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState<"lost" | "found">("lost");
  const [form, setForm] = useState<ReportForm>({
    title: "",
    category: "",
    location: "",
    description: "",
    phone: "",
    reward: "",
  });
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const filtered = ITEMS.filter((item) => {
    if (filter !== "all" && item.type !== filter) return false;
    if (category !== "All" && item.category !== category) return false;
    if (
      search &&
      !item.title.toLowerCase().includes(search.toLowerCase()) &&
      !item.description.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="cs-container mx-auto pt-5 md:pt-10">
        <div className="flex items-center gap-3 mb-3 text-center">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl cursor-pointer">
            <Link href="/">
              <FaArrowLeftLong className="w-5 h-5" />
            </Link>
          </div>
          <span className=" text-2xl font-medium">Lost & Found</span>
        </div>
      </div>

      <div className="cs-container py-8">
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-orange-400"
            />
          </div>
          {/* <div className="flex gap-2">
            <button
              onClick={() => {
                setReportType("lost");
                setShowReportModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
            >
              <Plus className="w-4 h-4" /> Report Lost
            </button>
            <button
              onClick={() => {
                setReportType("found");
                setShowReportModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700"
            >
              <Plus className="w-4 h-4" /> Report Found
            </button>
          </div> */}
          <div className="flex gap-2 md:gap-4 overflow-x-auto no-scrollbar">
            {(["all", "lost", "found"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-1 rounded-lg text-sm font-medium capitalize transition-colors ${filter === f ? "bg-slate-800 text-white" : "text-gray-500 bg-gray-200 hover:text-gray-900"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row flex-wrap gap-x-6 gap-y-3 mb-6">
          <h2 className="text-lg font-medium">Categories</h2>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`px-4 py-2 rounded-md text-xs font-medium transition-colors flex items-center gap-2 ${category === c.value ? "bg-red-600 text-white" : "bg-gray-200 hover:border-red-400"}`}
              >
                <span>{c.icon}</span> {c.title}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-4">
          {filtered.length} item{filtered.length !== 1 ? "s" : ""} found
        </p>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <Link
              key={item.id}
              href={`/lost-found/${item.id}`}
              className="bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow overflow-hidden group flex flex-row md:flex-col"
            >
              <div
                className={`${item.type === "lost" ? "bg-red-200" : "bg-green-200"} p-6 text-center text-5xl flex items-center justify-center`}
              >
                {item.image}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-orange-600">
                    {item.title}
                  </h3>
                  {item.reward && (
                    <span className="px-2 py-0.5 rounded text-xs bg-orange-200 text-orange-600 border border-orange-500 font-medium whitespace-nowrap">
                      <span className="">৳</span> {item.reward}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-3 md:gap-0">
                  <p className="text-xs text-gray-500 mb-1">
                    {item.description.slice(0, 80)}...
                  </p>
                  <p
                    className={`px-3 py-1 rounded-md text-xs font-medium capitalize ${item.type === "lost" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-600"}`}
                  >
                    {item.type}
                  </p>
                </div>
                {/* <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {item.category}
                  </span>
                </div> */}
                <div className="flex items-center justify-between gap-1 text-xs text-gray-500 my-2 md:my-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {item.location}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" /> {item.time}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <span className="text-4xl mb-3 block">🔍</span>
            <p className="text-gray-500">
              No items found for your search or filter.
            </p>
          </div>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">
                Report {reportType === "lost" ? "Lost" : "Found"} Item
              </h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {reportSubmitted ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h4 className="font-bold text-gray-900 mb-1">
                  Report Submitted!
                </h4>
                <p className="text-sm text-gray-500 mb-4">
                  Your report has been posted. Community members can now help
                  you.
                </p>
                <button
                  onClick={() => {
                    setShowReportModal(false);
                    setReportSubmitted(false);
                    setForm({
                      title: "",
                      category: "",
                      location: "",
                      description: "",
                      phone: "",
                      reward: "",
                    });
                  }}
                  className="px-5 py-2.5 rounded-xl bg-orange-600 text-white text-sm font-medium"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
                  {(["lost", "found"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setReportType(t)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${reportType === t ? "bg-white shadow text-gray-900" : "text-gray-500"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Item title (e.g. Blue HP Laptop)"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-400"
                />
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-400 bg-white appearance-none"
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.slice(1).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <input
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                  placeholder={
                    reportType === "lost"
                      ? "Where did you last see it?"
                      : "Where did you find it?"
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-400"
                />
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Describe the item in detail..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-400 resize-none"
                />
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Your phone number"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-400"
                />
                {reportType === "lost" && (
                  <input
                    value={form.reward}
                    onChange={(e) =>
                      setForm({ ...form, reward: e.target.value })
                    }
                    placeholder="Reward amount (optional, e.g. ৳200)"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-400"
                  />
                )}
                <button
                  disabled={!form.title || !form.location || !form.phone}
                  onClick={() => setReportSubmitted(true)}
                  className="w-full py-3 rounded-xl bg-orange-600 text-white font-semibold text-sm hover:bg-orange-700 disabled:opacity-50"
                >
                  Submit Report
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
