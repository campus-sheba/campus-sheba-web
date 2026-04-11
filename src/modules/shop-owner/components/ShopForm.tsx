"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { uploadMediaFiles } from "@/lib/media/client";
import type { Shop, ShopPayload } from "@/types/owner-shop-hub";
import Button from "@/components/ui/Button";
import { MediaFeatureName } from "@/types/media";
import { cn } from "@/utils/utils";
import { Store } from "lucide-react";

const inputCls =
  "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-[#00A651] focus:outline-none focus:ring-2 focus:ring-[#00A651]/25";
const labelCls = "mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500";

function socialFromShop(shop: Shop | null | undefined) {
  const r = shop?.socialLinks;
  if (!r || typeof r !== "object") {
    return { facebook: "", instagram: "", twitter: "", whatsapp: "" };
  }
  const o = r as Record<string, unknown>;
  return {
    facebook: String(o.facebook ?? ""),
    instagram: String(o.instagram ?? ""),
    twitter: String(o.twitter ?? ""),
    whatsapp: String(o.whatsapp ?? ""),
  };
}

type Props = {
  initial?: Shop | null;
  onSubmit: (data: ShopPayload) => void;
  onCancel?: () => void;
  loading: boolean;
  isEdit: boolean;
};

export default function ShopForm({ initial, onSubmit, onCancel, loading, isEdit }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [minimumOrderAmount, setMinimumOrderAmount] = useState("0");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [logo, setLogo] = useState<{ url: string; key: string; size: number } | null>(null);
  const [coverPhoto, setCoverPhoto] = useState<{ url: string; key: string; size: number } | null>(null);
  const [uploading, setUploading] = useState<"logo" | "cover" | null>(null);

  useEffect(() => {
    if (!initial || !isEdit) return;
    setName(initial.name ?? "");
    setDescription(initial.description ?? "");
    setAddress(initial.address ?? "");
    setPhoneNumber(initial.phoneNumber ?? "");
    setContactEmail(initial.contactEmail ?? "");
    setWebsite(initial.website ?? "");
    setMinimumOrderAmount(String(initial.minimumOrderAmount ?? 0));
    const s = socialFromShop(initial);
    setFacebook(s.facebook);
    setInstagram(s.instagram);
    setTwitter(s.twitter);
    setWhatsapp(s.whatsapp);
    if (initial.logo?.url && initial.logo.key) {
      setLogo({
        url: initial.logo.url,
        key: initial.logo.key,
        size: initial.logo.size ?? 0,
      });
    } else {
      setLogo(null);
    }
    if (initial.coverPhoto?.url && initial.coverPhoto.key) {
      setCoverPhoto({
        url: initial.coverPhoto.url,
        key: initial.coverPhoto.key,
        size: initial.coverPhoto.size ?? 0,
      });
    } else {
      setCoverPhoto(null);
    }
  }, [initial, isEdit]);

  async function onPickLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading("logo");
    const res = await uploadMediaFiles([f], MediaFeatureName.SHOP);
    setUploading(null);
    if (res.success && res.files?.[0]) setLogo(res.files[0]);
    e.target.value = "";
  }

  async function onPickCover(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading("cover");
    const res = await uploadMediaFiles([f], MediaFeatureName.SHOP);
    setUploading(null);
    if (res.success && res.files?.[0]) setCoverPhoto(res.files[0]);
    e.target.value = "";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const min = Number(minimumOrderAmount);
    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      address: address.trim() || undefined,
      phoneNumber: phoneNumber.trim() || undefined,
      contactEmail: contactEmail.trim() || undefined,
      website: website.trim() || undefined,
      minimumOrderAmount: Number.isFinite(min) ? min : 0,
      socialLinks: {
        facebook: facebook.trim() || undefined,
        instagram: instagram.trim() || undefined,
        twitter: twitter.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
      },
      logo: logo ?? undefined,
      coverPhoto: coverPhoto ?? undefined,
    });
  }

  if (!isEdit) {
    return (
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-gray-600">
          Creating a campus shop uses a short guided flow: category, hours, logo, cover, and verification
          options. You can return here anytime to manage your shop.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/marketplace/shop/create"
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-md px-5 py-2 text-xs font-semibold transition-colors",
              "bg-[#00A651] text-white hover:brightness-110",
            )}
          >
            <Store className="h-4 w-4 text-white" />
            Start guided setup
          </Link>
          {onCancel ? (
            <Button type="button" variant="outline" uppercase={false} onClick={onCancel}>
              Cancel
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Logo</label>
          <div className="flex items-center gap-3">
            {logo?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo.url} alt="" className="h-14 w-14 rounded-xl border border-gray-200 object-cover" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-xs text-gray-400">
                None
              </div>
            )}
            <label className="cursor-pointer text-xs font-semibold text-[#00A651] hover:underline">
              {uploading === "logo" ? "Uploading…" : "Upload logo"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => void onPickLogo(e)} disabled={!!uploading} />
            </label>
          </div>
        </div>
        <div>
          <label className={labelCls}>Cover photo</label>
          <div className="flex items-center gap-3">
            {coverPhoto?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverPhoto.url} alt="" className="h-14 w-24 rounded-lg border border-gray-200 object-cover" />
            ) : (
              <div className="flex h-14 w-24 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 text-xs text-gray-400">
                None
              </div>
            )}
            <label className="cursor-pointer text-xs font-semibold text-[#00A651] hover:underline">
              {uploading === "cover" ? "Uploading…" : "Upload cover"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => void onPickCover(e)} disabled={!!uploading} />
            </label>
          </div>
        </div>
      </div>

      <div>
        <label className={labelCls}>Name *</label>
        <input required className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>Description</label>
        <textarea className={`${inputCls} min-h-[100px] resize-none`} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>Address</label>
        <input className={inputCls} value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Phone *</label>
          <input required className={inputCls} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Email</label>
          <input type="email" className={inputCls} value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
        </div>
      </div>
      <div>
        <label className={labelCls}>Website</label>
        <input className={inputCls} value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://…" />
      </div>
      <div>
        <label className={labelCls}>Minimum order (৳)</label>
        <input type="number" min={0} className={inputCls} value={minimumOrderAmount} onChange={(e) => setMinimumOrderAmount(e.target.value)} />
      </div>

      <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Social links</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Facebook</label>
            <input className={inputCls} value={facebook} onChange={(e) => setFacebook(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Instagram</label>
            <input className={inputCls} value={instagram} onChange={(e) => setInstagram(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Twitter / X</label>
            <input className={inputCls} value={twitter} onChange={(e) => setTwitter(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>WhatsApp</label>
            <input className={inputCls} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        {onCancel ? (
          <Button type="button" variant="ghost" uppercase={false} onClick={onCancel} disabled={loading || !!uploading}>
            Cancel
          </Button>
        ) : null}
        <Button
          type="submit"
          variant="secondary"
          uppercase={false}
          disabled={loading || !!uploading}
          className="!border-0 !bg-[#00A651] !text-white hover:!brightness-110 sm:ml-auto"
        >
          {loading ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
