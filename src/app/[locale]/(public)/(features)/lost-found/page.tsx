/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, MapPin, Clock, CheckCircle2, X, Plus, Upload } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { IoInfinite, IoKeySharp } from "react-icons/io5";
import {
  MdAccountBalanceWallet,
  MdLaptopWindows,
  MdPhoneAndroid,
} from "react-icons/md";
import { SiBookstack } from "react-icons/si";
import {
  createLostFoundPostAction,
  getLostFoundCategoriesAction,
  getLostFoundItemsAction,
  getUniversityLocationsAction,
  type LostFoundCategory,
  type LostFoundItem,
  type UniversityLocationOption,
} from "./actions";
import { useAppState } from "@/contexts/AppStateContext";
import { CookieHelper } from "@/lib/appStateHelper";
import { uploadMediaFiles } from "@/lib/media/client";
import { MediaFeatureName } from "@/types/media";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";

type ReportForm = {
  title: string;
  category: string;
  description: string;
  phone: string;
  reward: string;
};

const STATIC_ALL_CATEGORY = {
  title: "All",
  value: "all",
  icon: <IoInfinite />,
};

const iconByTitle = (title: string) => {
  const normalized = title.toLowerCase();

  if (normalized.includes("phone")) return <MdPhoneAndroid />;
  if (normalized.includes("bag") || normalized.includes("wallet")) {
    return <MdAccountBalanceWallet />;
  }
  if (normalized.includes("book")) return <SiBookstack />;
  if (normalized.includes("id") || normalized.includes("card") || normalized.includes("key")) {
    return <IoKeySharp />;
  }
  if (normalized.includes("electronic") || normalized.includes("laptop")) {
    return <MdLaptopWindows />;
  }

  return <SiBookstack />;
};

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

const getItemImage = (item: LostFoundItem) => {
  const firstImage = item.image?.[0]?.url;
  if (firstImage) return firstImage;

  const typeKey = item.type?.toLowerCase();
  return typeKey === "lost" ? "🔎" : "📦";
};

const getItemCategoryLabel = (item: LostFoundItem, categories: LostFoundCategory[]) => {
  const nestedCategory = item.items?.[0]?.category;
  const categoryId =
    typeof nestedCategory === "object" && nestedCategory?._id
      ? nestedCategory._id
      : (nestedCategory as string | undefined) || item.category;

  if (typeof nestedCategory === "object" && nestedCategory?.title) {
    return nestedCategory.title;
  }

  if (!categoryId) return "Uncategorized";

  const matched = categories.find((category) => category._id === categoryId);
  return matched?.title || "Uncategorized";
};

const getItemLocationLabel = (item: LostFoundItem) =>
  item.location?.map((loc) => loc.name).filter(Boolean).join(", ") || "Location not provided";

export default function LostFoundPage() {
  const params = useParams<{ locale: string }>();
  const searchParams = useSearchParams();
  const { state, dispatch } = useAppState();
  const locale = params?.locale ?? "";
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "lost" | "found">("all");
  const [category, setCategory] = useState("all");
  const [categories, setCategories] = useState<LostFoundCategory[]>([]);
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState<"lost" | "found">("lost");
  const [form, setForm] = useState<ReportForm>({
    title: "",
    category: "",
    description: "",
    phone: "",
    reward: "",
  });
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportError, setReportError] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [reportFiles, setReportFiles] = useState<File[]>([]);
  const [locationOptions, setLocationOptions] = useState<UniversityLocationOption[]>([]);
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [locationLoadError, setLocationLoadError] = useState("");

  const addressId = CookieHelper.getAddressId();
  const selectedUniversityId =
    state.university.selected?._id || CookieHelper.getUniversity()?._id || "";

  const categoryOptions = useMemo(
    () => [
      STATIC_ALL_CATEGORY,
      ...categories?.map((apiCategory) => ({
        title: apiCategory.title,
        value: apiCategory._id,
        icon: iconByTitle(apiCategory.title),
      })),
    ],
    [categories],
  );

  useEffect(() => {
    const loadCategories = async () => {
      const result = await getLostFoundCategoriesAction();
      if (result.success) {
        setCategories(result.categories || []);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const reportParam = searchParams.get("report");

    if (reportParam === "lost" || reportParam === "found") {
      setReportType(reportParam);
      setShowReportModal(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const loadLocationOptions = async () => {
      if (!showReportModal) return;

      setIsLoadingLocations(true);
      setLocationLoadError("");

      const result = await getUniversityLocationsAction(selectedUniversityId || undefined);
      
      if (!result.success) {
        setLocationOptions([]);
        if (selectedUniversityId) {
          setLocationLoadError(result.message || "Failed to load campus locations");
        }
      } else {
        setLocationOptions(result.locations);
      }

      setIsLoadingLocations(false);
    };

    loadLocationOptions();
  }, [showReportModal, selectedUniversityId]);

  useEffect(() => {
    const loadItems = async () => {
      setIsLoading(true);
      setErrorMessage("");

      const result = await getLostFoundItemsAction({
        page: 1,
        limit: 20,
        title: search.trim() || undefined,
        category: category !== "all" ? category : undefined,
        type: filter === "all" ? undefined : filter === "lost" ? "Lost" : "Found",
        status: "approved",
        universityId: selectedUniversityId || undefined,
      });

      console.log("Load items result:", result);

      if (!result.success) {
        setItems([]);
        setErrorMessage(result.message || "Failed to load items");
      } else {
        setItems(result.items);
      }

      setIsLoading(false);
    };

    loadItems();
  }, [search, filter, category, refreshKey]);

  const handleCreateReport = async () => {
    if (!state.auth.isAuthenticated) {
      dispatch({ type: "OPEN_AUTH_MODAL", payload: { defaultTab: "login" } });
      return;
    }

    if (!form.title || !form.phone) {
      return;
    }

    setIsSubmittingReport(true);
    setReportError("");

    const profile = state.user.profile;
    const locationIds = Array.from(
      new Set([...(selectedLocationIds || []), ...(addressId ? [addressId] : [])]),
    );

    if (locationIds.length === 0) {
      setReportError("Please select at least one campus location");
      setIsSubmittingReport(false);
      return;
    }

    const uploadResult = await uploadMediaFiles(
      reportFiles,
      MediaFeatureName.LOST_AND_FOUND,
    );

    if (!uploadResult.success) {
      setReportError(uploadResult.message || "Failed to upload image");
      setIsSubmittingReport(false);
      return;
    }

    const result = await createLostFoundPostAction({
      title: form.title,
      description: form.description || form.title,
      category: form.category || undefined,
      locationIds,
      contactName: profile?.name || "Campus Sheba User",
      contactPhone: form.phone,
      contactEmail: profile?.email || undefined,
      rewardAmount: reportType === "lost" ? Number(form.reward || 0) : 0,
      type: reportType === "lost" ? "Lost" : "Found",
      imageUrls: uploadResult.urls,
    });

    if (!result.success) {
      setReportError(result.message || "Failed to create report");
      setIsSubmittingReport(false);
      return;
    }

    setReportSubmitted(true);
    setIsSubmittingReport(false);
    setReportFiles([]);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="cs-container mx-auto pt-5 md:pt-10">
        <AppBreadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Lost & Found" },
          ]}
        />
        <div className="mb-3">
          <span className="text-2xl font-medium text-gray-900">Lost & Found</span>
        </div>
      </div>

      <div className="cs-container py-8">
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-orange-400"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setReportType("lost");
                setShowReportModal(true);
                setReportError("");
                setReportFiles([]);
                setSelectedLocationIds(addressId ? [addressId] : []);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
            >
              <Plus className="w-4 h-4" /> Report Lost
            </button>
            <button
              onClick={() => {
                setReportType("found");
                setShowReportModal(true);
                setReportError("");
                setReportFiles([]);
                setSelectedLocationIds(addressId ? [addressId] : []);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700"
            >
              <Plus className="w-4 h-4" /> Report Found
            </button>
          </div>
          <div className="flex gap-2 md:gap-4 overflow-x-auto no-scrollbar">
            {(["all", "lost", "found"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-1 rounded-lg text-sm font-medium capitalize transition-colors ${filter === f ? "bg-slate-800 text-white" : "text-gray-500 bg-gray-200 hover:text-gray-900"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row flex-wrap gap-x-6 gap-y-3 mb-6">
          {/* <h2 className="text-lg font-medium">Categories</h2> */}
          <div className="flex gap-2 flex-wrap">
            {categoryOptions?.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`px-4 py-2 rounded-md text-xs font-medium transition-colors flex items-center gap-2 ${category === c.value ? "bg-red-600 text-white" : "bg-gray-200 hover:border-red-400"}`}
              >
                <span>{c.icon}</span> {c.title}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-4">
          {items.length} item{items.length !== 1 ? "s" : ""} found
        </p>

        {/* Grid */}
        {isLoading && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-gray-500">Loading items...</p>
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="bg-white rounded-2xl border border-red-100 p-12 text-center">
            <p className="text-red-600 font-medium mb-2">Could not load items</p>
            <p className="text-sm text-gray-500">{errorMessage}</p>
          </div>
        )}

        {!isLoading && !errorMessage && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item) => {
              const previewImage = getItemImage(item);

              return (
            <Link
              key={item._id}
              href={`/${locale}/lost-found/${item._id}`}
              className="bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow overflow-hidden group flex flex-row md:flex-col"
            >
              <div
                className={`${item.type.toLowerCase() === "lost" ? "bg-red-200" : "bg-green-200"} p-6 text-center text-5xl flex items-center justify-center`}
              >
                {previewImage.startsWith("http") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewImage}
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                ) : (
                  previewImage
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-orange-600">
                    {item.title}
                  </h3>
                  {typeof item.rewardAmount === "number" && item.rewardAmount > 0 && (
                    <span className="px-2 py-0.5 rounded text-xs bg-orange-200 text-orange-600 border border-orange-500 font-medium whitespace-nowrap">
                      <span>৳</span> {item.rewardAmount}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-3 md:gap-0">
                  <p className="text-xs text-gray-500 mb-1">
                    {(item.description || "No description").slice(0, 80)}...
                  </p>
                  <p
                    className={`px-3 py-1 rounded-md text-xs font-medium capitalize ${item.type.toLowerCase() === "lost" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-600"}`}
                  >
                    {item.type.toLowerCase()}
                  </p>
                </div>
                <div className="my-2">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {getItemCategoryLabel(item, categories)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-1 text-xs text-gray-500 my-2 md:my-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {getItemLocationLabel(item)}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" /> {formatRelativeTime(item.createdAt)}
                  </div>
                </div>
              </div>
            </Link>
              );
            })}
          </div>
        )}

        {!isLoading && !errorMessage && items.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <span className="text-4xl mb-3 block">🔍</span>
            <p className="text-gray-500">
              No items found for your search or filter.
            </p>
          </div>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">
                Report {reportType === "lost" ? "Lost" : "Found"} Item
              </h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {reportSubmitted ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h4 className="font-bold text-gray-900 mb-1">
                  Report Submitted!
                </h4>
                <p className="text-sm text-gray-500 mb-4">
                  Your report has been posted. Community members can now help
                  you.
                </p>
                <button
                  onClick={() => {
                    setShowReportModal(false);
                    setReportSubmitted(false);
                    setReportError("");
                    setForm({
                      title: "",
                      category: "",
                      description: "",
                      phone: "",
                      reward: "",
                    });
                    setReportFiles([]);
                    setSelectedLocationIds(addressId ? [addressId] : []);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-orange-600 text-white text-sm font-medium"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
                  {(["lost", "found"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setReportType(t)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${reportType === t ? "bg-white shadow text-gray-900" : "text-gray-500"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Item title (e.g. Blue HP Laptop)"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-400"
                />
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-400 bg-white appearance-none"
                >
                  <option value="">Select Category</option>
                  {categoryOptions.slice(1).map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.title}
                    </option>
                  ))}
                </select>
                <div className="rounded-xl border border-gray-200 p-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Campus Location</p>
                  {isLoadingLocations ? (
                    <p className="text-sm text-gray-500">Loading locations...</p>
                  ) : locationOptions.length > 0 ? (
                    <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                      {locationOptions.map((location) => {
                        const checked = selectedLocationIds.includes(location.id);

                        return (
                          <label
                            key={location.id}
                            className="flex items-center gap-2 text-sm text-gray-700"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(event) => {
                                if (event.target.checked) {
                                  setSelectedLocationIds((prev) =>
                                    Array.from(new Set([...prev, location.id])),
                                  );
                                } else {
                                  setSelectedLocationIds((prev) =>
                                    prev.filter((id) => id !== location.id),
                                  );
                                }
                              }}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <span>{location.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      {locationLoadError || "No campus locations available. Your saved campus location will be used if available."}
                    </p>
                  )}
                </div>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Describe the item in detail..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-400 resize-none"
                />
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Your phone number"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-400"
                />
                {reportType === "lost" && (
                  <input
                    value={form.reward}
                    onChange={(e) =>
                      setForm({ ...form, reward: e.target.value })
                    }
                    placeholder="Reward amount (optional, e.g. ৳200)"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-400"
                  />
                )}
                <label className="block">
                  <span className="text-sm text-gray-600 mb-1 block">Images (optional)</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(event) =>
                      setReportFiles(Array.from(event.target.files || []))
                    }
                    className="w-full text-sm"
                  />
                </label>
                {reportFiles.length > 0 ? (
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" /> {reportFiles.length} file(s) selected
                  </p>
                ) : null}
                {reportError ? (
                  <p className="text-sm text-red-600">{reportError}</p>
                ) : null}
                <button
                  disabled={!form.title || !form.phone || isSubmittingReport}
                  onClick={handleCreateReport}
                  className="w-full py-3 rounded-xl bg-orange-600 text-white font-semibold text-sm hover:bg-orange-700 disabled:opacity-50"
                >
                  {isSubmittingReport ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
