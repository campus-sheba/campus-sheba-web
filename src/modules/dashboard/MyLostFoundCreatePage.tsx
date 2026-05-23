"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/navigation";
import { useAppState } from "@/contexts/AppStateContext";
import { uploadMediaFiles, type UploadedMediaMeta } from "@/lib/media/client";
import { createLostFoundAction } from "@/services/lost-and-found";
import { fetchUserCategoriesByType } from "@/services/books";
import { fetchUniversityLocationsAction } from "@/services/university-locations";
import type { BuySellCategory } from "@/types/buy-sell";
import type { LostFoundType } from "@/types/lost-and-found";
import { MediaFeatureName } from "@/types/media";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";

const MAX_ITEMS = 3;
const MAX_PHOTOS_PER_ITEM = 4;

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-[#E30B12]";
const labelClass = "text-xs font-medium text-gray-500";

function normalizePhoneDigits(value: string): string {
  const onlyDigits = value.replace(/\D/g, "");
  const withoutCountryCode = onlyDigits.startsWith("88") ? onlyDigits.slice(2) : onlyDigits;
  return withoutCountryCode.slice(0, 11);
}

function buildApiPhone(digits: string): string {
  if (digits.length === 11 && digits.startsWith("01")) return `+88${digits}`;
  return digits.replace(/\s/g, "");
}

type ItemDraft = {
  name: string;
  description: string;
  categoryId: string;
  photos: UploadedMediaMeta[];
};

export default function MyLostFoundCreatePage() {
  const router = useRouter();
  const { state } = useAppState();
  const universityId = state.university.selected?._id ?? state.user.profile?.university?._id;

  const [categories, setCategories] = useState<BuySellCategory[]>([]);
  const [locations, setLocations] = useState<{ _id: string; name?: string }[]>([]);
  const [loadMeta, setLoadMeta] = useState(true);

  const [postType, setPostType] = useState<LostFoundType>("Lost");
  const [items, setItems] = useState<ItemDraft[]>([
    { name: "", description: "", categoryId: "", photos: [] },
  ]);
  const [locationIds, setLocationIds] = useState<string[]>([]);
  const [lastSeenDate, setLastSeenDate] = useState("");
  const [lastSeenTime, setLastSeenTime] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [alternatePhone, setAlternatePhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [rewardAmount, setRewardAmount] = useState("");

  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setLoadMeta(true);
      try {
        const [catRes, locs] = await Promise.all([
          fetchUserCategoriesByType("Lost and Found", 1, 100),
          universityId ? fetchUniversityLocationsAction(universityId) : Promise.resolve([]),
        ]);
        setCategories(catRes.data ?? []);
        setLocations(locs);
      } catch {
        setError("Could not load form data.");
      } finally {
        setLoadMeta(false);
      }
    })();
  }, [universityId]);

  useEffect(() => {
    const p = state.user.profile;
    if (!p) return;
    setContactName((prev) => prev || p.name || "");
    setContactPhone((prev) => prev || p.phone || "");
    setContactEmail((prev) => prev || p.email || "");
  }, [state.user.profile]);

  function toggleLocation(id: string) {
    setLocationIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function onPickItemPhotos(itemIndex: number, files: FileList | null) {
    if (!files?.length) return;
    const item = items[itemIndex];
    const remain = MAX_PHOTOS_PER_ITEM - item.photos.length;
    if (remain <= 0) return;
    const slice = Array.from(files).slice(0, remain);
    setUploadingIdx(itemIndex);
    setError(null);
    const res = await uploadMediaFiles(slice, MediaFeatureName.LOST_AND_FOUND);
    setUploadingIdx(null);
    if (!res.success || !res.files?.length) {
      setError(res.message ?? "Upload failed.");
      return;
    }
    setItems((prev) =>
      prev.map((it, i) =>
        i === itemIndex ? { ...it, photos: [...it.photos, ...res.files!].slice(0, MAX_PHOTOS_PER_ITEM) } : it,
      ),
    );
  }

  function addItem() {
    if (items.length >= MAX_ITEMS) return;
    setItems((prev) => [...prev, { name: "", description: "", categoryId: "", photos: [] }]);
  }

  function removeItem(i: number) {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, j) => j !== i));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const filled = items.filter((it) => it.name.trim());
    if (filled.length === 0) {
      setError("Add at least one item with a name.");
      return;
    }
    if (locationIds.length === 0) {
      setError("Select at least one campus location.");
      return;
    }
    if (!contactName.trim() || !contactPhone.trim()) {
      setError("Contact name and phone are required.");
      return;
    }
    const digits = normalizePhoneDigits(contactPhone);
    if (digits.length !== 11 || !digits.startsWith("01")) {
      setError("Enter a valid Bangladesh mobile number (01XXXXXXXXX).");
      return;
    }
    let altDigits = "";
    if (alternatePhone.trim()) {
      altDigits = normalizePhoneDigits(alternatePhone);
      if (altDigits.length !== 11 || !altDigits.startsWith("01")) {
        setError("Alternate phone must be a valid Bangladesh mobile number.");
        return;
      }
    }

    const payloadItems = filled.map((it) => ({
      name: it.name.trim(),
      description: it.description.trim() || undefined,
      category: it.categoryId || undefined,
      images: it.photos.map((p) => ({
        url: p.url,
        key: p.key || `k-${p.url.slice(-20)}`,
        size: Math.max(1, p.size || 1),
      })),
    }));

    const payload = {
      items: payloadItems,
      location: locationIds,
      lastSeenDate: lastSeenDate ? new Date(lastSeenDate + "T12:00:00.000Z").toISOString() : undefined,
      lastSeenTime: lastSeenTime.trim() || undefined,
      contactName: contactName.trim(),
      contactPhone: buildApiPhone(digits),
      alternateContactPhone: altDigits ? buildApiPhone(altDigits) : undefined,
      contactEmail: contactEmail.trim() || undefined,
      rewardAmount:
        postType === "Lost" && rewardAmount.trim()
          ? Math.max(0, Number(rewardAmount) || 0)
          : undefined,
      type: postType,
    };

    setSubmitting(true);
    const res = await createLostFoundAction(payload);
    setSubmitting(false);
    if (!res.success) {
      setError(res.message ?? "Failed to create post.");
      return;
    }
    router.push("/my-lost-found");
  }

  return (
    <div className="space-y-5">
      <div>
        <Link href="/my-lost-found" className="text-sm font-medium text-gray-500 hover:text-gray-900">
          ← My posts
        </Link>
        <h1 className="mt-2 text-xl font-bold text-gray-900">New Lost & Found post</h1>
        <p className="mt-1 text-sm text-gray-500">Up to {MAX_ITEMS} items per post. Add photos and campus locations.</p>
      </div>

      {loadMeta ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : (
        <form onSubmit={(ev) => void onSubmit(ev)} className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm sm:p-6">
          {error ? (
            <p className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          ) : null}

          <div className="mb-6 flex flex-wrap gap-2">
            {(["Lost", "Found"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setPostType(t)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                  postType === t ? "bg-[#E30B12] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="space-y-8">
            {items.map((it, idx) => (
              <div key={idx} className="rounded-xl border border-gray-100 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800">Item {idx + 1}</span>
                  {items.length > 1 ? (
                    <button type="button" onClick={() => removeItem(idx)} className="text-xs font-semibold text-red-600 hover:underline">
                      Remove
                    </button>
                  ) : null}
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div>
                    <label className={labelClass}>Name</label>
                    <input
                      required={idx === 0}
                      value={it.name}
                      onChange={(e) =>
                        setItems((prev) => prev.map((row, i) => (i === idx ? { ...row, name: e.target.value } : row)))
                      }
                      className={`${inputClass} mt-1`}
                      placeholder="e.g. Black backpack"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Category</label>
                    <select
                      value={it.categoryId}
                      onChange={(e) =>
                        setItems((prev) => prev.map((row, i) => (i === idx ? { ...row, categoryId: e.target.value } : row)))
                      }
                      className={`${inputClass} mt-1`}
                    >
                      <option value="">Optional</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="lg:col-span-2">
                    <label className={labelClass}>Description</label>
                    <textarea
                      value={it.description}
                      onChange={(e) =>
                        setItems((prev) => prev.map((row, i) => (i === idx ? { ...row, description: e.target.value } : row)))
                      }
                      rows={3}
                      className={`${inputClass} mt-1 resize-y`}
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <p className={labelClass}>Photos ({it.photos.length}/{MAX_PHOTOS_PER_ITEM})</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {it.photos.map((p, pi) => (
                        <div key={`${p.key}-${pi}`} className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200">
                          <Image src={p.url} alt="" fill className="object-cover" sizes="80px" unoptimized={shouldUnoptimizeRemoteImage(p.url)} />
                          <button
                            type="button"
                            onClick={() =>
                              setItems((prev) =>
                                prev.map((row, i) =>
                                  i === idx ? { ...row, photos: row.photos.filter((_, j) => j !== pi) } : row,
                                ),
                              )
                            }
                            className="absolute right-0.5 top-0.5 rounded bg-black/60 px-1 text-[10px] text-white"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <label className="mt-2 inline-flex cursor-pointer rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-600 hover:border-[#E30B12]">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="sr-only"
                        disabled={uploadingIdx === idx || it.photos.length >= MAX_PHOTOS_PER_ITEM}
                        onChange={(e) => void onPickItemPhotos(idx, e.target.files)}
                      />
                      {uploadingIdx === idx ? "Uploading…" : "Add photos"}
                    </label>
                  </div>
                </div>
              </div>
            ))}
            {items.length < MAX_ITEMS ? (
              <button type="button" onClick={addItem} className="text-sm font-semibold text-[#E30B12] hover:underline">
                + Add another item
              </button>
            ) : null}
          </div>

          <div className="mt-8 border-t border-gray-100 pt-6">
            <h2 className="text-sm font-semibold text-gray-900">Where & when</h2>
            <p className="mt-1 text-xs text-gray-500">Pick one or more spots on campus (required).</p>
            <div className="mt-3 max-h-48 space-y-2 overflow-y-auto rounded-lg border border-gray-100 p-3">
              {locations.length === 0 ? (
                <p className="text-sm text-amber-800">No locations loaded. Select a campus in the header.</p>
              ) : (
                locations.map((loc) => (
                  <label key={loc._id} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={locationIds.includes(loc._id)}
                      onChange={() => toggleLocation(loc._id)}
                      className="rounded border-gray-300 text-[#E30B12] focus:ring-[#E30B12]"
                    />
                    {loc.name ?? loc._id}
                  </label>
                ))
              )}
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Last seen date</label>
                <input type="date" value={lastSeenDate} onChange={(e) => setLastSeenDate(e.target.value)} className={`${inputClass} mt-1`} />
              </div>
              <div>
                <label className={labelClass}>Last seen time (HH:MM)</label>
                <input
                  type="time"
                  value={lastSeenTime}
                  onChange={(e) => setLastSeenTime(e.target.value)}
                  className={`${inputClass} mt-1`}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-6">
            <h2 className="text-sm font-semibold text-gray-900">Contact</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Name</label>
                <input required value={contactName} onChange={(e) => setContactName(e.target.value)} className={`${inputClass} mt-1`} />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input required type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className={`${inputClass} mt-1`} />
              </div>
              <div>
                <label className={labelClass}>Alternate phone</label>
                <input type="tel" value={alternatePhone} onChange={(e) => setAlternatePhone(e.target.value)} className={`${inputClass} mt-1`} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className={`${inputClass} mt-1`} />
              </div>
            </div>
            {postType === "Lost" ? (
              <div className="mt-4">
                <label className={labelClass}>Reward (৳, optional)</label>
                <input
                  type="number"
                  min={0}
                  value={rewardAmount}
                  onChange={(e) => setRewardAmount(e.target.value)}
                  className={`${inputClass} mt-1 max-w-xs`}
                />
              </div>
            ) : null}
          </div>

          <div className="mt-8 flex flex-wrap gap-3 border-t border-gray-100 pt-5">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[#E30B12] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {submitting ? "Publishing…" : "Publish"}
            </button>
            <Link href="/my-lost-found" className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Cancel
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
