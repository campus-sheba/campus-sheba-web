"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, ShoppingCart } from "lucide-react";
import { Link } from "@/i18n/navigation";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import { Button } from "@/components/ui";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import { ImageGallery } from "@/components/marketplace/ImageGallery";
import { SectionHeader } from "@/components/marketplace/SectionHeader";
import { addToCartAction } from "@/services/cart";
import { emitCartUpdated } from "@/lib/cartEvents";
import { fetchUserBookById } from "@/services/book";
import type { BookListing } from "@/types/book";
import { useBookList } from "@/modules/book/hooks/useBookList";
import { useAppState } from "@/contexts/AppStateContext";
import BookListingCard from "./BookListingCard";

export default function BookDetail() {
  const { state } = useAppState();
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const [item, setItem] = useState<BookListing | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [cartMsg, setCartMsg] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    void (async () => {
      try {
        const data = await fetchUserBookById(id);
        if (!cancelled) {
          setItem(data);
          setError(data ? null : "Listing not found.");
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load listing.");
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
  const { items: relatedRaw } = useBookList({
    universityId,
    debouncedSearch: "",
    pageSize: 8,
    category: relatedCategoryId,
  });
  const related = relatedRaw.filter((x) => x._id !== item?._id).slice(0, 8);

  const onAddToCart = () => {
    if (!item) return;
    setCartMsg(null);
    startTransition(async () => {
      const res = await addToCartAction({
        contentId: item._id,
        type: "Book",
        quantity,
      });
      if (res.success) {
        emitCartUpdated();
        setCartMsg("Added to cart.");
      } else {
        setCartMsg(res.message ?? "Could not add to cart.");
      }
    });
  };

  if (!id) {
    return (
      <ContentWrapper maxWidth="max-w-7xl mx-auto" padding="lg">
        <p className="text-sm text-gray-600">Invalid listing.</p>
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
          Back to Books
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
      : "Campus Marketplace";
  const sellerName = item.contactName || "Verified campus seller";
  const sellerPhone = item.contactPhone || "+880 1XXX-XXXXXX";
  const sellerEmail = item.contactEmail || "seller@campus.example";
  const description =
    item.description ||
    "Good condition book from a trusted campus seller. Contact seller for pickup details.";
  const condition = item.condition || "Used - Good";
  const stock = Math.max(0, item.quantity ?? 1);
  const warranty = "No official warranty";
  const returns = "No returns after handover";
  const delivery = "Campus pickup / local delivery";
  const postedOn = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString()
    : "Recently";
  const rating = "4.8";
  const reviews = "32";

  return (
    <ContentWrapper maxWidth="max-w-7xl mx-auto" padding="md">
      <AppBreadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Books", href: "/books" },
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
            <span className="w-fit rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800">
              {categoryLabel}
            </span>
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
              {item.title}
            </h1>
            {(item.brand || item.modelName) && (
              <p className="text-sm text-gray-600">
                {[item.brand, item.modelName].filter(Boolean).join(" · ")}
              </p>
            )}
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-3xl font-bold text-[#00A651]">
                  ৳{item.price.toLocaleString()}
                </span>
                {item.negotiable && (
                  <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                    Negotiable
                  </span>
                )}
                <span className="text-sm text-gray-500">{condition}</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Posted {postedOn} · {rating} ({reviews} reviews)
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-700">
                Stock: {stock}
              </span>
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-700">
                Warranty: {warranty}
              </span>
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-700">
                Delivery: {delivery}
              </span>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-700">
              <p className="font-medium text-gray-900">Seller</p>
              <p>{sellerName}</p>
              <p>{sellerPhone}</p>
              <p>{sellerEmail}</p>
            </div>

            <div className="flex items-center gap-4">
              <div>
                {/* <p className="mb-1 text-xs font-semibold text-gray-500">
                  Quantity
                </p> */}
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
                      setQuantity((q) => Math.min(stock || 1, q + 1))
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
                    ? "Adding…"
                    : stock < 1
                      ? "Out of stock"
                      : "Add to cart"}
                </Button>
              </div>
            </div>
            {cartMsg && (
              <p className="text-sm text-gray-600" role="status">
                {cartMsg}
              </p>
            )}
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper spacing="sm" background="transparent" className="mt-6">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-3">
            <details
              open
              className="rounded-xl border border-gray-100 bg-white p-4"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-gray-900">
                Description
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </summary>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                {description}
              </p>
            </details>

            <details className="rounded-xl border border-gray-100 bg-white p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-gray-900">
                Book details
                <ChevronUp className="h-4 w-4 text-gray-500" />
              </summary>
              <div className="mt-3 grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
                <p>
                  <span className="text-gray-500">Author:</span>{" "}
                  {item.brand || "Generic"}
                </p>
                <p>
                  <span className="text-gray-500">Edition:</span>{" "}
                  {item.modelName || "Standard model"}
                </p>
                <p>
                  <span className="text-gray-500">Condition:</span> {condition}
                </p>
                <p>
                  <span className="text-gray-500">Quantity available:</span>{" "}
                  {stock}
                </p>
                <p>
                  <span className="text-gray-500">Return policy:</span>{" "}
                  {returns}
                </p>
                <p>
                  <span className="text-gray-500">Delivery type:</span>{" "}
                  {delivery}
                </p>
              </div>
            </details>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border border-gray-100 bg-white p-4">
              <h3 className="text-sm font-semibold text-gray-900">
                Why get books here?
              </h3>
              <div className="mt-3 space-y-2 text-sm text-gray-600">
                <p className="rounded bg-gray-50 px-3 py-2">
                  100% campus community listing
                </p>
                <p className="rounded bg-gray-50 px-3 py-2">
                  Safe meetup & verified accounts
                </p>
                <p className="rounded bg-gray-50 px-3 py-2">
                  Fast buyer-seller communication
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-4">
              <h3 className="text-sm font-semibold text-gray-900">
                Quick FAQs
              </h3>
              <div className="mt-3 space-y-2 text-xs text-gray-600">
                <p className="rounded bg-gray-50 px-3 py-2">
                  Can I negotiate? {item.negotiable ? "Yes" : "No"}
                </p>
                <p className="rounded bg-gray-50 px-3 py-2">
                  Is inspection possible? Yes, before payment.
                </p>
                <p className="rounded bg-gray-50 px-3 py-2">
                  Payment method: Cash / agreed transfer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper spacing="sm" background="transparent" className="mt-6">
        <SectionHeader
          title="Related items"
          subtitle="More listings you may like."
          viewAllHref={
            relatedCategoryId
              ? `/books/all?category=${encodeURIComponent(relatedCategoryId)}`
              : "/books/all"
          }
        />
        {related.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
            No related items found yet.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (
              <BookListingCard key={r._id} item={r} />
            ))}
          </div>
        )}
      </SectionWrapper>
    </ContentWrapper>
  );
}
