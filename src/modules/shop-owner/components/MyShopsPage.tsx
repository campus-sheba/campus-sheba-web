"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { listMyStudentShopsAction } from "@/services/shop";
import type { OwnerShop } from "@/types/owner-shop";
import { Loader2, Plus, Store } from "lucide-react";

export default function MyShopsPage() {
  const [shops, setShops] = useState<OwnerShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError(null);
      const res = await listMyStudentShopsAction();
      if (!res.success) {
        setError(res.message);
        setShops([]);
      } else {
        setShops(res.shops);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-gray-100 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My shop</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your student storefront, status, and verification.</p>
        </div>
        <Link
          href="/marketplace/shop/create"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00A651] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:brightness-105"
        >
          <Plus className="h-4 w-4" />
          Create shop
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-9 w-9 animate-spin text-[#00A651]" />
        </div>
      ) : error ? (
        <p className="mt-8 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      ) : shops.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
          <Store className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-sm font-medium text-gray-800">No student shop yet</p>
          <p className="mt-1 text-sm text-gray-500">Create your storefront to list food, products, or services on campus.</p>
          <Link
            href="/marketplace/shop/create"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-800"
          >
            <Plus className="h-4 w-4" />
            Create your first shop
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {shops.map((s) => (
            <li key={s._id}>
              <Link
                href={`/my-shop/${s._id}`}
                className="block rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-[#00A651]/25 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-gray-900">{s.name ?? "Untitled shop"}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-gray-500">{s.description ?? "—"}</p>
                  </div>
                  {s.status ? (
                    <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase text-gray-700">
                      {s.status}
                    </span>
                  ) : null}
                </div>
                {s.kycStatus ? (
                  <p className="mt-3 text-[11px] font-medium text-gray-500">
                    KYC: <span className="text-gray-800">{s.kycStatus}</span>
                  </p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
