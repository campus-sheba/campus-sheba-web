"use client";

import { use, useState } from "react";
import Link from "next/link";
import { BookOpen, Phone, MapPin, Mail, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { HiOutlineBars3BottomLeft } from "react-icons/hi2";

interface BookDetail {
  id: string;
  title: string;
  author: string;
  category: string;
  condition: string;
  listingType: "Sell" | "Rent";
  sellingPrice?: number;
  originalPrice?: number;
  savingsPercent?: number;
  rentalPrice?: number;
  department: string;
  semester: string;
  location: string;
  postedTime: string;
  description: string;
  subject: string;
  seller: {
    id: string;
    name: string;
    phone: string;
    email: string;
    rating: number;
    totalListings: number;
  };
}

const BOOKS: Record<string, BookDetail> = {
  "1": {
    id: "1",
    title: "Data Structures and Algorithms in C++",
    author: "Michael T. Goodrich",
    category: "Textbook",
    condition: "Good",
    listingType: "Sell",
    sellingPrice: 800,
    originalPrice: 1500,
    savingsPercent: 47,
    department: "Computer Science & Engineering",
    semester: "3rd Semester",
    location: "Dhaka University",
    postedTime: "2h ago",
    description:
      "Complete textbook with all chapters. Minimal highlighting, no missing pages.",
    subject: "Data Structures",
    seller: {
      id: "1",
      name: "Ahmed Hassan",
      phone: "+880 1712-345678",
      email: "ahmed@email.com",
      rating: 4.8,
      totalListings: 12,
    },
  },
  "2": {
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
    description:
      "Available for rental. Book in like-new condition. Return within 1 month.",
    subject: "Database Systems",
    seller: {
      id: "2",
      name: "Priya Roy",
      phone: "+880 1823-456789",
      email: "priya@email.com",
      rating: 4.9,
      totalListings: 8,
    },
  },
  "3": {
    id: "3",
    title: "Engineering Mathematics - Complete Notes",
    author: "Dr. H.K. Dass",
    category: "Study Guide",
    condition: "New",
    listingType: "Sell",
    sellingPrice: 300,
    originalPrice: 500,
    savingsPercent: 40,
    department: "Computer Science & Engineering",
    semester: "1st Semester",
    location: "Dhaka University",
    postedTime: "1d ago",
    description: "Complete study guide with solved problems and notes.",
    subject: "Mathematics",
    seller: {
      id: "3",
      name: "Fatima Khan",
      phone: "+880 1934-567890",
      email: "fatima@email.com",
      rating: 5.0,
      totalListings: 5,
    },
  },
};

export default function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const router = useRouter();
  const { id, locale } = use(params);
  const book = BOOKS[id];
  const [isContactVisible, setIsContactVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">Book Not Found</h2>
          <p className="text-gray-500 text-sm mt-2 mb-6">
            This book listing doesn&apos;t exist
          </p>
          <Link
            href={`/${locale}/books`}
            className="text-red-600 font-semibold"
          >
            ← Back to Books
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-0">
      {/* Header */}
      <div className="bg-white ">
        <div className="max-w-3xl mx-auto pb-4 flex items-center justify-between border-b border-gray-200 mb-6">
          <div className="flex items-center gap-5">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-center text-lg flex-1 font-semibold">
              Book Details
            </h1>
          </div>
          <span
            className={`text-xs px-3 py-1 rounded-full ${book.listingType === "Sell" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}
          >
            {book.listingType === "Sell" ? "For Sale" : "For Rent"}
          </span>
        </div>
      </div>

      {!submitted ? (
        <div className="max-w-3xl mx-auto ">
          <div>
            <div className="border border-gray-100 p-4 rounded-lg">
              {/* Book Cover */}
              <div className="flex items-start gap-3 mb-12">
                <div className="relative h-16 min-w-16 rounded-md bg-red-100 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-red-400 opacity-50" />
                </div>
                <div>
                  <h2 className="text-md md:text-xl font-bold text-gray-900">
                    {book.title}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">by {book.author}</p>
                </div>
              </div>

              {/* Book Info Card */}
              <div className="">
                {/* Price */}
                <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">
                        Selling Price
                      </p>
                      <p className="text-xl md:text-3xl font-bold text-gray-900">
                        ৳{book.sellingPrice || book.rentalPrice}
                      </p>
                    </div>
                    {book.originalPrice && (
                      <div className="text-right">
                        <p className="text-xs text-gray-600 mb-1">
                          Original Price
                        </p>
                        <p className="text-sm md:text-lg line-through text-gray-400">
                          ৳{book.originalPrice}
                        </p>
                      </div>
                    )}
                    {book.listingType === "Rent" && (
                      <div className="text-right text-xs text-gray-600">
                        /month
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="mt-6 bg-gray-100 p-4 rounded-lg">
                  <h3 className=" text-gray-900 mb-2 text-xs md:text-base">
                    Description
                  </h3>
                  <p className="leading-[1.5] text-sm leading-relaxed">
                    {book.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Book Information */}
            <div className="mt-4 border border-gray-100 rounded-xl p-4">
              <h3 className="text-xs md:text-base font-semibold text-gray-900 mb-4">
                Book Information
              </h3>
              <div className="space-y-3 ">
                <div className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-lg">
                  <span className="text-gray-600">
                    <HiOutlineBars3BottomLeft />
                  </span>
                  <div>
                    <p className="text-xs text-gray-600">Subject/Department</p>
                    <p className="font-semibold text-gray-900">
                      {book.subject}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-lg">
                  <span className="text-gray-600">🎓</span>
                  <div>
                    <p className="text-xs text-gray-600">Department</p>
                    <p className="font-semibold text-gray-900">
                      {book.department}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-lg">
                  <span className="text-gray-600">📅</span>
                  <div>
                    <p className="text-xs text-gray-600">Semester</p>
                    <p className="font-semibold text-gray-900">
                      {book.semester}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-lg">
                  <MapPin className="w-4 h-4 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-600">Location</p>
                    <p className="font-semibold text-gray-900">
                      {book.location}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-lg">
                  <span className="text-gray-600">🕒</span>
                  <div>
                    <p className="text-xs text-gray-600">Posted</p>
                    <p className="font-semibold text-gray-900">
                      {book.postedTime}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Seller Information */}
            <div className="mt-6 border border-gray-100 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-4">
                Seller Information
              </h3>
              <div className="flex items-center gap-3 mb-4 bg-gray-100 px-4 py-2 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-red-200 flex items-center justify-center">
                  <span className="text-lg">👤</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {book.seller.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    ⭐ {book.seller.rating} • {book.seller.totalListings}{" "}
                    listings
                  </p>
                </div>
              </div>

              <div className="space-y-2 ">
                <button
                  onClick={() => setIsContactVisible(!isContactVisible)}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-red-100 hover:border-red-300 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <Phone className="w-5 h-5 text-red-600" />
                    <div className="flex flex-col ">
                      <span className="font-semibold text-gray-500">Phone</span>
                      <p className="text-red-600 text-xs md:text-base font-semibold -mt-1">
                        {book.seller.phone}
                      </p>
                    </div>
                  </div>
                  <span className="text-red-600">{`>`}</span>
                </button>

                <button
                  onClick={() => setIsContactVisible(!isContactVisible)}
                  className="w-full flex items-center justify-between p-3 bg-red-100 rounded-lg  hover:border-red-300 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <Mail className="w-5 h-5 text-red-600 text-lg" />
                    <div className="flex flex-col ">
                      <span className=" text-gray-500">Email</span>
                      <p className="text-red-600 font-semibold text-xs md:text-base -mt-1">
                        {book.seller.email}
                      </p>
                    </div>
                  </div>
                  <span className="text-red-600">{`>`}</span>
                </button>
              </div>
            </div>

            {/* Contact Seller Button */}
            <button
              onClick={() => setSubmitted(true)}
              className="w-full mt-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <Phone className="w-5 h-5" />
              Contact Seller
            </button>
          </div>

          <div className="h-6"></div>
        </div>
      ) : (
        /* Success State */
        <div className="max-w-2xl mx-auto p-4 mt-12">
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Contact Details Shared!
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              You can now contact the seller at their phone number or email.
            </p>
            <Link
              href={`/${locale}/books`}
              className="inline-block bg-red-600 text-white rounded-xl px-8 py-3 font-semibold hover:bg-red-700 transition-colors"
            >
              Back to Books
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
