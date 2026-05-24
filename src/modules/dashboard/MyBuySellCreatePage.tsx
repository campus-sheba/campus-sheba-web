"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/navigation";
import { useAppState } from "@/contexts/AppStateContext";
import { uploadMediaFiles, type UploadedMediaMeta } from "@/lib/media/client";
import { pickDefaultDeliveryAddressId } from "@/modules/cart/deliveryAddress";
import {
  createBuySellListingAction,
  fetchBuySellCategories,
} from "@/services/buy-sell";
import { getAddressesAction } from "@/services/addresses";
import type { BuySellCategory } from "@/types/buy-sell";
import type { UserAddress } from "@/types/address";
import { MediaFeatureName } from "@/types/media";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";

const CONDITIONS = [
  "New",
  "Used - Like New",
  "Used - Good",
  "Used - Fair",
] as const;
const MAX_PHOTOS = 5;

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-[#E30B12]";
const labelClass = "text-xs font-medium text-gray-500";

export default function MyBuySellCreatePage() {
  const router = useRouter();
  const { state } = useAppState();

  const [categories, setCategories] = useState<BuySellCategory[]>([]);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loadMeta, setLoadMeta] = useState(true);

  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [modelName, setModelName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [condition, setCondition] = useState<string>(CONDITIONS[2]);
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [negotiable, setNegotiable] = useState(true);
  const [description, setDescription] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [addressId, setAddressId] = useState("");

  const [photos, setPhotos] = useState<UploadedMediaMeta[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setLoadMeta(true);
      setError(null);
      try {
        const [catRes, addrRes] = await Promise.all([
          fetchBuySellCategories(),
          getAddressesAction("DELIVERY"),
        ]);
        setCategories(catRes.data ?? []);
        const list = addrRes.data ?? [];
        setAddresses(list);
        const defaultId = pickDefaultDeliveryAddressId(list);
        setAddressId((prev) => prev || defaultId || "");
      } catch {
        setError("Could not load categories or addresses.");
      } finally {
        setLoadMeta(false);
      }
    })();
  }, []);

  useEffect(() => {
    const p = state.user.profile;
    if (!p) return;
    setContactName((prev) => prev || p.name || "");
    setContactPhone((prev) => prev || p.phone || "");
    setContactEmail((prev) => prev || p.email || "");
  }, [state.user.profile]);

  async function onPickPhotos(files: FileList | null) {
    if (!files?.length) return;
    const remain = MAX_PHOTOS - photos.length;
    if (remain <= 0) return;
    const slice = Array.from(files).slice(0, remain);
    setUploadingPhotos(true);
    setError(null);
    const res = await uploadMediaFiles(slice, MediaFeatureName.PRODUCT);
    setUploadingPhotos(false);
    if (!res.success || !res.files?.length) {
      setError(res.message ?? "Photo upload failed.");
      return;
    }
    setPhotos((prev) => [...prev, ...res.files!].slice(0, MAX_PHOTOS));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!categoryId) {
      setError("Choose a category.");
      return;
    }
    if (!addressId) {
      setError("Choose a delivery address or add one in Addresses.");
      return;
    }
    if (!description.trim()) {
      setError("Description is required.");
      return;
    }
    if (!contactName.trim() || !contactPhone.trim() || !contactEmail.trim()) {
      setError("Contact name, phone, and email are required.");
      return;
    }
    const priceNum = Number(price);
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      setError("Enter a valid price.");
      return;
    }
    const qty = Math.max(1, Math.floor(Number(quantity) || 1));
    if (photos.length === 0) {
      setError("Add at least one photo.");
      return;
    }

    setSubmitting(true);
    const res = await createBuySellListingAction({
      title: title.trim(),
      ...(brand.trim() ? { brand: brand.trim() } : {}),
      ...(modelName.trim() ? { modelName: modelName.trim() } : {}),
      addressId,
      photos,
      category: categoryId,
      description: description.trim(),
      contactName: contactName.trim(),
      contactPhone: contactPhone.trim(),
      contactEmail: contactEmail.trim(),
      condition,
      price: priceNum,
      negotiable,
      quantity: qty,
    });
    setSubmitting(false);

    if (!res.success) {
      setError(res.message);
      return;
    }
    if (res.listingId) {
      router.push(`/buy-sell/${res.listingId}`);
    } else {
      router.push("/my-buy-sell");
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/my-buy-sell"
          className="text-sm font-medium text-gray-500 transition hover:text-gray-900"
        >
          ← My listings
        </Link>
        <h1 className="mt-2 text-xl font-bold tracking-tight text-gray-900">
          New listing
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Publish a second-hand item for your campus marketplace.
        </p>
      </div>

      {loadMeta ? (
        <p className="text-sm text-gray-500">Loading form…</p>
      ) : (
        <form
          onSubmit={(ev) => void onSubmit(ev)}
          className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm sm:p-6"
        >
          {error ? (
            <p className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className={labelClass} htmlFor="bs-title">
                  Title
                </label>
                <input
                  id="bs-title"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`${inputClass} mt-1`}
                  placeholder="e.g. Used Laptop HP"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="bs-brand">
                    Brand
                  </label>
                  <input
                    id="bs-brand"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className={`${inputClass} mt-1`}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="bs-model">
                    Model
                  </label>
                  <input
                    id="bs-model"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    className={`${inputClass} mt-1`}
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass} htmlFor="bs-category">
                  Category
                </label>
                <select
                  id="bs-category"
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className={`${inputClass} mt-1`}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="bs-condition">
                    Condition
                  </label>
                  <select
                    id="bs-condition"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className={`${inputClass} mt-1`}
                  >
                    {CONDITIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass} htmlFor="bs-qty">
                    Quantity
                  </label>
                  <input
                    id="bs-qty"
                    type="number"
                    min={1}
                    step={1}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className={`${inputClass} mt-1`}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass} htmlFor="bs-price">
                  Price (৳)
                </label>
                <input
                  id="bs-price"
                  type="number"
                  min={0}
                  step={1}
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={`${inputClass} mt-1`}
                />
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={negotiable}
                  onChange={(e) => setNegotiable(e.target.checked)}
                  className="rounded border-gray-300 text-[#E30B12] focus:ring-[#E30B12]"
                />
                Price is negotiable
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelClass} htmlFor="bs-address">
                  Pickup / delivery address
                </label>
                <select
                  id="bs-address"
                  required
                  value={addressId}
                  onChange={(e) => setAddressId(e.target.value)}
                  className={`${inputClass} mt-1`}
                >
                  <option value="">Select address</option>
                  {addresses.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.address}
                      {a.isDefault ? " (default)" : ""}
                    </option>
                  ))}
                </select>
                {addresses.length === 0 ? (
                  <p className="mt-2 text-xs text-amber-800">
                    No delivery addresses yet.{" "}
                    <Link
                      href="/my-addresses"
                      className="font-semibold text-[#E30B12] underline"
                    >
                      Add one
                    </Link>
                  </p>
                ) : null}
              </div>
              <div>
                <label className={labelClass} htmlFor="bs-desc">
                  Description
                </label>
                <textarea
                  id="bs-desc"
                  required
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`${inputClass} mt-1 resize-y`}
                  placeholder="Condition, accessories, reason for selling…"
                />
              </div>
              <div>
                <p className={labelClass}>
                  Photos ({photos.length}/{MAX_PHOTOS})
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {photos.map((p, i) => (
                    <div
                      key={`${p.key}-${i}`}
                      className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                    >
                      <Image
                        src={p.url}
                        alt="Listing photo"
                        fill
                        className="object-cover"
                        sizes="80px"
                        unoptimized={shouldUnoptimizeRemoteImage(p.url)}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setPhotos((prev) => prev.filter((_, j) => j !== i))
                        }
                        className="absolute right-0.5 top-0.5 rounded bg-black/60 px-1 text-[10px] font-bold text-white"
                        aria-label="Remove photo"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <label className="mt-2 inline-flex cursor-pointer items-center rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:border-[#E30B12] hover:text-[#E30B12]">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    disabled={uploadingPhotos || photos.length >= MAX_PHOTOS}
                    onChange={(e) => void onPickPhotos(e.target.files)}
                  />
                  {uploadingPhotos
                    ? "Uploading…"
                    : photos.length >= MAX_PHOTOS
                      ? "Max photos"
                      : "Add photos"}
                </label>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Buyer contact
                </p>
                <div className="mt-3 space-y-3">
                  <div>
                    <label className={labelClass} htmlFor="bs-cname">
                      Name
                    </label>
                    <input
                      id="bs-cname"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className={`${inputClass} mt-1`}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="bs-cphone">
                      Phone
                    </label>
                    <input
                      id="bs-cphone"
                      required
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className={`${inputClass} mt-1`}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="bs-cemail">
                      Email
                    </label>
                    <input
                      id="bs-cemail"
                      required
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className={`${inputClass} mt-1`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 border-t border-gray-100 pt-5">
            <button
              type="submit"
              disabled={submitting || loadMeta}
              className="rounded-lg bg-[#E30B12] px-5 py-2.5 text-sm font-semibold text-white active:brightness-95 disabled:opacity-50"
            >
              {submitting ? "Publishing…" : "Publish listing"}
            </button>
            <Link
              href="/my-buy-sell"
              className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
