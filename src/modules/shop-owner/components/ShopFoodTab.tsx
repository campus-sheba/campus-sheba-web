"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import {
  getOwnFoodsAction,
  createFoodAction,
  updateFoodAction,
  deleteFoodAction,
  getFoodCategoriesAction,
} from "@/services/owner-shop-hub";
import type {
  FoodItem,
  FoodPayload,
  FoodPhoto,
  FoodSpicyLevel,
  FoodVariation,
} from "@/types/owner-shop-hub";
import { uploadMediaFiles } from "@/lib/media/client";
import { MediaFeatureName } from "@/types/media";
import Button from "@/components/ui/Button";
import { Plus, Pencil, Trash, Image as ImageIcon, Search, X } from "lucide-react";

const SPICY_LEVELS: FoodSpicyLevel[] = ["Mild", "Medium", "Hot", "Extra Hot"];
const ALLERGEN_OPTIONS = ["Nuts", "Dairy", "Gluten", "Egg", "Soy", "Fish", "Shellfish", "Wheat"];
const MAX_PHOTOS = 5;

type CategoryRow = { _id: string; title: string };
type FormTab = "basic" | "pricing" | "media" | "details";

type Props = { shopId: string };

export default function ShopFoodTab({ shopId }: Props) {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);

  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "form">("list");
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);
  const [activeSection, setActiveSection] = useState<FormTab>("basic");

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState<Partial<FoodPayload>>({});
  const [variationDraft, setVariationDraft] = useState({ title: "", price: "" });
  const [allergenDraft, setAllergenDraft] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [foodRes, catRes] = await Promise.all([
      getOwnFoodsAction({ shop: shopId }),
      getFoodCategoriesAction(),
    ]);
    if (foodRes.success) setFoods(foodRes.data);
    if (catRes.success) setCategories(catRes.data);
    setLoading(false);
  }, [shopId]);

  useEffect(() => { void fetchData(); }, [fetchData]);

  function blankForm(): Partial<FoodPayload> {
    return {
      title: "",
      description: "",
      price: 0,
      quantity: 1,
      photos: [],
      category: "",
      variations: [],
      allergens: [],
      isVegetarian: false,
      isVegan: false,
      shopId,
    };
  }

  function handleAdd() {
    setEditingFood(null);
    setForm(blankForm());
    setVariationDraft({ title: "", price: "" });
    setAllergenDraft("");
    setActiveSection("basic");
    setView("form");
  }

  function handleEdit(f: FoodItem) {
    setEditingFood(f);
    setForm({
      title: f.title,
      description: f.description ?? "",
      price: f.price,
      discountPrice: f.discountPrice,
      quantity: f.quantity ?? 1,
      photos: (f.photos ?? []).map((x): FoodPhoto => ({ url: x.url, key: x.key ?? "", size: x.size ?? 0 })),
      category:
        typeof f.category === "object" && f.category !== null
          ? (f.category as { _id: string })._id
          : (f.category ?? ""),
      variations: f.variations ?? [],
      allergens: f.allergens ?? [],
      isVegetarian: !!f.isVegetarian,
      isVegan: !!f.isVegan,
      spicyLevel: f.spicyLevel,
      preparationTime: f.preparationTime,
      deliveryTime: f.deliveryTime,
      servingSize: f.servingSize ?? "",
      maxDailyOrders: f.maxDailyOrders,
      shopId,
    });
    setVariationDraft({ title: "", price: "" });
    setAllergenDraft("");
    setActiveSection("basic");
    setView("form");
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this food item?")) return;
    startTransition(async () => {
      const res = await deleteFoodAction(id);
      if (!res.success) { alert(res.message ?? "Delete failed"); return; }
      const r = await getOwnFoodsAction({ shop: shopId });
      if (r.success) setFoods(r.data);
    });
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadMediaFiles([file], MediaFeatureName.PRODUCT);
      if (res.success && res.files?.[0]) {
        setForm((prev) => ({ ...prev, photos: [...(prev.photos ?? []), res.files![0]].slice(0, MAX_PHOTOS) }));
      } else {
        alert(res.message ?? "Upload failed");
      }
    } catch { alert("Error uploading file"); }
    finally { setUploading(false); e.target.value = ""; }
  }

  function removePhoto(idx: number) {
    setForm((prev) => ({ ...prev, photos: prev.photos?.filter((_, i) => i !== idx) }));
  }

  function addVariation() {
    const price = parseFloat(variationDraft.price);
    if (!variationDraft.title.trim() || isNaN(price) || price < 0) return;
    const v: FoodVariation = { title: variationDraft.title.trim(), price };
    setForm((prev) => ({ ...prev, variations: [...(prev.variations ?? []), v] }));
    setVariationDraft({ title: "", price: "" });
  }

  function removeVariation(idx: number) {
    setForm((prev) => ({ ...prev, variations: prev.variations?.filter((_, i) => i !== idx) }));
  }

  function toggleAllergen(allergen: string) {
    setForm((prev) => {
      const current = prev.allergens ?? [];
      return {
        ...prev,
        allergens: current.includes(allergen)
          ? current.filter((a) => a !== allergen)
          : [...current, allergen],
      };
    });
  }

  function addCustomAllergen() {
    const a = allergenDraft.trim();
    if (!a || (form.allergens ?? []).includes(a)) return;
    setForm((prev) => ({ ...prev, allergens: [...(prev.allergens ?? []), a] }));
    setAllergenDraft("");
  }

  function buildPayload(): FoodPayload | null {
    if (
      !form.title?.trim() ||
      form.price == null ||
      form.quantity == null ||
      !form.category ||
      !form.photos?.length
    ) return null;

    return {
      title: form.title.trim(),
      description: form.description?.trim() || undefined,
      price: Number(form.price),
      discountPrice: form.discountPrice != null && Number(form.discountPrice) > 0 ? Number(form.discountPrice) : undefined,
      quantity: Math.max(1, Math.floor(Number(form.quantity))),
      photos: form.photos,
      category: form.category,
      variations: form.variations?.length ? form.variations : undefined,
      allergens: form.allergens?.length ? form.allergens : undefined,
      isVegetarian: !!form.isVegetarian,
      isVegan: !!form.isVegan,
      spicyLevel: form.spicyLevel || undefined,
      preparationTime: form.preparationTime != null && Number(form.preparationTime) > 0 ? Number(form.preparationTime) : undefined,
      deliveryTime: form.deliveryTime != null && Number(form.deliveryTime) > 0 ? Number(form.deliveryTime) : undefined,
      servingSize: form.servingSize?.trim() || undefined,
      maxDailyOrders: form.maxDailyOrders != null && Number(form.maxDailyOrders) > 0 ? Number(form.maxDailyOrders) : undefined,
      shopId,
    };
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const payload = buildPayload();
    if (!payload) {
      setError("Fill all required fields: title, price, quantity, category, and at least one photo.");
      return;
    }
    startTransition(async () => {
      try {
        const res = editingFood
          ? await updateFoodAction(editingFood._id, payload)
          : await createFoodAction(payload);
        if (res.success) {
          const r = await getOwnFoodsAction({ shop: shopId });
          if (r.success) setFoods(r.data);
          setView("list");
        } else {
          setError("message" in res ? (res.message ?? "Request failed") : "Request failed");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Request failed");
      }
    });
  }

  const ic = "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm transition focus:border-[#00A651] focus:outline-none focus:ring-2 focus:ring-[#00A651]/25";
  const lc = "mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500";

  if (view === "form") {
    const tabs: { key: FormTab; label: string }[] = [
      { key: "basic", label: "Basic" },
      { key: "pricing", label: "Pricing" },
      { key: "media", label: "Photos" },
      { key: "details", label: "Details" },
    ];

    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h3 className="mb-1 text-xl font-bold text-gray-900">{editingFood ? "Edit menu item" : "New menu item"}</h3>
        <p className="mb-6 text-sm text-gray-500">Required fields are marked *.</p>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">⚠ {error}</div>
        ) : null}

        <div className="mb-6 flex w-full max-w-2xl gap-1 overflow-x-auto rounded-xl bg-gray-50 p-1">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveSection(key)}
              className={`flex-1 whitespace-nowrap rounded-lg px-2 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
                activeSection === key ? "bg-white text-[#00A651] shadow-sm" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
          {activeSection === "basic" && (
            <div className="space-y-4">
              <div>
                <label className={lc}>Title *</label>
                <input required value={form.title ?? ""} onChange={(e) => setForm({ ...form, title: e.target.value })} className={ic} placeholder="e.g. Chicken Biryani" />
              </div>
              <div>
                <label className={lc}>Description</label>
                <textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={`${ic} resize-none`} placeholder="Describe the dish…" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lc}>Category *</label>
                  <select required value={form.category || ""} onChange={(e) => setForm({ ...form, category: e.target.value })} className={ic}>
                    <option value="" disabled>Select…</option>
                    {categories.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lc}>Serving size</label>
                  <input value={form.servingSize ?? ""} onChange={(e) => setForm({ ...form, servingSize: e.target.value })} className={ic} placeholder="e.g. 1 bowl, 250g" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={lc}>Prep time (min)</label>
                  <input type="number" min={0} value={form.preparationTime ?? ""} onChange={(e) => setForm({ ...form, preparationTime: Number(e.target.value) })} className={ic} placeholder="15" />
                </div>
                <div>
                  <label className={lc}>Delivery time (min)</label>
                  <input type="number" min={0} value={form.deliveryTime ?? ""} onChange={(e) => setForm({ ...form, deliveryTime: Number(e.target.value) })} className={ic} placeholder="30" />
                </div>
                <div>
                  <label className={lc}>Max daily orders</label>
                  <input type="number" min={0} value={form.maxDailyOrders ?? ""} onChange={(e) => setForm({ ...form, maxDailyOrders: Number(e.target.value) })} className={ic} placeholder="50" />
                </div>
              </div>
            </div>
          )}

          {activeSection === "pricing" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lc}>Price (৳) *</label>
                  <input type="number" required min={0} value={form.price ?? ""} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className={ic} />
                </div>
                <div>
                  <label className={lc}>Discount price (৳)</label>
                  <input type="number" min={0} value={form.discountPrice ?? ""} onChange={(e) => setForm({ ...form, discountPrice: Number(e.target.value) })} className={ic} placeholder="Optional" />
                </div>
              </div>
              <div>
                <label className={lc}>Quantity *</label>
                <input type="number" required min={1} value={form.quantity ?? ""} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} className={ic} />
              </div>

              <div>
                <label className={lc}>Variations (e.g. sizes with different prices)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input value={variationDraft.title} onChange={(e) => setVariationDraft({ ...variationDraft, title: e.target.value })} className={ic} placeholder="Name (e.g. Large)" />
                  <input type="number" min={0} value={variationDraft.price} onChange={(e) => setVariationDraft({ ...variationDraft, price: e.target.value })} className={ic} placeholder="Price (৳)" />
                </div>
                <button type="button" onClick={addVariation} className="mt-2 text-xs font-semibold text-[#00A651] hover:underline">+ Add variation</button>
                {(form.variations ?? []).length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {form.variations!.map((v, i) => (
                      <li key={i} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-1.5 text-xs">
                        <span><span className="font-semibold">{v.title}:</span> ৳{v.price}</span>
                        <button type="button" onClick={() => removeVariation(i)}><X className="h-3.5 w-3.5 text-gray-400 hover:text-red-500" /></button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {activeSection === "media" && (
            <div className="space-y-4">
              <label className={lc}>Photos * (max {MAX_PHOTOS})</label>
              <div className="grid grid-cols-2 gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 sm:grid-cols-4">
                {form.photos?.map((photo, i) => (
                  <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.url} alt="" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => removePhoto(i)} className="absolute right-1 top-1 rounded-md bg-red-500 p-1 text-white opacity-0 transition group-hover:opacity-100">
                      <Trash className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {(form.photos?.length ?? 0) < MAX_PHOTOS && (
                  <label className="relative flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white text-gray-400 hover:border-[#00A651] hover:text-[#00A651]">
                    {uploading
                      ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#00A651]/30 border-t-[#00A651]" />
                      : <><Plus className="mb-1 h-6 w-6" /><span className="text-xs font-medium">Add photo</span></>}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => void handlePhotoUpload(e)} disabled={uploading} />
                  </label>
                )}
              </div>
            </div>
          )}

          {activeSection === "details" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <label className="flex cursor-pointer items-center gap-2">
                  <input type="checkbox" checked={!!form.isVegetarian} onChange={(e) => setForm({ ...form, isVegetarian: e.target.checked })} className="rounded border-gray-300 text-[#00A651] focus:ring-[#00A651]" />
                  <span className="text-sm font-medium text-gray-700">Vegetarian</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input type="checkbox" checked={!!form.isVegan} onChange={(e) => setForm({ ...form, isVegan: e.target.checked })} className="rounded border-gray-300 text-[#00A651] focus:ring-[#00A651]" />
                  <span className="text-sm font-medium text-gray-700">Vegan</span>
                </label>
              </div>

              <div>
                <label className={lc}>Spicy level</label>
                <div className="flex flex-wrap gap-2">
                  {SPICY_LEVELS.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setForm({ ...form, spicyLevel: form.spicyLevel === level ? undefined : level })}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                        form.spicyLevel === level
                          ? "bg-orange-500 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-700"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={lc}>Allergens</label>
                <div className="flex flex-wrap gap-2">
                  {ALLERGEN_OPTIONS.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleAllergen(a)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                        (form.allergens ?? []).includes(a)
                          ? "bg-red-500 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-700"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <input
                    value={allergenDraft}
                    onChange={(e) => setAllergenDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomAllergen(); } }}
                    className={`${ic} flex-1`}
                    placeholder="Add custom allergen…"
                  />
                  <button type="button" onClick={addCustomAllergen} className="shrink-0 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-semibold hover:bg-gray-100">Add</button>
                </div>
                {(form.allergens ?? []).filter((a) => !ALLERGEN_OPTIONS.includes(a)).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {form.allergens!.filter((a) => !ALLERGEN_OPTIONS.includes(a)).map((a) => (
                      <span key={a} className="flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600">
                        {a}
                        <button type="button" onClick={() => toggleAllergen(a)}><X className="h-3 w-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-3 border-t border-gray-100 pt-6">
            <Button type="button" variant="ghost" uppercase={false} onClick={() => setView("list")} disabled={isPending || uploading}>Cancel</Button>
            <Button type="submit" variant="secondary" uppercase={false} disabled={isPending || uploading} className="ml-auto !border-0 !bg-[#00A651] !text-white hover:!brightness-110">
              {isPending ? "Saving…" : editingFood ? "Update item" : "Add to menu"}
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
        <span className="text-sm font-medium text-gray-500">Loading menu…</span>
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
            <h3 className="font-bold leading-tight text-gray-900">Your menu</h3>
            <p className="text-xs font-medium text-gray-500">{foods.length} item{foods.length === 1 ? "" : "s"}</p>
          </div>
        </div>
        <Button size="sm" onClick={handleAdd} uppercase={false} className="gap-1.5 !border-0 !bg-[#00A651] !text-white hover:!brightness-110">
          <Plus className="h-4 w-4" /> Add item
        </Button>
      </div>

      {foods.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
            <Search className="h-6 w-6 text-gray-400" />
          </div>
          <p className="mb-1 text-lg font-bold text-gray-900">No menu items yet</p>
          <p className="mb-5 text-sm text-gray-500">Add food items to your menu.</p>
          <Button variant="outline" uppercase={false} onClick={handleAdd}>Add your first item</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {foods.map((f) => {
            const showDiscount = f.discountPrice != null && f.discountPrice > 0 && f.price > f.discountPrice;
            return (
              <div key={f._id} className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md">
                <div className="relative aspect-[4/3] overflow-hidden border-b border-gray-100 bg-gray-50">
                  {f.photos?.length ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={f.photos[0].url} alt={f.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center text-gray-300">
                      <ImageIcon className="mb-2 h-8 w-8 opacity-50" />
                      <span className="text-[10px] font-medium uppercase tracking-wider">No image</span>
                    </div>
                  )}
                  <div className="absolute left-2 top-2 flex flex-wrap gap-1">
                    {f.isVegetarian ? <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-700">Veg</span> : null}
                    {f.isVegan ? <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">Vegan</span> : null}
                    {f.spicyLevel ? <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-700">{f.spicyLevel}</span> : null}
                    {f.isAvailable === false ? <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-600">Unavailable</span> : null}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h4 className="mb-0.5 line-clamp-2 text-sm font-bold leading-tight text-gray-900">{f.title}</h4>
                  {f.description ? <p className="mb-1 line-clamp-2 text-xs text-gray-500">{f.description}</p> : null}
                  {f.servingSize ? <p className="mb-1 text-[11px] font-medium text-gray-400">{f.servingSize}</p> : null}
                  {f.preparationTime ? <p className="mb-1 text-[11px] text-gray-400">Prep: {f.preparationTime} min</p> : null}
                  <div className="mt-auto flex items-end justify-between pt-2">
                    <div>
                      <div className="text-xl font-black leading-none text-[#00A651]">৳{showDiscount ? f.discountPrice : f.price}</div>
                      {showDiscount
                        ? <div className="mt-0.5 text-[10px] font-bold text-gray-400 line-through">৳{f.price}</div>
                        : <div className="mt-0.5 text-[10px] font-medium text-gray-400">Qty {f.quantity ?? 1}</div>}
                    </div>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => handleEdit(f)} className="rounded-lg border border-transparent bg-gray-50/50 p-2 text-gray-400 transition hover:border-blue-100 hover:bg-blue-50 hover:text-blue-600" title="Edit">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => handleDelete(f._id)} disabled={isPending} className="rounded-lg border border-transparent bg-gray-50/50 p-2 text-gray-400 transition hover:border-red-100 hover:bg-red-50 hover:text-red-600" title="Delete">
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
