"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Globe,
  MapPin,
  Plus,
  Save,
  ShieldCheck,
  Store,
  Trash2,
  Upload,
} from "lucide-react";
import { Button, Heading, Paragraph, Subtitle, Title } from "@/components/ui";
import { ContentWrapper } from "@/components/wrappers";
import { uploadMediaFiles } from "@/lib/media/client";
import { MediaFeatureName } from "@/types/media";
import { createOwnerShopAction } from "../actions";
import {
  CATEGORY_MINIMUM_ORDER,
  OPERATING_DAYS,
  type OperatingHourForm,
  type OwnerAddShopPayload,
  type PhotoForm,
  type ShopCreateCategoryOption,
  type ShopCreateFormState,
  type SlotForm,
} from "./types";

interface DynamicShopCreateFormProps {
  locale: string;
  selectedCategory: ShopCreateCategoryOption;
  onBackToIntro: () => void;
}

const fieldClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#E30A13] focus:ring-4 focus:ring-[#E30A13]/10";
const labelClassName = "mb-1.5 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500";

const categoryHelperCopy: Record<
  ShopCreateCategoryOption["kind"],
  { title: string; description: string; accent: string }
> = {
  Food: {
    title: "Food shop settings",
    description:
      "Pre-order controls are shown here. Keep minimum order, delivery windows, and contact details clear.",
    accent: "text-[#A80A12]",
  },
  Product: {
    title: "Product shop settings",
    description:
      "Focus on catalog readiness, contact points, and a clean operating schedule. No pre-order block is shown.",
    accent: "text-slate-700",
  },
  Service: {
    title: "Skill / Service shop settings",
    description: "Skill-based shops are flagged automatically and the minimum order amount can stay at zero.",
    accent: "text-[#A80A12]",
  },
};

const parseCommaSeparated = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const toNumber = (value: string | number) => {
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toCoordinates = (latitude: string, longitude: string): [number, number] | null => {
  if (!latitude.trim() || !longitude.trim()) {
    return null;
  }

  const lat = Number(latitude);
  const lng = Number(longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return [lng, lat];
};

const buildInitialOperatingHours = (): OperatingHourForm[] =>
  OPERATING_DAYS.map((day) => ({
    day,
    isClosed: day === "Friday",
    slots: day === "Friday" ? [] : [{ open: "09:00", close: "18:00" }],
  }));

const buildInitialFormState = (category: ShopCreateCategoryOption["kind"]): ShopCreateFormState => ({
  type: "Student Shop",
  name: "",
  description: "",
  address: "",
  logo: {
    url: "",
    key: "",
    size: 0,
  },
  coverPhoto: {
    url: "",
    key: "",
    size: 0,
  },
  contactEmail: "",
  phoneNumber: "",
  website: "",
  socialLinks: {
    facebook: "",
    instagram: "",
    twitter: "",
    whatsapp: "",
  },
  minimumOrderAmount: CATEGORY_MINIMUM_ORDER[category],
  operatingHours: buildInitialOperatingHours(),
  latitude: "",
  longitude: "",
  tagsText: "",
  preOrderPolicy: {
    isPreOrderOnly: category === "Food",
    leadTimeHours: category === "Food" ? 8 : 0,
    nextDeliveryDate: "",
  },
});

function FieldLabel({ children }: { children: string }) {
  return <label className={labelClassName}>{children}</label>;
}

function SectionCard({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#A80A12]">{eyebrow}</p>
        <Heading as="h2" size="lg" className="mt-1 text-slate-900">
          {title}
        </Heading>
        <Paragraph size="sm" color="muted" className="mt-2 max-w-2xl">
          {description}
        </Paragraph>
      </div>
      {children}
    </section>
  );
}

function MediaTile({
  title,
  note,
  value,
  uploading,
  onUpload,
}: {
  title: string;
  note: string;
  value: PhotoForm;
  uploading: boolean;
  onUpload: (file: File) => Promise<void>;
}) {
  const inputId = `${title.replace(/\s+/g, "-").toLowerCase()}-upload`;

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{note}</p>
        </div>
        <Upload className="mt-0.5 h-4 w-4 text-slate-400" />
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="h-16 w-16 overflow-hidden rounded-2xl border border-white bg-white shadow-sm">
          {value.url ? (
            <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${value.url})` }} />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[#A80A12]">
              <Store className="h-6 w-6" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id={inputId}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void onUpload(file);
              }
              event.target.value = "";
            }}
          />
          <label
            htmlFor={inputId}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
              uploading
                ? "border-slate-200 bg-slate-100 text-slate-400"
                : "border-[#E30A13]/15 bg-white text-[#A80A12] hover:border-[#E30A13]/30 hover:bg-[#E30A13]/5"
            }`}
          >
            {uploading ? "Uploading..." : "Upload image"}
          </label>
          <p className="mt-2 text-xs text-slate-400">
            {value.url ? `Stored as ${value.key || "uploaded media"}` : "Upload a clear, square image for best results."}
          </p>
        </div>
      </div>
    </div>
  );
}

function SlotEditor({
  slot,
  onChange,
  onRemove,
  removable,
}: {
  slot: SlotForm;
  onChange: (next: SlotForm) => void;
  onRemove: () => void;
  removable: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:flex-row md:items-center">
      <div className="grid flex-1 gap-3 md:grid-cols-2">
        <div>
          <FieldLabel>Open</FieldLabel>
          <input
            type="time"
            value={slot.open}
            onChange={(event) => onChange({ ...slot, open: event.target.value })}
            className={fieldClassName}
          />
        </div>
        <div>
          <FieldLabel>Close</FieldLabel>
          <input
            type="time"
            value={slot.close}
            onChange={(event) => onChange({ ...slot, close: event.target.value })}
            className={fieldClassName}
          />
        </div>
      </div>
      {removable ? (
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          aria-label="Remove slot"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}

export default function DynamicShopCreateForm({
  locale,
  selectedCategory,
  onBackToIntro,
}: DynamicShopCreateFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<ShopCreateFormState>(() => buildInitialFormState(selectedCategory.kind));
  const [error, setError] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const helperCopy = categoryHelperCopy[selectedCategory.kind];

  const setField = <K extends keyof ShopCreateFormState>(key: K, value: ShopCreateFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateOperatingDay = (day: string, updater: (current: OperatingHourForm) => OperatingHourForm) => {
    setForm((prev) => ({
      ...prev,
      operatingHours: prev.operatingHours.map((entry) => (entry.day === day ? updater(entry) : entry)),
    }));
  };

  const addSlot = (day: string) => {
    updateOperatingDay(day, (current) => ({
      ...current,
      slots: [...current.slots, { open: "09:00", close: "18:00" }],
    }));
  };

  const removeSlot = (day: string, slotIndex: number) => {
    updateOperatingDay(day, (current) => ({
      ...current,
      slots: current.slots.filter((_, index) => index !== slotIndex),
    }));
  };

  const uploadMedia = async (file: File, target: "logo" | "coverPhoto") => {
    if (target === "logo") setUploadingLogo(true);
    if (target === "coverPhoto") setUploadingCover(true);

    try {
      const response = await uploadMediaFiles([file], MediaFeatureName.SHOP);

      if (!response.success || !response.urls.length) {
        setError(response.message ?? "Failed to upload media.");
        return;
      }

      setField(target, {
        url: response.urls[0],
        key: file.name,
        size: file.size,
      });
      setError(null);
    } finally {
      if (target === "logo") setUploadingLogo(false);
      if (target === "coverPhoto") setUploadingCover(false);
    }
  };

  const requiredState = useMemo(() => {
    const coordinates = toCoordinates(form.latitude, form.longitude);
    const hasOpenHours = form.operatingHours.some(
      (day) => !day.isClosed && day.slots.some((slot) => slot.open && slot.close),
    );

    return {
      hasCoordinates: Boolean(coordinates),
      hasHours: hasOpenHours,
      hasBrand: Boolean(form.name.trim() && form.logo.url && form.coverPhoto.url),
      hasContact: Boolean(form.phoneNumber.trim()),
      canSubmit:
        Boolean(form.name.trim()) &&
        Boolean(form.logo.url.trim()) &&
        Boolean(form.coverPhoto.url.trim()) &&
        Boolean(form.phoneNumber.trim()) &&
        Boolean(form.minimumOrderAmount >= 0) &&
        Boolean(coordinates) &&
        hasOpenHours,
    };
  }, [form]);

  const buildPayload = (): OwnerAddShopPayload | null => {
    const coordinates = toCoordinates(form.latitude, form.longitude);
    if (!coordinates) {
      return null;
    }

    const tags = parseCommaSeparated(form.tagsText);

    const operatingHours = form.operatingHours.map((day) => ({
      day: day.day,
      isClosed: day.isClosed,
      slots: day.isClosed ? [] : day.slots.filter((slot) => slot.open && slot.close),
    }));

    const socialLinks = {
      facebook: form.socialLinks.facebook.trim() || undefined,
      instagram: form.socialLinks.instagram.trim() || undefined,
      twitter: form.socialLinks.twitter.trim() || undefined,
      whatsapp: form.socialLinks.whatsapp.trim() || undefined,
    };

    return {
      type: "Student Shop",
      category: selectedCategory.categoryId,
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      address: form.address.trim() || undefined,
      logo: {
        url: form.logo.url.trim(),
        key: form.logo.key.trim(),
        size: toNumber(form.logo.size),
      },
      coverPhoto: {
        url: form.coverPhoto.url.trim(),
        key: form.coverPhoto.key.trim(),
        size: toNumber(form.coverPhoto.size),
      },
      contactEmail: form.contactEmail.trim() || undefined,
      phoneNumber: form.phoneNumber.trim(),
      website: form.website.trim() || undefined,
      socialLinks:
        socialLinks.facebook || socialLinks.instagram || socialLinks.twitter || socialLinks.whatsapp
          ? socialLinks
          : undefined,
      minimumOrderAmount: toNumber(form.minimumOrderAmount),
      operatingHours,
      location: {
        type: "Point",
        coordinates,
      },
      isAggregator: false,
      isSkillBased: selectedCategory.kind === "Service",
      ...(tags.length ? { tags } : {}),
      ...(selectedCategory.kind === "Food"
        ? {
            preOrderPolicy: {
              isPreOrderOnly: form.preOrderPolicy.isPreOrderOnly,
              leadTimeHours: toNumber(form.preOrderPolicy.leadTimeHours),
              ...(form.preOrderPolicy.nextDeliveryDate
                ? { nextDeliveryDate: new Date(form.preOrderPolicy.nextDeliveryDate).toISOString() }
                : {}),
            },
          }
        : {}),
    };
  };

  const submitForm = async () => {
    if (!requiredState.canSubmit) {
      setError("Complete the required fields, upload both images, add a location, and keep at least one open hour slot.");
      return;
    }

    const payload = buildPayload();
    if (!payload) {
      setError("Add a valid map location before submitting the shop.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const result = await createOwnerShopAction(payload);

      if (!result.success) {
        setError(result.message ?? "Failed to create shop.");
        return;
      }

      router.replace(`/${locale}/my-shop`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-14">
      <section className="border-b border-slate-200 bg-white/90 text-slate-900 backdrop-blur">
        <ContentWrapper maxWidth="container" padding="lg" className="py-8 md:py-10">
          <button
            type="button"
            onClick={onBackToIntro}
            className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#A80A12] transition hover:text-[#7A0810]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to intro
          </button>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <Subtitle color="default" className="!text-[#A80A12]">
                Dynamic Shop Builder
              </Subtitle>
              <Title as="h1" size="2xl" className="mt-2 text-slate-950 md:!text-4xl">
                Set up your {selectedCategory.label} shop
              </Title>
              <Paragraph size="sm" color="muted" className="mt-3 max-w-2xl">
                The form below adapts to the selected category, keeps the payload aligned with the API,
                and redirects you to My Shop after a successful create.
              </Paragraph>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Selected category</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{selectedCategory.label}</p>
                </div>
                <div className="rounded-2xl bg-white p-3 text-[#A80A12] shadow-sm">
                  <Store className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5 text-[#A80A12]" />
                Type is fixed to Student Shop
              </div>
            </div>
          </div>
        </ContentWrapper>
      </section>

      <ContentWrapper maxWidth="container" padding="md" className="mt-6">
        {error ? (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.85fr] lg:items-start">
          <div className="space-y-6">
            <SectionCard
              eyebrow="Brand basics"
              title="Tell students who you are"
              description="These are the fields that create the first impression on your shop page. Keep them precise and useful."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <FieldLabel>Shop name</FieldLabel>
                  <input
                    value={form.name}
                    onChange={(event) => setField("name", event.target.value)}
                    placeholder="Example: JUBAZAR Creative Services"
                    className={fieldClassName}
                  />
                </div>

                <div className="md:col-span-2">
                  <FieldLabel>Description</FieldLabel>
                  <textarea
                    value={form.description}
                    onChange={(event) => setField("description", event.target.value)}
                    placeholder="Short, clear summary of what you sell or offer."
                    rows={4}
                    className={`${fieldClassName} resize-none`}
                  />
                </div>

                <div className="md:col-span-2">
                  <FieldLabel>Address</FieldLabel>
                  <input
                    value={form.address}
                    onChange={(event) => setField("address", event.target.value)}
                    placeholder="JU Campus / Online / Nearby campus area"
                    className={fieldClassName}
                  />
                </div>

                <div>
                  <FieldLabel>Phone number</FieldLabel>
                  <input
                    value={form.phoneNumber}
                    onChange={(event) => setField("phoneNumber", event.target.value)}
                    placeholder="017XXXXXXXX"
                    className={fieldClassName}
                  />
                </div>

                <div>
                  <FieldLabel>Contact email</FieldLabel>
                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={(event) => setField("contactEmail", event.target.value)}
                    placeholder="owner@example.com"
                    className={fieldClassName}
                  />
                </div>

                <div>
                  <FieldLabel>Website</FieldLabel>
                  <input
                    value={form.website}
                    onChange={(event) => setField("website", event.target.value)}
                    placeholder="https://your-shop.example"
                    className={fieldClassName}
                  />
                </div>

                <div>
                  <FieldLabel>Minimum order amount</FieldLabel>
                  <input
                    type="number"
                    min={0}
                    value={form.minimumOrderAmount}
                    onChange={(event) => setField("minimumOrderAmount", toNumber(event.target.value))}
                    className={fieldClassName}
                  />
                </div>

                <div className="md:col-span-2">
                  <FieldLabel>Tags</FieldLabel>
                  <input
                    value={form.tagsText}
                    onChange={(event) => setField("tagsText", event.target.value)}
                    placeholder="Design, preorder, campus pickup"
                    className={fieldClassName}
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard
              eyebrow="Media"
              title="Upload your logo and cover image"
              description="Use clean, well-lit images. The logo should be simple and the cover should communicate your brand at a glance."
            >
              <div className="grid gap-4 lg:grid-cols-2">
                <MediaTile
                  title="Logo"
                  note="Use a square image that works at small sizes."
                  value={form.logo}
                  uploading={uploadingLogo}
                  onUpload={async (file) => uploadMedia(file, "logo")}
                />
                <MediaTile
                  title="Cover photo"
                  note="Choose a wider image that feels like your shop banner."
                  value={form.coverPhoto}
                  uploading={uploadingCover}
                  onUpload={async (file) => uploadMedia(file, "coverPhoto")}
                />
              </div>
            </SectionCard>

            <SectionCard
              eyebrow="Location and hours"
              title="Share where and when customers can reach you"
              description="Your shop page uses the map location and opening windows to set expectations clearly."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2 grid gap-4 md:grid-cols-2">
                  <div>
                    <FieldLabel>Latitude</FieldLabel>
                    <input
                      value={form.latitude}
                      onChange={(event) => setField("latitude", event.target.value)}
                      placeholder="23.8825"
                      className={fieldClassName}
                    />
                  </div>
                  <div>
                    <FieldLabel>Longitude</FieldLabel>
                    <input
                      value={form.longitude}
                      onChange={(event) => setField("longitude", event.target.value)}
                      placeholder="90.2673"
                      className={fieldClassName}
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Operating hours</p>
                      <p className="mt-1 text-xs text-slate-500">Add at least one open day with a time slot.</p>
                    </div>
                    <Clock3 className="h-4 w-4 text-slate-400" />
                  </div>

                  <div className="space-y-3">
                    {form.operatingHours.map((day) => (
                      <div key={day.day} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{day.day}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              {day.isClosed ? "Marked as closed" : "Open for business"}
                            </p>
                          </div>

                          <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
                            <input
                              type="checkbox"
                              checked={day.isClosed}
                              onChange={(event) => {
                                const isClosed = event.target.checked;
                                updateOperatingDay(day.day, (current) => ({
                                  ...current,
                                  isClosed,
                                  slots: isClosed
                                    ? []
                                    : current.slots.length
                                      ? current.slots
                                      : [{ open: "09:00", close: "18:00" }],
                                }));
                              }}
                            />
                            Closed
                          </label>
                        </div>

                        {!day.isClosed ? (
                          <div className="mt-4 space-y-3">
                            {day.slots.map((slot, slotIndex) => (
                              <SlotEditor
                                key={`${day.day}-${slotIndex}`}
                                slot={slot}
                                onChange={(next) =>
                                  updateOperatingDay(day.day, (current) => ({
                                    ...current,
                                    slots: current.slots.map((currentSlot, index) =>
                                      index === slotIndex ? next : currentSlot,
                                    ),
                                  }))
                                }
                                onRemove={() => removeSlot(day.day, slotIndex)}
                                removable={day.slots.length > 1}
                              />
                            ))}

                            <button
                              type="button"
                              onClick={() => addSlot(day.day)}
                              className="inline-flex items-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-[#E30A13]/35 hover:bg-white hover:text-[#A80A12]"
                            >
                              <Plus className="h-4 w-4" />
                              Add time slot
                            </button>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              eyebrow="Category specific"
              title={helperCopy.title}
              description={helperCopy.description}
            >
              {selectedCategory.kind === "Food" ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2 rounded-[1.5rem] border border-[#E30A13]/15 bg-[#E30A13]/5 p-4 text-sm text-slate-700">
                    Food shops typically need a pre-order policy. The fields below are included in the payload
                    only for this category.
                  </div>

                  <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.preOrderPolicy.isPreOrderOnly}
                      onChange={(event) =>
                        setField("preOrderPolicy", {
                          ...form.preOrderPolicy,
                          isPreOrderOnly: event.target.checked,
                        })
                      }
                    />
                    Pre-order only
                  </label>

                  <div>
                    <FieldLabel>Lead time hours</FieldLabel>
                    <input
                      type="number"
                      min={0}
                      value={form.preOrderPolicy.leadTimeHours}
                      onChange={(event) =>
                        setField("preOrderPolicy", {
                          ...form.preOrderPolicy,
                          leadTimeHours: toNumber(event.target.value),
                        })
                      }
                      className={fieldClassName}
                    />
                  </div>

                  <div>
                    <FieldLabel>Next delivery date</FieldLabel>
                    <input
                      type="date"
                      value={form.preOrderPolicy.nextDeliveryDate}
                      onChange={(event) =>
                        setField("preOrderPolicy", {
                          ...form.preOrderPolicy,
                          nextDeliveryDate: event.target.value,
                        })
                      }
                      className={fieldClassName}
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  {selectedCategory.kind === "Service"
                    ? "Skill / Service shops are flagged as skill-based automatically. Minimum order amount can stay at zero unless you want to set a floor for your work."
                    : "Product shops keep the payload lean: no pre-order block is shown, and the backend receives only the general shop fields."}
                </div>
              )}
            </SectionCard>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-6">
            <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#A80A12]">Submission summary</p>
              <Heading as="h3" size="base" className="mt-1 text-slate-900">
                Ready to create
              </Heading>

              <div className="mt-4 space-y-3">
                {[
                  { label: "Type", value: "Student Shop" },
                  { label: "Category", value: selectedCategory.label },
                  { label: "Backend category", value: selectedCategory.categoryId || "Loaded from API" },
                  { label: "Skill-based", value: selectedCategory.kind === "Service" ? "Yes" : "No" },
                  { label: "Subcategories", value: "Not used" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{item.label}</span>
                    <span className="text-sm font-semibold text-slate-800">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Required before submit
                </div>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li className={requiredState.hasBrand ? "text-emerald-700" : ""}>Logo, cover photo, and shop name</li>
                  <li className={requiredState.hasContact ? "text-emerald-700" : ""}>Phone number</li>
                  <li className={requiredState.hasCoordinates ? "text-emerald-700" : ""}>Valid map coordinates</li>
                  <li className={requiredState.hasHours ? "text-emerald-700" : ""}>At least one open operating slot</li>
                </ul>
              </div>

              <div className="mt-5 flex items-center gap-2 rounded-2xl border border-[#E30A13]/10 bg-[#E30A13]/5 px-4 py-3 text-xs font-medium text-slate-600">
                <ShieldCheck className="h-4 w-4 text-[#A80A12]" />
                Payload uses Student Shop, no logistics branch, and no subcategory selection.
              </div>

              <div className="mt-5 flex flex-col gap-3">
                <Button uppercase={false} variant="outline" onClick={onBackToIntro} className="justify-center">
                  Back
                </Button>
                <Button
                  uppercase={false}
                  onClick={() => void submitForm()}
                  disabled={isSubmitting}
                  className="justify-center !border-0 !bg-[#E30A13] !text-white"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Creating..." : "Create shop"}
                </Button>
              </div>

              <p className="mt-4 text-xs leading-5 text-slate-400">
                After a successful create, you will be redirected to /{locale}/my-shop to manage verification,
                edits, products, orders, and shop details.
              </p>
            </section>

            <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <MapPin className="h-4 w-4 text-[#A80A12]" />
                {selectedCategory.label} note
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{helperCopy.description}</p>

              <div className={`mt-4 inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-xs font-semibold ${helperCopy.accent}`}>
                <Globe className="h-3.5 w-3.5" />
                Use clear, real-world details. Students should understand the shop in a glance.
              </div>
            </section>
          </aside>
        </div>
      </ContentWrapper>
    </div>
  );
}
