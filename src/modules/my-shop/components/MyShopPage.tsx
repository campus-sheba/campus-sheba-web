"use client";

import { useEffect, useState, useTransition } from "react";
import {
  getMyShopAction,
  createShopAction,
  updateShopAction,
  type Shop,
  type ShopPayload,
} from "@/app/[locale]/(protected)/(dashboard)/my-shop/actions";
import ShopForm from "./ShopForm";
import ShopProductsTab from "./ShopProductsTab";
import ShopOrdersTab from "./ShopOrdersTab";
import Button from "@/components/ui/Button";
import {
  Store,
  Pencil,
  Plus,
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
} from "lucide-react";

type View = "detail" | "create" | "edit";
type Tab = "info" | "products" | "orders" | "reviews";

export default function MyShopPage() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [view, setView] = useState<View>("detail");
  const [activeTab, setActiveTab] = useState<Tab>("info");
  
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // ── Initial fetch ──────────────────────────────────────────────────────────
  useEffect(() => {
    getMyShopAction().then((res) => {
      if (!res.success) {
        setFetchError(res.message ?? "Failed to load shop.");
      } else {
        setShop(res.shop ?? null);
      }
      setInitialLoading(false);
    });
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────
  function refresh() {
    return getMyShopAction().then((res) => {
      if (res.success) setShop(res.shop ?? null);
    });
  }

  function handleCreate(data: ShopPayload) {
    setActionError(null);
    setActionSuccess(null);
    startTransition(async () => {
      const res = await createShopAction(data);
      if (!res.success) {
        setActionError((res as any).message ?? "Failed to create shop.");
      } else {
        await refresh();
        setView("detail");
        setActiveTab("info");
        setActionSuccess("Shop created successfully!");
      }
    });
  }

  function handleUpdate(data: ShopPayload) {
    if (!shop?._id) return;
    setActionError(null);
    setActionSuccess(null);
    startTransition(async () => {
      const res = await updateShopAction(shop._id, data);
      if (!res.success) {
        setActionError((res as any).message ?? "Failed to update shop.");
      } else {
        await refresh();
        setView("detail");
        setActionSuccess("Shop updated successfully!");
      }
    });
  }

  // ── States ─────────────────────────────────────────────────────────────────
  if (initialLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="w-9 h-9 border-4 border-[#E30A13]/20 border-t-[#E30A13] rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading your shop…</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="p-6 rounded-2xl bg-red-50 border border-red-100 text-center max-w-sm">
          <p className="text-sm text-red-600 font-medium">{fetchError}</p>
          <Button
            variant="outline"
            size="sm"
            uppercase={false}
            className="mt-4"
            onClick={() => {
              setFetchError(null);
              setInitialLoading(true);
              getMyShopAction().then((res) => {
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

  // ── CREATE FORM ────────────────────────────────────────────────────────────
  if (!shop || view === "create") {
    return (
      <div className="mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E30A13]/10 flex items-center justify-center">
            <Store className="w-5 h-5 text-[#E30A13]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Create Your Shop</h1>
            <p className="text-xs text-gray-500">Set up your campus shop profile</p>
          </div>
        </div>

        {actionError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            ⚠ {actionError}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <ShopForm
            onSubmit={handleCreate}
            onCancel={shop ? () => setView("detail") : undefined}
            loading={isPending}
            isEdit={false}
          />
        </div>
      </div>
    );
  }

  // ── EDIT FORM ──────────────────────────────────────────────────────────────
  if (view === "edit") {
    return (
      <div className="mx-auto space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <button
            onClick={() => setView("detail")}
            className="hover:text-[#E30A13] transition-colors font-medium"
          >
            My Shop
          </button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-700 font-medium">Edit</span>
        </div>

        <div className="flex items-center gap-3">
          {shop.logo?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shop.logo.url}
              alt="Logo"
              className="w-10 h-10 rounded-xl object-cover border border-gray-200"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-[#E30A13]/10 flex items-center justify-center">
              <Store className="w-5 h-5 text-[#E30A13]" />
            </div>
          )}
          <div>
            <h1 className="text-lg font-bold text-gray-900">Edit Shop</h1>
            <p className="text-xs text-gray-500">{shop.name}</p>
          </div>
        </div>

        {actionError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            ⚠ {actionError}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <ShopForm
            initial={shop}
            onSubmit={handleUpdate}
            onCancel={() => setView("detail")}
            loading={isPending}
            isEdit
          />
        </div>
      </div>
    );
  }

  // ── DETAIL VIEW ────────────────────────────────────────────────────────────
  const openDays =
    shop.operatingHours?.filter((h) => !h.isClosed) ?? [];
  const closedDays =
    shop.operatingHours?.filter((h) => h.isClosed).map((h) => h.day) ?? [];

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "info", label: "Shop Info", icon: <Info className="w-4 h-4" /> },
    { id: "products", label: "Products", icon: <Package className="w-4 h-4" /> },
    { id: "orders", label: "Orders", icon: <ShoppingBag className="w-4 h-4" /> },
    { id: "reviews", label: "Reviews", icon: <Star className="w-4 h-4" /> },
  ];

  return (
    <div className="mx-auto space-y-4 mt-5">
      {/* Success toast */}
      {actionSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center justify-between">
          <span>✓ {actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="text-green-500 hover:text-green-700 ml-2">✕</button>
        </div>
      )}

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="relative h-36 bg-gradient-to-br from-gray-100 to-gray-200">
          {shop.coverPhoto?.url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shop.coverPhoto.url}
              alt="Cover"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>

        <div className="px-5 pb-5">
          <div className="flex items-end justify-between -mt-8 mb-3">
            <div className="w-16 h-16 rounded-2xl border-4 border-white shadow-md bg-white overflow-hidden flex items-center justify-center z-10">
              {shop.logo?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={shop.logo.url} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Store className="w-7 h-7 text-[#E30A13]" />
              )}
            </div>
            <Button
              variant="secondary"
              size="sm"
              uppercase={false}
              onClick={() => { setActionError(null); setView("edit"); }}
              className="flex items-center gap-1.5 !bg-[#E30A13] border-0"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit Shop
            </Button>
          </div>

          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 truncate">{shop.name}</h1>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-[#E30A13]/10 text-[#E30A13]">
                  {shop.type ?? "Student Shop"}
                </span>
                {shop.minimumOrderAmount! > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-100">
                    Min. order ৳{shop.minimumOrderAmount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Row */}
        <div className="flex flex-wrap border-t border-gray-100 bg-gray-50/50 px-2 pt-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-[#E30A13] text-[#E30A13]"
                  : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-200"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="mt-4">
        {activeTab === "info" && (
          <div className="space-y-4">
            {shop.description && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-2">
                <h2 className="text-sm font-semibold text-gray-700">About</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{shop.description}</p>
              </div>
            )}

            {/* Contact & Social */}
            {(shop.address || shop.contactEmail || shop.phoneNumber || shop.website ||
              shop.socialLinks?.facebook || shop.socialLinks?.instagram || shop.socialLinks?.twitter) && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                <h2 className="text-sm font-semibold text-gray-700">Contact & Social</h2>
                <div className="space-y-2">
                  {shop.address && (
                    <div className="flex items-center gap-2.5 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>{shop.address}</span>
                    </div>
                  )}
                  {shop.phoneNumber && (
                    <div className="flex items-center gap-2.5 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>{shop.phoneNumber}</span>
                    </div>
                  )}
                  {shop.contactEmail && (
                    <div className="flex items-center gap-2.5 text-sm text-gray-600">
                      <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>{shop.contactEmail}</span>
                    </div>
                  )}
                  {shop.website && (
                    <div className="flex items-center gap-2.5 text-sm text-gray-600">
                      <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <a
                        href={shop.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#E30A13] hover:underline truncate"
                      >
                        {shop.website}
                      </a>
                    </div>
                  )}
                </div>

                {/* Social links */}
                {(shop.socialLinks?.facebook || shop.socialLinks?.instagram || shop.socialLinks?.twitter) && (
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    {shop.socialLinks.facebook && (
                      <a
                        href={shop.socialLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-colors"
                      >
                        <Facebook className="w-3.5 h-3.5" /> Facebook
                      </a>
                    )}
                    {shop.socialLinks.instagram && (
                      <a
                        href={shop.socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-50 text-pink-700 text-xs font-medium hover:bg-pink-100 transition-colors"
                      >
                        <Instagram className="w-3.5 h-3.5" /> Instagram
                      </a>
                    )}
                    {shop.socialLinks.twitter && (
                      <a
                        href={shop.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 text-xs font-medium hover:bg-sky-100 transition-colors"
                      >
                        <Twitter className="w-3.5 h-3.5" /> Twitter
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Operating Hours */}
            {shop.operatingHours && shop.operatingHours.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <h2 className="text-sm font-semibold text-gray-700">Operating Hours</h2>
                </div>
                <div className="space-y-1.5">
                  {openDays.map((h) => (
                    <div key={h.day} className="flex items-start gap-2 text-sm">
                      <span className="w-24 font-medium text-gray-700 flex-shrink-0">{h.day}</span>
                      <div className="flex flex-col gap-0.5">
                        {h.slots.map((s, i) => (
                          <span key={i} className="text-gray-600">
                            {s.open} – {s.close}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  {closedDays.length > 0 && (
                    <div className="flex items-start gap-2 text-sm pt-1 border-t border-gray-100 mt-1">
                      <span className="w-24 font-medium text-gray-400 flex-shrink-0">Closed</span>
                      <span className="text-gray-400">{closedDays.join(", ")}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Location */}
            {shop.location?.coordinates && (
              shop.location.coordinates[0] !== 0 || shop.location.coordinates[1] !== 0
            ) && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <h2 className="text-sm font-semibold text-gray-700">Location</h2>
                </div>
                <p className="text-sm text-gray-600">
                  Lng: {shop.location.coordinates[0]}, Lat: {shop.location.coordinates[1]}
                </p>
                <a
                  href={`https://maps.google.com/?q=${shop.location.coordinates[1]},${shop.location.coordinates[0]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#E30A13] hover:underline font-medium"
                >
                  <Globe className="w-3.5 h-3.5" /> Open in Google Maps
                </a>
              </div>
            )}
          </div>
        )}

        {activeTab === "products" && <ShopProductsTab shopId={shop._id} />}

        {activeTab === "orders" && <ShopOrdersTab />}

        {activeTab === "reviews" && (
          <div className="bg-white p-10 text-center rounded-xl border border-gray-100 shadow-sm">
            <Star className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-bold">Reviews</p>
            <p className="text-gray-400 text-sm mt-1">Customer reviews will appear here.</p>
          </div>
        )}
      </div>

    </div>
  );
}
