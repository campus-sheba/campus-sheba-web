"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  ChevronRight,
  ImageIcon,
  Loader2,
  Sparkles,
  Store,
} from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useAppState } from "@/contexts/AppStateContext";
import { uploadMediaFiles, type UploadedMediaMeta } from "@/lib/media/client";
import { createStudentShopAction } from "@/services/shop";
import { fetchUserCategoriesByType } from "@/services/books";
import type { BuySellCategory } from "@/types/buy-sell";
import type { CreateStudentShopBody } from "@/types/shop-create";
import { MediaFeatureName } from "@/types/media";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";
import { buildDefaultOperatingHours } from "../defaultOperatingHours";
import { defaultFlagsForShopTitle, subcategoryListTypeForShopTitle } from "../subcategoryApiType";
import ShopCreateReviewCard from "./ShopCreateReviewCard";

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#00A651] focus:ring-1 focus:ring-[#00A651]/20";
const labelClass = "mb-1.5 block text-xs font-semibold text-gray-600";

const STEPS = [
  "Welcome",
  "Shop type",
  "Specialties",
  "Business details",
  "Contact & social",
  "Brand photos",
  "Hours & orders",
  "Review",
] as const;

export default function CreateShopWizard() {
  const router = useRouter();
  const { state } = useAppState();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [shopCategories, setShopCategories] = useState<BuySellCategory[]>([]);
  const [subCategories, setSubCategoriesList] = useState<BuySellCategory[]>([]);
  const [loadingShopCats, setLoadingShopCats] = useState(false);
  const [loadingSubCats, setLoadingSubCats] = useState(false);

  const [shopCategory, setShopCategory] = useState<BuySellCategory | null>(null);
  const [selectedSubIds, setSelectedSubIds] = useState<string[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");

  const [contactEmail, setContactEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [website, setWebsite] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const [logo, setLogo] = useState<UploadedMediaMeta | null>(null);
  const [coverPhoto, setCoverPhoto] = useState<UploadedMediaMeta | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [minimumOrderAmount, setMinimumOrderAmount] = useState("0");
  const [tagsInput, setTagsInput] = useState("");
  const [lng, setLng] = useState("");
  const [lat, setLat] = useState("");

  useEffect(() => {
    const p = state.user.profile;
    if (!p) return;
    setContactEmail((v) => v || p.email || "");
    setPhoneNumber((v) => v || p.phone || "");
  }, [state.user.profile]);

  const loadShopCategories = useCallback(async () => {
    setLoadingShopCats(true);
    setError(null);
    try {
      const res = await fetchUserCategoriesByType("Shop", 1, 100);
      setShopCategories(res.data ?? []);
    } catch {
      setError("Could not load shop categories. Try again.");
    } finally {
      setLoadingShopCats(false);
    }
  }, []);

  useEffect(() => {
    if (step === 1 && shopCategories.length === 0 && !loadingShopCats) {
      void loadShopCategories();
    }
  }, [step, shopCategories.length, loadingShopCats, loadShopCategories]);

  const subListType = shopCategory ? subcategoryListTypeForShopTitle(shopCategory.title) : null;

  useEffect(() => {
    if (step !== 2 || !shopCategory || !subListType) {
      return;
    }
    let cancelled = false;
    setLoadingSubCats(true);
    setError(null);
    void (async () => {
      try {
        const res = await fetchUserCategoriesByType(subListType, 1, 100);
        if (cancelled) return;
        setSubCategoriesList(res.data ?? []);
      } catch {
        if (!cancelled) setError("Could not load specialties for this shop type.");
      } finally {
        if (!cancelled) setLoadingSubCats(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [step, shopCategory, subListType]);

  const flags = useMemo(
    () => (shopCategory ? defaultFlagsForShopTitle(shopCategory.title) : { isAggregator: false, isSkillBased: false }),
    [shopCategory],
  );

  const specialtyLabels = useMemo(
    () =>
      subCategories.filter((s) => selectedSubIds.includes(s._id)).map((s) => s.title),
    [subCategories, selectedSubIds],
  );

  const draftPayload = useMemo((): CreateStudentShopBody | null => {
    if (!shopCategory || !logo || !coverPhoto) return null;
    const minOrder = Number(minimumOrderAmount);
    if (Number.isNaN(minOrder) || minOrder < 0) return null;
    if (phoneNumber.trim().length < 8) return null;
    if (name.trim().length < 2 || description.trim().length < 10 || address.trim().length < 5) return null;

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    let location: CreateStudentShopBody["location"];
    const lo = parseFloat(lng);
    const la = parseFloat(lat);
    if (Number.isFinite(lo) && Number.isFinite(la)) {
      location = { type: "Point", coordinates: [lo, la] };
    }

    return {
      category: shopCategory._id,
      subCategories: selectedSubIds,
      name: name.trim(),
      description: description.trim(),
      address: address.trim(),
      logo: { url: logo.url, key: logo.key, size: logo.size },
      coverPhoto: { url: coverPhoto.url, key: coverPhoto.key, size: coverPhoto.size },
      contactEmail: contactEmail.trim() || null,
      phoneNumber: phoneNumber.trim(),
      website: website.trim() || null,
      socialLinks: {
        facebook: facebook.trim() || null,
        instagram: instagram.trim() || null,
        twitter: twitter.trim() || null,
        whatsapp: whatsapp.trim() || null,
      },
      minimumOrderAmount: minOrder,
      operatingHours: buildDefaultOperatingHours(),
      isAggregator: flags.isAggregator,
      isSkillBased: flags.isSkillBased,
      tags: tags.length ? tags : undefined,
      ...(location ? { location } : {}),
    };
  }, [
    shopCategory,
    logo,
    coverPhoto,
    minimumOrderAmount,
    phoneNumber,
    name,
    description,
    address,
    tagsInput,
    lng,
    lat,
    selectedSubIds,
    contactEmail,
    website,
    facebook,
    instagram,
    twitter,
    whatsapp,
    flags.isAggregator,
    flags.isSkillBased,
  ]);

  function toggleSub(id: string) {
    setSelectedSubIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function onLogo(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    setUploadingLogo(true);
    setError(null);
    const res = await uploadMediaFiles([f], MediaFeatureName.SHOP);
    setUploadingLogo(false);
    if (!res.success || !res.files?.[0]) {
      setError(res.message ?? "Logo upload failed.");
      return;
    }
    setLogo(res.files[0]);
  }

  async function onCover(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    setUploadingCover(true);
    setError(null);
    const res = await uploadMediaFiles([f], MediaFeatureName.SHOP);
    setUploadingCover(false);
    if (!res.success || !res.files?.[0]) {
      setError(res.message ?? "Cover photo upload failed.");
      return;
    }
    setCoverPhoto(res.files[0]);
  }

  function canGoNext(): boolean {
    switch (step) {
      case 0:
        return true;
      case 1:
        return Boolean(shopCategory);
      case 2:
        return true;
      case 3:
        return name.trim().length >= 2 && description.trim().length >= 10 && address.trim().length >= 5;
      case 4:
        return phoneNumber.trim().length >= 8;
      case 5:
        return Boolean(logo && coverPhoto);
      case 6: {
        const n = Number(minimumOrderAmount);
        return !Number.isNaN(n) && n >= 0;
      }
      case 7:
        return Boolean(draftPayload);
      default:
        return false;
    }
  }

  function next() {
    if (!canGoNext()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function submit() {
    if (!draftPayload) return;
    setSubmitting(true);
    setError(null);

    const result = await createStudentShopAction(draftPayload);
    setSubmitting(false);
    if (!result.success) {
      setError(result.message);
      return;
    }
    router.push(`/my-shop/${result.shop?._id}`);
  }

  return (
    <div className="mx-auto max-w-7xl pb-16 pt-4 md:pt-8">
      <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-1">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2 shrink-0">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                i < step ? "bg-[#00A651] text-white" : i === step ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"
              }`}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`hidden text-xs font-medium sm:inline ${i === step ? "text-gray-900" : "text-gray-400"}`}>
              {label}
            </span>
            {i < STEPS.length - 1 ? <ChevronRight className="h-4 w-4 text-gray-300" /> : null}
          </div>
        ))}
      </div>

      {error ? (
        <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      ) : null}

      {step === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-gradient-to-b from-emerald-50/60 to-white p-8 shadow-sm md:p-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00A651] text-white shadow-lg shadow-emerald-900/15">
            <Sparkles className="h-7 w-7" aria-hidden />
          </div>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">Become a campus entrepreneur</h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-600 md:text-base">
            Open a verified <strong className="font-semibold text-gray-800">Student Shop</strong> on Campus Sheba — food,
            products, services, or logistics. We review every storefront to keep the marketplace safe and trustworthy for
            your university.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[#00A651]">
                <Store className="h-3.5 w-3.5" />
              </span>
              <span>
                <strong className="font-semibold text-gray-900">How it works</strong> — choose your shop type, add
                specialties, business details, and branding. Submit once; our team reviews and activates your shop.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[#00A651]">
                <Building2 className="h-3.5 w-3.5" />
              </span>
              <span>
                After approval, list items in the right module (foods, products, or skills) and reach buyers across campus.
              </span>
            </li>
          </ul>
          <button
            type="button"
            onClick={next}
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#00A651] px-6 py-3.5 text-sm font-bold text-white shadow-md hover:brightness-105 sm:w-auto"
          >
            Start creating my shop
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {step === 1 ? (
        <div>
          <h2 className="text-xl font-bold text-gray-900">What will you offer?</h2>
          <p className="mt-1 text-sm text-gray-500">Pick one shop category. This drives how customers discover you.</p>
          {loadingShopCats ? (
            <div className="mt-8 flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#00A651]" />
            </div>
          ) : (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {shopCategories.map((c) => (
                <button
                  key={c._id}
                  type="button"
                  onClick={() => {
                    setShopCategory(c);
                    setSelectedSubIds([]);
                    setSubCategoriesList([]);
                  }}
                  className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition ${
                    shopCategory?._id === c._id
                      ? "border-[#00A651] bg-emerald-50/50 ring-1 ring-[#00A651]/20"
                      : "border-gray-100 bg-white hover:border-gray-200"
                  }`}
                >
                  {c.icon && c.icon.startsWith("http") ? (
                    <Image
                      src={c.icon}
                      alt=""
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-lg object-cover"
                      unoptimized={shouldUnoptimizeRemoteImage(c.icon)}
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                      <Store className="h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-gray-900">{c.title}</p>
                    {c.description ? <p className="text-xs text-gray-500 line-clamp-2">{c.description}</p> : null}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {step === 2 ? (
        <div>
          <h2 className="text-xl font-bold text-gray-900">Specialties</h2>
          <p className="mt-1 text-sm text-gray-500">
            Select one or more focus areas{subListType ? ` (from ${subListType} catalogue)` : ""}. Optional if none apply
            yet.
          </p>
          {!subListType ? (
            <p className="mt-6 text-sm text-amber-800">This shop type does not use linked specialties — continue.</p>
          ) : loadingSubCats ? (
            <div className="mt-8 flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#00A651]" />
            </div>
          ) : subCategories.length === 0 ? (
            <p className="mt-6 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-600">
              No specialties are configured for this line yet. You can still continue — add details in the next steps.
            </p>
          ) : (
            <div className="mt-6 flex flex-wrap gap-2">
              {subCategories.map((s) => {
                const on = selectedSubIds.includes(s._id);
                return (
                  <button
                    key={s._id}
                    type="button"
                    onClick={() => toggleSub(s._id)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                      on
                        ? "border-[#00A651] bg-emerald-50 text-emerald-900"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {s.icon && s.icon.startsWith("http") ? (
                      <Image
                        src={s.icon}
                        alt=""
                        width={20}
                        height={20}
                        className="h-5 w-5 rounded object-cover"
                        unoptimized={shouldUnoptimizeRemoteImage(s.icon)}
                      />
                    ) : null}
                    {s.title}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Business details</h2>
          <p className="text-sm text-gray-500">Name and describe your shop like a professional storefront.</p>
          <div>
            <label className={labelClass}>Shop name</label>
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Campus Bites" />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              className={`${inputClass} min-h-[100px] resize-y`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What you sell, delivery area, and what makes you different."
            />
          </div>
          <div>
            <label className={labelClass}>Address / pickup point</label>
            <input
              className={inputClass}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Building, floor, campus area"
            />
          </div>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Contact & social</h2>
          <p className="text-sm text-gray-500">How customers reach you (phone is required).</p>
          <div>
            <label className={labelClass}>Phone</label>
            <input className={inputClass} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+8801..." />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              className={inputClass}
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="support@example.com"
            />
          </div>
          <div>
            <label className={labelClass}>Website</label>
            <input className={inputClass} value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Facebook</label>
              <input className={inputClass} value={facebook} onChange={(e) => setFacebook(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Instagram</label>
              <input className={inputClass} value={instagram} onChange={(e) => setInstagram(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Twitter / X</label>
              <input className={inputClass} value={twitter} onChange={(e) => setTwitter(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>WhatsApp</label>
              <input className={inputClass} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="https://wa.me/..." />
            </div>
          </div>
        </div>
      ) : null}

      {step === 5 ? (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Brand photos</h2>
          <p className="text-sm text-gray-500">Logo and cover image help students recognize your shop.</p>
          <div>
            <label className={labelClass}>Logo</label>
            <div className="flex flex-wrap items-center gap-4">
              {logo ? (
                <Image
                  src={logo.url}
                  alt="Logo"
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-xl border object-cover"
                  unoptimized={shouldUnoptimizeRemoteImage(logo.url)}
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50">
                  <ImageIcon className="h-8 w-8 text-gray-300" />
                </div>
              )}
              <label className="cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50">
                <span className="inline-flex items-center gap-2">
                  {uploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {uploadingLogo ? "Uploading…" : "Upload logo"}
                </span>
                <input type="file" accept="image/*" className="sr-only" onChange={(e) => void onLogo(e.target.files)} />
              </label>
            </div>
          </div>
          <div>
            <label className={labelClass}>Cover photo</label>
            <div className="space-y-3">
              {coverPhoto ? (
                <div className="relative aspect-[21/9] w-full max-w-lg overflow-hidden rounded-xl border">
                  <Image
                    src={coverPhoto.url}
                    alt="Cover"
                    fill
                    className="object-cover"
                    unoptimized={shouldUnoptimizeRemoteImage(coverPhoto.url)}
                  />
                </div>
              ) : (
                <div className="flex aspect-[21/9] w-full max-w-lg items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50">
                  <ImageIcon className="h-10 w-10 text-gray-300" />
                </div>
              )}
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50">
                {uploadingCover ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {uploadingCover ? "Uploading…" : "Upload cover"}
                <input type="file" accept="image/*" className="sr-only" onChange={(e) => void onCover(e.target.files)} />
              </label>
            </div>
          </div>
        </div>
      ) : null}

      {step === 6 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Hours & orders</h2>
          <p className="text-sm text-gray-500">
            We start you with a standard weekly schedule (Mon–Thu split slots, Fri–Sat closed). You can request changes
            after approval. Set your minimum order amount for checkout.
          </p>
          <div>
            <label className={labelClass}>Minimum order amount (BDT)</label>
            <input
              className={inputClass}
              type="number"
              min={0}
              value={minimumOrderAmount}
              onChange={(e) => setMinimumOrderAmount(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Tags (comma-separated)</label>
            <input
              className={inputClass}
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Kacchi, Delivery, Preorder"
            />
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Map pin (optional)</p>
            <p className="mt-1 text-xs text-gray-500">Longitude, latitude — helps discovery on campus maps.</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <input className={inputClass} value={lng} onChange={(e) => setLng(e.target.value)} placeholder="90.2673" />
              <input className={inputClass} value={lat} onChange={(e) => setLat(e.target.value)} placeholder="23.8825" />
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Flags for your shop:{" "}
            <strong>{flags.isAggregator ? "Aggregator / delivery" : "Standard storefront"}</strong>
            {flags.isSkillBased ? ", skill-based services" : ""}.
          </p>
        </div>
      ) : null}

      {step === 7 ? (
        <div className="space-y-6">
          <div className="text-center md:text-left">
            <h2 className="text-xl font-bold text-gray-900 md:text-2xl">Review & submit</h2>
            <p className="mt-1 text-sm text-gray-500">
              Your shop will be <strong className="text-gray-700">Pending</strong> until our team reviews it.
            </p>
          </div>
          {draftPayload && shopCategory ? (
            <ShopCreateReviewCard
              payload={draftPayload}
              shopCategoryTitle={shopCategory.title}
              specialtyLabels={specialtyLabels}
            />
          ) : (
            <p className="rounded-xl border border-dashed border-amber-200 bg-amber-50/50 px-4 py-6 text-center text-sm text-amber-900">
              Complete the previous steps to see your storefront preview.
            </p>
          )}
        </div>
      ) : null}

      {step > 0 ? (
        <div className="mt-10 flex flex-col-reverse gap-3 border-t border-gray-100 pt-8 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={back}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              disabled={!canGoNext()}
              onClick={next}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00A651] px-5 py-2.5 text-sm font-bold text-white hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting || !draftPayload}
              onClick={() => void submit()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Submit for review
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
