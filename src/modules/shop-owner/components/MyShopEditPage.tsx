"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { getOwnerShopByIdAction, updateOwnerShopAction } from "@/services/shop";
import type { OwnerShop } from "@/types/owner-shop";
import { ArrowLeft, Loader2 } from "lucide-react";

const inputClass =
  "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#00A651] focus:ring-1 focus:ring-[#00A651]/20";
const labelClass = "mb-1.5 block text-xs font-semibold text-gray-600";

export default function MyShopEditPage({ shopId }: { shopId: string }) {
  const router = useRouter();
  const [shop, setShop] = useState<OwnerShop | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [minimumOrderAmount, setMinimumOrderAmount] = useState("");

  useEffect(() => {
    void (async () => {
      setLoading(true);
      const res = await getOwnerShopByIdAction(shopId);
      if (!res.success) {
        setError(res.message);
        setShop(null);
      } else {
        setShop(res.shop);
        setName(res.shop.name ?? "");
        setDescription(res.shop.description ?? "");
        setAddress(res.shop.address ?? "");
        setPhoneNumber(res.shop.phoneNumber ?? "");
        setContactEmail(res.shop.contactEmail ?? "");
        setWebsite(res.shop.website ?? "");
        setMinimumOrderAmount(String(res.shop.minimumOrderAmount ?? 0));
      }
      setLoading(false);
    })();
  }, [shopId]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const min = Number(minimumOrderAmount);
    const body: Record<string, unknown> = {
      name: name.trim(),
      description: description.trim(),
      address: address.trim(),
      phoneNumber: phoneNumber.trim(),
      contactEmail: contactEmail.trim() || null,
      website: website.trim() || null,
      minimumOrderAmount: Number.isFinite(min) ? min : 0,
    };
    const res = await updateOwnerShopAction(shopId, body);
    setSaving(false);
    if (!res.success) {
      setError(res.message);
      return;
    }
    router.push(`/my-shop/${shopId}`);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-9 w-9 animate-spin text-[#00A651]" />
      </div>
    );
  }

  if (error && !shop) {
    return <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>;
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => router.push(`/my-shop/${shopId}`)}
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>
      <h1 className="text-2xl font-bold text-gray-900">Edit shop</h1>
      <p className="mt-1 text-sm text-gray-500">Update profile fields. Category and media can be extended later.</p>
      {error ? <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}

      <form onSubmit={(e) => void onSave(e)} className="mt-6 max-w-lg space-y-4">
        <div>
          <label className={labelClass}>Name</label>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <textarea className={`${inputClass} min-h-[100px]`} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Address</label>
          <input className={inputClass} value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <input className={inputClass} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input className={inputClass} type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Website</label>
          <input className={inputClass} value={website} onChange={(e) => setWebsite(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Minimum order (BDT)</label>
          <input className={inputClass} type="number" min={0} value={minimumOrderAmount} onChange={(e) => setMinimumOrderAmount(e.target.value)} />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex min-w-[140px] items-center justify-center rounded-xl bg-[#00A651] px-5 py-2.5 text-sm font-bold text-white hover:brightness-105 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save changes"}
        </button>
      </form>
    </div>
  );
}
