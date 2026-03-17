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
  const [tab, setTab] = useState<"donors" | "be-donor" | "emergency">("donors");
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
        d.campus.toLowerCase().includes(search.toLowerCase())),
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

      <div className="cs-container py-8">
        {/* Tabs */}
        <div className="flex gap-2 md:gap-4 mb-6 overflow-x-auto no-scrollbar">
          {[
            { id: "donors", label: "Find Donor", icon: <IoSearchSharp /> },
            { id: "be-donor", label: "Be Donor", icon: <IoMdHeart /> },
            { id: "emergency", label: "Emergency", icon: <RiAlertFill /> },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as typeof tab)}
              className={`flex-shrink-0 flex flex-col items-center gap-1 px-6 md:px-10 py-2.5 rounded-xl text-sm transition-colors text-center ${
                tab === t.id
                  ? "bg-red-600 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-red-300"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {tab === "donors" && (
          <>
            <div className="flex gap-5 mb-4 flex-col">
              <div className="md:cs-container p-3 md:p-6 rounded-xl bg-gradient-to-r from-red-600 to-pink-500 text-white mx-3 md:mx-auto">
                <div className="cs-container py-6">
                  <div className=" gap-3 flex items-center ">
                    <div className="w-10 h-10 rounded-xl bg-white/20  flex items-center justify-center">
                      <MdBloodtype className="w-5 h-5" />
                    </div>
                    <div>
                      <span className=" text- font-medium">
                        Find Blood Donors
                      </span>
                      <p className="text-red-200 text-sm max-w-lg">
                        Connect with verified student donors on campus. Every
                        donation saves lives!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
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

        {tab === "be-donor" && (
          <div className="space-y-5">
            <div className="md:cs-container p-3 md:p-6 rounded-xl bg-gradient-to-r from-pink-600 to-red-500 text-white mx-3 md:mx-auto">
              <div className="cs-container py-6">
                <div className=" gap-3 flex items-center ">
                  <div className="w-10 h-10 rounded-xl bg-white/20  flex items-center justify-center">
                    <MdBloodtype className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-lg font-semibold">
                      Be a Life Saver
                    </span>
                    <p className="text-red-200 text-sm max-w-lg">
                      Register as a blood donor and help your fellow students in
                      need.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 mx-3 md:mx-auto max-w-2xl">
              <h3 className="text-lg text-gray-900 mb-4">
                Personal Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-2">
                    Full Name
                  </label>
                  <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-3 py-3">
                    <User className="w-5 h-5 text-gray-500" />
                    <input
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Enter your full name"
                      className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-2">
                    Blood Group
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {BLOOD_GROUPS.slice(1).map((g) => (
                      <button
                        key={g}
                        onClick={() => setRegBlood(g)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                          regBlood === g
                            ? "bg-red-600 text-white border-red-600"
                            : "bg-gray-100 placeholder:text-gray-900 border-transparent"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-2">
                    Phone Number
                  </label>
                  <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-3 py-3">
                    <MdCall className="w-5 h-5 text-gray-500" />
                    <input
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+880 1XXX-XXXXXXX"
                      className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-2">
                    Email (Optional)
                  </label>
                  <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-3 py-3">
                    <IoMail className="w-5 h-5 text-gray-500" />
                    <input
                      placeholder="your.email@student.edu.bd"
                      className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-2">
                    Campus Location
                  </label>
                  <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-3 py-3">
                    <FaLocationPin className="w-5 h-5 text-gray-500" />
                    <input
                      placeholder="e.g., Dormitory A, Off Campus"
                      className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-2">
                    Department
                  </label>
                  <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-3 py-3">
                    <FaUserFriends className="w-5 h-5 text-gray-500" />
                    <input
                      placeholder="e.g., Computer Science"
                      className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-2">
                    Last Donation Date (Optional)
                  </label>
                  <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-3 py-3">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <input
                      type="date"
                      className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-900"
                    />
                  </div>
                </div>

                <button
                  disabled={!regName || !regBlood || !regPhone}
                  onClick={() => setRegSubmitted(true)}
                  className="w-full py-3 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  <span className="inline-flex items-center gap-2 justify-center">
                    <IoMdHeart className="w-4 h-4" /> Register as Donor
                  </span>
                </button>

                <div className="bg-white border border-gray-100 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Donation Guidelines
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✔</span> Must be 18-60
                      years old
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✔</span> Weight must be
                      at least 50 kg
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✔</span> Can donate every
                      3-4 months
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✔</span> Must be in good
                      health
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "emergency" && (
          <div className="space-y-5">
            <div className="md:cs-container p-3 md:p-6 rounded-xl bg-gradient-to-r from-red-600 to-pink-500 text-white mx-3 md:mx-auto">
              <div className="cs-container py-6">
                <div className=" gap-3 flex items-center ">
                  <div className="w-10 h-10 rounded-xl bg-white/20  flex items-center justify-center">
                    <RiAlertFill className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-lg font-semibold">
                      Emergency Contacts
                    </span>
                    <p className="text-red-200 text-sm max-w-lg">
                      Quick access to campus security, hospitals, police, and
                      emergency services.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mx-3 md:mx-auto max-w-3xl space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">
                    National Emergency
                  </h4>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    24/7
                  </span>
                </div>
                <div className="rounded-xl overflow-hidden">
                  <div className="bg-red-600 text-white px-5 py-6 rounded-xl ">
                    <div className="font-bold flex items-center gap-3 mb-2">
                      <RiAlertFill className="w-6 h-6 " />
                      <p className="">National Emergency</p>
                    </div>
                    <div className="flex items-center justify-between w-full bg-white/10 p-2 rounded-md">
                      <div className="flex items-center gap-3">
                        <MdCall className="w-5 h-5" />
                        <span className="font-semibold text-lg">999</span>
                      </div>
                      <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                        24/7
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Campus contacts */}
              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-md bg-blue-100 flex items-center justify-center">
                    <FaMapMarkerAlt className="w-4 h-4 text-blue-700" />
                  </div>
                  <h4 className="font-semibold text-gray-900">Campus</h4>
                </div>
                <div className="space-y-3 ">
                  {[
                    {
                      title: "Campus Security Control Room",
                      location: "Main Gate, Campus",
                      primary: "+880 2-9876543",
                      secondary: "+880 1700-000001",
                    },
                    {
                      title: "Campus Medical Center",
                      location: "Building 5, Ground Floor",
                      primary: "+880 2-9876544",
                      secondary: "",
                    },
                    {
                      title: "Proctor Office",
                      location: "Administration Building",
                      primary: "+880 2-9876545",
                      secondary: "+880 1700-000002",
                    },
                  ].map((c) => (
                    <div key={c.title} className="bg-gray-50 rounded-xl p-4">
                      <p className="font-medium text-gray-800">{c.title}</p>
                      <p className="text-xs text-gray-400 mb-4">{c.location}</p>
                      <div className="flex gap-3 text-[11px] md:text-base">
                        <a
                          href={`tel:${c.primary}`}
                          className="flex-1 bg-red-600 text-white rounded-xl py-3 flex items-center justify-center gap-2"
                        >
                          <MdCall className="w-4 h-4" /> {c.primary}
                        </a>
                        {c.secondary ? (
                          <a
                            href={`tel:${c.secondary}`}
                            className="flex-1 bg-white border border-gray-200 rounded-xl py-3 flex items-center justify-center gap-2"
                          >
                            <MdCall className="w-4 h-4 placeholder:text-gray-900" />{" "}
                            {c.secondary}
                          </a>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hospital / Police / Fire / Ambulance grouped quickly */}
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">Hospital</h4>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      24/7
                    </span>
                  </div>
                  {[
                    {
                      title: "Dhaka Medical College Hospital",
                      location: "Secretariat Road, Dhaka",
                      primary: "+880 2-8626812",
                      secondary: "999",
                    },
                    {
                      title: "Square Hospital",
                      location: "Birdem Road, Dhaka",
                      primary: "+880 2-8159457",
                      secondary: "+880 1713-033190",
                    },
                    {
                      title: "United Hospital",
                      location: "Gulshan",
                      primary: "+880 2-8836000",
                      secondary: "10666",
                    },
                  ].map((h) => (
                    <div
                      key={h.title}
                      className="bg-gray-50 rounded-xl p-4 mb-3"
                    >
                      <p className="font-medium text-gray-800">{h.title}</p>
                      <p className="text-xs text-gray-400 mb-2">{h.location}</p>
                      <div className="flex gap-3 text-[11px] md:text-base">
                        <a
                          href={`tel:${h.primary}`}
                          className="flex-1 bg-red-600 text-white rounded-xl py-3 flex items-center justify-center gap-2"
                        >
                          <MdCall className="w-4 h-4" /> {h.primary}
                        </a>
                        <a
                          href={`tel:${h.secondary}`}
                          className="flex-1 bg-white border border-gray-200 rounded-xl py-3 flex items-center justify-center gap-2"
                        >
                          <MdCall className="w-4 h-4 placeholder:text-gray-900" />{" "}
                          {h.secondary}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">Police</h4>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      24/7
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="font-medium">National Emergency (Police)</p>
                    <div className="mt-3 text-[11px] md:text-base">
                      <a
                        href={`tel:999`}
                        className="w-full bg-red-600 text-white rounded-xl py-3 flex items-center justify-center gap-2"
                      >
                        <MdCall className="w-4 h-4" /> 999
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">
                      Fire Service
                    </h4>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      24/7
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="font-medium">Fire Service & Civil Defence</p>
                    <div className="mt-3 text-[11px] md:text-base">
                      <a
                        href={`tel:999`}
                        className="w-full bg-red-600 text-white rounded-xl py-3 flex items-center justify-center gap-2"
                      >
                        <MdCall className="w-4 h-4" /> 999
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">Ambulance</h4>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      24/7
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="font-medium">National Ambulance Service</p>
                    <div className="mt-3 text-[11px] md:text-base">
                      <a
                        href={`tel:999`}
                        className="w-full bg-red-600 text-white rounded-xl py-3 flex items-center justify-center gap-2"
                      >
                        <MdCall className="w-4 h-4" /> 999
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
