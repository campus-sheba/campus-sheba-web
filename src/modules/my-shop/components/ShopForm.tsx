/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import type { ShopPayload, OperatingHour } from "@/app/[locale]/(protected)/(dashboard)/my-shop/actions";
import { uploadMediaFiles } from "@/lib/media/client";
import { MediaFeatureName } from "@/types/media";
import { Plus, Image as ImageIcon } from "lucide-react";

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

const DEFAULT_HOURS: OperatingHour[] = DAYS.map((day) => ({
  day,
  isClosed: day === "Friday" || day === "Saturday",
  slots: day === "Friday" || day === "Saturday"
    ? []
    : [{ open: "09:00", close: "18:00" }],
}));

const DEFAULT_FORM: ShopPayload = {
  type: "Student Shop",
  name: "",
  description: "",
  address: "",
  logo: { url: "", key: "", size: 0 },
  coverPhoto: { url: "", key: "", size: 0 },
  contactEmail: "",
  phoneNumber: "",
  website: "",
  socialLinks: { facebook: "", instagram: "", twitter: "" },
  minimumOrderAmount: 0,
  operatingHours: DEFAULT_HOURS,
  location: { type: "Point", coordinates: [0, 0] },
};

interface ShopFormProps {
  initial?: Partial<ShopPayload>;
  onSubmit: (data: ShopPayload) => void | Promise<void>;
  onCancel?: () => void;
  loading: boolean;
  isEdit?: boolean;
}

export default function ShopForm({
  initial,
  onSubmit,
  onCancel,
  loading,
  isEdit = false,
}: ShopFormProps) {
  const merged = { ...DEFAULT_FORM, ...initial };
  const [form, setForm] = useState<ShopPayload>({
    ...merged,
    socialLinks: { ...DEFAULT_FORM.socialLinks, ...initial?.socialLinks },
    logo: {
      url: initial?.logo?.url ?? DEFAULT_FORM.logo!.url,
      key: initial?.logo?.key ?? DEFAULT_FORM.logo!.key,
      size: initial?.logo?.size ?? DEFAULT_FORM.logo!.size,
    },
    coverPhoto: {
      url: initial?.coverPhoto?.url ?? DEFAULT_FORM.coverPhoto!.url,
      key: initial?.coverPhoto?.key ?? DEFAULT_FORM.coverPhoto!.key,
      size: initial?.coverPhoto?.size ?? DEFAULT_FORM.coverPhoto!.size,
    },
    operatingHours: initial?.operatingHours?.length ? initial.operatingHours : DEFAULT_HOURS,
    location: initial?.location ?? DEFAULT_FORM.location,
  });
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>("basic");

  // ─── upload logic ──────────────────────────────────────────────────────────
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "coverPhoto") {
    const file = e.target.files?.[0];
    if (!file) return;

    const isLogo = type === "logo";
    const setUploading = isLogo ? setUploadingLogo : setUploadingCover;
    setUploading(true);
    
    try {
      const res = await uploadMediaFiles([file], MediaFeatureName.SHOP);
      if (res.success && res.urls.length > 0) {
        setNestedField(type, "url", res.urls[0]);
        setNestedField(type, "size", file.size);
        setNestedField(type, "key", file.name);
      } else {
        setError(res.message || "Failed to upload image.");
      }
    } catch (err: any) {
      setError(err?.message || "Error uploading file.");
    } finally {
      setUploading(false);
    }
  }

  // ─── helpers ───────────────────────────────────────────────────────────────
  function setField<K extends keyof ShopPayload>(key: K, value: ShopPayload[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setNestedField(
    parent: "logo" | "coverPhoto" | "socialLinks" | "location",
    key: string,
    value: any
  ) {
    setForm((f) => ({ ...f, [parent]: { ...(f[parent] as any), [key]: value } }));
  }

  function setHour(idx: number, key: keyof OperatingHour, value: any) {
    setForm((f) => {
      const hours = [...(f.operatingHours ?? DEFAULT_HOURS)];
      hours[idx] = { ...hours[idx], [key]: value };
      return { ...f, operatingHours: hours };
    });
  }

  function addSlot(idx: number) {
    setForm((f) => {
      const hours = [...(f.operatingHours ?? DEFAULT_HOURS)];
      hours[idx] = {
        ...hours[idx],
        slots: [...hours[idx].slots, { open: "09:00", close: "18:00" }],
      };
      return { ...f, operatingHours: hours };
    });
  }

  function removeSlot(dayIdx: number, slotIdx: number) {
    setForm((f) => {
      const hours = [...(f.operatingHours ?? DEFAULT_HOURS)];
      const slots = hours[dayIdx].slots.filter((_, i) => i !== slotIdx);
      hours[dayIdx] = { ...hours[dayIdx], slots };
      return { ...f, operatingHours: hours };
    });
  }

  function setSlot(dayIdx: number, slotIdx: number, key: "open" | "close", value: string) {
    setForm((f) => {
      const hours = [...(f.operatingHours ?? DEFAULT_HOURS)];
      const slots = [...hours[dayIdx].slots];
      slots[slotIdx] = { ...slots[slotIdx], [key]: value };
      hours[dayIdx] = { ...hours[dayIdx], slots };
      return { ...f, operatingHours: hours };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) {
      setError("Shop name is required.");
      setActiveSection("basic");
      return;
    }
    try {
      await onSubmit(form);
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong.");
    }
  }

  // ─── section tabs ──────────────────────────────────────────────────────────
  const sections = [
    { id: "basic", label: "Basic Info" },
    { id: "media", label: "Media" },
    { id: "contact", label: "Contact & Social" },
    { id: "hours", label: "Hours" },
    { id: "location", label: "Location" },
  ];

  const inputCls =
    "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E30A13]/30 focus:border-[#E30A13] transition";

  const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Section Tabs */}
      <div className="flex flex-wrap gap-1 bg-gray-100 rounded-xl p-1">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActiveSection(s.id)}
            className={`flex-1 min-w-fit px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSection === s.id
                ? "bg-white text-[#E30A13] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ── BASIC INFO ── */}
      {activeSection === "basic" && (
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Shop Type</label>
            <select
              value={form.type}
              onChange={(e) => setField("type", e.target.value as any)}
              className={inputCls}
            >
              <option value="Student Shop">Student Shop</option>
              <option value="Campus Shop">Campus Shop</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Shop Name <span className="text-[#E30A13]">*</span></label>
            <input
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="e.g. Campus Bites"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea
              value={form.description ?? ""}
              onChange={(e) => setField("description", e.target.value)}
              rows={3}
              placeholder="Briefly describe your shop..."
              className={inputCls + " resize-none"}
            />
          </div>
          <div>
            <label className={labelCls}>Address</label>
            <input
              value={form.address ?? ""}
              onChange={(e) => setField("address", e.target.value)}
              placeholder="Building A, Floor 2, Campus Area"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Minimum Order Amount (BDT)</label>
            <input
              type="number"
              min={0}
              value={form.minimumOrderAmount ?? 0}
              onChange={(e) => setField("minimumOrderAmount", Number(e.target.value))}
              className={inputCls}
            />
          </div>
        </div>
      )}

      {/* ── MEDIA ── */}
      {activeSection === "media" && (
        <div className="space-y-5">
          <p className="text-xs text-gray-500">
            Upload your shop's logo and cover photo.
          </p>
          {/* Logo */}
          <div className="p-4 rounded-xl border border-gray-200 space-y-3">
            <p className="text-sm font-semibold text-gray-700">Logo</p>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                {form.logo?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.logo.url} alt="Logo preview" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-gray-300" />
                )}
              </div>
              <label className="cursor-pointer">
                <div className="px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 transition">
                  {uploadingLogo ? "Uploading..." : "Upload Logo"}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "logo")} disabled={uploadingLogo} />
              </label>
            </div>
            {/* hidden inputs for preserving form structure */}
            <input type="hidden" value={form.logo?.url ?? ""} />
            <input type="hidden" value={form.logo?.key ?? ""} />
            <input type="hidden" value={form.logo?.size ?? 0} />
          </div>
          
          {/* Cover Photo */}
          <div className="p-4 rounded-xl border border-gray-200 space-y-3">
            <p className="text-sm font-semibold text-gray-700">Cover Photo</p>
            <div className="flex flex-col gap-3">
              <div className="h-24 w-full bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                {form.coverPhoto?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.coverPhoto.url} alt="Cover preview" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-300" />
                )}
              </div>
              <div>
                <label className="cursor-pointer inline-block">
                  <div className="px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 transition">
                    {uploadingCover ? "Uploading..." : "Upload Cover"}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "coverPhoto")} disabled={uploadingCover} />
                </label>
              </div>
            </div>
            <input type="hidden" value={form.coverPhoto?.url ?? ""} />
            <input type="hidden" value={form.coverPhoto?.key ?? ""} />
            <input type="hidden" value={form.coverPhoto?.size ?? 0} />
          </div>
        </div>
      )}

      {/* ── CONTACT & SOCIAL ── */}
      {activeSection === "contact" && (
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Contact Email</label>
            <input
              type="email"
              value={form.contactEmail ?? ""}
              onChange={(e) => setField("contactEmail", e.target.value)}
              placeholder="support@yourshop.com"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Phone Number</label>
            <input
              value={form.phoneNumber ?? ""}
              onChange={(e) => setField("phoneNumber", e.target.value)}
              placeholder="+8801XXXXXXXXX"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Website</label>
            <input
              type="url"
              value={form.website ?? ""}
              onChange={(e) => setField("website", e.target.value)}
              placeholder="https://yourshop.com"
              className={inputCls}
            />
          </div>
          <div className="pt-2 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-700 mb-3">Social Links</p>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Facebook</label>
                <input
                  value={form.socialLinks?.facebook ?? ""}
                  onChange={(e) => setNestedField("socialLinks", "facebook", e.target.value)}
                  placeholder="https://facebook.com/yourshop"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Instagram</label>
                <input
                  value={form.socialLinks?.instagram ?? ""}
                  onChange={(e) => setNestedField("socialLinks", "instagram", e.target.value)}
                  placeholder="https://instagram.com/yourshop"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Twitter / X</label>
                <input
                  value={form.socialLinks?.twitter ?? ""}
                  onChange={(e) => setNestedField("socialLinks", "twitter", e.target.value)}
                  placeholder="https://twitter.com/yourshop"
                  className={inputCls}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── OPERATING HOURS ── */}
      {activeSection === "hours" && (
        <div className="space-y-3">
          {(form.operatingHours ?? DEFAULT_HOURS).map((hour, idx) => (
            <div
              key={hour.day}
              className={`rounded-xl border p-3 space-y-2 transition ${
                hour.isClosed ? "bg-gray-50 border-gray-200 opacity-70" : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800 w-24">{hour.day}</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs text-gray-500">
                    {hour.isClosed ? "Closed" : "Open"}
                  </span>
                  <div
                    onClick={() => setHour(idx, "isClosed", !hour.isClosed)}
                    className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${
                      hour.isClosed ? "bg-gray-300" : "bg-[#E30A13]"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        hour.isClosed ? "translate-x-0" : "translate-x-5"
                      }`}
                    />
                  </div>
                </label>
              </div>
              {!hour.isClosed && (
                <div className="space-y-1.5 pl-1">
                  {hour.slots.map((slot, sIdx) => (
                    <div key={sIdx} className="flex items-center gap-2">
                      <input
                        type="time"
                        value={slot.open}
                        onChange={(e) => setSlot(idx, sIdx, "open", e.target.value)}
                        className={inputCls + " !py-1 w-28"}
                      />
                      <span className="text-gray-400 text-xs">to</span>
                      <input
                        type="time"
                        value={slot.close}
                        onChange={(e) => setSlot(idx, sIdx, "close", e.target.value)}
                        className={inputCls + " !py-1 w-28"}
                      />
                      {hour.slots.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSlot(idx, sIdx)}
                          className="text-red-400 hover:text-red-600 text-lg leading-none"
                          title="Remove slot"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addSlot(idx)}
                    className="text-xs text-[#E30A13] hover:underline font-medium"
                  >
                    + Add time slot
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── LOCATION ── */}
      {activeSection === "location" && (
        <div className="space-y-4">
          <p className="text-xs text-gray-500">
            Enter the GPS coordinates of your shop (longitude, latitude).
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Longitude</label>
              <input
                type="number"
                step="any"
                value={form.location?.coordinates[0] ?? 0}
                onChange={(e) => {
                  const lng = parseFloat(e.target.value) || 0;
                  const lat = form.location?.coordinates[1] ?? 0;
                  setField("location", { type: "Point", coordinates: [lng, lat] });
                }}
                placeholder="106.660172"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Latitude</label>
              <input
                type="number"
                step="any"
                value={form.location?.coordinates[1] ?? 0}
                onChange={(e) => {
                  const lng = form.location?.coordinates[0] ?? 0;
                  const lat = parseFloat(e.target.value) || 0;
                  setField("location", { type: "Point", coordinates: [lng, lat] });
                }}
                placeholder="10.762622"
                className={inputCls}
              />
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <span className="text-red-500 text-sm">⚠</span>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
            uppercase={false}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="secondary"
          disabled={loading}
          uppercase={false}
          className="flex-1"
        >
          {loading ? (
            <span className="flex items-center gap-2 justify-center">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Saving...
            </span>
          ) : isEdit ? "Update Shop" : "Create Shop"}
        </Button>
      </div>
    </form>
  );
}
