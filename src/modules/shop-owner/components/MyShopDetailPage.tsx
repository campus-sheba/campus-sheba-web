"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/navigation";
import { getOwnerShopByIdAction } from "@/services/shop";
import type { OwnerShop } from "@/types/owner-shop";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";
import { ArrowLeft, Loader2, Pencil, ShieldCheck } from "lucide-react";

export default function MyShopDetailPage({ shopId }: { shopId: string }) {
  const router = useRouter();
  const [shop, setShop] = useState<OwnerShop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError(null);
      const res = await getOwnerShopByIdAction(shopId);
      if (!res.success) {
        setError(res.message);
        setShop(null);
      } else {
        setShop(res.shop);
      }
      setLoading(false);
    })();
  }, [shopId]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-9 w-9 animate-spin text-[#00A651]" />
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-800">
        {error ?? "Shop not found."}
        <button type="button" onClick={() => router.push("/my-shop")} className="mt-3 block text-[#00A651] font-semibold hover:underline">
          Back to my shop
        </button>
      </div>
    );
  }

  const cover = shop.coverPhoto?.url;
  const logo = shop.logo?.url;

  return (
    <div>
      <button
        type="button"
        onClick={() => router.push("/my-shop")}
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        All shops
      </button>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="relative aspect-[2.8/1] bg-gray-100">
          {cover ? (
            <Image src={cover} alt="" fill className="object-cover" unoptimized={shouldUnoptimizeRemoteImage(cover)} />
          ) : null}
        </div>
        <div className="relative px-4 pb-6 pt-0 sm:px-6">
          <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end">
            <div className="relative mx-auto h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-white bg-white shadow-md sm:mx-0 sm:h-28 sm:w-28">
              {logo ? (
                <Image src={logo} alt="" fill className="object-cover" unoptimized={shouldUnoptimizeRemoteImage(logo)} />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">No logo</div>
              )}
            </div>
            <div className="flex-1 text-center sm:pb-2 sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900">{shop.name}</h1>
              <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                {shop.status ? (
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-bold text-gray-800">{shop.status}</span>
                ) : null}
                {shop.isActive === false ? (
                  <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-900">Inactive</span>
                ) : null}
                {shop.kycStatus ? (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-900">
                    KYC: {shop.kycStatus}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600">{shop.description}</p>
          <p className="mt-2 text-sm text-gray-500">{shop.address}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/my-shop/${shopId}/edit`}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-800 shadow-sm hover:bg-gray-50"
            >
              <Pencil className="h-4 w-4" />
              Edit profile
            </Link>
            <Link
              href={`/my-shop/${shopId}/kyc`}
              className="inline-flex items-center gap-2 rounded-xl bg-[#00A651] px-4 py-2.5 text-sm font-bold text-white hover:brightness-105"
            >
              <ShieldCheck className="h-4 w-4" />
              KYC & verification
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
