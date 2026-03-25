"use client";

import { useEffect, useState, useTransition } from "react";
import Button from "@/components/ui/Button";
import {
  getOwnProductsAction,
  createProductAction,
  updateProductAction,
  deleteProductAction,
  getCategoriesAction,
  type Product,
  type ProductPayload,
} from "@/app/[locale]/(protected)/(dashboard)/my-shop/actions";
import { getAddressesAction, type Address } from "@/app/[locale]/(protected)/(dashboard)/my-addresses/actions";
import { uploadMediaFiles } from "@/lib/media/client";
import { MediaFeatureName } from "@/types/media";
import { Plus, Pencil, Trash, Image as ImageIcon, Search } from "lucide-react";

export default function ShopProductsTab({ shopId }: { shopId: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ _id: string; title: string; isActive?: boolean }[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "form">("list");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeSection, setActiveSection] = useState<"basic" | "pricing" | "media" | "contact">("basic");
  
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [form, setForm] = useState<Partial<ProductPayload>>({});

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const [prodRes, catRes, addrRes] = await Promise.all([
      getOwnProductsAction(),
      getCategoriesAction(),
      getAddressesAction(),
    ]);

    if (prodRes.success) setProducts(prodRes.data);
    if (catRes.success) {
      // Sometimes categories come with parent/child structure or just a simple flat base depending on backend.
      // We will assume the output is flat or can be mapped using title.
      // @ts-ignore
      const catData = catRes.data?.data || catRes.data;
      setCategories(Array.isArray(catData) ? catData : []);
    }
    if ((addrRes as any)?.data) {
      setAddresses((addrRes as any).data);
    }
    setLoading(false);
  }

  function handleAdd() {
    setEditingProduct(null);
    setForm({
      title: "",
      type: "Selling",
      price: 0,
      quantity: 1,
      condition: "Brand New",
      description: "",
      photos: [],
      categoryId: "",
      addressId: "",
      isNegotiable: false,
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
      price: p.price,
      quantity: p.quantity ?? 1,
      condition: p.condition ?? "Brand New",
      description: p.description ?? "",
      photos: p.photos ?? [],
      categoryId: p.categoryId ?? (p as any).category ?? "",
      addressId: p.addressId ?? (p as any).address ?? "",
      isNegotiable: !!p.isNegotiable,
      contactName: p.contactName ?? "",
      contactPhone: p.contactPhone ?? "",
      contactEmail: p.contactEmail ?? "",
      weight: p.weight ?? 0,
      discountPrice: p.discountPrice ?? 0,
      safekeepingCharge: p.safekeepingCharge ?? 0,
      subtitle: p.subtitle ?? "",
      shopId,
    });
    setActiveSection("basic");
    setView("form");
  }

  function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    startTransition(async () => {
      await deleteProductAction(id);
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
      if (res.success && res.urls.length > 0) {
        setForm((prev) => ({
          ...prev,
          photos: [
            ...(prev.photos || []),
            { url: res.urls[0], key: file.name, size: file.size },
          ],
        }));
      } else {
        alert("Upload failed");
      }
    } catch (err) {
      alert("Error uploading file");
    } finally {
      setUploading(false);
    }
  }

  function removePhoto(idx: number) {
    setForm((prev) => ({
      ...prev,
      photos: prev.photos?.filter((_, i) => i !== idx),
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.title || !form.price || !form.quantity || !form.categoryId || !form.addressId) {
      setError("Please fill out all required fields (Title, Price, Quantity, Category, Address).");
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          ...form,
          price: Number(form.price),
          quantity: Number(form.quantity),
          weight: Number(form.weight || 0),
          discountPrice: Number(form.discountPrice || 0),
          safekeepingCharge: Number(form.safekeepingCharge || 0),
        };

        let res;
        if (editingProduct) {
          res = await updateProductAction(editingProduct._id, payload as Partial<ProductPayload>);
        } else {
          res = await createProductAction(payload as ProductPayload);
        }
        
        if (res.success) {
          const refetch = await getOwnProductsAction();
          if (refetch.success) setProducts(refetch.data);
          setView("list");
        } else {
          setError(res.message);
        }
      } catch (err: any) {
        setError(err.message);
      }
    });
  }

  const inputCls = "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E30A13]/30 focus:border-[#E30A13] transition";
  const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1";

  if (view === "form") {
    return (
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in duration-200">
        <h3 className="text-xl font-bold text-gray-900 mb-1">{editingProduct ? "Edit Product" : "Add New Product"}</h3>
        <p className="text-sm text-gray-500 mb-6">Fill in the details for your listing. Required fields are marked with *.</p>
        
        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 mb-4">⚠ {error}</div>}
        
        {/* Step Navigation */}
        <div className="flex gap-1 mb-6 bg-gray-50 p-1 rounded-xl w-full max-w-2xl">
          {["basic", "pricing", "media", "contact"].map((sec) => (
            <button
              key={sec}
              onClick={() => setActiveSection(sec as any)}
              className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                activeSection === sec ? "bg-white text-[#E30A13] shadow-sm" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
          
          {/* BASIC INFO SECTION */}
          {activeSection === "basic" && (
            <div className="space-y-4 animate-in slide-in-from-right-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Type *</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputCls}>
                    <option value="Selling">Selling</option>
                    <option value="Lending">Lending</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Condition *</label>
                  <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className={inputCls}>
                    <option value="Brand New">Brand New</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className={labelCls}>Title *</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} placeholder="e.g. Physics 101 Textbook" />
              </div>
              
              <div>
                <label className={labelCls}>Subtitle</label>
                <input value={form.subtitle || ""} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className={inputCls} placeholder="Optional catchy subtitle" />
              </div>
              
              <div>
                <label className={labelCls}>Description</label>
                <textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={`${inputCls} resize-none`} placeholder="Detailed description of the product..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Category *</label>
                  <select required value={form.categoryId || ""} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className={inputCls}>
                    <option value="" disabled>Select category...</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Pickup Address *</label>
                  {addresses.length === 0 ? (
                    <div className="text-xs text-[#E30A13] mt-2">No addresses found. Add one in My Addresses.</div>
                  ) : (
                    <select required value={form.addressId || ""} onChange={(e) => setForm({ ...form, addressId: e.target.value })} className={inputCls}>
                      <option value="" disabled>Select an address...</option>
                      {addresses.map((a) => (
                        <option key={a._id} value={a._id}>{a.address}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PRICING SECTION */}
          {activeSection === "pricing" && (
            <div className="space-y-4 animate-in slide-in-from-right-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Price (৳) *</label>
                  <input type="number" required min={1} value={form.price || ""} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className={inputCls} placeholder="0" />
                </div>
                <div>
                  <label className={labelCls}>Listing Quantity *</label>
                  <input type="number" required min={1} value={form.quantity || ""} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} className={inputCls} placeholder="1" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Discount Price (৳)</label>
                  <input type="number" min={0} value={form.discountPrice || ""} onChange={(e) => setForm({ ...form, discountPrice: Number(e.target.value) })} className={inputCls} placeholder="0 (Optional)" />
                </div>
                <div>
                  <label className={labelCls}>Product Weight (kg)</label>
                  <input type="number" step="any" min={0} value={form.weight || ""} onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })} className={inputCls} placeholder="0 (Optional)" />
                </div>
              </div>

              {form.type === "Lending" && (
                <div>
                  <label className={labelCls}>Safekeeping Charge (৳) *</label>
                  <input type="number" required={form.type === "Lending"} min={0} value={form.safekeepingCharge || ""} onChange={(e) => setForm({ ...form, safekeepingCharge: Number(e.target.value) })} className={inputCls} placeholder="Amount needed for deposit" />
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${form.isNegotiable ? "bg-[#E30A13]" : "bg-gray-300"}`}>
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isNegotiable ? "translate-x-5" : "translate-x-0"}`} />
                  </div>
                  <input type="checkbox" checked={!!form.isNegotiable} onChange={(e) => setForm({ ...form, isNegotiable: e.target.checked })} className="hidden" />
                  <span className="text-sm font-medium text-gray-700">Price is negotiable</span>
                </label>
              </div>
            </div>
          )}

          {/* MEDIA SECTION */}
          {activeSection === "media" && (
            <div className="space-y-4 animate-in slide-in-from-right-4">
              <label className={labelCls}>Product Photos (Max 5MB each)</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-xl border border-dashed border-gray-200">
                {form.photos?.map((photo, i) => (
                  <div key={i} className="relative aspect-square rounded-lg border border-gray-200 overflow-hidden bg-white group shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.url} alt="Product" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removePhoto(i)} className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition">
                      <Trash className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                <label className="relative aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-[#E30A13] bg-white flex flex-col items-center justify-center cursor-pointer transition text-gray-400 hover:text-[#E30A13] shadow-sm">
                  {uploading ? (
                    <div className="flex flex-col items-center">
                      <span className="w-5 h-5 border-2 border-[#E30A13]/20 border-t-[#E30A13] rounded-full animate-spin mb-1" />
                      <span className="text-[10px] font-medium text-[#E30A13]">Uploading...</span>
                    </div>
                  ) : (
                    <>
                      <Plus className="w-6 h-6 mb-1" />
                      <span className="text-xs font-medium">Add Photo</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                </label>
              </div>
            </div>
          )}

          {/* CONTACT SECTION */}
          {activeSection === "contact" && (
            <div className="space-y-4 animate-in slide-in-from-right-4">
              <p className="text-xs text-gray-500 mb-2">Optional: Provide direct contact details. If left blank, buyers will contact you via platform chat or shop details.</p>
              
              <div>
                <label className={labelCls}>Contact Name</label>
                <input value={form.contactName || ""} onChange={(e) => setForm({ ...form, contactName: e.target.value })} className={inputCls} placeholder="John Doe" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Contact Phone</label>
                  <input value={form.contactPhone || ""} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} className={inputCls} placeholder="+880..." />
                </div>
                <div>
                  <label className={labelCls}>Contact Email</label>
                  <input type="email" value={form.contactEmail || ""} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} className={inputCls} placeholder="example@mail.com" />
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-6 mt-6 border-t border-gray-100">
            <Button type="button" variant="ghost" uppercase={false} onClick={() => setView("list")} disabled={isPending || uploading}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary" uppercase={false} disabled={isPending || uploading} className="!bg-[#E30A13] border-none ml-auto px-6">
              {isPending ? "Saving..." : (editingProduct ? "Update Product" : "Publish Product")}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-10 flex flex-col items-center justify-center">
        <span className="w-8 h-8 border-4 border-[#E30A13]/20 border-t-[#E30A13] rounded-full animate-spin mb-3" />
        <span className="text-sm font-medium text-gray-500">Loading products...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-white px-5 py-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 leading-tight">Your Products</h3>
            <p className="text-xs text-gray-500 font-medium">{products.length} listing{products.length === 1 ? '' : 's'} available</p>
          </div>
        </div>
        <Button size="sm" onClick={handleAdd} uppercase={false} className="!bg-[#E30A13] border-none shadow-sm gap-1.5 px-4 text-white"><Plus className="w-4 h-4"/> Create New</Button>
      </div>

      {products.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-gray-300">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-900 font-bold text-lg mb-1">No products found</p>
          <p className="text-gray-500 text-sm mb-5">You haven't listed any items for your shop yet.</p>
          <Button variant="outline" uppercase={false} onClick={handleAdd}>List your first product</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((p) => (
            <div key={p._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col group">
              <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden border-b border-gray-100">
                {p.photos && p.photos.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.photos[0].url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                    <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">No Image</span>
                  </div>
                )}
                
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border shadow-sm ${
                    p.type === 'Lending' ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-green-50 text-green-700 border-green-200'
                  }`}>
                    {p.type}
                  </span>
                  {p.condition && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-white text-gray-700 border border-gray-200 shadow-sm">
                      {p.condition}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-4 flex flex-col flex-1">
                <h4 className="font-bold text-gray-900 text-sm line-clamp-2 leading-tight mb-1" title={p.title}>{p.title}</h4>
                {p.subtitle && <p className="text-xs text-gray-500 line-clamp-1 mb-2">{p.subtitle}</p>}
                
                <div className="mt-auto pt-3 flex items-end justify-between">
                  <div>
                    <div className="text-xl font-black text-[#E30A13] leading-none">৳{p.discountPrice && p.discountPrice > 0 ? p.discountPrice : p.price}</div>
                    {p.discountPrice && p.discountPrice > 0 && p.price > p.discountPrice ? (
                      <div className="text-[10px] font-bold text-gray-400 line-through mt-0.5">৳{p.price} Original</div>
                    ) : (
                       <div className="text-[10px] font-medium text-gray-400 mt-0.5">Qty {p.quantity}</div>
                    )}
                  </div>
                  
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(p)} className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50/50 rounded-lg hover:bg-blue-50 transition border border-transparent hover:border-blue-100" title="Edit">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(p._id)} disabled={isPending} className="p-2 text-gray-400 hover:text-red-600 bg-gray-50/50 rounded-lg hover:bg-red-50 transition border border-transparent hover:border-red-100" title="Delete">
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
