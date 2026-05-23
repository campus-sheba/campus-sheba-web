"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/navigation";
import { useAppState } from "@/contexts/AppStateContext";
import { uploadMediaFiles, type UploadedMediaMeta } from "@/lib/media/client";
import { pickDefaultBookAddressId } from "@/modules/cart/deliveryAddress";
import {
  deleteBookAction,
  fetchBookCategories,
  getCreatorBookByIdAction,
  updateBookAction,
} from "@/services/books";
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

function applyBookToForm(
  book: BookListing,
  setters: {
    setTitle: (v: string) => void;
    setAuthor: (v: string) => void;
    setEdition: (v: string) => void;
    setCategoryId: (v: string) => void;
    setDepartmentId: (v: string) => void;
    setSubject: (v: string) => void;
    setBuyingYear: (v: string) => void;
    setPublisher: (v: string) => void;
    setLanguage: (v: string) => void;
    setCourseCode: (v: string) => void;
    setSemester: (v: string) => void;
    setQuality: (v: BookQuality) => void;
    setDescription: (v: string) => void;
    setPrice: (v: string) => void;
    setDiscountPrice: (v: string) => void;
    setQuantity: (v: string) => void;
    setSafekeepingCharge: (v: string) => void;
    setBorrowDuration: (v: string) => void;
    setMaxExtensionDuration: (v: string) => void;
    setAllowsExtension: (v: boolean) => void;
    setContactName: (v: string) => void;
    setContactPhone: (v: string) => void;
    setContactEmail: (v: string) => void;
    setAddressId: (v: string) => void;
    setPhotos: (v: UploadedMediaMeta[]) => void;
  },
) {
  setters.setTitle(book.title);
  setters.setAuthor(book.author ?? "");
  setters.setEdition(book.edition ?? "");
  setters.setCategoryId(categoryIdFromBook(book));
  setters.setDepartmentId(departmentIdFromBook(book));
  setters.setSubject(book.subject ?? "");
  setters.setBuyingYear(book.buyingYear ?? "");
  setters.setPublisher(book.publisher ?? "");
  setters.setLanguage(book.language ?? "English");
  setters.setCourseCode(book.courseCode ?? "");
  setters.setSemester(book.semester ?? "");
  setters.setQuality((book.quality as BookQuality) ?? "Good");
  setters.setDescription(book.description ?? "");
  setters.setPrice(String(book.price ?? ""));
  setters.setDiscountPrice(book.discountPrice != null ? String(book.discountPrice) : "");
  setters.setQuantity(String(book.quantity ?? 1));
  setters.setSafekeepingCharge(
    book.safekeepingCharge != null ? String(book.safekeepingCharge) : "",
  );
  setters.setBorrowDuration(String(book.borrowDuration ?? 14));
  setters.setMaxExtensionDuration(String(book.maxExtensionDuration ?? 7));
  setters.setAllowsExtension(book.allowsExtension ?? false);
  setters.setContactName(book.contactName ?? "");
  setters.setContactPhone(book.contactPhone ?? "");
  setters.setContactEmail(book.contactEmail ?? "");
  setters.setAddressId(addressIdFromBook(book));
  setters.setPhotos(photosToMeta(book));
}

type Props = {
  bookId: string;
};

export default function MyBooksEditPage({ bookId }: Props) {
  const router = useRouter();
  const { state } = useAppState();
  const universityId = state.university.selected?._id ?? state.user.profile?.university?._id;

  const [book, setBook] = useState<BookListing | null>(null);
  const [loadBook, setLoadBook] = useState(true);
  const [bookError, setBookError] = useState<string | null>(null);
  const [categories, setCategories] = useState<BuySellCategory[]>([]);
  const [departments, setDepartments] = useState<{ _id: string; name: string; code?: string }[]>([]);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loadMeta, setLoadMeta] = useState(true);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [edition, setEdition] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [subject, setSubject] = useState("");
  const [buyingYear, setBuyingYear] = useState("");
  const [publisher, setPublisher] = useState("");
  const [language, setLanguage] = useState("English");
  const [courseCode, setCourseCode] = useState("");
  const [semester, setSemester] = useState("");
  const [quality, setQuality] = useState<BookQuality>("Good");
  const [description, setDescription] = useState("");

  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [safekeepingCharge, setSafekeepingCharge] = useState("");
  const [borrowDuration, setBorrowDuration] = useState("14");
  const [maxExtensionDuration, setMaxExtensionDuration] = useState("7");
  const [allowsExtension, setAllowsExtension] = useState(false);

  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [addressId, setAddressId] = useState("");

  const [photos, setPhotos] = useState<UploadedMediaMeta[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listingType = book?.type;
  const isShowcase = listingType === "Library Only";

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoadBook(true);
      setBookError(null);
      const res = await getCreatorBookByIdAction(bookId);
      if (cancelled) return;
      setLoadBook(false);
      if (!res.success || !res.data) {
        setBookError(res.message ?? "Book not found.");
        setBook(null);
        return;
      }
      setBook(res.data);
      applyBookToForm(res.data, {
        setTitle,
        setAuthor,
        setEdition,
        setCategoryId,
        setDepartmentId,
        setSubject,
        setBuyingYear,
        setPublisher,
        setLanguage,
        setCourseCode,
        setSemester,
        setQuality,
        setDescription,
        setPrice,
        setDiscountPrice,
        setQuantity,
        setSafekeepingCharge,
        setBorrowDuration,
        setMaxExtensionDuration,
        setAllowsExtension,
        setContactName,
        setContactPhone,
        setContactEmail,
        setAddressId,
        setPhotos,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [bookId]);

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
    if (!isShowcase && !addressId) {
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

    const payload: UpdateBookPayload = {
      title: title.trim(),
      photos: photoPayload,
      category: categoryId,
      buyingYear: buyingYear.trim(),
      description: description.trim(),
      type: listingType,
      department: departmentId,
      quality,
      quantity: qty,
      ...(!isShowcase
        ? {
            addressId,
            contactName: contactName.trim(),
            contactPhone: apiPhone,
            contactEmail: contactEmail.trim() || undefined,
          }
        : {}),
      ...(author.trim() ? { author: author.trim() } : {}),
      ...(edition.trim() ? { edition: edition.trim() } : {}),
      ...(subject.trim() ? { subject: subject.trim() } : {}),
      ...(publisher.trim() ? { publisher: publisher.trim() } : {}),
      ...(language.trim() ? { language: language.trim() } : {}),
      ...(courseCode.trim() ? { courseCode: courseCode.trim() } : {}),
      ...(semester.trim() ? { semester: semester.trim() } : {}),
    };

    if (listingType === "Donation" || listingType === "Library Only") {
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

  if (loadBook) {
    return <p className="text-sm text-gray-500">Loading book…</p>;
  }

  if (bookError || !book) {
    return (
      <div className="space-y-4 rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm">
        <p className="text-sm text-red-600">{bookError ?? "Book not found."}</p>
        <Link
          href="/my-books"
          className="inline-block text-sm font-semibold text-[#E30B12] hover:underline"
        >
          ← Back to my books
        </Link>
      </div>
    );
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
          {listingType === "Library Only" && "Showcase"}
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
              <div>
                <label className={labelClass} htmlFor="ebk-lang">
                  Language
                </label>
                <input
                  id="ebk-lang"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className={`${inputClass} mt-1`}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="ebk-course">
                    Course code
                  </label>
                  <input
                    id="ebk-course"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    className={`${inputClass} mt-1`}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="ebk-semester">
                    Semester
                  </label>
                  <input
                    id="ebk-semester"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className={`${inputClass} mt-1`}
                  />
                </div>
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
                      className="rounded border-gray-300 text-[#E30B12] focus:ring-[#E30B12]"
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
              className="rounded-lg bg-[#E30B12] px-5 py-2.5 text-sm font-semibold text-white active:brightness-95 disabled:opacity-50"
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
