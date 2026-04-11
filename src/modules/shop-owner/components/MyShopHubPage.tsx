"use client";

import type { ReactNode } from "react";
import { useEffect, useState, useTransition } from "react";
import { Link } from "@/i18n/navigation";
import { getMyShopAction, updateShopAction } from "@/services/owner-shop-hub";
import type { OperatingHour, Shop, ShopPayload } from "@/types/owner-shop-hub";
import ShopForm from "@/modules/shop-owner/components/ShopForm";
import ShopProductsTab from "@/modules/shop-owner/components/ShopProductsTab";
import ShopOrdersTab from "@/modules/shop-owner/components/ShopOrdersTab";
import ShopReviewsTab from "@/modules/shop-owner/components/ShopReviewsTab";
import Button from "@/components/ui/Button";
import {
  Store,
  Pencil,
  Phone,
  Mail,
  Globe,
  MapPin,
  Clock,
  Facebook,
  Instagram,
  Twitter,
  ChevronRight,
  Package,
  ShoppingBag,
  Star,
  Info,
  ShieldCheck,
} from "lucide-react";
import type { ShopOperatingDayPayload } from "@/types/shop-create";

type View = "detail" | "create" | "edit";
type Tab = "info" | "products" | "orders" | "reviews";

function socialUrl(shop: Shop, key: string): string | null {
  const sl = shop.socialLinks;
  if (!sl || typeof sl !== "object") return null;
  const v = (sl as Record<string, unknown>)[key];
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

export default function MyShopHubPage() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [view, setView] = useState<View>("detail");
  const [activeTab, setActiveTab] = useState<Tab>("info");

  const [fetchError, setFetchError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    void getMyShopAction().then((res) => {
      if (!res.success) {
        setFetchError(res.message ?? "Failed to load shop.");
      } else {
        setShop(res.shop ?? null);
      }
      setInitialLoading(false);
    });
  }, []);

  function refresh() {
    return getMyShopAction().then((res) => {
      if (res.success) setShop(res.shop ?? null);
    });
  }

  function handleUpdate(data: ShopPayload) {
    if (!shop?._id) return;
    setActionError(null);
    setActionSuccess(null);
    startTransition(async () => {
      const res = await updateShopAction(shop._id, data);
      if (!res.success) {
        setActionError(res.message ?? "Failed to update shop.");
      } else {
        await refresh();
        setView("detail");
        setActionSuccess("Shop updated successfully!");
      }
    });
  }

  if (initialLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="h-9 w-9 animate-spin rounded-full border-4 border-[#00A651]/20 border-t-[#00A651]" />
          <p className="text-sm text-gray-500">Loading your shop…</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="max-w-sm rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
          <p className="text-sm font-medium text-red-600">{fetchError}</p>
          <Button
            variant="outline"
            size="sm"
            uppercase={false}
            className="mt-4"
            onClick={() => {
              setFetchError(null);
              setInitialLoading(true);
              void getMyShopAction().then((res) => {
                if (!res.success) setFetchError(res.message ?? "Error");
                else setShop(res.shop ?? null);
                setInitialLoading(false);
              });
            }}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!shop || view === "create") {
    return (
      <div className="mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00A651]/10">
            <Store className="h-5 w-5 text-[#00A651]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Create your shop</h1>
            <p className="text-xs text-gray-500">Set up your campus shop profile</p>
          </div>
        </div>

        {actionError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">⚠ {actionError}</div>
        ) : null}

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <ShopForm
            onSubmit={() => {}}
            onCancel={shop ? () => setView("detail") : undefined}
            loading={false}
            isEdit={false}
          />
        </div>
      </div>
    );
  }

  if (view === "edit") {
    return (
      <div className="mx-auto space-y-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <button type="button" onClick={() => setView("detail")} className="font-medium transition-colors hover:text-[#00A651]">
            My shop
          </button>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-gray-700">Edit</span>
        </div>

        <div className="flex items-center gap-3">
          {shop.logo?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shop.logo.url} alt="" className="h-10 w-10 rounded-xl border border-gray-200 object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00A651]/10">
              <Store className="h-5 w-5 text-[#00A651]" />
            </div>
          )}
          <div>
            <h1 className="text-lg font-bold text-gray-900">Edit shop</h1>
            <p className="text-xs text-gray-500">{shop.name}</p>
          </div>
        </div>

        {actionError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">⚠ {actionError}</div>
        ) : null}

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <ShopForm initial={shop} onSubmit={handleUpdate} onCancel={() => setView("detail")} loading={isPending} isEdit />
        </div>
      </div>
    );
  }

  const hours = shop.operatingHours as OperatingHour[] | undefined;
  const openDays = hours?.filter((h) => !h.isClosed) ?? [];
  const closedDays = hours?.filter((h) => h.isClosed).map((h) => h.day) ?? [];

  const tabs: { id: Tab; label: string; icon: ReactNode }[] = [
    { id: "info", label: "Shop info", icon: <Info className="h-4 w-4" /> },
    { id: "products", label: "Products", icon: <Package className="h-4 w-4" /> },
    { id: "orders", label: "Orders", icon: <ShoppingBag className="h-4 w-4" /> },
    { id: "reviews", label: "Reviews", icon: <Star className="h-4 w-4" /> },
  ];

  const fb = socialUrl(shop, "facebook");
  const ig = socialUrl(shop, "instagram");
  const tw = socialUrl(shop, "twitter");

  const coords = shop.location?.coordinates;
  const hasCoords =
    Array.isArray(coords) &&
    coords.length >= 2 &&
    (coords[0] !== 0 || coords[1] !== 0);

  return (
    <div className="mx-auto mt-5 space-y-4">
      {actionSuccess ? (
        <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          <span>✓ {actionSuccess}</span>
          <button type="button" onClick={() => setActionSuccess(null)} className="ml-2 text-green-500 hover:text-green-700">
            ✕
          </button>
        </div>
      ) : null}

      <div className="mb-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="relative h-36 bg-gradient-to-br from-gray-100 to-gray-200">
          {shop.coverPhoto?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shop.coverPhoto.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>

        <div className="px-5 pb-5">
          <div className="-mt-8 mb-3 flex items-end justify-between">
            <div className="z-10 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-white shadow-md">
              {shop.logo?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={shop.logo.url} alt="" className="h-full w-full object-cover" />
              ) : (
                <Store className="h-7 w-7 text-[#00A651]" />
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/my-shop/${shop._id}/kyc`}
                className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 shadow-sm hover:bg-gray-50"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-[#00A651]" />
                KYC
              </Link>
              <Button
                variant="secondary"
                size="sm"
                uppercase={false}
                onClick={() => {
                  setActionError(null);
                  setView("edit");
                }}
                className="flex items-center gap-1.5 !border-0 !bg-[#00A651] !text-white hover:!brightness-110"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit shop
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-bold text-gray-900">{shop.name}</h1>
              <div className="mt-0.5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-[#00A651]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#00A651]">
                  {shop.type ?? "Student shop"}
                </span>
                {shop.minimumOrderAmount != null && shop.minimumOrderAmount > 0 ? (
                  <span className="inline-flex items-center rounded-full border border-amber-100 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                    Min. order ৳{shop.minimumOrderAmount}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap border-t border-gray-100 bg-gray-50/50 px-2 pt-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? "border-[#00A651] text-[#00A651]"
                  : "border-transparent text-gray-500 hover:border-gray-200 hover:text-gray-900"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        {activeTab === "info" ? (
          <div className="space-y-4">
            {shop.description ? (
              <div className="space-y-2 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-700">About</h2>
                <p className="text-sm leading-relaxed text-gray-600">{shop.description}</p>
              </div>
            ) : null}

            {(shop.address ||
              shop.contactEmail ||
              shop.phoneNumber ||
              shop.website ||
              fb ||
              ig ||
              tw) ? (
              <div className="space-y-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-700">Contact & social</h2>
                <div className="space-y-2">
                  {shop.address ? (
                    <div className="flex items-center gap-2.5 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 flex-shrink-0 text-gray-400" />
                      <span>{shop.address}</span>
                    </div>
                  ) : null}
                  {shop.phoneNumber ? (
                    <div className="flex items-center gap-2.5 text-sm text-gray-600">
                      <Phone className="h-4 w-4 flex-shrink-0 text-gray-400" />
                      <span>{shop.phoneNumber}</span>
                    </div>
                  ) : null}
                  {shop.contactEmail ? (
                    <div className="flex items-center gap-2.5 text-sm text-gray-600">
                      <Mail className="h-4 w-4 flex-shrink-0 text-gray-400" />
                      <span>{shop.contactEmail}</span>
                    </div>
                  ) : null}
                  {shop.website ? (
                    <div className="flex items-center gap-2.5 text-sm text-gray-600">
                      <Globe className="h-4 w-4 flex-shrink-0 text-gray-400" />
                      <a
                        href={shop.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate text-[#00A651] hover:underline"
                      >
                        {shop.website}
                      </a>
                    </div>
                  ) : null}
                </div>

                {fb || ig || tw ? (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {fb ? (
                      <a
                        href={fb}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
                      >
                        <Facebook className="h-3.5 w-3.5" /> Facebook
                      </a>
                    ) : null}
                    {ig ? (
                      <a
                        href={ig}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-pink-50 px-3 py-1.5 text-xs font-medium text-pink-700 transition-colors hover:bg-pink-100"
                      >
                        <Instagram className="h-3.5 w-3.5" /> Instagram
                      </a>
                    ) : null}
                    {tw ? (
                      <a
                        href={tw}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700 transition-colors hover:bg-sky-100"
                      >
                        <Twitter className="h-3.5 w-3.5" /> Twitter
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}

            {hours && hours.length > 0 ? (
              <div className="space-y-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <h2 className="text-sm font-semibold text-gray-700">Operating hours</h2>
                </div>
                <div className="space-y-1.5">
                  {openDays.map((h) => (
                    <div key={h.day} className="flex items-start gap-2 text-sm">
                      <span className="w-24 flex-shrink-0 font-medium text-gray-700">{h.day}</span>
                      <div className="flex flex-col gap-0.5">
                        {h.slots.map((s, i) => (
                          <span key={i} className="text-gray-600">
                            {s.open} – {s.close}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  {closedDays.length > 0 ? (
                    <div className="mt-1 flex items-start gap-2 border-t border-gray-100 pt-1 text-sm">
                      <span className="w-24 flex-shrink-0 font-medium text-gray-400">Closed</span>
                      <span className="text-gray-400">{closedDays.join(", ")}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            {hasCoords && coords ? (
              <div className="space-y-2 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <h2 className="text-sm font-semibold text-gray-700">Location</h2>
                </div>
                <p className="text-sm text-gray-600">
                  Lng: {coords[0]}, Lat: {coords[1]}
                </p>
                <a
                  href={`https://maps.google.com/?q=${coords[1]},${coords[0]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#00A651] hover:underline"
                >
                  <Globe className="h-3.5 w-3.5" /> Open in Google Maps
                </a>
              </div>
            ) : null}
          </div>
        ) : null}

        {activeTab === "products" ? <ShopProductsTab shopId={shop._id} /> : null}
        {activeTab === "orders" ? <ShopOrdersTab /> : null}
        {activeTab === "reviews" ? <ShopReviewsTab /> : null}
      </div>
    </div>
  );
}
