"use client";

import { useEffect, useState, useTransition } from "react";
import Button from "@/components/ui/Button";
import {
  getOwnProductsAction,
  createProductAction,
  updateProductAction,
  deleteProductAction,
  type Product,
  type ProductPayload,
} from "@/app/[locale]/(protected)/(dashboard)/my-shop/actions";
import { uploadMediaFiles } from "@/lib/media/client";
import { MediaFeatureName } from "@/types/media";
import { Plus, Pencil, Trash, Image as ImageIcon } from "lucide-react";

export default function ShopProductsTab({ shopId }: { shopId: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "form">("list");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState<Partial<ProductPayload>>({
    title: "",
    type: "Selling",
    price: 0,
    quantity: 1,
    condition: "Good",
    description: "",
    photos: [],
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const res = await getOwnProductsAction();
    if (res.success) {
      setProducts(res.data);
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
      condition: "Good",
      description: "",
      photos: [],
      shopId,
    });
    setView("form");
  }

  function handleEdit(p: Product) {
    setEditingProduct(p);
    setForm({
      title: p.title,
      type: p.type ?? "Selling",
      price: p.price,
      quantity: p.quantity ?? 1,
      condition: p.condition ?? "Good",
      description: p.description ?? "",
      photos: p.photos ?? [],
      shopId,
    });
    setView("form");
  }

  function handleDelete(id: string) {
    if (!confirm("Are you sure?")) return;
    startTransition(async () => {
      await deleteProductAction(id);
      await fetchProducts();
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
    startTransition(async () => {
      try {
        let res;
        if (editingProduct) {
          res = await updateProductAction(editingProduct._id, form);
        } else {
          res = await createProductAction(form as ProductPayload);
        }
        if (res.success) {
          await fetchProducts();
          setView("list");
        } else {
          setError(res.message);
        }
      } catch (err: any) {
        setError(err.message);
      }
    });
  }

  if (view === "form") {
    return (
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold mb-4">{editingProduct ? "Edit Product" : "Add Product"}</h3>
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:border-[#E30A13]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Price</label>
              <input
                type="number"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:border-[#E30A13]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Quantity</label>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:border-[#E30A13]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:border-[#E30A13]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Photos</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.photos?.map((photo, i) => (
                <div key={i} className="relative w-16 h-16 rounded border overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.url} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removePhoto(i)} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 text-[10px] leading-none">✕</button>
                </div>
              ))}
              <label className="w-16 h-16 rounded border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition">
                {uploading ? <span className="text-[10px]">...</span> : <Plus className="w-5 h-5 text-gray-400" />}
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
              </label>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isPending || uploading} variant="secondary">
              {isPending ? "Saving..." : "Save Product"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setView("list")}>Cancel</Button>
          </div>
        </form>
      </div>
    );
  }

  if (loading) {
    return <div className="p-5 text-center text-sm text-gray-500">Loading products...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="font-semibold">Products ({products.length})</h3>
        <Button size="sm" onClick={handleAdd} className="gap-1.5"><Plus className="w-4 h-4"/> Add Product</Button>
      </div>

      {products.length === 0 ? (
        <div className="bg-white p-10 text-center rounded-xl border border-gray-100">
          <p className="text-gray-500 mb-3">You do not have any products yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p._id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col">
              <div className="h-32 mb-3 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                {p.photos && p.photos.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.photos[0].url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-300" />
                )}
              </div>
              <h4 className="font-semibold text-sm truncate" title={p.title}>{p.title}</h4>
              <div className="text-[#E30A13] font-bold text-sm my-1">৳{p.price}</div>
              <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-50">
                <span className="text-xs text-gray-500">Qty: {p.quantity ?? 0}</span>
                <div className="flex gap-1.5">
                  <button onClick={() => handleEdit(p)} className="p-1.5 text-gray-500 hover:text-blue-600 bg-gray-50 rounded-lg hover:bg-blue-50 transition"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(p._id)} disabled={isPending} className="p-1.5 text-gray-500 hover:text-red-600 bg-gray-50 rounded-lg hover:bg-red-50 transition"><Trash className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
