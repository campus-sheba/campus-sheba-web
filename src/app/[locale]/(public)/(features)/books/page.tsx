"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, BookOpen } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { getBooksAction, type BookListItem } from "./actions";
import { useAppState } from "@/contexts/AppStateContext";

export default function BooksPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { state } = useAppState();
  const selectedUniversityId = state.university.selected?._id;

  const [books, setBooks] = useState<BookListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"All" | "Selling" | "Lending" | "Donation">("All");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const result = await getBooksAction({
        page: 1,
        limit: 50,
        ...(selectedUniversityId ? { university: selectedUniversityId } : {}),
      });
      if (!mounted) return;
      if (!result.success) {
        setError(result.message ?? "Failed to load books");
      } else {
        setBooks(result.data.data);
        setError(null);
      }
      setLoading(false);
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [selectedUniversityId]);

  const filtered = useMemo(() => {
    return books.filter((b) => {
      const title = b.title?.toLowerCase() ?? "";
      const author = b.author?.toLowerCase() ?? "";
      const matchesSearch = title.includes(search.toLowerCase()) || author.includes(search.toLowerCase());
      const matchesType = filterType === "All" || b.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [books, filterType, search]);

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
          <div className="flex-1">
            <h1 className="font-semibold text-lg text-gray-900">
              Books Exchange
            </h1>
            <p className="text-xs text-gray-500">Buy, Sell, Donate & Borrow</p>
          </div>
          <div className="w-8"></div>
        </div>

        <div className="mt-2 text-xs text-gray-500">{books.length} listings available</div>
      </div>

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

          <div className="bg-white space-y-3">
            <div className="flex gap-2 overflow-x-auto">
              {(["All", "Selling", "Lending", "Donation"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`py-2 rounded-full text-sm font-medium flex-1 transition-colors mb-6 ${
                    filterType === type
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {type === "All" ? "All" : type}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-gray-500 text-sm">Loading books...</div>
          ) : error ? (
            <div className="py-16 text-center text-red-500 text-sm">{error}</div>
          ) : (
          <div className="space-y-3 mt-8">
            {filtered.map((book) => (
              <Link
                key={book._id}
                href={`/${locale}/books/${book._id}`}
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
                    by {book.author ?? "Unknown author"}
                  </p>

                  {/* Status Badge */}
                  <div className="flex gap-2 mt-2">
                    <span className="text-[9px] md:text-sm px-2 py-1 rounded bg-red-100 text-red-600">
                      {book.quality ?? "N/A"}
                    </span>
                    <span className="text-[9px] md:text-sm px-2 py-1 rounded bg-blue-100 text-blue-700">
                      {book.type ?? "Selling"}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="mt-2 space-y-0.5 flex gap-3 justify-between md:gap-6 md:justify-normal">
                    <p className="text-xs text-gray-500">{book.category?.title ?? "General"}</p>
                    <p className="text-xs text-gray-400">
                      {book.createdAt ? new Date(book.createdAt).toLocaleDateString() : ""}
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div className="text-right flex flex-col justify-between">
                  <div>
                    <p className="font-bold text-sm md:text-base text-gray-900">
                      ৳{book.discountPrice ?? book.price ?? 0}
                    </p>
                    {book.price && book.discountPrice && book.discountPrice < book.price && (
                      <p className="text-xs md:text-sm text-gray-400 line-through">
                        ৳{book.price}
                      </p>
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
          )}

          {/* List Your Book FAB */}
          <div className="fixed bottom-6 right-6">
            <Link
              href={`/${locale}/books/list`}
              className="bg-red-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-red-700 font-bold text-xl"
            >
              +
            </Link>
          </div>
      </>
    </div>
  );
}
