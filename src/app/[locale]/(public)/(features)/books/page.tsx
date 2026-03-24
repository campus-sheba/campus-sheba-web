"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, BookOpen } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { BsGrid3X3GapFill } from "react-icons/bs";
import { MdMenuBook } from "react-icons/md";
import { BiSolidFileBlank } from "react-icons/bi";
import { LiaFileInvoiceSolid } from "react-icons/lia";
import { RiFileFill } from "react-icons/ri";
import { ImLab } from "react-icons/im";
import { FaBookOpen } from "react-icons/fa6";

const CATEGORIES = [
  { name: "All", icon: <BsGrid3X3GapFill /> },
  { name: "Textbook", icon: <MdMenuBook /> },
  { name: "Notebook", icon: <BiSolidFileBlank /> },
  { name: "Reference", icon: <LiaFileInvoiceSolid /> },
  { name: "Novel", icon: <RiFileFill /> },
  { name: "Lab Manual", icon: <ImLab /> },
  { name: "Study Guide", icon: <FaBookOpen /> },
  { name: "Question Bank", icon: <LiaFileInvoiceSolid /> },
  { name: "Other", icon: <BsGrid3X3GapFill /> },
];

const BOOKS = [
  {
    id: "1",
    title: "Data Structures and Algorithms in C++",
    author: "Michael T. Goodrich",
    category: "Textbook",
    condition: "Good",
    listingType: "Sell",
    sellingPrice: 800,
    originalPrice: 1500,
    department: "Computer Science & Engineering",
    semester: "3rd Semester",
    location: "Dhaka University",
    postedTime: "2h ago",
    seller: {
      id: "1",
      name: "Ahmed Hassan",
      phone: "+880 1712-345678",
      email: "ahmed@email.com",
    },
  },
  {
    id: "2",
    title: "Database Management Systems",
    author: "Raghu Ramakrishnan",
    category: "Textbook",
    condition: "Like New",
    listingType: "Rent",
    rentalPrice: 150,
    department: "Computer Science & Engineering",
    semester: "3rd Semester",
    location: "BUET Campus",
    postedTime: "5h ago",
    seller: {
      id: "2",
      name: "Priya Roy",
      phone: "+880 1823-456789",
      email: "priya@email.com",
    },
  },
  {
    id: "3",
    title: "Engineering Mathematics - Complete Notes",
    author: "Dr. H.K. Dass",
    category: "Study Guide",
    condition: "New",
    listingType: "Sell",
    sellingPrice: 300,
    originalPrice: 500,
    department: "Computer Science & Engineering",
    semester: "1st Semester",
    location: "Dhaka University",
    postedTime: "1d ago",
    seller: {
      id: "3",
      name: "Fatima Khan",
      phone: "+880 1934-567890",
      email: "fatima@email.com",
    },
  },
  {
    id: "4",
    title: "Organic Chemistry Lab Manual",
    author: "John McMurry",
    category: "Lab Manual",
    condition: "Acceptable",
    listingType: "Sell",
    sellingPrice: 250,
    originalPrice: 400,
    department: "Chemistry",
    semester: "2nd Semester",
    location: "Medical College",
    postedTime: "1d ago",
    seller: {
      id: "4",
      name: "Sadia Malik",
      phone: "+880 1845-678901",
      email: "sadia@email.com",
    },
  },
  {
    id: "5",
    title: "Microprocessor & Assembly Language",
    author: "Barry B. Brey",
    category: "Textbook",
    condition: "Good",
    listingType: "Sell",
    sellingPrice: 600,
    originalPrice: 1200,
    department: "Computer Science & Engineering",
    semester: "4th Semester",
    location: "BUET Campus",
    postedTime: "2d ago",
    seller: {
      id: "5",
      name: "Karim Hasanuzzaman",
      phone: "+880 1756-789012",
      email: "karim@email.com",
    },
  },
];

export default function BooksPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [activeTab, setActiveTab] = useState<"browse" | "mylistings">("browse");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"All" | "For Sale" | "For Rent">(
    "All",
  );
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filtered = BOOKS.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase());
    const matchesType =
      filterType === "All" ||
      (filterType === "For Sale" && b.listingType === "Sell") ||
      (filterType === "For Rent" && b.listingType === "Rent");
    const matchesCategory =
      selectedCategory === "All" || b.category === selectedCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  return (
    <div className="min-h-screen pb-20 max-w-7xl mx-auto px-4 md:px-8 lg:px-0">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 ">
        <div className=" px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-red-600 text-2xl"
          >
            ←
          </button>
          <div className=" flex-1">
            <h1 className="font-semibold text-lg text-gray-900">
              Books Exchange
            </h1>
            <p className="text-xs text-gray-500">Buy, Sell & Rent</p>
          </div>
          <div className="w-8"></div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("browse")}
            className={`flex-1 py-3 font-semibold text-sm rounded-md ${
              activeTab === "browse"
                ? "text-white bg-red-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 "
            }`}
          >
            Browse
          </button>
          <button
            onClick={() => setActiveTab("mylistings")}
            className={`flex-1 py-3 font-semibold text-sm rounded-md ${
              activeTab === "mylistings"
                ? "text-white bg-red-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 "
            }`}
          >
            My Listings
          </button>
        </div>
      </div>

      {activeTab === "browse" ? (
        <>
          {/* Search Bar */}
          <div className="bg-white my-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search books..."
                className="w-full pl-9 pr-4 py-2.5 md:py-3 rounded-lg bg-gray-100 text-sm outline-none placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white space-y-3">
            {/* Listing Type Filter */}
            <div className="flex gap-2 overflow-x-auto">
              {(["All", "For Sale", "For Rent"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`py-2 rounded-full text-sm font-medium flex-1 transition-colors mb-6 ${
                    filterType === type
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto mt-8 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3 py-2 rounded-full whitespace-nowrap text-xs font-medium flex-shrink-0 transition-colors flex items-center gap-2 ${
                    selectedCategory === cat.name
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat.icon && <span className="">{cat.icon}</span>}
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Books List */}
          <div className="space-y-3 mt-8">
            {filtered.map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow flex gap-2 md:gap-4"
              >
                <div className="w-14 md:w-16 h-14 md:h-16 rounded-md bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-7 md:w-8 h-7 md:h-8 text-red-400" />
                </div>
                <div className="flex-1 min-w-0 gap-1 flex flex-col">
                  <h3 className="font-semibold text-sm text-gray-900 line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    by {book.author}
                  </p>

                  {/* Status Badge */}
                  <div className="flex gap-2 mt-2">
                    <span className="text-[9px] md:text-sm px-2 py-1 rounded bg-red-100 text-red-600">
                      {book.condition}
                    </span>
                    <span
                      className={`text-[9px] md:text-sm px-2 py-1 rounded ${book.listingType === "Sell" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}
                    >
                      {book.listingType === "Sell" ? "For Sale" : "For Rent"}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="mt-2 space-y-0.5 flex gap-3 justify-between md:gap-6 md:justify-normal">
                    <p className="text-xs text-gray-500">📍 {book.location}</p>
                    <p className="text-xs text-gray-400">{book.postedTime}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="text-right flex flex-col justify-between">
                  <div>
                    <p className="font-bold text-sm md:text-base text-gray-900">
                      ৳{book.sellingPrice || book.rentalPrice}
                    </p>
                    {book.originalPrice && (
                      <p className="text-xs md:text-sm text-gray-400 line-through">
                        ৳{book.originalPrice}
                      </p>
                    )}
                    {book.listingType === "Rent" && (
                      <p className="text-xs text-gray-500">/month</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 text-sm">No books found</p>
              </div>
            )}
          </div>

          {/* List Your Book FAB */}
          <div className="fixed bottom-6 right-6">
            <Link
              href={`/books/list`}
              className="bg-red-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-red-700 font-bold text-xl"
            >
              +
            </Link>
          </div>
        </>
      ) : (
        /* My Listings Tab */
        <div className="">
          <div className="bg-white rounded-2xl  text-center  min-h-96 flex flex-col items-center justify-center">
            <div className="w-16 max-h-16 md:h-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              No Listings Yet
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Start by listing your books for sale or rent
            </p>
            <Link
              href={`/books/list`}
              className="bg-red-600 text-white rounded-xl px-6 py-3 font-semibold text-sm hover:bg-red-700 transition-colors w-full md:min-w-[300px] md:w-auto flex items-center justify-center gap-2 max-w-xs mx-auto"
            >
              + List Your First Book
            </Link>
          </div>

          {/* List Your Book FAB */}
          <div className="fixed bottom-6 right-6">
            <Link
              href={`/books/list`}
              className="bg-red-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-red-700 font-bold text-xl"
            >
              +
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
