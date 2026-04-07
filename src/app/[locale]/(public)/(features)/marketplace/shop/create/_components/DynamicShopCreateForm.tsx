"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Plus,
  Save,
  ShieldCheck,
  Store,
  Trash2,
} from "lucide-react";
import { Button, Heading, Paragraph, Subtitle, Title } from "@/components/ui";
import { ContentWrapper } from "@/components/wrappers";
import { uploadMediaFiles } from "@/lib/media/client";
import { MediaFeatureName } from "@/types/media";
import {
  createOwnerShopAction,
  getShopCategoriesAction,
  getShopSubCategoriesAction,
} from "../actions";
import type {
  AdvancedShopConfig,
  DynamicShopFormState,
  OperatingHourForm,
  OwnerAddShopPayload,
  ShopCategory,
  ShopCategoryKind,
  SlotForm,
} from "./types";
import { OPERATING_DAYS, SHOP_TYPE_NOTES } from "./types";
import { getShopCreateMessages } from "./messages";

interface DynamicShopCreateFormProps {
  locale: string;
  onBackToIntro: () => void;
}

const toCategoryKind = (title: string): ShopCategoryKind => {
  const normalized = title.trim().toLowerCase();
  if (normalized === "food") return "Food";
  if (normalized === "product") return "Product";
  if (normalized === "service") return "Service";
  if (normalized === "logistics") return "Logistics";
  return "General";
};

const initialOperatingHours = (): OperatingHourForm[] =>
  OPERATING_DAYS.map((day) => ({
    day,
    isClosed: day === "Friday",
    slots: day === "Friday" ? [] : [{ open: "09:00", close: "18:00" }],
  }));

const buildInitialFormState = (): DynamicShopFormState => ({
  type: "Student Shop",
  categoryId: "",
  subCategoryIds: [],
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
  minimumOrderAmount: 0,
  operatingHours: initialOperatingHours(),
  latitude: "",
  longitude: "",
  tagsText: "",
  isActive: true,
  isAggregator: false,
  isSkillBased: false,
  preOrderPolicy: {
    isPreOrderOnly: false,
    leadTimeHours: 0,
    nextDeliveryDate: "",
  },
  deliveryPolicy: {
    zoneName: "",
    maxRadiusKm: 0,
    baseDeliveryFee: 0,
    minOrderForFreeDelivery: 0,
  },
  inventoryPolicy: {
    allowBackOrder: false,
    maxOrderPerUser: 0,
  },
  serviceSla: {
    responseTimeHours: 0,
    revisionPolicy: "",
  },
  connector: {
    provider: "",
    merchantCode: "",
    hubId: "",
    coverageArea: "",
    deliveryFeeModel: "",
  },
});

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

const getCategoryDefaults = (kind: ShopCategoryKind): Partial<DynamicShopFormState> => {
  if (kind === "Food") {
    return { type: "Student Shop", isAggregator: false, isSkillBased: false, minimumOrderAmount: 100 };
  }
  if (kind === "Product") {
    return { type: "Student Shop", isAggregator: false, isSkillBased: false };
  }
  if (kind === "Logistics") {
    return { type: "Startup", isAggregator: true, isSkillBased: false, minimumOrderAmount: 0 };
  }
  if (kind === "Service") {
    return { type: "Student Shop", isAggregator: false, isSkillBased: true, minimumOrderAmount: 0 };
  }
  return {};
};

const fieldClassName =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-[#E30A13]";
const labelClassName = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500";

function FieldLabel({ children }: { children: string }) {
  return <label className={labelClassName}>{children}</label>;
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
    <div className="flex items-center gap-2">
      <input
        type="time"
        value={slot.open}
        onChange={(event) => onChange({ ...slot, open: event.target.value })}
        className={fieldClassName}
      />
      <span className="text-xs font-semibold text-gray-400">to</span>
      <input
        type="time"
        value={slot.close}
        onChange={(event) => onChange({ ...slot, close: event.target.value })}
        className={fieldClassName}
      />
      {removable ? (
        <button
          type="button"
          onClick={onRemove}
          className="rounded-lg p-2 text-red-500 hover:bg-red-50"
          aria-label="Remove slot"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}

export default function DynamicShopCreateForm({ locale, onBackToIntro }: DynamicShopCreateFormProps) {
  const messages = getShopCreateMessages(locale);
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [subCategories, setSubCategories] = useState<ShopCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [subCategoriesLoading, setSubCategoriesLoading] = useState(false);
  const [form, setForm] = useState<DynamicShopFormState>(buildInitialFormState);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let mounted = true;

    async function loadCategories() {
      setCategoriesLoading(true);
      const response = await getShopCategoriesAction(1, 50);

      if (!mounted) return;

      if (response.success && response.data) {
        if (response.data.length > 0) {
          setCategories(response.data);
        } else if (categories.length === 0) {
          setError(messages.form.errors.categoriesLoad);
        }
      } else {
        setError(response.message ?? messages.form.errors.categoriesLoad);
      }

      setCategoriesLoading(false);
    }

    void loadCategories();

    return () => {
      mounted = false;
    };
  }, [categories.length, messages.form.errors.categoriesLoad]);

  useEffect(() => {
    let mounted = true;

    async function loadSubCategories() {
      if (!form.categoryId) {
        setSubCategories([]);
        setNested("subCategoryIds", []);
        return;
      }

      setSubCategoriesLoading(true);
      const result = await getShopSubCategoriesAction(form.categoryId);
      if (!mounted) return;

      const items = result.success && result.data ? result.data : [];
      setSubCategories(items);

      setForm((prev) => ({
        ...prev,
        subCategoryIds: prev.subCategoryIds.filter((id) => items.some((entry) => entry._id === id)),
      }));

      setSubCategoriesLoading(false);
    }

    void loadSubCategories();

    return () => {
      mounted = false;
    };
  }, [form.categoryId]);

  const selectedCategory = useMemo(
    () => categories.find((item) => item._id === form.categoryId),
    [categories, form.categoryId],
  );

  const categoryKind = useMemo<ShopCategoryKind>(
    () => toCategoryKind(selectedCategory?.title ?? ""),
    [selectedCategory],
  );

  useEffect(() => {
    const defaults = getCategoryDefaults(categoryKind);
    if (!Object.keys(defaults).length) return;
    setForm((prev) => ({ ...prev, ...defaults }));
  }, [categoryKind]);

  const canProceedStepOne =
    form.categoryId.trim() &&
    form.name.trim();

  const canProceedStepTwo =
    form.logo.url.trim() &&
    form.logo.key.trim() &&
    form.coverPhoto.url.trim() &&
    form.coverPhoto.key.trim() &&
    Number.isFinite(Number(form.minimumOrderAmount));

  const hasOperatingHour = form.operatingHours.some((day) => !day.isClosed && day.slots.length > 0);
  const hasInvalidSlot = form.operatingHours.some(
    (day) => !day.isClosed && day.slots.some((slot) => !slot.open || !slot.close),
  );
  const hasCoordinates = form.latitude.trim() && form.longitude.trim();
  const hasValidCoordinates =
    !hasCoordinates ||
    (Number.isFinite(Number(form.latitude)) &&
      Number.isFinite(Number(form.longitude)) &&
      Math.abs(Number(form.latitude)) <= 90 &&
      Math.abs(Number(form.longitude)) <= 180);
  const preOrderVisible = categoryKind === "Food";
  const preOrderValid =
    !preOrderVisible ||
    !form.preOrderPolicy.isPreOrderOnly ||
    form.preOrderPolicy.leadTimeHours > 0;

  const canSubmit =
    canProceedStepOne &&
    canProceedStepTwo &&
    hasOperatingHour &&
    !hasInvalidSlot &&
    hasValidCoordinates &&
    preOrderValid;

  const setNested = <K extends keyof DynamicShopFormState>(key: K, value: DynamicShopFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateOperatingDay = (day: string, updater: (current: OperatingHourForm) => OperatingHourForm) => {
    setForm((prev) => ({
      ...prev,
      operatingHours: prev.operatingHours.map((entry) =>
        entry.day === day ? updater(entry) : entry,
      ),
    }));
  };

  const toggleSubCategory = (id: string) => {
    setNested(
      "subCategoryIds",
      form.subCategoryIds.includes(id)
        ? form.subCategoryIds.filter((entry) => entry !== id)
        : [...form.subCategoryIds, id],
    );
  };

  const handleMediaUpload = async (file: File, target: "logo" | "coverPhoto") => {
    if (target === "logo") setUploadingLogo(true);
    if (target === "coverPhoto") setUploadingCover(true);

    try {
      const upload = await uploadMediaFiles([file], MediaFeatureName.SHOP);
      if (!upload.success || !upload.urls.length) {
        setError(upload.message ?? "Failed to upload media.");
        return;
      }

      const mediaValue = {
        url: upload.urls[0],
        key: file.name,
        size: file.size,
      };

      setNested(target, mediaValue);
      setError(null);
    } finally {
      if (target === "logo") setUploadingLogo(false);
      if (target === "coverPhoto") setUploadingCover(false);
    }
  };

  const buildPayload = (): { payload: OwnerAddShopPayload; advancedConfig: AdvancedShopConfig } => {
    const subCategories = form.subCategoryIds;
    const tags = parseCommaSeparated(form.tagsText);

    const hasCoordinates = form.latitude.trim() && form.longitude.trim();
    const coordinates: [number, number] | null = hasCoordinates
      ? [toNumber(form.longitude), toNumber(form.latitude)]
      : null;

    const socialLinks = {
      facebook: form.socialLinks.facebook.trim() || undefined,
      instagram: form.socialLinks.instagram.trim() || undefined,
      twitter: form.socialLinks.twitter.trim() || undefined,
      whatsapp: form.socialLinks.whatsapp.trim() || undefined,
    };

    const normalizedOperatingHours = form.operatingHours.map((day) => ({
      day: day.day,
      isClosed: day.isClosed,
      slots: day.isClosed ? [] : day.slots.filter((slot) => slot.open && slot.close),
    }));

    const payload: OwnerAddShopPayload = {
      type: form.type,
      category: form.categoryId,
      ...(subCategories.length ? { subCategories } : {}),
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
      phoneNumber: form.phoneNumber.trim() || undefined,
      website: form.website.trim() || undefined,
      socialLinks:
        socialLinks.facebook || socialLinks.instagram || socialLinks.twitter || socialLinks.whatsapp
          ? socialLinks
          : undefined,
      minimumOrderAmount: toNumber(form.minimumOrderAmount),
      operatingHours: normalizedOperatingHours,
      ...(coordinates && hasValidCoordinates ? { location: { type: "Point", coordinates } } : {}),
      isActive: form.isActive,
      ...(tags.length ? { tags } : {}),
    };

    if (categoryKind === "Food") {
      payload.isAggregator = false;
      payload.isSkillBased = false;
      payload.preOrderPolicy = {
        isPreOrderOnly: form.preOrderPolicy.isPreOrderOnly,
        leadTimeHours: toNumber(form.preOrderPolicy.leadTimeHours),
        ...(form.preOrderPolicy.nextDeliveryDate
          ? { nextDeliveryDate: new Date(form.preOrderPolicy.nextDeliveryDate).toISOString() }
          : {}),
      };
    }

    if (categoryKind === "Product") {
      payload.isAggregator = false;
      payload.isSkillBased = false;
    }

    if (categoryKind === "Logistics") {
      payload.isAggregator = true;
      payload.isSkillBased = false;
    }

    if (categoryKind === "Service") {
      payload.isAggregator = false;
      payload.isSkillBased = true;
    }

    const advancedConfig: AdvancedShopConfig = {
      ...(categoryKind === "Food" || categoryKind === "Logistics"
        ? {
            deliveryPolicy: form.deliveryPolicy,
            connector: form.connector,
          }
        : {}),
      ...(categoryKind === "Product" ? { inventoryPolicy: form.inventoryPolicy } : {}),
      ...(categoryKind === "Service" ? { serviceSla: form.serviceSla } : {}),
    };

    return { payload, advancedConfig };
  };

  const hasAdvancedConfig = (advancedConfig: AdvancedShopConfig) => {
    const values = JSON.stringify(advancedConfig);
    return values !== "{}" && values.replace(/[{}\[\]\":,0\s]/g, "").length > 0;
  };

  const saveAdvancedConfig = (shopName: string, advancedConfig: AdvancedShopConfig) => {
    if (!hasAdvancedConfig(advancedConfig)) return;
    const storageKey = `shop_advanced_config_${shopName.trim().toLowerCase().replace(/\s+/g, "_")}`;
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        createdAt: new Date().toISOString(),
        advancedConfig,
      }),
    );
  };

  const submitForm = () => {
    if (!canSubmit) {
      if (!hasValidCoordinates) {
        setError("Coordinates must be valid [lng, lat] values.");
        return;
      }
      if (hasInvalidSlot) {
        setError("Every open operating day must include slot open and close time.");
        return;
      }
      if (!preOrderValid) {
        setError("Lead time is required for pre-order only food shops.");
        return;
      }
      setError(messages.form.errors.requiredAllSections);
      return;
    }

    setError(null);
    setSubmitMessage(null);

    const { payload, advancedConfig } = buildPayload();

    startTransition(async () => {
      const result = await createOwnerShopAction(payload);

      if (!result.success) {
        setError(result.message ?? messages.form.errors.createFail);
        return;
      }

      saveAdvancedConfig(payload.name, advancedConfig);
      setSubmitMessage(
        hasAdvancedConfig(advancedConfig)
          ? messages.form.success.advancedSavedMessage
          : messages.form.success.pendingMessage,
      );
      setSubmitted(true);
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ContentWrapper maxWidth="container" padding="lg" className="py-12">
          <div className="mx-auto max-w-xl rounded-3xl border border-emerald-100 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <Title as="h2" size="2xl" className="mb-2">
              {messages.form.success.title}
            </Title>
            <Paragraph color="muted" size="sm" className="mx-auto max-w-md">
              {submitMessage ?? messages.form.success.defaultMessage}
            </Paragraph>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href={`/${locale}/marketplace`}>
                <Button uppercase={false} className="!border-0 !bg-[#E30A13] !text-white">
                  {messages.form.buttons.goMarketplace}
                </Button>
              </Link>
              <Button
                variant="outline"
                uppercase={false}
                onClick={() => {
                  setSubmitted(false);
                  setStep(1);
                  setForm(buildInitialFormState());
                  setSubmitMessage(null);
                }}
              >
                {messages.form.buttons.createAnother}
              </Button>
            </div>
          </div>
        </ContentWrapper>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-14">
      <section className="border-b border-red-200/70 bg-gradient-to-r from-[#AE0810] to-[#D20A12] text-white">
        <ContentWrapper maxWidth="container" padding="lg" className="py-8 md:py-10">
          <button
            type="button"
            onClick={onBackToIntro}
            className="mb-4 inline-flex items-center gap-2 text-xs font-semibold text-red-100 transition hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {messages.form.backToIntro}
          </button>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Subtitle color="default" className="!text-red-100">
                {messages.form.heroBadge}
              </Subtitle>
              <Title as="h1" size="2xl" className="mt-2 !text-white md:!text-4xl">
                {messages.form.heroTitle}
              </Title>
              <Paragraph size="sm" className="mt-3 max-w-2xl !text-red-50">
                {messages.form.heroDescription}
              </Paragraph>
            </div>
            <div className="rounded-2xl bg-white/15 px-4 py-3 text-xs">
              <p className="font-semibold text-white">{messages.form.currentStep}</p>
              <p className="mt-1 text-red-100">{step} of 4</p>
            </div>
          </div>
        </ContentWrapper>
      </section>

      <ContentWrapper maxWidth="container" padding="md" className="space-y-5">
        <div className="grid gap-2 rounded-2xl border border-gray-100 bg-white p-4 md:grid-cols-4">
          {messages.form.steps.map(
            (label, index) => {
              const isActive = step === index + 1;
              const isDone = step > index + 1;

              return (
                <div
                  key={label}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium ${
                    isActive
                      ? "border-[#E30A13] bg-red-50 text-[#B70910]"
                      : isDone
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-gray-100 bg-gray-50 text-gray-500"
                  }`}
                >
                  {index + 1}. {label}
                </div>
              );
            },
          )}
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}

        <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm md:p-7">
          {step === 1 ? (
            <div className="space-y-5">
              <Heading as="h2" size="xl">
                {messages.form.step1Title}
              </Heading>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <FieldLabel>{messages.form.labels.category}</FieldLabel>
                  <select
                    value={form.categoryId}
                    onChange={(event) => setNested("categoryId", event.target.value)}
                    className={fieldClassName}
                    disabled={categoriesLoading}
                  >
                    <option value="">
                      {categoriesLoading ? messages.form.loadingCategories : messages.form.selectCategory}
                    </option>
                    {categories.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <FieldLabel>{messages.form.labels.shopType}</FieldLabel>
                  <select
                    value={form.type}
                    onChange={(event) =>
                      setNested("type", event.target.value as DynamicShopFormState["type"])
                    }
                    className={fieldClassName}
                  >
                    <option value="Student Shop">Student Shop</option>
                    <option value="Startup">Startup</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <FieldLabel>{messages.form.labels.shopName}</FieldLabel>
                  <input
                    value={form.name}
                    onChange={(event) => setNested("name", event.target.value)}
                    placeholder="Example: JU Smart Food Corner"
                    className={fieldClassName}
                  />
                </div>

                <div className="md:col-span-2">
                  <FieldLabel>{messages.form.labels.description}</FieldLabel>
                  <textarea
                    value={form.description}
                    onChange={(event) => setNested("description", event.target.value)}
                    rows={4}
                    placeholder="Tell students what you offer and why they should buy from your shop."
                    className={`${fieldClassName} resize-none`}
                  />
                </div>

                <div className="md:col-span-2">
                  <FieldLabel>{messages.form.labels.subCategories}</FieldLabel>
                  {subCategoriesLoading ? (
                    <p className="text-sm text-gray-500">{messages.form.loadingCategories}</p>
                  ) : subCategories.length ? (
                    <div className="grid gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3 md:grid-cols-2">
                      {subCategories.map((item) => (
                        <label
                          key={item._id}
                          className="inline-flex items-center gap-2 text-sm font-medium text-gray-700"
                        >
                          <input
                            type="checkbox"
                            checked={form.subCategoryIds.includes(item._id)}
                            onChange={() => toggleSubCategory(item._id)}
                          />
                          {item.title}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No sub-categories available for this category.</p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
                <div className="mb-1 flex items-center gap-2 font-semibold">
                  <Store className="h-4 w-4" />
                  {messages.form.notes.categorySpecific}
                </div>
                {SHOP_TYPE_NOTES[categoryKind]}
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-5">
              <Heading as="h2" size="xl">{messages.form.step2Title}</Heading>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <FieldLabel>{messages.form.labels.address}</FieldLabel>
                  <input
                    value={form.address}
                    onChange={(event) => setNested("address", event.target.value)}
                    placeholder="Hall area, road, and campus location"
                    className={fieldClassName}
                  />
                </div>
                <div>
                  <FieldLabel>{messages.form.labels.contactEmail}</FieldLabel>
                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={(event) => setNested("contactEmail", event.target.value)}
                    placeholder="owner@shop.com"
                    className={fieldClassName}
                  />
                </div>
                <div>
                  <FieldLabel>{messages.form.labels.phoneNumber}</FieldLabel>
                  <input
                    value={form.phoneNumber}
                    onChange={(event) => setNested("phoneNumber", event.target.value)}
                    placeholder="+8801XXXXXXXXX"
                    className={fieldClassName}
                  />
                </div>
                <div>
                  <FieldLabel>{messages.form.labels.website}</FieldLabel>
                  <input
                    value={form.website}
                    onChange={(event) => setNested("website", event.target.value)}
                    placeholder="https://example.com"
                    className={fieldClassName}
                  />
                </div>
                <div>
                  <FieldLabel>{messages.form.labels.minimumOrderAmount}</FieldLabel>
                  <input
                    type="number"
                    min={0}
                    value={form.minimumOrderAmount}
                    onChange={(event) => setNested("minimumOrderAmount", toNumber(event.target.value))}
                    className={fieldClassName}
                  />
                </div>
                <div>
                  <FieldLabel>{messages.form.labels.facebook}</FieldLabel>
                  <input
                    value={form.socialLinks.facebook}
                    onChange={(event) =>
                      setNested("socialLinks", { ...form.socialLinks, facebook: event.target.value })
                    }
                    className={fieldClassName}
                  />
                </div>
                <div>
                  <FieldLabel>{messages.form.labels.instagram}</FieldLabel>
                  <input
                    value={form.socialLinks.instagram}
                    onChange={(event) =>
                      setNested("socialLinks", { ...form.socialLinks, instagram: event.target.value })
                    }
                    className={fieldClassName}
                  />
                </div>
                <div>
                  <FieldLabel>{messages.form.labels.twitter}</FieldLabel>
                  <input
                    value={form.socialLinks.twitter}
                    onChange={(event) =>
                      setNested("socialLinks", { ...form.socialLinks, twitter: event.target.value })
                    }
                    className={fieldClassName}
                  />
                </div>
                <div>
                  <FieldLabel>{messages.form.labels.whatsapp}</FieldLabel>
                  <input
                    value={form.socialLinks.whatsapp}
                    onChange={(event) =>
                      setNested("socialLinks", { ...form.socialLinks, whatsapp: event.target.value })
                    }
                    className={fieldClassName}
                  />
                </div>
                <div>
                  <FieldLabel>{messages.form.labels.latitude}</FieldLabel>
                  <input
                    value={form.latitude}
                    onChange={(event) => setNested("latitude", event.target.value)}
                    placeholder="23.8103"
                    className={fieldClassName}
                  />
                </div>
                <div>
                  <FieldLabel>{messages.form.labels.longitude}</FieldLabel>
                  <input
                    value={form.longitude}
                    onChange={(event) => setNested("longitude", event.target.value)}
                    placeholder="90.4125"
                    className={fieldClassName}
                  />
                </div>
                <div className="md:col-span-2">
                  <FieldLabel>{messages.form.labels.tags}</FieldLabel>
                  <input
                    value={form.tagsText}
                    onChange={(event) => setNested("tagsText", event.target.value)}
                    placeholder="fast delivery, budget food, halal"
                    className={fieldClassName}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <Heading as="h3" size="base" className="mb-3">
                  Media Fields
                </Heading>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 bg-white p-3">
                    <FieldLabel>{messages.form.labels.logoUpload}</FieldLabel>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void handleMediaUpload(file, "logo");
                      }}
                      className="text-sm"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      {uploadingLogo ? "Uploading..." : form.logo.url || "No logo uploaded yet."}
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-white p-3">
                    <FieldLabel>{messages.form.labels.coverUpload}</FieldLabel>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void handleMediaUpload(file, "coverPhoto");
                      }}
                      className="text-sm"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      {uploadingCover ? "Uploading..." : form.coverPhoto.url || "No cover uploaded yet."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-6">
              <Heading as="h2" size="xl">{messages.form.step3Title}</Heading>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <Heading as="h3" size="base">
                    Operating Hours
                  </Heading>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-500">
                    <Clock3 className="h-3.5 w-3.5" />
                    Required
                  </span>
                </div>
                <div className="space-y-3">
                  {form.operatingHours.map((day) => (
                    <div key={day.day} className="rounded-xl border border-gray-200 bg-white p-3">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-gray-700">{day.day}</p>
                        <label className="inline-flex items-center gap-2 text-xs font-medium text-gray-500">
                          <input
                            type="checkbox"
                            checked={day.isClosed}
                            onChange={(event) =>
                              updateOperatingDay(day.day, (current) => ({
                                ...current,
                                isClosed: event.target.checked,
                                slots: event.target.checked
                                  ? []
                                  : current.slots.length
                                    ? current.slots
                                    : [{ open: "09:00", close: "18:00" }],
                              }))
                            }
                          />
                          Closed
                        </label>
                      </div>
                      {day.isClosed ? (
                        <p className="text-xs text-gray-400">Closed on this day</p>
                      ) : (
                        <div className="space-y-2">
                          {day.slots.map((slot, slotIndex) => (
                            <SlotEditor
                              key={`${day.day}-${slotIndex}`}
                              slot={slot}
                              removable={day.slots.length > 1}
                              onChange={(next) =>
                                updateOperatingDay(day.day, (current) => ({
                                  ...current,
                                  slots: current.slots.map((inner, innerIndex) =>
                                    innerIndex === slotIndex ? next : inner,
                                  ),
                                }))
                              }
                              onRemove={() =>
                                updateOperatingDay(day.day, (current) => ({
                                  ...current,
                                  slots: current.slots.filter((_, innerIndex) => innerIndex !== slotIndex),
                                }))
                              }
                            />
                          ))}
                          <button
                            type="button"
                            onClick={() =>
                              updateOperatingDay(day.day, (current) => ({
                                ...current,
                                slots: [...current.slots, { open: "", close: "" }],
                              }))
                            }
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#B70A11]"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            {messages.form.buttons.addSlot}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {(categoryKind === "Food" || categoryKind === "Logistics") && (
                <div className="rounded-2xl border border-gray-100 bg-white p-4">
                  <Heading as="h3" size="base" className="mb-3">
                    Delivery Zone / Connector
                  </Heading>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <FieldLabel>Delivery Zone Name</FieldLabel>
                      <input
                        value={form.deliveryPolicy.zoneName}
                        onChange={(event) =>
                          setNested("deliveryPolicy", {
                            ...form.deliveryPolicy,
                            zoneName: event.target.value,
                          })
                        }
                        className={fieldClassName}
                      />
                    </div>
                    <div>
                      <FieldLabel>Max Radius (km)</FieldLabel>
                      <input
                        type="number"
                        min={0}
                        value={form.deliveryPolicy.maxRadiusKm}
                        onChange={(event) =>
                          setNested("deliveryPolicy", {
                            ...form.deliveryPolicy,
                            maxRadiusKm: toNumber(event.target.value),
                          })
                        }
                        className={fieldClassName}
                      />
                    </div>
                    <div>
                      <FieldLabel>Base Delivery Fee</FieldLabel>
                      <input
                        type="number"
                        min={0}
                        value={form.deliveryPolicy.baseDeliveryFee}
                        onChange={(event) =>
                          setNested("deliveryPolicy", {
                            ...form.deliveryPolicy,
                            baseDeliveryFee: toNumber(event.target.value),
                          })
                        }
                        className={fieldClassName}
                      />
                    </div>
                    <div>
                      <FieldLabel>Min Order For Free Delivery</FieldLabel>
                      <input
                        type="number"
                        min={0}
                        value={form.deliveryPolicy.minOrderForFreeDelivery}
                        onChange={(event) =>
                          setNested("deliveryPolicy", {
                            ...form.deliveryPolicy,
                            minOrderForFreeDelivery: toNumber(event.target.value),
                          })
                        }
                        className={fieldClassName}
                      />
                    </div>

                    <div>
                      <FieldLabel>Connector Provider</FieldLabel>
                      <input
                        value={form.connector.provider}
                        onChange={(event) =>
                          setNested("connector", { ...form.connector, provider: event.target.value })
                        }
                        placeholder="Example: Ju Food Riders"
                        className={fieldClassName}
                      />
                    </div>
                    <div>
                      <FieldLabel>Merchant Code</FieldLabel>
                      <input
                        value={form.connector.merchantCode}
                        onChange={(event) =>
                          setNested("connector", { ...form.connector, merchantCode: event.target.value })
                        }
                        className={fieldClassName}
                      />
                    </div>
                    <div>
                      <FieldLabel>Hub ID</FieldLabel>
                      <input
                        value={form.connector.hubId}
                        onChange={(event) =>
                          setNested("connector", { ...form.connector, hubId: event.target.value })
                        }
                        className={fieldClassName}
                      />
                    </div>
                    <div>
                      <FieldLabel>Coverage Area</FieldLabel>
                      <input
                        value={form.connector.coverageArea}
                        onChange={(event) =>
                          setNested("connector", { ...form.connector, coverageArea: event.target.value })
                        }
                        className={fieldClassName}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <FieldLabel>Delivery Fee Model</FieldLabel>
                      <input
                        value={form.connector.deliveryFeeModel}
                        onChange={(event) =>
                          setNested("connector", {
                            ...form.connector,
                            deliveryFeeModel: event.target.value,
                          })
                        }
                        placeholder="Flat / Distance / Dynamic"
                        className={fieldClassName}
                      />
                    </div>
                  </div>
                </div>
              )}

              {categoryKind === "Food" && (
                <div className="rounded-2xl border border-gray-100 bg-white p-4">
                  <Heading as="h3" size="base" className="mb-3">
                    Food-specific Policy
                  </Heading>
                  <div className="grid gap-4 md:grid-cols-2">
                    <p className="text-sm font-medium text-gray-600">
                      Aggregator mode is fixed to disabled for Food category.
                    </p>
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-600">
                      <input
                        type="checkbox"
                        checked={form.preOrderPolicy.isPreOrderOnly}
                        onChange={(event) =>
                          setNested("preOrderPolicy", {
                            ...form.preOrderPolicy,
                            isPreOrderOnly: event.target.checked,
                          })
                        }
                      />
                      Pre-order only
                    </label>
                    <div>
                      <FieldLabel>Lead Time (hours)</FieldLabel>
                      <input
                        type="number"
                        min={0}
                        value={form.preOrderPolicy.leadTimeHours}
                        onChange={(event) =>
                          setNested("preOrderPolicy", {
                            ...form.preOrderPolicy,
                            leadTimeHours: toNumber(event.target.value),
                          })
                        }
                        className={fieldClassName}
                      />
                    </div>
                    <div>
                      <FieldLabel>Next Delivery Date</FieldLabel>
                      <input
                        type="date"
                        value={form.preOrderPolicy.nextDeliveryDate}
                        onChange={(event) =>
                          setNested("preOrderPolicy", {
                            ...form.preOrderPolicy,
                            nextDeliveryDate: event.target.value,
                          })
                        }
                        className={fieldClassName}
                      />
                    </div>
                  </div>
                </div>
              )}

              {categoryKind === "Product" && (
                <div className="rounded-2xl border border-gray-100 bg-white p-4">
                  <Heading as="h3" size="base" className="mb-3">
                    Inventory Policy
                  </Heading>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-600">
                      <input
                        type="checkbox"
                        checked={form.inventoryPolicy.allowBackOrder}
                        onChange={(event) =>
                          setNested("inventoryPolicy", {
                            ...form.inventoryPolicy,
                            allowBackOrder: event.target.checked,
                          })
                        }
                      />
                      Allow backorder
                    </label>
                    <div>
                      <FieldLabel>Max Order Per User</FieldLabel>
                      <input
                        type="number"
                        min={0}
                        value={form.inventoryPolicy.maxOrderPerUser}
                        onChange={(event) =>
                          setNested("inventoryPolicy", {
                            ...form.inventoryPolicy,
                            maxOrderPerUser: toNumber(event.target.value),
                          })
                        }
                        className={fieldClassName}
                      />
                    </div>
                  </div>
                </div>
              )}

              {categoryKind === "Service" && (
                <div className="rounded-2xl border border-gray-100 bg-white p-4">
                  <Heading as="h3" size="base" className="mb-3">
                    Service SLA
                  </Heading>
                  <div className="grid gap-4 md:grid-cols-2">
                    <p className="text-sm font-medium text-gray-600">
                      Skill-based mode is enabled by default for Service category.
                    </p>
                    <div>
                      <FieldLabel>First Response Time (hours)</FieldLabel>
                      <input
                        type="number"
                        min={0}
                        value={form.serviceSla.responseTimeHours}
                        onChange={(event) =>
                          setNested("serviceSla", {
                            ...form.serviceSla,
                            responseTimeHours: toNumber(event.target.value),
                          })
                        }
                        className={fieldClassName}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <FieldLabel>Revision Policy</FieldLabel>
                      <textarea
                        value={form.serviceSla.revisionPolicy}
                        onChange={(event) =>
                          setNested("serviceSla", {
                            ...form.serviceSla,
                            revisionPolicy: event.target.value,
                          })
                        }
                        rows={3}
                        className={`${fieldClassName} resize-none`}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-5">
              <Heading as="h2" size="xl">{messages.form.step4Title}</Heading>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Summary</p>
                <dl className="mt-3 grid gap-3 text-sm md:grid-cols-2">
                  <div>
                    <dt className="text-gray-500">Category</dt>
                    <dd className="font-semibold text-gray-800">{selectedCategory?.title || "Not selected"}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Shop Name</dt>
                    <dd className="font-semibold text-gray-800">{form.name || "Not provided"}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Contact</dt>
                    <dd className="font-semibold text-gray-800">{form.phoneNumber || "Not provided"}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Minimum Order</dt>
                    <dd className="font-semibold text-gray-800">{form.minimumOrderAmount}</dd>
                  </div>
                  <div className="md:col-span-2">
                    <dt className="text-gray-500">Description</dt>
                    <dd className="font-semibold text-gray-800">{form.description || "Not provided"}</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
                <div className="mb-1 flex items-center gap-2 font-semibold">
                  <ShieldCheck className="h-4 w-4" />
                  {messages.form.notes.payloadStrategyTitle}
                </div>
                {messages.form.notes.payloadStrategyBody}
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-5">
            <Button
              variant="ghost"
              uppercase={false}
              onClick={() => {
                if (step === 1) {
                  onBackToIntro();
                  return;
                }
                setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
              }}
            >
              {messages.form.buttons.back}
            </Button>

            <div className="flex flex-wrap gap-2">
              {step < 4 ? (
                <Button
                  uppercase={false}
                  className="!border-0 !bg-[#E30A13] !text-white"
                  disabled={(step === 1 && !canProceedStepOne) || (step === 2 && !canProceedStepTwo)}
                  onClick={() => setStep((prev) => (prev + 1) as 1 | 2 | 3 | 4)}
                >
                  {messages.form.buttons.next}
                </Button>
              ) : (
                <Button
                  uppercase={false}
                  className="!border-0 !bg-[#E30A13] !text-white"
                  onClick={submitForm}
                  disabled={!canSubmit || isPending}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isPending ? messages.form.buttons.submitting : messages.form.buttons.submit}
                </Button>
              )}
            </div>
          </div>
        </section>
      </ContentWrapper>
    </div>
  );
}