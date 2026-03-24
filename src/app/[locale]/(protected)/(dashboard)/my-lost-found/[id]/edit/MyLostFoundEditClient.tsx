/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2, MapPin, Save, Upload } from "lucide-react";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import { useAppState } from "@/contexts/AppStateContext";
import { CookieHelper } from "@/lib/appStateHelper";
import { uploadMediaFiles } from "@/lib/media/client";
import { MediaFeatureName } from "@/types/media";
import {
  getLostFoundCategoriesAction,
  getMyLostFoundItemByIdAction,
  getUniversityLocationsAction,
  updateLostFoundPostAction,
  type LostFoundCategory,
  type LostFoundItem,
  type UniversityLocationOption,
} from "@/app/[locale]/(public)/(features)/lost-found/actions";

type EditForm = {
  title: string;
  description: string;
  category: string;
  contactName: string;
  contactPhone: string;
  alternateContactPhone: string;
  contactEmail: string;
  rewardAmount: string;
  lastSeenDate: string;
  lastSeenTime: string;
};

const getItemTitle = (item?: LostFoundItem | null) => item?.title || item?.items?.[0]?.name || "Untitled";
const getItemDescription = (item?: LostFoundItem | null) =>
  item?.description || item?.items?.[0]?.description || "";
const getItemCategory = (item?: LostFoundItem | null) => {
  const nested = item?.items?.[0]?.category;
  if (typeof nested === "object" && nested?._id) return nested._id;
  if (typeof nested === "string") return nested;
  return item?.category || "";
};

export default function MyLostFoundEditClient() {
  const params = useParams<{ locale: string; id: string }>();
  const locale = params?.locale || "en";
  const id = params?.id || "";
  const { state } = useAppState();

  const [item, setItem] = useState<LostFoundItem | null>(null);
  const [categories, setCategories] = useState<LostFoundCategory[]>([]);
  const [locations, setLocations] = useState<UniversityLocationOption[]>([]);
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [form, setForm] = useState<EditForm>({
    title: "",
    description: "",
    category: "",
    contactName: "",
    contactPhone: "",
    alternateContactPhone: "",
    contactEmail: "",
    rewardAmount: "",
    lastSeenDate: "",
    lastSeenTime: "",
  });

  const selectedUniversityId =
    state.university.selected?._id || CookieHelper.getUniversity()?._id || "";

  const hydrateFormFromItem = (foundItem: LostFoundItem) => {
    setForm({
      title: getItemTitle(foundItem),
      description: getItemDescription(foundItem),
      category: getItemCategory(foundItem),
      contactName: foundItem.contactName || "",
      contactPhone: foundItem.contactPhone || "",
      alternateContactPhone: foundItem.alternateContactPhone || "",
      contactEmail: foundItem.contactEmail || "",
      rewardAmount: String(foundItem.rewardAmount || 0),
      lastSeenDate: foundItem.lastSeenDate ? new Date(foundItem.lastSeenDate).toISOString().split("T")[0] : "",
      lastSeenTime: foundItem.lastSeenTime || "",
    });

    setSelectedLocationIds(foundItem.location?.map((loc) => loc._id).filter(Boolean) || []);
  };

  const loadAll = useCallback(async () => {
    setIsLoading(true);

    const [itemResult, categoriesResult, locationsResult] = await Promise.all([
      getMyLostFoundItemByIdAction(id),
      getLostFoundCategoriesAction(),
      getUniversityLocationsAction(selectedUniversityId || undefined),
    ]);

    if (itemResult.success && itemResult.item) {
      setItem(itemResult.item);
      hydrateFormFromItem(itemResult.item);
    } else {
      setItem(null);
      setMessage({ type: "error", text: itemResult.message || "Could not load post" });
    }

    if (categoriesResult.success) {
      setCategories(categoriesResult.categories);
    }

    if (locationsResult.success) {
      setLocations(locationsResult.locations);
    }

    setIsLoading(false);
  }, [id, selectedUniversityId]);

  useEffect(() => {
    if (!id) return;
    loadAll();
  }, [id, loadAll]);

  const handleSave = async () => {
    if (!item) return;

    setIsSaving(true);
    setMessage(null);

    let imageUrls = item.image?.map((img) => img.url).filter(Boolean) as string[];

    if (newFiles.length > 0) {
      const uploadResult = await uploadMediaFiles(newFiles, MediaFeatureName.LOST_AND_FOUND);
      if (!uploadResult.success) {
        setMessage({ type: "error", text: uploadResult.message || "Failed to upload image" });
        setIsSaving(false);
        return;
      }
      imageUrls = uploadResult.urls;
    }

    const result = await updateLostFoundPostAction({
      id: item._id,
      title: form.title.trim(),
      description: form.description.trim() || form.title.trim(),
      category: form.category || undefined,
      locationIds: selectedLocationIds,
      lastSeenDate: form.lastSeenDate || undefined,
      lastSeenTime: form.lastSeenTime || undefined,
      contactName: form.contactName.trim(),
      contactPhone: form.contactPhone.trim(),
      alternateContactPhone: form.alternateContactPhone.trim() || undefined,
      contactEmail: form.contactEmail.trim() || undefined,
      rewardAmount: Number(form.rewardAmount || 0),
      imageUrls,
    });

    if (!result.success) {
      setMessage({ type: "error", text: result.message || "Failed to update post" });
      setIsSaving(false);
      return;
    }

    setMessage({ type: "success", text: "Post updated successfully" });
    await loadAll();
    setNewFiles([]);
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-500">
        Loading editable post data...
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

  return (
    <div className="space-y-5">
      <AppBreadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: `/profile` },
          { label: "Lost & Found", href: `/my-lost-found` },
          { label: getItemTitle(item), href: `/my-lost-found/${item._id}` },
          { label: "Edit" },
        ]}
      />

      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h1 className="text-xl font-bold text-gray-900">Edit Lost & Found Post</h1>
          <Link href={`/my-lost-found/${item._id}`} className="text-xs font-semibold text-[#E30A13] hover:underline">
            Back to Details
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Title</label>
            <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
            <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm">
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>{category.title}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Contact Name</label>
            <input value={form.contactName} onChange={(e) => setForm((p) => ({ ...p, contactName: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Primary Phone</label>
            <input value={form.contactPhone} onChange={(e) => setForm((p) => ({ ...p, contactPhone: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Alternate Phone</label>
            <input value={form.alternateContactPhone} onChange={(e) => setForm((p) => ({ ...p, alternateContactPhone: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Contact Email</label>
            <input value={form.contactEmail} onChange={(e) => setForm((p) => ({ ...p, contactEmail: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Last Seen Date</label>
            <input type="date" value={form.lastSeenDate} onChange={(e) => setForm((p) => ({ ...p, lastSeenDate: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Last Seen Time</label>
            <input type="time" value={form.lastSeenTime} onChange={(e) => setForm((p) => ({ ...p, lastSeenTime: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm" />
          </div>

          {item.type === "Lost" ? (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Reward Amount</label>
              <input type="number" min={0} value={form.rewardAmount} onChange={(e) => setForm((p) => ({ ...p, rewardAmount: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm" />
            </div>
          ) : null}

          <div className="md:col-span-2 rounded-xl border border-gray-200 p-3">
            <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
              <MapPin className="w-4 h-4" /> Location Selection
            </p>
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
                          setSelectedLocationIds((prev) => prev.filter((v) => v !== location.id));
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span>{location.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Replace Images (optional)</label>
            <input type="file" accept="image/*" multiple onChange={(event) => setNewFiles(Array.from(event.target.files || []))} className="w-full text-sm" />
            {newFiles.length > 0 ? (
              <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" /> {newFiles.length} file selected
              </p>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E30A13] text-white text-sm font-semibold hover:bg-[#c70810] disabled:opacity-60"
        >
          <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save Changes"}
        </button>

        {message ? (
          <p className={`mt-3 text-sm ${message.type === "error" ? "text-red-600" : "text-emerald-600"}`}>
            {message.text}
          </p>
        ) : null}
      </div>
    </div>
  );
}
