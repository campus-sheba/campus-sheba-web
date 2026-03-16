"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Droplets,
  Search,
  Phone,
  Heart,
  CheckCircle2,
  X,
  MapPin,
  Clock,
  User,
  AlertTriangle,
} from "lucide-react";
import { IoMail, IoSearchSharp } from "react-icons/io5";
import { IoMdHeart } from "react-icons/io";
import { RiAlertFill } from "react-icons/ri";
import { FaArrowLeftLong, FaLocationPin } from "react-icons/fa6";
import { MdBloodtype, MdCall } from "react-icons/md";
import { FaCheckCircle, FaMapMarkerAlt, FaUserFriends } from "react-icons/fa";
import { VscError } from "react-icons/vsc";

const BLOOD_GROUPS = ["All", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const DONORS = [
  {
    id: "d1",
    name: "Rafiqul Islam",
    bloodGroup: "A+",
    campus: "JU",
    department: "Computer Science",
    lastDonation: "3 months ago",
    available: true,
    donations: 8,
    phone: "01XXXXXXXXX",
    mail: "rafiqul@example.com",
    email: "rafiqul@example.com",
  },
  {
    id: "d2",
    name: "Mim Sultana",
    bloodGroup: "B+",
    campus: "JU",
    department: "Business Administration",
    lastDonation: "4 months ago",
    available: true,
    donations: 5,
    phone: "01XXXXXXXXX",
    mail: "mim@example.com",
    email: "mim@example.com",
  },
  {
    id: "d3",
    name: "Arif Hossain",
    bloodGroup: "O+",
    campus: "JU",
    department: "Electrical Engineering",
    lastDonation: "1 month ago",
    available: false,
    donations: 12,
    phone: "01XXXXXXXXX",
    mail: "arif@example.com",
    email: "arif@example.com",
  },
  {
    id: "d4",
    name: "Shirin Begum",
    bloodGroup: "AB+",
    campus: "JU",
    department: "Medicine",
    lastDonation: "5 months ago",
    available: true,
    donations: 3,
    phone: "01XXXXXXXXX",
    mail: "shirin@example.com",
    email: "shirin@example.com",
  },
  {
    id: "d5",
    name: "Tanvir Ahmed",
    bloodGroup: "O-",
    campus: "JU",
    department: "Civil Engineering",
    lastDonation: "6 months ago",
    available: true,
    donations: 7,
    phone: "01XXXXXXXXX",
    mail: "tanvir@example.com",
    email: "tanvir@example.com",
  },
  {
    id: "d6",
    name: "Nadia Rahman",
    bloodGroup: "B-",
    campus: "JU",
    department: "Law",
    lastDonation: "2 months ago",
    available: false,
    donations: 4,
    phone: "01XXXXXXXXX",
    mail: "nadia@example.com",
    email: "nadia@example.com",
  },
];

const REQUESTS = [
  {
    id: "r1",
    bloodGroup: "A+",
    hospital: "JU Medical Centre",
    date: "Urgent — Today",
    units: 2,
    postedBy: "Rakib H.",
  },
  {
    id: "r2",
    bloodGroup: "O+",
    hospital: "DMCH, Dhaka",
    date: "Dec 15, 2025",
    units: 1,
    postedBy: "Sadia K.",
  },
  {
    id: "r3",
    bloodGroup: "B+",
    hospital: "JU Medical Centre",
    date: "Dec 16, 2025",
    units: 3,
    postedBy: "Farhan T.",
  },
];

export default function BloodBankPage() {
  const [tab, setTab] = useState<
    "donors" | "requests" | "register" | "request"
  >("donors");
  const [bloodFilter, setBloodFilter] = useState("All");
  const [search, setSearch] = useState("");

  // Donor registration state
  const [regName, setRegName] = useState("");
  const [regBlood, setRegBlood] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regSubmitted, setRegSubmitted] = useState(false);

  // Blood request state
  const [reqBlood, setReqBlood] = useState("");
  const [reqHospital, setReqHospital] = useState("");
  const [reqUnits, setReqUnits] = useState("1");
  const [reqPhone, setReqPhone] = useState("");
  const [reqDate, setReqDate] = useState("");
  const [reqSubmitted, setReqSubmitted] = useState(false);

  const filteredDonors = DONORS.filter(
    (d) =>
      (bloodFilter === "All" || d.bloodGroup === bloodFilter) &&
      (d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.campus.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div>
        <div className="cs-container py-5 md:py-8 flex items-center gap-4">
          <Link href="/">
            <FaArrowLeftLong className="w-5 h-5 text-gray-600 hover:text-gray-900" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Blood & Emergency
            </h1>
            <p className="text-gray-600 mt-1">Save lives, get help fast</p>
          </div>
        </div>
      </div>

      <div className="md:cs-container p-3 md:p-6 rounded-xl bg-gradient-to-r from-red-600 to-pink-500 text-white mx-3 md:mx-auto">
        <div className="cs-container py-6">
          <div className=" gap-3 flex items-center ">
            <div className="w-10 h-10 rounded-xl bg-white/20  flex items-center justify-center">
              <MdBloodtype className="w-5 h-5" />
            </div>
            <div>
              <span className=" text- font-medium">Find Blood Donors</span>
              <p className="text-red-200 text-sm max-w-lg">
                Connect with verified student donors on campus. Every donation
                saves lives!
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="cs-container py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
          {[
            { id: "donors", label: "Find Donor", icon: <IoSearchSharp /> },
            { id: "be-donor", label: "Be Donor", icon: <IoMdHeart /> },
            { id: "emergency", label: "Emergency", icon: <RiAlertFill /> },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as typeof tab)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-red-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-red-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "donors" && (
          <>
            <div className="flex gap-5 mb-4 flex-col">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-5 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, department, location..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-md border border-gray-200 text-sm outline-none focus:border-red-400 bg-white truncate"
                />
              </div>
              <div className="bg-white px-3 py-6 rounded-md">
                <p className="text-sm mb-3">Filter by Blood Group</p>
                <div className="flex gap-2 flex-wrap">
                  {BLOOD_GROUPS.map((g) => (
                    <button
                      key={g}
                      onClick={() => setBloodFilter(g)}
                      className={`flex-shrink-0 px-5 py-2 rounded-md text-sm font-medium border transition-colors  ${
                        bloodFilter === g
                          ? "bg-red-600 border-red-600 text-white"
                          : "bg-gray-200  text-gray-600 hover:border-red-300"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-3 mt-6 text-xs md:text-base">
                <p>6 donor(s) found</p>
                <div className="flex items-center gap-2 ">
                  <FaUserFriends />
                  <p>6 total</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDonors.map((d) => (
                  <div
                    key={d.id}
                    className="bg-white rounded-2xl border border-gray-100 p-5"
                  >
                    <div>
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center font-bold text-white flex-shrink-0">
                              <MdBloodtype className="w-5 h-5 text-lg" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {d.name}
                              </p>
                              <p className="text-xs md:text-sm">
                                {d.department}
                              </p>
                            </div>
                          </div>
                          <div className="bg-red-100 text-red-500 px-2 py-1 rounded-md text-xs">
                            <span>{d.bloodGroup}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs md:text-sm mt-4">
                        <div>
                          <FaMapMarkerAlt className="w-4 h-4  inline-block mr-1" />
                          <span className="text-sm ">Dormitory C</span>
                        </div>
                        <div>
                          <Clock className="w-4 h-4  inline-block mr-1" />
                          <span className="text-sm ">
                            Last donated: {d.lastDonation}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 ${
                            d.available
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {d.available ? (
                            <FaCheckCircle />
                          ) : (
                            <VscError className="w-3.5 h-3.5" />
                          )}
                          {d.available ? "Available" : "Not Available"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="mt-3 flex items-center justify-center gap-2 w-full py-3 rounded-lg  bg-red-500 text-white text-sm font-medium hover:bg-red-100 transition-colors">
                        <a
                          href={`tel:${d.phone}`}
                          className="flex items-center gap-1"
                        >
                          <MdCall className="w-3.5 h-3.5" /> <span>Call</span>
                        </a>
                      </button>
                      <button className="mt-3 flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-red-50 border border-gray-400 text-sm font-medium hover:bg-red-100 transition-colors">
                        <a
                          href={`mailto:${d.email}`}
                          className="flex items-center gap-1.5"
                        >
                          <IoMail className="w-3.5 h-3.5" /> <span>Mail</span>
                        </a>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === "requests" && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-800 font-medium">
                Active blood requests — please reach out if you can help.
              </p>
            </div>
            {REQUESTS.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4"
              >
                <div className="w-14 h-14 rounded-xl bg-red-100 flex items-center justify-center font-bold text-red-700">
                  {r.bloodGroup}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">
                      {r.units} unit{r.units > 1 ? "s" : ""} needed
                    </p>
                    {r.date.startsWith("Urgent") && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                        URGENT
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{r.hospital}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {r.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      By {r.postedBy}
                    </span>
                  </div>
                </div>
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 flex-shrink-0">
                  <Heart className="w-3.5 h-3.5" /> Help
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === "register" && (
          <div className="max-w-md">
            {regSubmitted ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Registered as Donor!
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  Thank you for registering as a blood donor. You will be
                  notified when someone in your area needs blood.
                </p>
                <button
                  onClick={() => setTab("donors")}
                  className="btn-primary"
                >
                  View All Donors
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                <h2 className="text-lg font-bold text-gray-900">
                  Register as Blood Donor
                </h2>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Your Full Name
                  </label>
                  <input
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-red-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Blood Group
                  </label>
                  <select
                    value={regBlood}
                    onChange={(e) => setRegBlood(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-red-400 bg-white"
                  >
                    <option value="">Select blood group</option>
                    {BLOOD_GROUPS.slice(1).map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-red-400"
                  />
                </div>
                <button
                  disabled={!regName || !regBlood || !regPhone}
                  onClick={() => setRegSubmitted(true)}
                  className="w-full py-3 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  Register as Donor
                </button>
              </div>
            )}
          </div>
        )}

        {tab === "request" && (
          <div className="max-w-md">
            {reqSubmitted ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Request Posted!
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  Your blood request has been posted. Matching donors will be
                  notified immediately. We hope you find help soon.
                </p>
                <button
                  onClick={() => setTab("donors")}
                  className="btn-primary"
                >
                  Find Donors Now
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                <h2 className="text-lg font-bold text-gray-900">
                  Post a Blood Request
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                      Blood Group *
                    </label>
                    <select
                      value={reqBlood}
                      onChange={(e) => setReqBlood(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-red-400 bg-white"
                    >
                      <option value="">Select</option>
                      {BLOOD_GROUPS.slice(1).map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                      Units Needed *
                    </label>
                    <input
                      value={reqUnits}
                      onChange={(e) => setReqUnits(e.target.value)}
                      type="number"
                      min="1"
                      max="10"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-red-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Hospital Name *
                  </label>
                  <input
                    value={reqHospital}
                    onChange={(e) => setReqHospital(e.target.value)}
                    placeholder="e.g. JU Medical Centre"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-red-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Date Needed *
                  </label>
                  <input
                    value={reqDate}
                    onChange={(e) => setReqDate(e.target.value)}
                    type="date"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-red-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Contact Phone *
                  </label>
                  <input
                    value={reqPhone}
                    onChange={(e) => setReqPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-red-400"
                  />
                </div>
                <button
                  disabled={!reqBlood || !reqHospital || !reqPhone || !reqDate}
                  onClick={() => setReqSubmitted(true)}
                  className="w-full py-3 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  Post Blood Request
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
