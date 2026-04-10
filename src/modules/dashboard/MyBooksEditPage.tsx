"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/navigation";
import { useAppState } from "@/contexts/AppStateContext";
import { uploadMediaFiles, type UploadedMediaMeta } from "@/lib/media/client";
import { pickDefaultBookAddressId } from "@/modules/cart/deliveryAddress";
import { deleteBookAction, fetchBookCategories, updateBookAction } from "@/services/books";
import { getAddressesAction } from "@/services/addresses";
import { getUniversityMetadataAction } from "@/services/user";
import type { BookListing, BookQuality, UpdateBookPayload } from "@/types/book";
import type { BuySellCategory } from "@/types/buy-sell";
import type { UserAddress } from "@/types/address";
import { MediaFeatureName } from "@/types/media";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";

const QUALITIES: BookQuality[] = ["New", "Like New", "Good", "Acceptable"];
const MAX_PHOTOS = 5;

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-[#00A651]";
const labelClass = "text-xs font-medium text-gray-500";

function normalizePhoneDigits(value: string): string {
  const onlyDigits = value.replace(/\D/g, "");
  const withoutCountryCode = onlyDigits.startsWith("88") ? onlyDigits.slice(2) : onlyDigits;
  return withoutCountryCode.slice(0, 11);
}

function buildApiPhone(digits: string): string {
  if (digits.length === 11 && digits.startsWith("01")) {
    return `+88${digits}`;
  }
  return digits.replace(/\s/g, "");
}

function categoryIdFromBook(book: BookListing): string {
  const c = book.category;
  if (!c) return "";
  if (typeof c === "string") return c;
  return c._id ?? "";
}

function departmentIdFromBook(book: BookListing): string {
  const d = book.department;
  if (!d) return "";
  if (typeof d === "string") return d;
  return d._id ?? "";
}

function addressIdFromBook(book: BookListing): string {
  const a = book.address;
  if (!a) return "";
  if (typeof a === "string") return a;
  return a._id ?? "";
}

function photosToMeta(book: BookListing): UploadedMediaMeta[] {
  return (book.photos ?? []).map((p) => ({
    url: p.url,
    key: p.key ?? p._id ?? "",
    size: Math.max(1, p.size ?? 1),
  }));
}

type Props = {
  book: BookListing;
};

export default function MyBooksEditPage({ book }: Props) {
  const router = useRouter();
  const bookId = book._id;
  const { state } = useAppState();
  const universityId = state.university.selected?._id ?? state.user.profile?.university?._id;

  const [categories, setCategories] = useState<BuySellCategory[]>([]);
  const [departments, setDepartments] = useState<{ _id: string; name: string; code?: string }[]>([]);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loadMeta, setLoadMeta] = useState(true);

  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author ?? "");
  const [edition, setEdition] = useState(book.edition ?? "");
  const [categoryId, setCategoryId] = useState(() => categoryIdFromBook(book));
  const [departmentId, setDepartmentId] = useState(() => departmentIdFromBook(book));
  const [subject, setSubject] = useState(book.subject ?? "");
  const [buyingYear, setBuyingYear] = useState(book.buyingYear ?? "");
  const [publisher, setPublisher] = useState(book.publisher ?? "");
  const [quality, setQuality] = useState<BookQuality>(() => (book.quality as BookQuality) ?? "Good");
  const [description, setDescription] = useState(book.description ?? "");

  const [price, setPrice] = useState(String(book.price ?? ""));
  const [discountPrice, setDiscountPrice] = useState(
    book.discountPrice != null ? String(book.discountPrice) : "",
  );
  const [quantity, setQuantity] = useState(String(book.quantity ?? 1));
  const [safekeepingCharge, setSafekeepingCharge] = useState(
    book.safekeepingCharge != null ? String(book.safekeepingCharge) : "",
  );
  const [borrowDuration, setBorrowDuration] = useState(String(book.borrowDuration ?? 14));
  const [maxExtensionDuration, setMaxExtensionDuration] = useState(
    String(book.maxExtensionDuration ?? 7),
  );
  const [allowsExtension, setAllowsExtension] = useState(book.allowsExtension ?? false);

  const [contactName, setContactName] = useState(book.contactName ?? "");
  const [contactPhone, setContactPhone] = useState(book.contactPhone ?? "");
  const [contactEmail, setContactEmail] = useState(book.contactEmail ?? "");
  const [addressId, setAddressId] = useState(() => addressIdFromBook(book));

  const [photos, setPhotos] = useState<UploadedMediaMeta[]>(() => photosToMeta(book));
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listingType = book.type;

  useEffect(() => {
    void (async () => {
      setLoadMeta(true);
      setError(null);
      try {
        const [catRes, addrRes, meta] = await Promise.all([
          fetchBookCategories(),
          getAddressesAction(),
          universityId ? getUniversityMetadataAction(universityId) : Promise.resolve(null),
        ]);
        setCategories(catRes.data ?? []);
        const list = addrRes.data ?? [];
        setAddresses(list);
        setAddressId((prev) => {
          if (prev) return prev;
          return pickDefaultBookAddressId(list) || "";
        });
        if (meta && meta.success) {
          setDepartments(meta.departments ?? []);
        } else {
          setDepartments([]);
        }
      } catch {
        setError("Could not load categories or addresses.");
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
    setError(null);
    const res = await uploadMediaFiles(slice, MediaFeatureName.BOOK);
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
    if (!departmentId) {
      setError("Choose a department.");
      return;
    }
    if (!addressId) {
      setError("Choose a pickup address.");
      return;
    }
    if (!buyingYear.trim()) {
      setError("Buying year is required.");
      return;
    }
    if (!description.trim()) {
      setError("Description is required.");
      return;
    }
    if (!contactName.trim() || !contactPhone.trim()) {
      setError("Contact name and phone are required.");
      return;
    }
    const digits = normalizePhoneDigits(contactPhone);
    if (digits.length !== 11 || !digits.startsWith("01")) {
      setError("Enter a valid Bangladesh mobile number (11 digits, e.g. 017XXXXXXXX).");
      return;
    }
    const apiPhone = buildApiPhone(digits);

    const qty = Math.max(1, Math.floor(Number(quantity) || 1));
    if (photos.length === 0) {
      setError("Add at least one photo.");
      return;
    }

    const photoPayload = photos.map((p) => ({
      url: p.url,
      key: p.key || `k-${p.url.slice(-24)}`,
      size: Math.max(1, p.size || 1),
    }));

    const payload: UpdateBookPayload = {
      addressId,
      title: title.trim(),
      photos: photoPayload,
      category: categoryId,
      buyingYear: buyingYear.trim(),
      description: description.trim(),
      type: listingType,
      department: departmentId,
      contactName: contactName.trim(),
      contactPhone: apiPhone,
      contactEmail: contactEmail.trim() || undefined,
      quality,
      quantity: qty,
      ...(author.trim() ? { author: author.trim() } : {}),
      ...(edition.trim() ? { edition: edition.trim() } : {}),
      ...(subject.trim() ? { subject: subject.trim() } : {}),
      ...(publisher.trim() ? { publisher: publisher.trim() } : {}),
    };

    if (listingType === "Donation") {
      payload.price = 0;
    } else {
      const priceNum = Number(price);
      if (!Number.isFinite(priceNum) || priceNum < 0) {
        setError("Enter a valid price.");
        return;
      }
      payload.price = priceNum;
      if (listingType === "Selling" && discountPrice.trim()) {
        const d = Number(discountPrice);
        if (Number.isFinite(d) && d >= 0 && d < priceNum) {
          payload.discountPrice = d;
        }
      }
    }

    if (listingType === "Lending") {
      payload.borrowDuration = Math.max(1, Math.floor(Number(borrowDuration) || 14));
      payload.maxExtensionDuration = Math.max(0, Math.floor(Number(maxExtensionDuration) || 0));
      payload.allowsExtension = allowsExtension;
      if (safekeepingCharge.trim()) {
        const sk = Number(safekeepingCharge);
        if (Number.isFinite(sk) && sk >= 0) payload.safekeepingCharge = sk;
      }
    }

    setSubmitting(true);
    const res = await updateBookAction(bookId, payload);
    setSubmitting(false);

    if (!res.success) {
      setError(res.message ?? "Failed to update.");
      return;
    }
    router.push(`/books/${bookId}`);
  }

  async function onConfirmDelete() {
    setDeleting(true);
    setError(null);
    const res = await deleteBookAction(bookId);
    setDeleting(false);
    if (!res.success) {
      setError(res.message);
      return;
    }
    setDeleteOpen(false);
    router.push("/my-books");
  }

  return (
    <div className="space-y-5">
      <div>
        <Link href="/my-books" className="text-sm font-medium text-gray-500 transition hover:text-gray-900">
          ← My books
        </Link>
        <h1 className="mt-2 text-xl font-bold tracking-tight text-gray-900">Edit listing</h1>
        <p className="mt-1 text-sm text-gray-500">
          {listingType === "Selling" && "Selling"}
          {listingType === "Lending" && "Lending"}
          {listingType === "Donation" && "Donation"}
          {listingType ? " · " : ""}
          {title}
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
            <p className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          ) : null}

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className={labelClass} htmlFor="ebk-title">
                  Title
                </label>
                <input
                  id="ebk-title"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`${inputClass} mt-1`}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="ebk-author">
                    Author
                  </label>
                  <input
                    id="ebk-author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className={`${inputClass} mt-1`}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="ebk-edition">
                    Edition
                  </label>
                  <input
                    id="ebk-edition"
                    value={edition}
                    onChange={(e) => setEdition(e.target.value)}
                    className={`${inputClass} mt-1`}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass} htmlFor="ebk-cat">
                  Category
                </label>
                <select
                  id="ebk-cat"
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
              <div>
                <label className={labelClass} htmlFor="ebk-dept">
                  Department
                </label>
                <select
                  id="ebk-dept"
                  required
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className={`${inputClass} mt-1`}
                >
                  <option value="">Select department</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.code ? `${d.name} (${d.code})` : d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="ebk-subject">
                    Subject
                  </label>
                  <input
                    id="ebk-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className={`${inputClass} mt-1`}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="ebk-year">
                    Buying year
                  </label>
                  <input
                    id="ebk-year"
                    required
                    value={buyingYear}
                    onChange={(e) => setBuyingYear(e.target.value)}
                    className={`${inputClass} mt-1`}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass} htmlFor="ebk-publisher">
                  Publisher
                </label>
                <input
                  id="ebk-publisher"
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  className={`${inputClass} mt-1`}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="ebk-quality">
                    Condition
                  </label>
                  <select
                    id="ebk-quality"
                    value={quality}
                    onChange={(e) => setQuality(e.target.value as BookQuality)}
                    className={`${inputClass} mt-1`}
                  >
                    {QUALITIES.map((q) => (
                      <option key={q} value={q}>
                        {q}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass} htmlFor="ebk-qty">
                    Quantity
                  </label>
                  <input
                    id="ebk-qty"
                    type="number"
                    min={1}
                    step={1}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className={`${inputClass} mt-1`}
                  />
                </div>
              </div>

              {listingType === "Selling" ? (
                <>
                  <div>
                    <label className={labelClass} htmlFor="ebk-price">
                      Price (৳)
                    </label>
                    <input
                      id="ebk-price"
                      type="number"
                      min={0}
                      step={1}
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className={`${inputClass} mt-1`}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="ebk-discount">
                      Discount price (৳, optional)
                    </label>
                    <input
                      id="ebk-discount"
                      type="number"
                      min={0}
                      step={1}
                      value={discountPrice}
                      onChange={(e) => setDiscountPrice(e.target.value)}
                      className={`${inputClass} mt-1`}
                    />
                  </div>
                </>
              ) : null}

              {listingType === "Lending" ? (
                <>
                  <div>
                    <label className={labelClass} htmlFor="ebk-lend-price">
                      Fee / deposit (৳)
                    </label>
                    <input
                      id="ebk-lend-price"
                      type="number"
                      min={0}
                      step={1}
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className={`${inputClass} mt-1`}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass} htmlFor="ebk-borrow">
                        Borrow duration (days)
                      </label>
                      <input
                        id="ebk-borrow"
                        type="number"
                        min={1}
                        step={1}
                        value={borrowDuration}
                        onChange={(e) => setBorrowDuration(e.target.value)}
                        className={`${inputClass} mt-1`}
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="ebk-max-ext">
                        Max extension (days)
                      </label>
                      <input
                        id="ebk-max-ext"
                        type="number"
                        min={0}
                        step={1}
                        value={maxExtensionDuration}
                        onChange={(e) => setMaxExtensionDuration(e.target.value)}
                        className={`${inputClass} mt-1`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="ebk-safe">
                      Safekeeping charge (৳, optional)
                    </label>
                    <input
                      id="ebk-safe"
                      type="number"
                      min={0}
                      step={1}
                      value={safekeepingCharge}
                      onChange={(e) => setSafekeepingCharge(e.target.value)}
                      className={`${inputClass} mt-1`}
                    />
                  </div>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={allowsExtension}
                      onChange={(e) => setAllowsExtension(e.target.checked)}
                      className="rounded border-gray-300 text-[#00A651] focus:ring-[#00A651]"
                    />
                    Borrower may request an extension
                  </label>
                </>
              ) : null}

              {listingType === "Donation" ? (
                <p className="text-sm text-gray-500">Donation listings are free (৳0).</p>
              ) : null}
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelClass} htmlFor="ebk-address">
                  Pickup address
                </label>
                <select
                  id="ebk-address"
                  required
                  value={addressId}
                  onChange={(e) => setAddressId(e.target.value)}
                  className={`${inputClass} mt-1`}
                >
                  <option value="">Select address</option>
                  {addresses.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.address} ({a.type})
                      {a.isDefault ? " — default" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="ebk-desc">
                  Description
                </label>
                <textarea
                  id="ebk-desc"
                  required
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`${inputClass} mt-1 resize-y`}
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
                        alt="Book photo"
                        fill
                        className="object-cover"
                        sizes="80px"
                        unoptimized={shouldUnoptimizeRemoteImage(p.url)}
                      />
                      <button
                        type="button"
                        onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
                        className="absolute right-0.5 top-0.5 rounded bg-black/60 px-1 text-[10px] font-bold text-white"
                        aria-label="Remove photo"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <label className="mt-2 inline-flex cursor-pointer items-center rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:border-[#00A651] hover:text-[#00A651]">
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
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Contact</p>
                <div className="mt-3 space-y-3">
                  <div>
                    <label className={labelClass} htmlFor="ebk-cname">
                      Name
                    </label>
                    <input
                      id="ebk-cname"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className={`${inputClass} mt-1`}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="ebk-cphone">
                      Phone
                    </label>
                    <input
                      id="ebk-cphone"
                      required
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className={`${inputClass} mt-1`}
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="ebk-cemail">
                      Email (optional)
                    </label>
                    <input
                      id="ebk-cemail"
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

          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-5">
            <button
              type="submit"
              disabled={submitting || loadMeta}
              className="rounded-lg bg-[#00A651] px-5 py-2.5 text-sm font-semibold text-white active:brightness-95 disabled:opacity-50"
            >
              {submitting ? "Saving…" : "Save changes"}
            </button>
            <Link
              href={`/books/${bookId}`}
              className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              View public page
            </Link>
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="ml-auto rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
            >
              Delete listing
            </button>
          </div>
        </form>
      )}

      {deleteOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-5 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-900">Delete this book?</h2>
            <p className="mt-2 text-sm text-gray-600">This listing will be removed from the marketplace.</p>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => void onConfirmDelete()}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
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
