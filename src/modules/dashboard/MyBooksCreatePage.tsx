"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";
import { useAppState } from "@/contexts/AppStateContext";
import { uploadMediaFiles, type UploadedMediaMeta } from "@/lib/media/client";
import { pickDefaultBookAddressId } from "@/modules/cart/deliveryAddress";
import {
  addShelfBookAction,
  createBookListingAction,
  fetchBookCategories,
  type BookCreateMode,
} from "@/services/books";
import { getAddressesAction } from "@/services/addresses";
import { getUniversityMetadataAction } from "@/services/user";
import type { BookQuality, CreateBookPayload, CreateShelfBookPayload } from "@/types/book";
import type { BuySellCategory } from "@/types/buy-sell";
import type { UserAddress } from "@/types/address";
import { MediaFeatureName } from "@/types/media";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";

const QUALITIES: BookQuality[] = ["New", "Like New", "Good", "Acceptable"];
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
  if (digits.length === 11 && digits.startsWith("01")) {
    return `+88${digits}`;
  }
  return digits.replace(/\s/g, "");
}

type ListingMode = BookCreateMode;

const FUTURE_PHASE_MODES = ["lend", "donate", "swap"] as const;
type FuturePhaseMode = (typeof FUTURE_PHASE_MODES)[number];

const MODE_TABS: { mode: ListingMode; label: string; future?: boolean }[] = [
  { mode: "sell", label: "Sell" },
  { mode: "lend", label: "Lend", future: true },
  { mode: "donate", label: "Donate", future: true },
  { mode: "swap", label: "Swap", future: true },
  { mode: "library-only", label: "Showcase" },
];

function isFuturePhaseMode(mode: ListingMode): mode is FuturePhaseMode {
  return (FUTURE_PHASE_MODES as readonly string[]).includes(mode);
}

function resolveInitialMode(value: string | null): ListingMode {
  if (!value) return "sell";
  const normalized = value.toLowerCase();
  // MVP pilot: only Sell + Showcase are selectable. Lend/Donate/Swap stay
  // out of the create form (machinery kept for a later phase).
  const allowed: ListingMode[] = ["sell", "library-only"];
  return allowed.includes(normalized as ListingMode)
    ? (normalized as ListingMode)
    : "sell";
}

const FUTURE_PHASE_LABELS: Record<FuturePhaseMode, string> = {
  lend: "Lending",
  donate: "Donating",
  swap: "Swapping",
};

export default function MyBooksCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state } = useAppState();

  const universityId = state.university.selected?._id ?? state.user.profile?.university?._id;

  const [categories, setCategories] = useState<BuySellCategory[]>([]);
  const [departments, setDepartments] = useState<{ _id: string; name: string; code?: string }[]>([]);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loadMeta, setLoadMeta] = useState(true);

  const [listingMode, setListingMode] = useState<ListingMode>(() =>
    resolveInitialMode(searchParams?.get("mode") ?? null),
  );

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [edition, setEdition] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [subject, setSubject] = useState("");
  const [buyingYear, setBuyingYear] = useState("");
  const [publisher, setPublisher] = useState("");
  const [quality, setQuality] = useState<BookQuality>("Good");
  const [description, setDescription] = useState("");

  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [courseCode, setCourseCode] = useState("");
  const [semester, setSemester] = useState("");
  const [language, setLanguage] = useState("English");

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
        const [catRes, addrRes, meta] = await Promise.all([
          fetchBookCategories(),
          getAddressesAction(),
          universityId ? getUniversityMetadataAction(universityId) : Promise.resolve(null),
        ]);
        setCategories(catRes.data ?? []);
        const list = addrRes.data ?? [];
        setAddresses(list);
        setAddressId((prev) => prev || pickDefaultBookAddressId(list) || "");
        if (meta && meta.success) {
          setDepartments(meta.departments ?? []);
        } else {
          setDepartments([]);
        }
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

    if (isFuturePhaseMode(listingMode)) return;

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
    const isShowcase = listingMode === "library-only";

    if (!isShowcase && !addressId) {
      setError("Choose a pickup address or add one under Addresses.");
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
    let apiPhone = "";
    if (!isShowcase) {
      if (!contactName.trim() || !contactPhone.trim()) {
        setError("Contact name and phone are required.");
        return;
      }
      const digits = normalizePhoneDigits(contactPhone);
      if (digits.length !== 11 || !digits.startsWith("01")) {
        setError("Enter a valid Bangladesh mobile number (11 digits, e.g. 017XXXXXXXX).");
        return;
      }
      apiPhone = buildApiPhone(digits);
    }

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

    if (isShowcase) {
      const shelfPayload: CreateShelfBookPayload = {
        title: title.trim(),
        photos: photoPayload,
        category: categoryId,
        department: departmentId,
        buyingYear: buyingYear.trim(),
        description: description.trim(),
        quality,
        ...(author.trim() ? { author: author.trim() } : {}),
        ...(edition.trim() ? { edition: edition.trim() } : {}),
        ...(subject.trim() ? { subject: subject.trim() } : {}),
        ...(publisher.trim() ? { publisher: publisher.trim() } : {}),
        ...(courseCode.trim() ? { courseCode: courseCode.trim() } : {}),
        ...(semester.trim() ? { semester: semester.trim() } : {}),
        ...(language.trim() ? { language: language.trim() } : {}),
      };
      setSubmitting(true);
      const shelfRes = await addShelfBookAction(shelfPayload);
      setSubmitting(false);
      if (!shelfRes.success) {
        setError(shelfRes.message ?? "Failed to add to shelf.");
        return;
      }
      router.push(shelfRes.bookId ? `/books/${shelfRes.bookId}` : "/my-library");
      return;
    }

    let payload: CreateBookPayload;

    const sharedFields = {
      title: title.trim(),
      addressId: addressId!,
      photos: photoPayload,
      category: categoryId,
      buyingYear: buyingYear.trim(),
      description: description.trim(),
      sellerType: "individual",
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
      ...(courseCode.trim() ? { courseCode: courseCode.trim() } : {}),
      ...(semester.trim() ? { semester: semester.trim() } : {}),
      ...(language.trim() ? { language: language.trim() } : {}),
    };

    const priceNum = Number(price);
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      setError("Enter a valid price.");
      return;
    }
    payload = {
      ...sharedFields,
      type: "Selling",
      price: priceNum,
    };

    if (discountPrice.trim()) {
      const d = Number(discountPrice);
      if (Number.isFinite(d) && d >= 0 && d < priceNum) {
        payload.discountPrice = d;
      }
    }

    setSubmitting(true);
    const res = await createBookListingAction(payload, "sell");
    setSubmitting(false);

    if (!res.success) {
      setError(res.message ?? "Failed to create listing.");
      return;
    }
    if (res.bookId) {
      router.push(`/books/${res.bookId}`);
    } else {
      router.push("/my-books");
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <Link href="/my-books" className="text-sm font-medium text-gray-500 transition hover:text-gray-900">
          ← My books
        </Link>
        <h1 className="mt-2 text-xl font-bold tracking-tight text-gray-900">List a book</h1>
        <p className="mt-1 text-sm text-gray-500">
          Sell books on campus or add showcase titles to your library shelf.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-6 flex flex-wrap gap-2">
          {/* MVP pilot: hide future-phase modes (Lend/Donate/Swap). */}
          {MODE_TABS.filter(({ future }) => !future).map(({ mode, label, future }) => (
            <button
              key={mode}
              type="button"
              onClick={() => {
                setListingMode(mode);
                setError(null);
              }}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                listingMode === mode
                  ? future
                    ? "bg-gray-700 text-white"
                    : "bg-[#E30B12] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {label}
              {future ? (
                <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                  Soon
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {isFuturePhaseMode(listingMode) ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center">
            <p className="text-sm font-semibold text-gray-900">
              {FUTURE_PHASE_LABELS[listingMode]} — coming in a future phase
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
              {listingMode === "lend" &&
                "Book lending (borrow & return on campus) is not available yet. You can sell books or add showcase titles to your library shelf today."}
              {listingMode === "donate" &&
                "Giving books away through Campus Sheba will open in a later release. For now, list books for sale or showcase them on your library profile."}
              {listingMode === "swap" &&
                "Peer-to-peer book swaps are planned for a future update. Use Sell or Showcase until then."}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => setListingMode("sell")}
                className="rounded-lg bg-[#E30B12] px-4 py-2 text-sm font-semibold text-white"
              >
                List for sale
              </button>
              <button
                type="button"
                onClick={() => setListingMode("library-only")}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Add to library shelf
              </button>
            </div>
          </div>
        ) : loadMeta ? (
          <p className="text-sm text-gray-500">Loading form…</p>
        ) : (
          <form onSubmit={(ev) => void onSubmit(ev)}>
            {error ? (
              <p className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className={labelClass} htmlFor="bk-title">
                  Title
                </label>
                <input
                  id="bk-title"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`${inputClass} mt-1`}
                  placeholder="e.g. Introduction to Algorithms"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="bk-author">
                    Author
                  </label>
                  <input
                    id="bk-author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className={`${inputClass} mt-1`}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="bk-edition">
                    Edition
                  </label>
                  <input
                    id="bk-edition"
                    value={edition}
                    onChange={(e) => setEdition(e.target.value)}
                    className={`${inputClass} mt-1`}
                    placeholder="e.g. 3rd Edition"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass} htmlFor="bk-cat">
                  Category
                </label>
                <select
                  id="bk-cat"
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
                <label className={labelClass} htmlFor="bk-dept">
                  Department
                </label>
                <select
                  id="bk-dept"
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
                {!universityId ? (
                  <p className="mt-1 text-xs text-amber-800">Select a campus in the header to load departments.</p>
                ) : departments.length === 0 ? (
                  <p className="mt-1 text-xs text-gray-500">No departments returned for this university.</p>
                ) : null}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="bk-subject">
                    Subject
                  </label>
                  <input
                    id="bk-subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className={`${inputClass} mt-1`}
                    placeholder="e.g. Computer Science"
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="bk-year">
                    Buying year
                  </label>
                  <input
                    id="bk-year"
                    required
                    value={buyingYear}
                    onChange={(e) => setBuyingYear(e.target.value)}
                    className={`${inputClass} mt-1`}
                    placeholder="e.g. 2022"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass} htmlFor="bk-lang">
                  Language
                </label>
                <input
                  id="bk-lang"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className={`${inputClass} mt-1`}
                  placeholder="e.g. English, Bangla"
                />
              </div>
              {listingMode === "sell" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="bk-course">
                      Course code
                    </label>
                    <input
                      id="bk-course"
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                      className={`${inputClass} mt-1`}
                      placeholder="e.g. CSE-311"
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="bk-semester">
                      Semester
                    </label>
                    <input
                      id="bk-semester"
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className={`${inputClass} mt-1`}
                      placeholder="e.g. 3rd"
                    />
                  </div>
                </div>
              )}
              {listingMode === "library-only" ? (
                <p className="rounded-lg border border-sky-100 bg-sky-50 px-3 py-2 text-xs text-sky-800">
                  Showcase books go on your library shelf only — no pickup address or contact
                  needed. Pending admin approval before they appear publicly.
                </p>
              ) : null}
              <div>
                <label className={labelClass} htmlFor="bk-publisher">
                  Publisher
                </label>
                <input
                  id="bk-publisher"
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  className={`${inputClass} mt-1`}
                  placeholder="Optional"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="bk-quality">
                    Condition
                  </label>
                  <select
                    id="bk-quality"
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
                {listingMode !== "library-only" ? (
                  <div>
                    <label className={labelClass} htmlFor="bk-qty">
                      Quantity
                    </label>
                    <input
                      id="bk-qty"
                      type="number"
                      min={1}
                      step={1}
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className={`${inputClass} mt-1`}
                    />
                  </div>
                ) : null}
              </div>

              {listingMode === "sell" ? (
                <>
                  <div>
                    <label className={labelClass} htmlFor="bk-price">
                      Price (৳)
                    </label>
                    <input
                      id="bk-price"
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
                    <label className={labelClass} htmlFor="bk-discount">
                      Discount price (৳, optional)
                    </label>
                    <input
                      id="bk-discount"
                      type="number"
                      min={0}
                      step={1}
                      value={discountPrice}
                      onChange={(e) => setDiscountPrice(e.target.value)}
                      className={`${inputClass} mt-1`}
                      placeholder="Must be less than regular price"
                    />
                  </div>
                </>
              ) : null}

            </div>

            <div className="space-y-4">
              {listingMode !== "library-only" ? (
                <div>
                  <label className={labelClass} htmlFor="bk-address">
                    Pickup address
                  </label>
                  <select
                    id="bk-address"
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
                  {addresses.length === 0 ? (
                    <p className="mt-2 text-xs text-amber-800">
                      No addresses yet.{" "}
                      <Link href="/my-addresses" className="font-semibold text-[#E30B12] underline">
                        Add one
                      </Link>
                    </p>
                  ) : null}
                </div>
              ) : null}
              <div>
                <label className={labelClass} htmlFor="bk-desc">
                  Description
                </label>
                <textarea
                  id="bk-desc"
                  required
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`${inputClass} mt-1 resize-y`}
                  placeholder="Condition, notes for buyers or borrowers…"
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
              {listingMode !== "library-only" ? (
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Contact
                  </p>
                  <div className="mt-3 space-y-3">
                    <div>
                      <label className={labelClass} htmlFor="bk-cname">
                        Name
                      </label>
                      <input
                        id="bk-cname"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className={`${inputClass} mt-1`}
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="bk-cphone">
                        Phone
                      </label>
                      <input
                        id="bk-cphone"
                        required
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className={`${inputClass} mt-1`}
                        placeholder="01XXXXXXXXX"
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="bk-cemail">
                        Email (optional)
                      </label>
                      <input
                        id="bk-cemail"
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className={`${inputClass} mt-1`}
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 border-t border-gray-100 pt-5">
            <button
              type="submit"
              disabled={submitting || loadMeta}
              className="rounded-lg bg-[#E30B12] px-5 py-2.5 text-sm font-semibold text-white active:brightness-95 disabled:opacity-50"
            >
              {submitting
                ? "Publishing…"
                : listingMode === "library-only"
                  ? "Add to shelf"
                  : "Publish"}
            </button>
            <Link
              href="/my-books"
              className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
