"use client";

import { useEffect, useState, useTransition } from "react";
import {
  getOwnProductsAction,
  createProductAction,
  updateProductAction,
  deleteProductAction,
  getCategoriesAction,
} from "@/services/owner-shop-hub";
import type { Product, ProductPayload, ProductPhoto } from "@/types/owner-shop-hub";
import { getAddressesAction } from "@/services/addresses";
import { useAppState } from "@/contexts/AppStateContext";
import { pickDefaultDeliveryAddressId } from "@/modules/cart/deliveryAddress";
import { uploadMediaFiles } from "@/lib/media/client";
import { MediaFeatureName } from "@/types/media";
import Button from "@/components/ui/Button";
import type { UserAddress } from "@/types/address";
import { Plus, Pencil, Trash, Image as ImageIcon, Search } from "lucide-react";

const CONDITIONS = ["New", "Used - Like New", "Used - Good", "Used - Fair"] as const;
const MAX_PHOTOS = 5;

type CategoryRow = { _id: string; title: string };

type Props = { shopId: string };

export default function ShopProductsTab({ shopId }: Props) {
  const { state } = useAppState();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);

  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "form">("list");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeSection, setActiveSection] = useState<"basic" | "pricing" | "media" | "contact">("basic");

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState<Partial<ProductPayload>>({});

  useEffect(() => {
    void fetchData();
  }, []);

  useEffect(() => {
    const p = state.user.profile;
    if (!p) return;
    setForm((prev) => ({
      ...prev,
      contactName: prev.contactName || p.name || "",
      contactPhone: prev.contactPhone || p.phone || "",
      contactEmail: prev.contactEmail || p.email || "",
    }));
  }, [state.user.profile]);

  async function fetchData() {
    setLoading(true);
    const [prodRes, catRes, addrRes] = await Promise.all([
      getOwnProductsAction(),
      getCategoriesAction(),
      getAddressesAction("DELIVERY"),
    ]);

    if (prodRes.success) setProducts(prodRes.data);
    if (catRes.success) setCategories(catRes.data);
    if (addrRes.success) {
      const list = addrRes.data ?? [];
      setAddresses(list);
      const defaultId = pickDefaultDeliveryAddressId(list);
      setForm((prev) => ({ ...prev, addressId: prev.addressId || defaultId || "" }));
    }
    setLoading(false);
  }

  function handleAdd() {
    setEditingProduct(null);
    const p = state.user.profile;
    setForm({
      title: "",
      type: "Selling",
      subtitle: "",
      price: 0,
      quantity: 1,
      condition: CONDITIONS[2],
      description: "",
      photos: [],
      categoryId: "",
      addressId: form.addressId || "",
      isNegotiable: true,
      discountPrice: undefined,
      weight: undefined,
      safekeepingCharge: undefined,
      contactName: p?.name || "",
      contactPhone: p?.phone || "",
      contactEmail: p?.email || "",
      shopId,
    });
    setActiveSection("basic");
    setView("form");
  }

  function handleEdit(p: Product) {
    setEditingProduct(p);
    setForm({
      title: p.title,
      type: p.type ?? "Selling",
      subtitle: p.subtitle ?? "",
      price: p.price,
      quantity: p.quantity ?? 1,
      condition: p.condition ?? CONDITIONS[2],
      description: p.description ?? "",
      photos: (p.photos ?? []).map(
        (x): ProductPhoto => ({
          url: x.url,
          key: x.key ?? "",
          size: x.size ?? 0,
        }),
      ),
      categoryId: p.categoryId ?? "",
      addressId: p.addressId ?? "",
      isNegotiable: !!p.isNegotiable,
      discountPrice: p.discountPrice,
      weight: p.weight,
      safekeepingCharge: p.safekeepingCharge,
      contactName: p.contactName ?? "",
      contactPhone: p.contactPhone ?? "",
      contactEmail: p.contactEmail ?? "",
      shopId,
    });
    setActiveSection("basic");
    setView("form");
  }

  function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    startTransition(async () => {
      const delRes = await deleteProductAction(id);
      if (!delRes.success) {
        alert(delRes.message ?? "Delete failed");
        return;
      }
      const res = await getOwnProductsAction();
      if (res.success) setProducts(res.data);
    });
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadMediaFiles([file], MediaFeatureName.PRODUCT);
      if (res.success && res.files?.[0]) {
        setForm((prev) => ({
          ...prev,
          photos: [...(prev.photos || []), res.files![0]].slice(0, MAX_PHOTOS),
        }));
      } else {
        alert(res.message ?? "Upload failed");
      }
    } catch {
      alert("Error uploading file");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removePhoto(idx: number) {
    setForm((prev) => ({
      ...prev,
      photos: prev.photos?.filter((_, i) => i !== idx),
    }));
  }

  function buildPayload(): ProductPayload | null {
    if (
      !form.title?.trim() ||
      form.price == null ||
      form.quantity == null ||
      !form.categoryId ||
      !form.addressId ||
      !form.description?.trim() ||
      !form.contactName?.trim() ||
      !form.contactPhone?.trim() ||
      !form.contactEmail?.trim()
    ) {
      return null;
    }
    if (!form.photos?.length) return null;

    return {
      title: form.title.trim(),
      type: form.type,
      subtitle: form.subtitle?.trim() || undefined,
      description: form.description.trim(),
      photos: form.photos,
      price: Number(form.price),
      quantity: Math.max(1, Math.floor(Number(form.quantity))),
      categoryId: form.categoryId,
      addressId: form.addressId,
      condition: form.condition ?? CONDITIONS[2],
      isNegotiable: !!form.isNegotiable,
      discountPrice:
        form.discountPrice != null && form.discountPrice > 0 ? Number(form.discountPrice) : undefined,
      weight: form.weight != null && form.weight > 0 ? Number(form.weight) : undefined,
      safekeepingCharge:
        form.type === "Lending" && form.safekeepingCharge != null
          ? Number(form.safekeepingCharge)
          : undefined,
      shopId,
      contactName: form.contactName.trim(),
      contactPhone: form.contactPhone.trim(),
      contactEmail: form.contactEmail.trim(),
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = buildPayload();
    if (!payload) {
      setError(
        "Please fill all required fields: title, description, price, quantity, category, address, contact details, and at least one photo.",
      );
      return;
    }

    startTransition(async () => {
      try {
        let res;
        if (editingProduct) {
          res = await updateProductAction(editingProduct._id, payload);
        } else {
          res = await createProductAction(payload);
        }

        if (res.success) {
          const refetch = await getOwnProductsAction();
          if (refetch.success) setProducts(refetch.data);
          setView("list");
        } else {
          setError("message" in res ? (res.message ?? "Request failed") : "Request failed");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Request failed");
      }
    });
  }

  const inputCls =
    "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm transition focus:border-[#00A651] focus:outline-none focus:ring-2 focus:ring-[#00A651]/25";
  const labelCls = "mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500";

  if (view === "form") {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h3 className="mb-1 text-xl font-bold text-gray-900">{editingProduct ? "Edit product" : "New product"}</h3>
        <p className="mb-6 text-sm text-gray-500">Required fields are marked with *.</p>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">⚠ {error}</div>
        ) : null}

        <div className="mb-6 flex w-full max-w-2xl gap-1 rounded-xl bg-gray-50 p-1">
          {(["basic", "pricing", "media", "contact"] as const).map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => setActiveSection(sec)}
              className={`flex-1 rounded-lg py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
                activeSection === sec ? "bg-white text-[#00A651] shadow-sm" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
          {activeSection === "basic" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Type</label>
                  <select
                    value={form.type ?? "Selling"}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className={inputCls}
                  >
                    <option value="Selling">Selling</option>
                    <option value="Lending">Lending</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Condition *</label>
                  <select
                    value={form.condition ?? CONDITIONS[2]}
                    onChange={(e) => setForm({ ...form, condition: e.target.value })}
                    className={inputCls}
                  >
                    {CONDITIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>Title *</label>
                <input
                  required
                  value={form.title ?? ""}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Subtitle</label>
                <input
                  value={form.subtitle ?? ""}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Description *</label>
                <textarea
                  required
                  value={form.description ?? ""}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className={`${inputCls} resize-none`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Category *</label>
                  <select
                    required
                    value={form.categoryId || ""}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className={inputCls}
                  >
                    <option value="" disabled>
                      Select category…
                    </option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Address *</label>
                  {addresses.length === 0 ? (
                    <p className="mt-2 text-xs text-[#00A651]">Add a delivery address under My addresses.</p>
                  ) : (
                    <select
                      required
                      value={form.addressId || ""}
                      onChange={(e) => setForm({ ...form, addressId: e.target.value })}
                      className={inputCls}
                    >
                      <option value="" disabled>
                        Select address…
                      </option>
                      {addresses.map((a) => (
                        <option key={a._id} value={a._id}>
                          {a.address}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          {activeSection === "pricing" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Price (৳) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={form.price ?? ""}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Quantity *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={form.quantity ?? ""}
                    onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Discount price (৳)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.discountPrice ?? ""}
                    onChange={(e) => setForm({ ...form, discountPrice: Number(e.target.value) })}
                    className={inputCls}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className={labelCls}>Weight (kg)</label>
                  <input
                    type="number"
                    step="any"
                    min={0}
                    value={form.weight ?? ""}
                    onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })}
                    className={inputCls}
                    placeholder="Optional"
                  />
                </div>
              </div>
              {form.type === "Lending" ? (
                <div>
                  <label className={labelCls}>Safekeeping charge (৳)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.safekeepingCharge ?? ""}
                    onChange={(e) => setForm({ ...form, safekeepingCharge: Number(e.target.value) })}
                    className={inputCls}
                  />
                </div>
              ) : null}
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!form.isNegotiable}
                  onChange={(e) => setForm({ ...form, isNegotiable: e.target.checked })}
                  className="rounded border-gray-300 text-[#00A651] focus:ring-[#00A651]"
                />
                <span className="text-sm font-medium text-gray-700">Price is negotiable</span>
              </label>
            </div>
          ) : null}

          {activeSection === "media" ? (
            <div className="space-y-4">
              <label className={labelCls}>Photos * (max {MAX_PHOTOS})</label>
              <div className="grid grid-cols-2 gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 sm:grid-cols-4">
                {form.photos?.map((photo, i) => (
                  <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute right-1 top-1 rounded-md bg-red-500 p-1 text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-600"
                    >
                      <Trash className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                {(form.photos?.length ?? 0) < MAX_PHOTOS ? (
                  <label className="relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white text-gray-400 shadow-sm transition hover:border-[#00A651] hover:text-[#00A651]">
                    {uploading ? (
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#00A651]/30 border-t-[#00A651]" />
                    ) : (
                      <>
                        <Plus className="mb-1 h-6 w-6" />
                        <span className="text-xs font-medium">Add photo</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => void handlePhotoUpload(e)}
                      disabled={uploading}
                    />
                  </label>
                ) : null}
              </div>
            </div>
          ) : null}

          {activeSection === "contact" ? (
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Contact name *</label>
                <input
                  required
                  value={form.contactName ?? ""}
                  onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Phone *</label>
                  <input
                    required
                    value={form.contactPhone ?? ""}
                    onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Email *</label>
                  <input
                    type="email"
                    required
                    value={form.contactEmail ?? ""}
                    onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex gap-3 border-t border-gray-100 pt-6">
            <Button type="button" variant="ghost" uppercase={false} onClick={() => setView("list")} disabled={isPending || uploading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="secondary"
              uppercase={false}
              disabled={isPending || uploading}
              className="ml-auto !border-0 !bg-[#00A651] !text-white hover:!brightness-110"
            >
              {isPending ? "Saving…" : editingProduct ? "Update product" : "Publish product"}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <span className="mb-3 h-8 w-8 animate-spin rounded-full border-4 border-[#00A651]/20 border-t-[#00A651]" />
        <span className="text-sm font-medium text-gray-500">Loading products…</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
            <ImageIcon className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h3 className="font-bold leading-tight text-gray-900">Your products</h3>
            <p className="text-xs font-medium text-gray-500">
              {products.length} listing{products.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={handleAdd}
          uppercase={false}
          className="gap-1.5 !border-0 !bg-[#00A651] !text-white hover:!brightness-110"
        >
          <Plus className="h-4 w-4" /> Create new
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
            <Search className="h-6 w-6 text-gray-400" />
          </div>
          <p className="mb-1 text-lg font-bold text-gray-900">No products found</p>
          <p className="mb-5 text-sm text-gray-500">List items for your shop.</p>
          <Button variant="outline" uppercase={false} onClick={handleAdd}>
            List your first product
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => {
            const showDiscount = p.discountPrice != null && p.discountPrice > 0 && p.price > p.discountPrice;
            return (
              <div
                key={p._id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="relative aspect-[4/3] overflow-hidden border-b border-gray-100 bg-gray-50">
                  {p.photos && p.photos.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.photos[0].url}
                      alt={p.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center text-gray-300">
                      <ImageIcon className="mb-2 h-8 w-8 opacity-50" />
                      <span className="text-[10px] font-medium uppercase tracking-wider">No image</span>
                    </div>
                  )}
                  {p.type ? (
                    <div className="absolute left-2 top-2 flex flex-wrap gap-1">
                      <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-700 shadow-sm">
                        {p.type}
                      </span>
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h4 className="mb-1 line-clamp-2 text-sm font-bold leading-tight text-gray-900" title={p.title}>
                    {p.title}
                  </h4>
                  {p.subtitle ? <p className="mb-2 line-clamp-1 text-xs text-gray-500">{p.subtitle}</p> : null}
                  <div className="mt-auto flex items-end justify-between pt-3">
                    <div>
                      <div className="text-xl font-black leading-none text-[#00A651]">
                        ৳{showDiscount ? p.discountPrice : p.price}
                      </div>
                      {showDiscount ? (
                        <div className="mt-0.5 text-[10px] font-bold text-gray-400 line-through">৳{p.price}</div>
                      ) : (
                        <div className="mt-0.5 text-[10px] font-medium text-gray-400">Qty {p.quantity ?? 1}</div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleEdit(p)}
                        className="rounded-lg border border-transparent bg-gray-50/50 p-2 text-gray-400 transition hover:border-blue-100 hover:bg-blue-50 hover:text-blue-600"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p._id)}
                        disabled={isPending}
                        className="rounded-lg border border-transparent bg-gray-50/50 p-2 text-gray-400 transition hover:border-red-100 hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
