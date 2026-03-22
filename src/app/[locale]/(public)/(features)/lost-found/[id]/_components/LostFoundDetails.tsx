/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import Link from "next/link";
import { Tag, Upload, Wallet } from "lucide-react";
import { FaMap, FaClock, FaPhone } from "react-icons/fa6";
import { useAppState } from "@/contexts/AppStateContext";
import { uploadMediaFiles } from "@/lib/media/client";
import { MediaFeatureName } from "@/types/media";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import {
  getLostFoundCategoriesAction,
  getLostFoundItemByIdAction,
  sendResolveRequestAction,
  type LostFoundCategory,
  type LostFoundItem,
} from "../../actions";

type Params = { id: string; locale: string };

const formatRelativeTime = (isoDate?: string) => {
  if (!isoDate) return "Recently";

  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return "Recently";

  const diffMs = Date.now() - parsed.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
};

const formatDateTime = (date?: string, time?: string) => {
  if (!date && !time) return "Not provided";

  const parsed = date ? new Date(date) : null;
  const dateLabel = parsed && !Number.isNaN(parsed.getTime())
    ? parsed.toLocaleDateString()
    : "";

  if (dateLabel && time) return `${dateLabel}, ${time}`;
  return dateLabel || time || "Not provided";
};

const getLocationLabel = (item?: LostFoundItem | null) =>
  item?.location?.map((location) => location.name).filter(Boolean).join(", ") ||
  "Location not provided";

const getItemTitle = (item?: LostFoundItem | null) =>
  item?.title || item?.items?.[0]?.name || "Untitled item";

const getImageUrl = (item?: LostFoundItem | null) =>
  item?.image?.[0]?.url || item?.items?.[0]?.images?.[0]?.url;

const getCategoryLabel = (
  item: LostFoundItem | null,
  categories: LostFoundCategory[],
) => {
  if (!item) return "Uncategorized";

  const nestedCategory = item.items?.[0]?.category;
  if (typeof nestedCategory === "object" && nestedCategory?.title) {
    return nestedCategory.title;
  }

  const categoryId =
    typeof nestedCategory === "object" && nestedCategory?._id
      ? nestedCategory._id
      : (nestedCategory as string | undefined) || item.category;

  if (!categoryId) return "Uncategorized";

  const matched = categories.find((category) => category._id === categoryId);
  return matched?.title || "Uncategorized";
};

export default function LostFoundDetailsPage(props: {
  params: Params | Promise<Params>;
}) {
  const { state, dispatch } = useAppState();
  const { params } = props;
  const actualParams =
    typeof (params as any)?.then === "function"
      ? React.use(params as Promise<Params>)
      : (params as Params);
  const [item, setItem] = React.useState<LostFoundItem | null>(null);
  const [categories, setCategories] = React.useState<LostFoundCategory[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [isResolveModalOpen, setIsResolveModalOpen] = React.useState(false);
  const [resolveMessage, setResolveMessage] = React.useState("");
  const [resolveFiles, setResolveFiles] = React.useState<File[]>([]);
  const [resolveFeedback, setResolveFeedback] = React.useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSubmittingResolveRequest, setIsSubmittingResolveRequest] = React.useState(false);

  React.useEffect(() => {
    let active = true;

    const loadItem = async () => {
      setIsLoading(true);
      setErrorMessage("");

      const [itemResult, categoryResult] = await Promise.all([
        getLostFoundItemByIdAction(actualParams.id),
        getLostFoundCategoriesAction(),
      ]);

      if (!active) return;

      if (categoryResult.success) {
        setCategories(categoryResult.categories);
      }

      if (itemResult.success && itemResult.item) {
        setItem(itemResult.item);
      } else {
        setItem(null);
        setErrorMessage(itemResult.message || "Item not found");
      }

      setIsLoading(false);
    };

    loadItem();

    return () => {
      active = false;
    };
  }, [actualParams.id]);

  const isLost = item?.type?.toLowerCase() === "lost";
  const isAuthenticated = state.auth.isAuthenticated;
  const imageUrl = getImageUrl(item) || undefined;
  const itemTitle = getItemTitle(item);

  const resolveStatus =
    item?.myResolveRequest?.status ||
    item?.resolveRequest?.status ||
    item?.deliveryRequest?.status ||
    null;

  const isResolveAccepted =
    typeof resolveStatus === "string" &&
    ["accepted", "approved", "resolved"].includes(resolveStatus.toLowerCase());

  const handleOpenResolveModal = () => {
    setResolveFeedback(null);

    if (!isAuthenticated) {
      dispatch({ type: "OPEN_AUTH_MODAL", payload: { defaultTab: "login" } });
      return;
    }

    setIsResolveModalOpen(true);
  };

  const handleSubmitResolveRequest = async () => {
    if (!item) return;

    setIsSubmittingResolveRequest(true);
    setResolveFeedback(null);

    const uploadResult = await uploadMediaFiles(
      resolveFiles,
      MediaFeatureName.LOST_AND_FOUND,
    );

    if (!uploadResult.success) {
      setResolveFeedback({
        type: "error",
        text: uploadResult.message || "Failed to upload proof image",
      });
      setIsSubmittingResolveRequest(false);
      return;
    }

    const result = await sendResolveRequestAction({
      postId: item._id,
      message: resolveMessage,
      images: uploadResult.urls,
    });

    if (!result.success) {
      setResolveFeedback({ type: "error", text: result.message || "Failed to send request" });
      setIsSubmittingResolveRequest(false);
      return;
    }

    setResolveFeedback({ type: "success", text: result.message });
    setIsSubmittingResolveRequest(false);
    setResolveMessage("");
    setResolveFiles([]);

    setTimeout(() => {
      setIsResolveModalOpen(false);
    }, 900);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading item details...</p>
      </div>
    );
  }

  if (!item || errorMessage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-5xl mb-4">🔍</p>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
            Item not found
          </h1>
          <p className="text-sm md:text-base text-gray-500 mb-6">
            {errorMessage || "The lost &amp; found item you are looking for does not exist."}
          </p>
          <Link
            href={`/${actualParams.locale}/lost-found`}
            className="text-blue-600 font-medium"
          >
            Back to Lost &amp; Found
          </Link>
        </div>
      </div>
    );
  }
  // href={`/${actualParams.locale}/lost-found`}
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="cs-container mx-auto pt-5 md:pt-8">
        <AppBreadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Lost & Found", href: `/lost-found` },
            { label: "Item Details" },
          ]}
        />

        {/* Top Bar */}
        <div className="flex items-center gap-3 mb-5 md:mb-8">
          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-2xl font-semibold text-gray-900">
              Item Details
            </h1>

            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                isLost
                  ? "bg-red-50 text-red-600 border border-red-100"
                  : "bg-emerald-50 text-emerald-600 border border-emerald-100"
              }`}
            >
              {item.type}
            </span>
          </div>
        </div>

        {/* Layout */}
        <div className="grid gap-6 lg:grid-cols-[2fr,1.5fr]">
          {/* LEFT */}
          <div className="space-y-5">
            <section className="bg-white rounded-2xl shadow-sm border p-5">
              <div className="flex gap-4">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${
                    isLost
                      ? "bg-red-50 text-red-600"
                      : "bg-green-50 text-green-600"
                  }`}
                >
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt={itemTitle}
                      className="w-16 h-16 object-cover rounded-2xl"
                    />
                  ) : isLost ? (
                    "🔎"
                  ) : (
                    "📦"
                  )}
                </div>

                <div className="flex-1">
                  <h2 className="font-semibold text-lg">{itemTitle}</h2>

                  <p className="text-sm text-gray-400">{formatRelativeTime(item.createdAt)}</p>

                  <div className="inline-flex items-center gap-1 mt-2 bg-gray-50 px-2 py-1 rounded-full text-xs">
                    <Tag className="w-3 h-3" />
                    {getCategoryLabel(item, categories)}
                  </div>
                </div>

                {typeof item.rewardAmount === "number" && item.rewardAmount > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2 text-amber-700 text-sm font-semibold">
                      <Wallet className="w-4 h-4" />৳{item.rewardAmount}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <h3 className="font-semibold mb-1">Description</h3>
                <p className="text-gray-600 text-sm">
                  {item.description || item.items?.[0]?.description || "No description provided."}
                </p>
              </div>
            </section>

            {/* LOCATION */}
            <section className="bg-white rounded-2xl shadow-sm border p-5">
              <h3 className="font-semibold mb-4">Location & Time</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex gap-3 bg-gray-50 p-3 rounded-xl">
                  <div className="bg-black text-white w-8 h-8 flex items-center justify-center rounded-lg">
                    <FaMap />
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">Last Seen</p>
                    <p className="text-sm font-medium">{getLocationLabel(item)}</p>
                  </div>
                </div>

                <div className="flex gap-3 bg-gray-50 p-3 rounded-xl">
                  <div className="bg-black text-white w-8 h-8 flex items-center justify-center rounded-lg">
                    <FaClock />
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">Date & Time</p>
                    <p className="text-sm font-medium">
                      {formatDateTime(item.lastSeenDate, item.lastSeenTime)}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT */}
          <div className="space-y-5">
            <section className="bg-white rounded-2xl shadow-sm border p-5">
              <h3 className="font-semibold mb-4">Contact Information</h3>

              {isResolveAccepted ? (
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <p className="text-xs text-gray-400">Name</p>
                    <p className="font-medium">
                      {item.contactName || item.createdBy?.name || "Not provided"}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-xl flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-400">Phone</p>
                      <p className="font-medium">{item.contactPhone || "Not provided"}</p>
                    </div>

                    {item.contactPhone ? (
                      <Link
                        href={`tel:${item.contactPhone}`}
                        className="bg-black text-white px-3 py-1 rounded-full text-sm flex items-center gap-1"
                      >
                        <FaPhone />
                        Call
                      </Link>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <p className="text-sm font-medium text-amber-700">Contact is hidden</p>
                  <p className="text-xs text-amber-700/90 mt-1">
                    Contact details will be visible after your resolve request is accepted.
                  </p>
                </div>
              )}
            </section>

            <section className="bg-white rounded-2xl shadow-sm border p-5">
              <h3 className="font-semibold mb-2">Need to mark this as resolved?</h3>
              <p className="text-sm text-gray-500 mb-4">
                Send a resolve request to the post owner with your message and optional proof images.
              </p>

              <button
                type="button"
                onClick={handleOpenResolveModal}
                className="w-full py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:opacity-50"
                disabled={isResolveAccepted}
              >
                {isResolveAccepted
                  ? "Resolve Request Accepted"
                  : isAuthenticated
                    ? "Send Resolve Request"
                    : "Login to Send Resolve Request"}
              </button>
            </section>
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-white">
        <div className="cs-container py-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {isResolveAccepted && item.contactPhone ? (
              <Link
                href={`tel:${item.contactPhone}`}
                className={`flex justify-center py-3 rounded-xl text-white font-semibold ${
                  isLost
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                <FaPhone className="mr-2" />
                Contact {isLost ? "Owner" : "Finder"}
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="w-full py-3 rounded-xl bg-gray-300 text-gray-600 font-semibold cursor-not-allowed"
              >
                Contact not available
              </button>
            )}

            <button
              type="button"
              onClick={handleOpenResolveModal}
                className="w-full py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:opacity-50"
                disabled={isResolveAccepted}
            >
                {isResolveAccepted ? "Request Accepted" : "Resolve Request"}
            </button>
          </div>
        </div>
      </div>

      {isResolveModalOpen ? (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Send Resolve Request</h3>
              <button
                type="button"
                onClick={() => setIsResolveModalOpen(false)}
                className="text-sm text-gray-500 hover:text-gray-800"
              >
                Close
              </button>
            </div>

            <div className="space-y-3">
              <textarea
                value={resolveMessage}
                onChange={(event) => setResolveMessage(event.target.value)}
                placeholder="Explain why this item may be yours / relevant to you"
                rows={4}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-400 resize-none"
              />

              <label className="block">
                <span className="text-sm text-gray-600 mb-1 block">Proof images (optional)</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(event) =>
                    setResolveFiles(Array.from(event.target.files || []))
                  }
                  className="w-full text-sm"
                />
              </label>

              {resolveFiles.length > 0 ? (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" /> {resolveFiles.length} file(s) selected
                </p>
              ) : null}

              {resolveFeedback ? (
                <p className={`text-sm ${resolveFeedback.type === "error" ? "text-red-600" : "text-green-600"}`}>
                  {resolveFeedback.text}
                </p>
              ) : null}

              <button
                type="button"
                disabled={!resolveMessage.trim() || isSubmittingResolveRequest}
                onClick={handleSubmitResolveRequest}
                className="w-full py-3 rounded-xl bg-slate-900 text-white font-semibold disabled:opacity-50"
              >
                {isSubmittingResolveRequest ? "Sending..." : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
