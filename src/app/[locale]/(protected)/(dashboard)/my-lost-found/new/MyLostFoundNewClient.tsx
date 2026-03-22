"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, MapPin, Plus, Upload } from "lucide-react";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import { useAppState } from "@/contexts/AppStateContext";
import { CookieHelper } from "@/lib/appStateHelper";
import { uploadMediaFiles } from "@/lib/media/client";
import { MediaFeatureName } from "@/types/media";
import {
  createLostFoundPostAction,
  getLostFoundCategoriesAction,
  getUniversityLocationsAction,
  type LostFoundCategory,
  type UniversityLocationOption,
} from "@/app/[locale]/(public)/(features)/lost-found/actions";

type LostFoundForm = {
  title: string;
  description: string;
  type: "Lost" | "Found";
  category: string;
  contactName: string;
  contactPhone: string;
  alternateContactPhone: string;
  contactEmail: string;
  rewardAmount: string;
  lastSeenDate: string;
  lastSeenTime: string;
};

export default function MyLostFoundNewClient() {
  const params = useParams<{ locale: string }>();
  const locale = params?.locale || "en";
  const router = useRouter();
  const { state } = useAppState();

  const [categories, setCategories] = useState<LostFoundCategory[]>([]);
  const [locations, setLocations] = useState<UniversityLocationOption[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>(() => {
    const fallbackAddressId = CookieHelper.getAddressId();
    return fallbackAddressId ? [fallbackAddressId] : [];
  });
  const [files, setFiles] = useState<File[]>([]);
  const [form, setForm] = useState<LostFoundForm>({
    title: "",
    description: "",
    type: "Lost",
    category: "",
    contactName: state.user.profile?.name || "",
    contactPhone: state.user.profile?.phone || "",
    alternateContactPhone: "",
    contactEmail: state.user.profile?.email || "",
    rewardAmount: "",
    lastSeenDate: "",
    lastSeenTime: "",
  });

  const selectedUniversityId =
    state.university.selected?._id || CookieHelper.getUniversity()?._id || "";

  useEffect(() => {
    const loadCategories = async () => {
      const result = await getLostFoundCategoriesAction();
      if (result.success) {
        setCategories(result.categories);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const loadLocationOptions = async () => {
      setIsLoadingLocations(true);
      const result = await getUniversityLocationsAction(selectedUniversityId || undefined);

      if (result.success) {
        setLocations(result.locations);
      } else {
        setLocations([]);
      }

      setIsLoadingLocations(false);
    };

    loadLocationOptions();
  }, [selectedUniversityId]);

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.contactPhone.trim()) {
      setErrorMessage("Title and primary phone are required");
      return;
    }

    if (selectedLocationIds.length === 0) {
      setErrorMessage("Please select at least one location");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    const uploadResult = await uploadMediaFiles(files, MediaFeatureName.LOST_AND_FOUND);
    if (!uploadResult.success) {
      setErrorMessage(uploadResult.message || "Failed to upload image");
      setIsSubmitting(false);
      return;
    }

    const result = await createLostFoundPostAction({
      title: form.title.trim(),
      description: form.description.trim() || form.title.trim(),
      category: form.category || undefined,
      locationIds: selectedLocationIds,
      lastSeenDate: form.lastSeenDate || undefined,
      lastSeenTime: form.lastSeenTime || undefined,
      contactName: form.contactName.trim() || state.user.profile?.name || "Campus Sheba User",
      contactPhone: form.contactPhone.trim(),
      alternateContactPhone: form.alternateContactPhone.trim() || undefined,
      contactEmail: form.contactEmail.trim() || undefined,
      rewardAmount: form.type === "Lost" ? Number(form.rewardAmount || 0) : 0,
      type: form.type,
      imageUrls: uploadResult.urls,
    });

    if (!result.success) {
      setErrorMessage(result.message || "Failed to create post");
      setIsSubmitting(false);
      return;
    }

    setSuccessMessage("Lost and Found post submitted successfully");
    setIsSubmitting(false);

    setTimeout(() => {
      router.push(`/${locale}/my-lost-found`);
      router.refresh();
    }, 700);
  };

  return (
    <div className="space-y-5">
      <AppBreadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: `/${locale}/profile` },
          { label: "Lost & Found", href: `/${locale}/my-lost-found` },
          { label: "New Report" },
        ]}
      />

      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h1 className="text-xl font-bold text-gray-900">Post New Lost/Found Report</h1>
          <Link href={`/${locale}/my-lost-found`} className="text-xs font-semibold text-[#E30A13] hover:underline">
            Back to History
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Post Type</label>
            <select
              value={form.type}
              onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value as "Lost" | "Found" }))}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm"
            >
              <option value="Lost">Lost</option>
              <option value="Found">Found</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
            <select
              value={form.category}
              onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm"
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.title}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Title</label>
            <input
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Contact Name</label>
            <input
              value={form.contactName}
              onChange={(event) => setForm((prev) => ({ ...prev, contactName: event.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Primary Phone</label>
            <input
              value={form.contactPhone}
              onChange={(event) => setForm((prev) => ({ ...prev, contactPhone: event.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Alternate Phone</label>
            <input
              value={form.alternateContactPhone}
              onChange={(event) => setForm((prev) => ({ ...prev, alternateContactPhone: event.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Contact Email</label>
            <input
              value={form.contactEmail}
              onChange={(event) => setForm((prev) => ({ ...prev, contactEmail: event.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Last Seen Date</label>
            <input
              type="date"
              value={form.lastSeenDate}
              onChange={(event) => setForm((prev) => ({ ...prev, lastSeenDate: event.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Last Seen Time</label>
            <input
              type="time"
              value={form.lastSeenTime}
              onChange={(event) => setForm((prev) => ({ ...prev, lastSeenTime: event.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm"
            />
          </div>

          {form.type === "Lost" ? (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Reward Amount</label>
              <input
                type="number"
                min={0}
                value={form.rewardAmount}
                onChange={(event) => setForm((prev) => ({ ...prev, rewardAmount: event.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm"
              />
            </div>
          ) : null}

          <div className="md:col-span-2 rounded-xl border border-gray-200 p-3">
            <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
              <MapPin className="w-4 h-4" /> Location Selection
            </p>
            {isLoadingLocations ? (
              <p className="text-sm text-gray-500">Loading university locations...</p>
            ) : locations.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {locations.map((location) => {
                  const checked = selectedLocationIds.includes(location.id);
                  return (
                    <label key={location.id} className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) => {
                          if (event.target.checked) {
                            setSelectedLocationIds((prev) => Array.from(new Set([...prev, location.id])));
                          } else {
                            setSelectedLocationIds((prev) => prev.filter((id) => id !== location.id));
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
              <p className="text-sm text-gray-500">No location options available for your university.</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => setFiles(Array.from(event.target.files || []))}
              className="w-full text-sm"
            />
            {files.length ? (
              <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" /> {files.length} file selected
              </p>
            ) : null}
          </div>
        </div>

        {errorMessage ? <p className="mt-3 text-sm text-red-600">{errorMessage}</p> : null}
        {successMessage ? (
          <p className="mt-3 text-sm text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> {successMessage}
          </p>
        ) : null}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E30A13] text-white text-sm font-semibold hover:bg-[#c70810] disabled:opacity-60"
        >
          <Plus className="w-4 h-4" />
          {isSubmitting ? "Submitting..." : "Submit Lost/Found Post"}
        </button>
      </div>
    </div>
  );
}
