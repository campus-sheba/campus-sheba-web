/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { CheckCircle2, Clock3, Edit3, MapPin, XCircle } from "lucide-react";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import {
  getIncomingResolveRequestsAction,
  getMyLostFoundItemByIdAction,
  resolveLostFoundPostAction,
  respondResolveRequestAction,
  type IncomingResolveRequest,
  type LostFoundItem,
} from "@/app/[locale]/(public)/(features)/lost-found/actions";
import { useParams } from "next/navigation";

const getItemTitle = (item?: LostFoundItem | null) => item?.title || item?.items?.[0]?.name || "Untitled";
const getItemDescription = (item?: LostFoundItem | null) =>
  item?.description || item?.items?.[0]?.description || "Not provided";

const getCategoryLabel = (item?: LostFoundItem | null) => {
  const category = item?.items?.[0]?.category;
  if (!category) return "Uncategorized";
  if (typeof category === "string") return category;
  return category.title || "Uncategorized";
};

const getImageUrls = (item?: LostFoundItem | null) => {
  const top = (item?.image || []).map((img) => img.url).filter(Boolean) as string[];
  const nested = (item?.items || [])
    .flatMap((it) => it.images || [])
    .map((img) => img.url)
    .filter(Boolean) as string[];

  return Array.from(new Set([...top, ...nested]));
};

const formatDateTime = (date?: string, time?: string) => {
  if (!date && !time) return "Not provided";
  const parsed = date ? new Date(date) : null;
  const dateLabel = parsed && !Number.isNaN(parsed.getTime()) ? parsed.toLocaleDateString() : "";
  return [dateLabel, time].filter(Boolean).join(" ") || "Not provided";
};

const formatDate = (value?: string) => {
  if (!value) return "Recently";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Recently";
  return parsed.toLocaleString();
};

export default function MyLostFoundDetailsClient() {
  const params = useParams<{id: string }>();
  const id = params?.id || "";

  const [item, setItem] = useState<LostFoundItem | null>(null);
  const [resolveRequests, setResolveRequests] = useState<IncomingResolveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"details" | "resolve-requests">("details");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadAll = useCallback(async () => {
    setIsLoading(true);

    const itemResult = await getMyLostFoundItemByIdAction(id);
    if (itemResult.success && itemResult.item) {
      setItem(itemResult.item);

      const requestsResult = await getIncomingResolveRequestsAction(itemResult.item._id);
      if (requestsResult.success) {
        setResolveRequests(requestsResult.requests || []);
      } else {
        setResolveRequests([]);
      }
    } else {
      setItem(null);
      setMessage({ type: "error", text: itemResult.message || "Could not load post details" });
    }

    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    loadAll();
  }, [id, loadAll]);

  const statusBadgeClass = useMemo(() => {
    const normalized = (item?.status || "").toLowerCase();
    if (normalized.includes("approve")) return "bg-emerald-50 text-emerald-700";
    if (normalized.includes("reject")) return "bg-red-50 text-red-700";
    if (normalized.includes("resolve")) return "bg-blue-50 text-blue-700";
    return "bg-amber-50 text-amber-700";
  }, [item?.status]);

  const handleResolveRequest = async (requestId: string, status: "accepted" | "rejected") => {
    const result = await respondResolveRequestAction({ requestId, status });

    if (!result.success) {
      setMessage({ type: "error", text: result.message || "Failed to update resolve request" });
      return;
    }

    setMessage({ type: "success", text: result.message || "Resolve request updated" });
    await loadAll();
  };

  const handleMarkResolved = async () => {
    if (!item) return;

    const result = await resolveLostFoundPostAction(item._id);
    if (!result.success) {
      setMessage({ type: "error", text: result.message || "Failed to mark post resolved" });
      return;
    }

    setMessage({ type: "success", text: result.message || "Post marked resolved" });
    await loadAll();
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-500">
        Loading post details...
      </div>
    );
  }

  if (!item) {
    return (
      <div className="rounded-2xl border border-red-100 bg-white p-6 text-sm text-red-600">
        Could not find this Lost & Found post.
      </div>
    );
  }

  const imageUrls = getImageUrls(item);

  return (
    <div className="space-y-5">
      <AppBreadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/profile" },
          { label: "Lost & Found", href: "/my-lost-found" },
          { label: getItemTitle(item) },
        ]}
      />

      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{getItemTitle(item)}</h1>
            <p className="text-xs text-gray-500 mt-1">Post ID: {item._id}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadgeClass}`}>
              {item.status || "pending"}
            </span>
            <Link
              href={`/my-lost-found/${item._id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:border-[#E30A13] hover:text-[#E30A13]"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Post
            </Link>
            <button
              type="button"
              onClick={handleMarkResolved}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Resolve Post
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab("details")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${activeTab === "details" ? "bg-[#E30A13] text-white" : "bg-gray-100 text-gray-700"}`}
          >
            Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("resolve-requests")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${activeTab === "resolve-requests" ? "bg-[#E30A13] text-white" : "bg-gray-100 text-gray-700"}`}
          >
            Resolve Requests ({resolveRequests.length})
          </button>
        </div>

        {activeTab === "details" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-xl border border-gray-200 p-3">
                <p className="text-xs text-gray-500">Type</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{item.type}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-3">
                <p className="text-xs text-gray-500">Category</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{getCategoryLabel(item)}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-3">
                <p className="text-xs text-gray-500">Created At</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{formatDate(item.createdAt)}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-3">
                <p className="text-xs text-gray-500">Updated At</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{formatDate(item.updatedAt)}</p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 p-3">
              <p className="text-xs text-gray-500">Description</p>
              <p className="text-sm text-gray-800 mt-1">{getItemDescription(item)}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-xl border border-gray-200 p-3">
                <p className="text-xs text-gray-500">Contact Name</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{item.contactName || "Not provided"}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-3">
                <p className="text-xs text-gray-500">Contact Phone</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{item.contactPhone || "Not provided"}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-3">
                <p className="text-xs text-gray-500">Alternate Contact</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{item.alternateContactPhone || "Not provided"}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-3">
                <p className="text-xs text-gray-500">Contact Email</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{item.contactEmail || "Not provided"}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-3">
                <p className="text-xs text-gray-500">Reward Amount</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{item.rewardAmount ?? 0}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-3">
                <p className="text-xs text-gray-500">Last Seen</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{formatDateTime(item.lastSeenDate, item.lastSeenTime)}</p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 p-3">
              <p className="text-xs text-gray-500 mb-1">Locations</p>
              {item.location?.length ? (
                <div className="space-y-1">
                  {item.location.map((loc) => (
                    <p key={loc._id} className="text-sm text-gray-800 inline-flex items-center gap-1.5 mr-3">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {loc.name}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No location provided</p>
              )}
            </div>

            <div className="rounded-xl border border-gray-200 p-3">
              <p className="text-xs text-gray-500 mb-2">Images</p>
              {imageUrls.length ? (
                <div className="flex flex-wrap gap-2">
                  {imageUrls.map((url, index) => (
                    <a
                      key={`${item._id}-image-${index}`}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-[#E30A13] hover:underline"
                    >
                      Image {index + 1}
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No images</p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {resolveRequests.length === 0 ? (
              <p className="text-sm text-gray-500">No incoming resolve requests yet.</p>
            ) : (
              resolveRequests.map((request) => (
                <div key={request.id} className="rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{request.requestedBy?.name || "Unknown user"}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{request.requestedBy?.phone || "No phone"}</p>
                      <p className="text-sm text-gray-700 mt-2">{request.message || "No message"}</p>
                      <p className="text-[11px] text-gray-400 mt-2 inline-flex items-center gap-1">
                        <Clock3 className="w-3.5 h-3.5" />
                        {request.createdAt ? new Date(request.createdAt).toLocaleString() : "Recently"}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                      {request.status || "pending"}
                    </span>
                  </div>

                  {request.images?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {request.images.map((img, index) => (
                        <a
                          key={`${request.id}-img-${index}`}
                          href={img}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-[#E30A13] hover:underline"
                        >
                          Proof {index + 1}
                        </a>
                      ))}
                    </div>
                  ) : null}

                  {request.status === "pending" ? (
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleResolveRequest(request.id, "accepted")}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => handleResolveRequest(request.id, "rejected")}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        )}

        {message ? (
          <p className={`mt-4 text-sm ${message.type === "error" ? "text-red-600" : "text-emerald-600"}`}>
            {message.text}
          </p>
        ) : null}
      </div>
    </div>
  );
}
