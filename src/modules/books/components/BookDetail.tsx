"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import { Button } from "@/components/ui";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import { ResponsiveCardsGrid } from "@/components/marketplace/ResponsiveCardsGrid";
import { ImageGallery } from "@/components/marketplace/ImageGallery";
import { SectionHeader } from "@/components/marketplace/SectionHeader";
import { addToCartAction } from "@/services/cart";
import { emitCartUpdated } from "@/lib/cartEvents";
import { fetchUserBookById, requestBookBorrowAction } from "@/services/books";
import type { BookListing } from "@/types/book";
import { useBooksList } from "@/modules/books/hooks/useBooksList";
import { useAppState } from "@/contexts/AppStateContext";
import BookListingCard from "./BookListingCard";
import { useTranslations } from "next-intl";

export default function BookDetail() {
  const t = useTranslations("common");
  const router = useRouter();
  const { state, dispatch } = useAppState();
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const [item, setItem] = useState<BookListing | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [cartMsg, setCartMsg] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [borrowMsg, setBorrowMsg] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState("");
  const [borrowNote, setBorrowNote] = useState("");
  const isLoggedIn = state.auth.isAuthenticated;

  const tt = (key: string, fallback: string) =>
    t.has(key) ? t(key) : fallback;

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    void (async () => {
      try {
        const data = await fetchUserBookById(id);
        if (!cancelled) {
          setItem(data);
          setError(data ? null : "Book not found.");
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load book.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const images = item?.photos?.length
    ? item.photos.map((p) => p.url).filter(Boolean)
    : ["/placeholder.jpg"];

  const relatedCategoryId =
    item && typeof item.category === "object" && item.category?._id
      ? item.category._id
      : typeof item?.category === "string"
        ? item.category
        : undefined;

  const universityId = state.university.selected?._id;
  const { items: relatedRaw } = useBooksList({
    universityId,
    debouncedSearch: "",
    pageSize: 8,
    category: relatedCategoryId,
  });
  const related = relatedRaw.filter((x) => x._id !== item?._id).slice(0, 8);

  const stock = Math.max(0, item?.quantity ?? 1);
  const maxQty = stock > 0 ? stock : 1;

  const addCurrentToCart = async () => {
    if (!item) return;
    if (item.type === "Lending") return false;
    const res = await addToCartAction({
      contentId: item._id,
      type: "book",
      quantity,
    });
    if (res.success) {
      emitCartUpdated();
      setCartMsg(tt("bookDetail.addedToCart", "Added to cart."));
      return true;
    }
    setCartMsg(
      res.message ??
        tt("bookDetail.couldNotAddToCart", "Could not add to cart."),
    );
    return false;
  };

  const onAddToCart = () => {
    if (!item || item.type === "Lending") return;
    setCartMsg(null);
    startTransition(async () => {
      await addCurrentToCart();
    });
  };

  const onBuyNow = () => {
    if (!item || item.type === "Lending") return;
    setCartMsg(null);
    startTransition(async () => {
      const ok = await addCurrentToCart();
      if (ok) router.push("/cart");
    });
  };

  const onRequestBorrow = () => {
    if (!item) return;
    if (!isLoggedIn) {
      dispatch({ type: "OPEN_AUTH_MODAL", payload: { defaultTab: "login" } });
      return;
    }
    if (!dueDate) {
      setBorrowMsg(tt("bookDetail.pickDueDate", "Choose a return date."));
      return;
    }
    setBorrowMsg(null);
    const iso = new Date(dueDate).toISOString();
    startTransition(async () => {
      const res = await requestBookBorrowAction({
        bookId: item._id,
        requestedDueDate: iso,
        requestMessage: borrowNote.trim() || undefined,
        securityDeposit: 0,
      });
      if (res.success) {
        setBorrowMsg(
          tt("bookDetail.borrowRequestSent", "Borrow request sent."),
        );
      } else {
        setBorrowMsg(
          res.message ??
            tt("bookDetail.borrowFailed", "Could not send request."),
        );
      }
    });
  };

  if (!id) {
    return (
      <ContentWrapper maxWidth="max-w-7xl mx-auto" padding="lg">
        <p className="text-sm text-gray-600">
          {tt("bookDetail.invalid", "Invalid book.")}
        </p>
      </ContentWrapper>
    );
  }

  if (error && !item) {
    return (
      <ContentWrapper maxWidth="max-w-7xl mx-auto" padding="lg">
        <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
        <Link
          href="/books"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#00A651]"
        >
          <ArrowLeft className="h-4 w-4" />
          {tt("bookDetail.backToBooks", "Back to books")}
        </Link>
      </ContentWrapper>
    );
  }

  if (!item) {
    return (
      <ContentWrapper maxWidth="max-w-7xl mx-auto" padding="lg">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-2/3 rounded-lg bg-gray-100" />
          <div className="aspect-[4/3] w-full max-w-xl rounded-2xl bg-gray-100" />
        </div>
      </ContentWrapper>
    );
  }

  const categoryLabel =
    typeof item.category === "object" && item.category?.title
      ? item.category.title
      : tt("bookDetail.campusBooks", "Campus books");
  const sellerName = item.contactName || tt("bookDetail.seller", "Seller");
  const description =
    item.description ||
    tt(
      "bookDetail.defaultDescription",
      "Campus textbook listing. Contact the seller for pickup or details.",
    );
  const quality = item.quality || "—";
  const deptLabel =
    typeof item.department === "object" && item.department?.name
      ? item.department.name
      : typeof item.department === "string"
        ? item.department
        : "—";

  const badge = (() => {
    const type = item.type;
    if (type === "Lending")
      return { label: "Lending", color: "bg-sky-50 text-sky-800" };
    if (type === "Donation")
      return { label: "Donation", color: "bg-violet-50 text-violet-800" };
    return { label: "Selling", color: "bg-emerald-50 text-emerald-800" };
  })();

  return (
    <ContentWrapper maxWidth="max-w-7xl mx-auto" padding="md">
      <AppBreadcrumb
        items={[
          { label: tt("bookDetail.home", "Home"), href: "/" },
          { label: tt("bookDetail.books", "Books"), href: "/books" },
          { label: item.title },
        ]}
      />

      <SectionWrapper
        spacing="sm"
        background="white"
        className="mt-6 rounded-2xl border border-gray-100 p-4 md:p-6"
      >
        <div className="grid gap-8 lg:grid-cols-2">
          <ImageGallery title={item.title} images={images} />
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <span
                className={`w-fit rounded-md px-2 py-1 text-xs font-semibold ${badge.color}`}
              >
                {badge.label}
              </span>
              <span className="w-fit rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800">
                {categoryLabel}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
              {item.title}
            </h1>
            {item.author && (
              <p className="text-sm text-gray-600">{item.author}</p>
            )}
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <div className="flex flex-wrap items-baseline gap-3">
                {item.type === "Donation" || item.price === 0 ? (
                  <span className="text-3xl font-bold text-[#00A651]">
                    Free
                  </span>
                ) : (
                  <>
                    <span className="text-3xl font-bold text-[#00A651]">
                      ৳
                      {(item.discountPrice != null &&
                      item.discountPrice < item.price
                        ? item.discountPrice
                        : item.price
                      ).toLocaleString()}
                    </span>
                    {item.discountPrice != null &&
                      item.discountPrice < item.price && (
                        <span className="text-lg text-gray-400 line-through">
                          ৳{item.price.toLocaleString()}
                        </span>
                      )}
                  </>
                )}
                <span className="text-sm text-gray-500">{quality}</span>
              </div>
              {item.type === "Lending" && (
                <p className="mt-2 text-sm text-gray-600">
                  {item.borrowDuration != null && (
                    <span>Borrow up to {item.borrowDuration} days. </span>
                  )}
                  {item.allowsExtension && (
                    <span>
                      Extensions allowed
                      {item.maxExtensionDuration != null
                        ? ` (max +${item.maxExtensionDuration}d)`
                        : ""}
                      .
                    </span>
                  )}
                </p>
              )}
            </div>

            <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-700">
              <p className="font-medium text-gray-900">
                {tt("bookDetail.contact", "Contact")}
              </p>
              <p>{sellerName}</p>
              {item.contactPhone && <p>{item.contactPhone}</p>}
              {item.contactEmail && <p>{item.contactEmail}</p>}
            </div>

            {item.type === "Lending" ? (
              <div className="space-y-3 rounded-xl border border-sky-100 bg-sky-50/50 p-4">
                <p className="text-sm font-semibold text-gray-900">
                  {tt("bookDetail.requestBorrow", "Request to borrow")}
                </p>
                <label className="block text-xs font-medium text-gray-600">
                  {tt("bookDetail.returnBy", "Preferred return date")}
                  <input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                </label>
                <label className="block text-xs font-medium text-gray-600">
                  {tt("bookDetail.message", "Message (optional)")}
                  <textarea
                    value={borrowNote}
                    onChange={(e) => setBorrowNote(e.target.value)}
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                </label>
                <Button
                  type="button"
                  uppercase={false}
                  onClick={onRequestBorrow}
                  disabled={isPending}
                >
                  {isPending
                    ? tt("bookDetail.sending", "Sending…")
                    : tt("bookDetail.sendBorrowRequest", "Send borrow request")}
                </Button>
                {borrowMsg && (
                  <p className="text-sm text-gray-700">{borrowMsg}</p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="rounded border border-gray-300 px-2.5 py-1 text-sm"
                    >
                      -
                    </button>
                    <span className="min-w-6 text-center text-sm font-semibold">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((q) => Math.min(maxQty, q + 1))
                      }
                      className="rounded border border-gray-300 px-2.5 py-1 text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex flex-1 flex-wrap gap-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    uppercase={false}
                    className="gap-2"
                    onClick={onAddToCart}
                    disabled={isPending || stock < 1}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {isPending
                      ? tt("bookDetail.adding", "Adding…")
                      : stock < 1
                        ? tt("bookDetail.outOfStock", "Out of stock")
                        : tt("bookDetail.addToCart", "Add to cart")}
                  </Button>
                  <Button
                    type="button"
                    uppercase={false}
                    className="gap-2"
                    onClick={onBuyNow}
                    disabled={isPending || stock < 1}
                  >
                    {isPending
                      ? tt("bookDetail.processing", "Processing…")
                      : tt("bookDetail.buyNow", "Buy now")}
                  </Button>
                </div>
              </div>
            )}
            {cartMsg && (
              <p className="text-sm text-gray-600" role="status">
                {cartMsg}
              </p>
            )}
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper spacing="sm" background="transparent" className="mt-6">
        <details
          open
          className="rounded-xl border border-gray-100 bg-white p-4"
        >
          <summary className="cursor-pointer list-none font-semibold text-gray-900">
            {tt("bookDetail.description", "Description")}
          </summary>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
            {description}
          </p>
        </details>
        <details className="mt-3 rounded-xl border border-gray-100 bg-white p-4">
          <summary className="cursor-pointer list-none font-semibold text-gray-900">
            {tt("bookDetail.details", "Details")}
          </summary>
          <div className="mt-3 grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
            <p>
              <span className="text-gray-500">
                {tt("bookDetail.subject", "Subject")}:
              </span>{" "}
              {item.subject || "—"}
            </p>
            <p>
              <span className="text-gray-500">
                {tt("bookDetail.edition", "Edition")}:
              </span>{" "}
              {item.edition || "—"}
            </p>
            <p>
              <span className="text-gray-500">
                {tt("bookDetail.publisher", "Publisher")}:
              </span>{" "}
              {item.publisher || "—"}
            </p>
            <p>
              <span className="text-gray-500">
                {tt("bookDetail.buyingYear", "Year")}:
              </span>{" "}
              {item.buyingYear || "—"}
            </p>
            <p>
              <span className="text-gray-500">
                {tt("bookDetail.department", "Department")}:
              </span>{" "}
              {deptLabel}
            </p>
          </div>
        </details>
      </SectionWrapper>

      <SectionWrapper spacing="sm" background="transparent" className="mt-6">
        <SectionHeader
          title={tt("bookDetail.related", "Related books")}
          subtitle={tt("bookDetail.relatedSub", "More you may like.")}
          viewAllHref={
            relatedCategoryId
              ? `/books/all?category=${encodeURIComponent(relatedCategoryId)}`
              : "/books/all"
          }
        />
        {related.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
            {tt("bookDetail.noRelated", "No related books yet.")}
          </p>
        ) : (
          <div className="mt-4">
            <ResponsiveCardsGrid>
              {related.map((r) => (
                <BookListingCard key={r._id} item={r} />
              ))}
            </ResponsiveCardsGrid>
          </div>
        )}
      </SectionWrapper>
    </ContentWrapper>
  );
}
