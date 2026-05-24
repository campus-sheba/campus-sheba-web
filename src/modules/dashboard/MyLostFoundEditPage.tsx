"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/navigation";
import { useAppState } from "@/contexts/AppStateContext";
import { uploadMediaFiles, type UploadedMediaMeta } from "@/lib/media/client";
import { deleteLostFoundAction, updateLostFoundAction } from "@/services/lost-and-found";
import { fetchUserCategoriesByType } from "@/services/books";
import { fetchUniversityLocationsAction } from "@/services/university-locations";
import type { BuySellCategory } from "@/types/buy-sell";
import type { LostFoundPost } from "@/types/lost-and-found";
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

function locationIdsFromPost(post: LostFoundPost): string[] {
  return (post.location ?? [])
    .map((l) => (typeof l === "string" ? l : l._id))
    .filter(Boolean) as string[];
}

type ItemDraft = {
  name: string;
  description: string;
  categoryId: string;
  photos: UploadedMediaMeta[];
};

function itemsFromPost(post: LostFoundPost): ItemDraft[] {
  if (post.items && post.items.length > 0) {
    return post.items.map((it) => ({
      name: it.name,
      description: it.description ?? "",
      categoryId: typeof it.category === "string" ? it.category : "",
      photos: (it.images ?? []).map((im) => ({
        url: im.url,
        key: im.key ?? im._id ?? "",
        size: Math.max(1, im.size ?? 1),
      })),
    }));
  }
  return [
    {
      name: post.title ?? "",
      description: post.description ?? "",
      categoryId: typeof post.category === "string" ? post.category : "",
      photos: (post.image ?? []).map((im) => ({
        url: im.url,
        key: im.key ?? im._id ?? "",
        size: Math.max(1, im.size ?? 1),
      })),
    },
  ];
}

type Props = { post: LostFoundPost };

export default function MyLostFoundEditPage({ post }: Props) {
  const router = useRouter();
  const postId = post._id;
  const { state } = useAppState();
  const universityId = state.university.selected?._id ?? state.user.profile?.university?._id;

  const [categories, setCategories] = useState<BuySellCategory[]>([]);
  const [locations, setLocations] = useState<{ _id: string; name?: string }[]>([]);
  const [loadMeta, setLoadMeta] = useState(true);

  const [items, setItems] = useState<ItemDraft[]>(() => itemsFromPost(post));
  const [locationIds, setLocationIds] = useState<string[]>(() => locationIdsFromPost(post));
  const [lastSeenDate, setLastSeenDate] = useState(
    post.lastSeenDate ? post.lastSeenDate.slice(0, 10) : "",
  );
  const [lastSeenTime, setLastSeenTime] = useState(post.lastSeenTime ?? "");
  const [contactName, setContactName] = useState(post.contactName ?? "");
  const [contactPhone, setContactPhone] = useState(post.contactPhone ?? "");
  const [alternatePhone, setAlternatePhone] = useState(post.alternateContactPhone ?? "");
  const [contactEmail, setContactEmail] = useState(post.contactEmail ?? "");
  const [rewardAmount, setRewardAmount] = useState(
    post.rewardAmount != null ? String(post.rewardAmount) : "",
  );

  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
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
      setError("Enter a valid Bangladesh mobile number.");
      return;
    }
    let altDigits = "";
    if (alternatePhone.trim()) {
      altDigits = normalizePhoneDigits(alternatePhone);
      if (altDigits.length !== 11 || !altDigits.startsWith("01")) {
        setError("Alternate phone invalid.");
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
        post.type === "Lost" && rewardAmount.trim()
          ? Math.max(0, Number(rewardAmount) || 0)
          : undefined,
    };

    setSubmitting(true);
    const res = await updateLostFoundAction(postId, payload);
    setSubmitting(false);
    if (!res.success) {
      setError(res.message ?? "Update failed.");
      return;
    }
    router.push(`/lost-found/${postId}`);
  }

  async function onDelete() {
    setDeleting(true);
    const res = await deleteLostFoundAction(postId);
    setDeleting(false);
    if (!res.success) {
      setError(res.message);
      return;
    }
    setDeleteOpen(false);
    router.push("/my-lost-found");
  }

  return (
    <div className="space-y-5">
      <div>
        <Link href="/my-lost-found" className="text-sm font-medium text-gray-500 hover:text-gray-900">
          ← My posts
        </Link>
        <h1 className="mt-2 text-xl font-bold text-gray-900">Edit post</h1>
      </div>

      {loadMeta ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : (
        <form onSubmit={(ev) => void onSubmit(ev)} className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm sm:p-6">
          {error ? (
            <p className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          ) : null}

          <p className="mb-4 text-xs text-gray-500">
            Type is set when you created the post ({post.type}). Contact support if you need to change it.
          </p>

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
            <h2 className="text-sm font-semibold text-gray-900">Locations</h2>
            <div className="mt-3 max-h-48 space-y-2 overflow-y-auto rounded-lg border border-gray-100 p-3">
              {locations.map((loc) => (
                <label key={loc._id} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={locationIds.includes(loc._id)}
                    onChange={() => toggleLocation(loc._id)}
                    className="rounded border-gray-300 text-[#E30B12] focus:ring-[#E30B12]"
                  />
                  {loc.name ?? loc._id}
                </label>
              ))}
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Last seen date</label>
                <input type="date" value={lastSeenDate} onChange={(e) => setLastSeenDate(e.target.value)} className={`${inputClass} mt-1`} />
              </div>
              <div>
                <label className={labelClass}>Last seen time</label>
                <input type="time" value={lastSeenTime} onChange={(e) => setLastSeenTime(e.target.value)} className={`${inputClass} mt-1`} />
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
            {post.type === "Lost" ? (
              <div className="mt-4">
                <label className={labelClass}>Reward (৳)</label>
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

          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-5">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[#E30B12] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {submitting ? "Saving…" : "Save"}
            </button>
            <Link href={`/lost-found/${postId}`} className="text-sm font-semibold text-[#E30B12] hover:underline">
              View public page
            </Link>
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="ml-auto text-sm font-semibold text-red-600 hover:underline"
            >
              Delete post
            </button>
          </div>
        </form>
      )}

      {deleteOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-5 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-900">Delete this post?</h2>
            <p className="mt-2 text-sm text-gray-600">This cannot be undone.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setDeleteOpen(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold">
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => void onDelete()}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
