"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, ShoppingCart } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import { Button } from "@/components/ui";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import { ResponsiveCardsGrid } from "@/components/marketplace/ResponsiveCardsGrid";
import { ImageGallery } from "@/components/marketplace/ImageGallery";
import { SectionHeader } from "@/components/marketplace/SectionHeader";
import { addToCartAction } from "@/services/cart";
import { emitCartUpdated } from "@/lib/cartEvents";
import { fetchUserBuySellById } from "@/services/buy-sell";
import type { BuySellListing } from "@/types/buy-sell";
import { useBuySellList } from "@/modules/buy-sell/hooks/useBuySellList";
import { useAppState } from "@/contexts/AppStateContext";
import BuySellListingCard from "./BuySellListingCard";
import { useTranslations } from "next-intl";

export default function BuySellDetail() {
  const t = useTranslations("common");
  const router = useRouter();
  const { state } = useAppState();
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const [item, setItem] = useState<BuySellListing | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [cartMsg, setCartMsg] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    void (async () => {
      try {
        const data = await fetchUserBuySellById(id);
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
  const { items: relatedRaw } = useBuySellList({
    universityId,
    debouncedSearch: "",
    pageSize: 8,
    category: relatedCategoryId,
  });
  const related = relatedRaw.filter((x) => x._id !== item?._id).slice(0, 8);

  const tt = (key: string, fallback: string) =>
    t.has(key) ? t(key) : fallback;

  const addCurrentToCart = async () => {
    if (!item) return;
    const res = await addToCartAction({
      contentId: item._id,
      type: "buy_sell",
      quantity,
    });
    if (res.success) {
      emitCartUpdated();
      setCartMsg(tt("buySellDetail.addedToCart", "Added to cart."));
      return true;
    }
    setCartMsg(
      res.message ??
        tt("buySellDetail.couldNotAddToCart", "Could not add to cart."),
    );
    return false;
  };

  const onAddToCart = () => {
    if (!item) return;
    setCartMsg(null);
    startTransition(async () => {
      await addCurrentToCart();
    });
  };

  const onBuyNow = () => {
    if (!item) return;
    setCartMsg(null);
    startTransition(async () => {
      const ok = await addCurrentToCart();
      if (ok) router.push("/cart");
    });
  };

  if (!id) {
    return (
      <ContentWrapper maxWidth="max-w-7xl mx-auto" padding="lg">
        <p className="text-sm text-gray-600">
          {tt("buySellDetail.invalidListing", "Invalid listing.")}
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
          href="/buy-sell"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#00A651]"
        >
          <ArrowLeft className="h-4 w-4" />
          {tt("buySellDetail.backToBuySell", "Back to Buy & Sell")}
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
      : tt("buySellDetail.campusMarketplace", "Campus Marketplace");
  const sellerName =
    item.contactName ||
    tt("buySellDetail.verifiedCampusSeller", "Verified campus seller");
  const sellerPhone = item.contactPhone || "+880 1XXX-XXXXXX";
  const sellerEmail = item.contactEmail || "seller@campus.example";
  const description =
    item.description ||
    tt(
      "buySellDetail.defaultDescription",
      "Good condition item from a trusted campus seller. Contact seller for inspection or pickup details.",
    );
  const condition =
    item.condition || tt("buySellDetail.usedGood", "Used - Good");
  const stock = Math.max(0, item.quantity ?? 1);
  const warranty = tt(
    "buySellDetail.noOfficialWarranty",
    "No official warranty",
  );
  const returns = tt(
    "buySellDetail.noReturnsAfterHandover",
    "No returns after handover",
  );
  const delivery = tt(
    "buySellDetail.campusPickupLocalDelivery",
    "Campus pickup / local delivery",
  );
  const postedOn = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString()
    : tt("buySellDetail.recently", "Recently");
  const rating = "4.8";
  const reviews = "32";

  return (
    <ContentWrapper maxWidth="max-w-7xl mx-auto" padding="md">
      <AppBreadcrumb
        items={[
          { label: tt("buySellDetail.home", "Home"), href: "/" },
          {
            label: tt("buySellDetail.buySell", "Buy & Sell"),
            href: "/buy-sell",
          },
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
                {tt("buySellDetail.posted", "Posted")} {postedOn} · {rating} (
                {reviews} {tt("buySellDetail.reviews", "reviews")})
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-700">
                {tt("buySellDetail.stock", "Stock")}: {stock}
              </span>
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-700">
                {tt("buySellDetail.warranty", "Warranty")}: {warranty}
              </span>
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-700">
                {tt("buySellDetail.delivery", "Delivery")}: {delivery}
              </span>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-700">
              <p className="font-medium text-gray-900">
                {tt("buySellDetail.seller", "Seller")}
              </p>
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
                    ? tt("buySellDetail.adding", "Adding…")
                    : stock < 1
                      ? tt("buySellDetail.outOfStock", "Out of stock")
                      : tt("buySellDetail.addToCart", "Add to cart")}
                </Button>
                <Button
                  type="button"
                  uppercase={false}
                  className="gap-2"
                  onClick={onBuyNow}
                  disabled={isPending || stock < 1}
                >
                  {isPending
                    ? tt("buySellDetail.processing", "Processing…")
                    : stock < 1
                      ? tt("buySellDetail.outOfStock", "Out of stock")
                      : tt("buySellDetail.buyNow", "Buy now")}
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
                {tt("buySellDetail.description", "Description")}
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </summary>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                {description}
              </p>
            </details>

            <details className="rounded-xl border border-gray-100 bg-white p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-gray-900">
                {tt("buySellDetail.productDetails", "Product details")}
                <ChevronUp className="h-4 w-4 text-gray-500" />
              </summary>
              <div className="mt-3 grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
                <p>
                  <span className="text-gray-500">
                    {tt("buySellDetail.brand", "Brand")}:
                  </span>{" "}
                  {item.brand || tt("buySellDetail.generic", "Generic")}
                </p>
                <p>
                  <span className="text-gray-500">
                    {tt("buySellDetail.model", "Model")}:
                  </span>{" "}
                  {item.modelName ||
                    tt("buySellDetail.standardModel", "Standard model")}
                </p>
                <p>
                  <span className="text-gray-500">
                    {tt("buySellDetail.condition", "Condition")}:
                  </span>{" "}
                  {condition}
                </p>
                <p>
                  <span className="text-gray-500">
                    {tt(
                      "buySellDetail.quantityAvailable",
                      "Quantity available",
                    )}
                    :
                  </span>{" "}
                  {stock}
                </p>
                <p>
                  <span className="text-gray-500">
                    {tt("buySellDetail.returnPolicy", "Return policy")}:
                  </span>{" "}
                  {returns}
                </p>
                <p>
                  <span className="text-gray-500">
                    {tt("buySellDetail.deliveryType", "Delivery type")}:
                  </span>{" "}
                  {delivery}
                </p>
              </div>
            </details>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border border-gray-100 bg-white p-4">
              <h3 className="text-sm font-semibold text-gray-900">
                {tt("buySellDetail.whyBuyHere", "Why buy here?")}
              </h3>
              <div className="mt-3 space-y-2 text-sm text-gray-600">
                <p className="rounded bg-gray-50 px-3 py-2">
                  {tt("buySellDetail.why1", "100% campus community listing")}
                </p>
                <p className="rounded bg-gray-50 px-3 py-2">
                  {tt("buySellDetail.why2", "Safe meetup & verified accounts")}
                </p>
                <p className="rounded bg-gray-50 px-3 py-2">
                  {tt("buySellDetail.why3", "Fast buyer-seller communication")}
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-4">
              <h3 className="text-sm font-semibold text-gray-900">
                {tt("buySellDetail.quickFaqs", "Quick FAQs")}
              </h3>
              <div className="mt-3 space-y-2 text-xs text-gray-600">
                <p className="rounded bg-gray-50 px-3 py-2">
                  {tt("buySellDetail.canINegotiate", "Can I negotiate?")}{" "}
                  {item.negotiable
                    ? tt("buySellDetail.yes", "Yes")
                    : tt("buySellDetail.no", "No")}
                </p>
                <p className="rounded bg-gray-50 px-3 py-2">
                  {tt(
                    "buySellDetail.inspectionPossible",
                    "Is inspection possible? Yes, before payment.",
                  )}
                </p>
                <p className="rounded bg-gray-50 px-3 py-2">
                  {tt(
                    "buySellDetail.paymentMethod",
                    "Payment method: Cash / agreed transfer.",
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper spacing="sm" background="transparent" className="mt-6">
        <SectionHeader
          title={tt("buySellDetail.relatedItems", "Related items")}
          subtitle={tt(
            "buySellDetail.relatedItemsSub",
            "More listings you may like.",
          )}
          viewAllHref={
            relatedCategoryId
              ? `/buy-sell/all?category=${encodeURIComponent(relatedCategoryId)}`
              : "/buy-sell/all"
          }
        />
        {related.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
            {tt("buySellDetail.noRelatedItems", "No related items found yet.")}
          </p>
        ) : (
          <div className="mt-4">
            <ResponsiveCardsGrid>
              {related.map((r) => (
                <BuySellListingCard key={r._id} item={r} />
              ))}
            </ResponsiveCardsGrid>
          </div>
        )}
      </SectionWrapper>
    </ContentWrapper>
  );
}
