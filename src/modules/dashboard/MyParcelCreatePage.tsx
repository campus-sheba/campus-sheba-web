"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/navigation";
import { useAppState } from "@/contexts/AppStateContext";
import { uploadMediaFiles, type UploadedMediaMeta } from "@/lib/media/client";
import { createParcelAction, estimateParcelAction } from "@/services/parcel";
import { fetchUniversityLocationsAction } from "@/services/university-locations";
import type { ParcelPaymentMethod, ParcelSize } from "@/types/parcel";
import { MediaFeatureName } from "@/types/media";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";

const SIZES: ParcelSize[] = ["Small", "Medium", "Large"];
const PAY: ParcelPaymentMethod[] = ["Cash on Delivery", "Wallet", "Online"];

const MAX_PHOTOS = 5;

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

export default function MyParcelCreatePage() {
  const router = useRouter();
  const { state } = useAppState();
  const universityId = state.university.selected?._id ?? state.user.profile?.university?._id;

  const [locations, setLocations] = useState<{ _id: string; name?: string }[]>([]);
  const [loadMeta, setLoadMeta] = useState(true);

  const [pickupLocation, setPickupLocation] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [pickupDetails, setPickupDetails] = useState("");
  const [deliveryDetails, setDeliveryDetails] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [size, setSize] = useState<ParcelSize>("Small");
  const [estimatedWeight, setEstimatedWeight] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<ParcelPaymentMethod>("Cash on Delivery");
  const [codAmount, setCodAmount] = useState("");

  const [photos, setPhotos] = useState<UploadedMediaMeta[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [estimateJson, setEstimateJson] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setLoadMeta(true);
      try {
        const locs = universityId ? await fetchUniversityLocationsAction(universityId) : [];
        setLocations(locs);
      } finally {
        setLoadMeta(false);
      }
    })();
  }, [universityId]);

  async function onPickPhotos(files: FileList | null) {
    if (!files?.length) return;
    const remain = MAX_PHOTOS - photos.length;
    if (remain <= 0) return;
    const slice = Array.from(files).slice(0, remain);
    setUploadingPhotos(true);
    const res = await uploadMediaFiles(slice, MediaFeatureName.MISC);
    setUploadingPhotos(false);
    if (!res.success || !res.files?.length) {
      setError(res.message ?? "Upload failed.");
      return;
    }
    setPhotos((prev) => [...prev, ...res.files!].slice(0, MAX_PHOTOS));
  }

  async function onEstimate() {
    setError(null);
    if (!pickupLocation || !deliveryLocation) {
      setError("Select pickup and delivery locations first.");
      return;
    }
    const res = await estimateParcelAction({
      pickupLocation,
      deliveryLocation,
      size,
      estimatedWeight: estimatedWeight.trim() || undefined,
    });
    if (!res.success) {
      setError(res.message ?? "Estimate failed.");
      setEstimateJson(null);
      return;
    }
    try {
      setEstimateJson(JSON.stringify(res.data, null, 2));
    } catch {
      setEstimateJson(String(res.data));
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!pickupLocation || !deliveryLocation) {
      setError("Select pickup and delivery locations.");
      return;
    }
    if (!pickupDetails.trim() || !deliveryDetails.trim()) {
      setError("Pickup and delivery details are required.");
      return;
    }
    if (!recipientName.trim() || !recipientPhone.trim()) {
      setError("Recipient name and phone are required.");
      return;
    }
    const digits = normalizePhoneDigits(recipientPhone);
    if (digits.length !== 11 || !digits.startsWith("01")) {
      setError("Recipient phone must be a valid Bangladesh mobile number.");
      return;
    }

    const payload = {
      pickupLocation,
      pickupDetails: pickupDetails.trim(),
      deliveryLocation,
      deliveryDetails: deliveryDetails.trim(),
      recipientName: recipientName.trim(),
      recipientPhone: buildApiPhone(digits),
      size,
      estimatedWeight: estimatedWeight.trim() || undefined,
      description: description.trim() || undefined,
      photos: photos.map((p) => ({
        url: p.url,
        key: p.key || `k-${p.url.slice(-20)}`,
        size: Math.max(1, p.size || 1),
      })),
      paymentMethod,
      codAmount:
        paymentMethod === "Cash on Delivery" && codAmount.trim()
          ? Math.max(0, Number(codAmount) || 0)
          : undefined,
    };

    setSubmitting(true);
    const res = await createParcelAction(payload);
    setSubmitting(false);
    if (!res.success) {
      setError(res.message ?? "Booking failed.");
      return;
    }
    if (res.parcelId) {
      router.push(`/my-parcels/${res.parcelId}`);
    } else {
      router.push("/my-parcels");
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <Link href="/my-parcels" className="text-sm font-medium text-gray-500 hover:text-gray-900">
          ← My parcels
        </Link>
        <h1 className="mt-2 text-xl font-bold text-gray-900">Book a parcel</h1>
        <p className="mt-1 text-sm text-gray-500">Campus pickup and delivery between university locations.</p>
      </div>

      {loadMeta ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : (
        <form onSubmit={(ev) => void onSubmit(ev)} className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm sm:p-6">
          {error ? (
            <p className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          ) : null}

          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <label className={labelClass}>Pickup location</label>
              <select
                required
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                className={`${inputClass} mt-1`}
              >
                <option value="">Select</option>
                {locations.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.name ?? l._id}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Delivery location</label>
              <select
                required
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
                className={`${inputClass} mt-1`}
              >
                <option value="">Select</option>
                {locations.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.name ?? l._id}
                  </option>
                ))}
              </select>
            </div>
            <div className="lg:col-span-2">
              <label className={labelClass}>Pickup details (room, gate, etc.)</label>
              <input
                required
                value={pickupDetails}
                onChange={(e) => setPickupDetails(e.target.value)}
                className={`${inputClass} mt-1`}
                placeholder="e.g. Hall A, Room 205"
              />
            </div>
            <div className="lg:col-span-2">
              <label className={labelClass}>Delivery details</label>
              <input
                required
                value={deliveryDetails}
                onChange={(e) => setDeliveryDetails(e.target.value)}
                className={`${inputClass} mt-1`}
                placeholder="e.g. Library 2nd floor"
              />
            </div>
            <div>
              <label className={labelClass}>Recipient name</label>
              <input required value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className={`${inputClass} mt-1`} />
            </div>
            <div>
              <label className={labelClass}>Recipient phone</label>
              <input required type="tel" value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} className={`${inputClass} mt-1`} />
            </div>
            <div>
              <label className={labelClass}>Size</label>
              <select value={size} onChange={(e) => setSize(e.target.value as ParcelSize)} className={`${inputClass} mt-1`}>
                {SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Estimated weight</label>
              <input
                value={estimatedWeight}
                onChange={(e) => setEstimatedWeight(e.target.value)}
                className={`${inputClass} mt-1`}
                placeholder="e.g. 2kg"
              />
            </div>
            <div className="lg:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={`${inputClass} mt-1 resize-y`} />
            </div>
            <div>
              <label className={labelClass}>Payment</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as ParcelPaymentMethod)}
                className={`${inputClass} mt-1`}
              >
                {PAY.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            {paymentMethod === "Cash on Delivery" ? (
              <div>
                <label className={labelClass}>COD amount (৳)</label>
                <input
                  type="number"
                  min={0}
                  value={codAmount}
                  onChange={(e) => setCodAmount(e.target.value)}
                  className={`${inputClass} mt-1`}
                />
              </div>
            ) : null}
          </div>

          <div className="mt-6">
            <p className={labelClass}>Photos ({photos.length}/{MAX_PHOTOS})</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {photos.map((p, i) => (
                <div key={`${p.key}-${i}`} className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200">
                  <Image src={p.url} alt="" fill className="object-cover" sizes="80px" unoptimized={shouldUnoptimizeRemoteImage(p.url)} />
                  <button
                    type="button"
                    onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
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
                disabled={uploadingPhotos || photos.length >= MAX_PHOTOS}
                onChange={(e) => void onPickPhotos(e.target.files)}
              />
              {uploadingPhotos ? "Uploading…" : "Add photos"}
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 border-t border-gray-100 pt-5">
            <button
              type="button"
              onClick={() => void onEstimate()}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50"
            >
              Get price estimate
            </button>
            {estimateJson ? (
              <pre className="max-h-32 max-w-full flex-1 overflow-auto rounded-lg bg-gray-50 p-3 text-xs text-gray-700">{estimateJson}</pre>
            ) : null}
          </div>

          <div className="mt-6 flex flex-wrap gap-3 border-t border-gray-100 pt-5">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[#E30B12] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {submitting ? "Booking…" : "Book parcel"}
            </button>
            <Link href="/my-parcels" className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Cancel
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
