"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  addBookToCartAction,
  getBookByIdAction,
  requestBookBorrowAction,
  type BookListItem,
} from "../actions";

export default function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const router = useRouter();
  const { id, locale } = use(params);
  const [book, setBook] = useState<BookListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const result = await getBookByIdAction(id);
      if (!mounted) return;
      if (!result.success || !result.data) {
        setError(result.message ?? "Book not found");
      } else {
        setBook(result.data);
      }
      setLoading(false);
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">Loading book details...</div>;
  }

  if (!book || error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">Book Not Found</h2>
          <p className="text-gray-500 text-sm mt-2 mb-6">{error ?? "This book listing doesn&apos;t exist."}</p>
          <Link href={`/${locale}/books`} className="text-red-600 font-semibold">
            ← Back to Books
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-0">
      <div className="bg-white ">
        <div className="max-w-3xl mx-auto pb-4 flex items-center justify-between border-b border-gray-200 mb-6">
          <div className="flex items-center gap-5">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-center text-lg flex-1 font-semibold">Book Details</h1>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-700">{book.type ?? "Selling"}</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="border border-gray-100 p-4 rounded-lg">
          <div className="flex items-start gap-3 mb-8">
            <div className="relative h-16 min-w-16 rounded-md bg-red-100 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-red-400 opacity-50" />
            </div>
            <div>
              <h2 className="text-md md:text-xl font-bold text-gray-900">{book.title}</h2>
              <p className="text-gray-500 text-sm mt-1">by {book.author ?? "Unknown author"}</p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-300">
            <p className="text-xs text-gray-600 mb-1">Price</p>
            <p className="text-xl md:text-3xl font-bold text-gray-900">৳{book.discountPrice ?? book.price ?? 0}</p>
          </div>

          <div className="mt-4 bg-gray-100 p-4 rounded-lg">
            <h3 className="text-gray-900 mb-2 text-xs md:text-base">Description</h3>
            <p className="leading-[1.5] text-sm">{book.description ?? "No description provided."}</p>
          </div>
        </div>

        <div className="mt-4 border border-gray-100 rounded-xl p-4">
          <h3 className="text-xs md:text-base font-semibold text-gray-900 mb-4">Seller Information</h3>
          <p className="text-sm text-gray-700">{book.contactName ?? book.owner?.name ?? "Unknown seller"}</p>
          <p className="text-sm text-red-600">{book.contactPhone ?? "No phone number"}</p>
        </div>

        {feedback ? <div className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-700">{feedback}</div> : null}

        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
          {book.type !== "Lending" ? (
            <button
              onClick={async () => {
                const response = await addBookToCartAction(book._id, 1);
                setFeedback(response.success ? "Added to cart successfully." : response.message ?? "Failed to add item.");
              }}
              className="py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Add To Cart
            </button>
          ) : (
            <button
              onClick={async () => {
                try {
                  await requestBookBorrowAction({
                    bookId: book._id,
                    requestedDueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                    requestMessage: "I want to borrow this book.",
                    securityDeposit: 0,
                  });
                  setFeedback("Borrow request submitted.");
                } catch (e) {
                  setFeedback(e instanceof Error ? e.message : "Borrow request failed.");
                }
              }}
              className="py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Request Borrow
            </button>
          )}

          <Link href={`/${locale}/cart`} className="py-3 border border-gray-200 rounded-xl font-semibold text-center hover:bg-gray-50">
            Go To Cart
          </Link>
        </div>
      </div>
    </div>
  );
}
