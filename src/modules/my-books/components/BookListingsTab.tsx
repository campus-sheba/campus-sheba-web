"use client";

import { useEffect, useState, useTransition } from "react";
import Button from "@/components/ui/Button";
import {
  getOwnBooksAction,
  createBookAction,
  updateBookAction,
  deleteBookAction,
  type Book,
  type BookPayload,
} from "@/app/[locale]/(protected)/(dashboard)/my-books/actions";
import { getCategoriesAction } from "@/app/[locale]/(protected)/(dashboard)/my-shop/actions";
import { getAddressesAction, type Address } from "@/app/[locale]/(protected)/(dashboard)/my-addresses/actions";
import { uploadMediaFiles } from "@/lib/media/client";
import { MediaFeatureName } from "@/types/media";
import { Plus, Pencil, Trash, Search, BookOpen, AlertCircle } from "lucide-react";

const TYPES = ["Selling", "Lending", "Donation"];
const QUALITIES = ["New", "Like New", "Good", "Acceptable"];

export default function BookListingsTab() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<{ _id: string; title: string }[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "form">("list");
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [activeSection, setActiveSection] = useState<"basic" | "details" | "pricing" | "media" | "contact">("basic");
  
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState<Partial<BookPayload>>({});

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const [booksRes, catRes, addrRes] = await Promise.all([
      getOwnBooksAction(),
      getCategoriesAction(),
      getAddressesAction(),
    ]);

    if (booksRes.success) setBooks(booksRes.data);
    if (catRes.success) {
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
    setEditingBook(null);
    setForm({
      title: "",
      author: "",
      type: "Selling",
      quality: "Good",
      price: 0,
      quantity: 1,
      description: "",
      photos: [],
      category: "",
      addressId: "",
      sellerType: "individual",
    });
    setActiveSection("basic");
    setView("form");
  }

  function handleEdit(b: Book) {
    setEditingBook(b);
    setForm({
      title: b.title,
      author: b.author,
      type: b.type ?? "Selling",
      quality: b.quality ?? "Good",
      price: b.price ?? 0,
      discountPrice: b.discountPrice ?? 0,
      safekeepingCharge: b.safekeepingCharge ?? 0,
      quantity: b.quantity ?? 1,
      description: b.description ?? "",
      photos: b.photos ?? [],
      category: b.category ?? "",
      addressId: b.addressId ?? "",
      edition: b.edition ?? "",
      publisher: b.publisher ?? "",
      department: b.department ?? "",
      subject: b.subject ?? "",
      buyingYear: b.buyingYear ?? "",
      borrowDuration: b.borrowDuration ?? 0,
      maxExtensionDuration: b.maxExtensionDuration ?? 0,
      allowsExtension: !!b.allowsExtension,
      contactName: b.contactName ?? "",
      contactPhone: b.contactPhone ?? "",
      contactEmail: b.contactEmail ?? "",
      sellerType: b.sellerType ?? "individual",
    });
    setActiveSection("basic");
    setView("form");
  }

  function handleDelete(id: string) {
    if (!confirm("Remove this book listing from your dashboard?")) return;
    startTransition(async () => {
      await deleteBookAction(id);
      const res = await getOwnBooksAction();
      if (res.success) setBooks(res.data);
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

    if (!form.title || !form.author || !form.category || !form.addressId) {
      setError("Title, Author, Category, and Address are required fields.");
      return;
    }

    startTransition(async () => {
      try {
        const payload = { ...form };
        
        // Ensure explicit number casting
        if (payload.price) payload.price = Number(payload.price);
        if (payload.discountPrice) payload.discountPrice = Number(payload.discountPrice);
        if (payload.safekeepingCharge) payload.safekeepingCharge = Number(payload.safekeepingCharge);
        if (payload.quantity) payload.quantity = Number(payload.quantity);
        if (payload.borrowDuration) payload.borrowDuration = Number(payload.borrowDuration);
        if (payload.maxExtensionDuration) payload.maxExtensionDuration = Number(payload.maxExtensionDuration);

        let res;
        if (editingBook) {
          res = await updateBookAction(editingBook._id, payload as Partial<BookPayload>);
        } else {
          res = await createBookAction(payload as BookPayload);
        }
        
        if (res.success) {
          const refetch = await getOwnBooksAction();
          if (refetch.success) setBooks(refetch.data);
          setView("list");
        } else {
          setError(res.message);
        }
      } catch (err: any) {
        setError(err.message);
      }
    });
  }

  const inputCls = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] transition";
  const labelCls = "block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5";

  if (view === "form") {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in duration-200">
        <h3 className="text-xl font-bold text-gray-900 mb-1">{editingBook ? "Edit Book Document" : "List New Book"}</h3>
        <p className="text-sm text-gray-500 mb-6 max-w-lg">Manage your required academic and literature listings ensuring students can easily browse your stock.</p>
        
        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-sm text-red-600 font-medium mb-5"><AlertCircle className="w-4 h-4" /> {error}</div>}
        
        <div className="flex gap-1 mb-8 bg-gray-50 p-1.5 rounded-xl w-full max-w-3xl overflow-x-auto no-scrollbar">
          {["basic", "details", "pricing", "media", "contact"].map((sec) => (
            <button
              key={sec}
              onClick={() => setActiveSection(sec as any)}
              className={`flex-1 min-w-[100px] py-2 px-3 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                activeSection === sec ? "bg-white text-blue-600 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
          
          {activeSection === "basic" && (
            <div className="space-y-5 animate-in slide-in-from-right-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Listing Type *</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })} className={inputCls} required>
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Quality *</label>
                  <select value={form.quality} onChange={(e) => setForm({ ...form, quality: e.target.value as any })} className={inputCls} required>
                    {QUALITIES.map(q => <option key={q} value={q}>{q}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className={labelCls}>Title *</label>
                  <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} placeholder="e.g. Physics for Scientists and Engineers" />
                </div>
                <div>
                  <label className={labelCls}>Primary Author *</label>
                  <input required value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className={inputCls} placeholder="e.g. Serway & Jewett" />
                </div>
                <div>
                  <label className={labelCls}>Category Context *</label>
                  <select required value={form.category || ""} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
                    <option value="" disabled>Select subject category...</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls}>Summary Description</label>
                <textarea
                  value={form.description || ""}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  className={`${inputCls} resize-y`}
                  placeholder="Provide details about the physical condition of the book, signs of wear, or highlighting marks."
                />
              </div>
            </div>
          )}

          {activeSection === "details" && (
            <div className="space-y-5 animate-in slide-in-from-right-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelCls}>Edition</label>
                  <input value={form.edition || ""} onChange={(e) => setForm({ ...form, edition: e.target.value })} className={inputCls} placeholder="e.g. 9th Edition" />
                </div>
                <div>
                  <label className={labelCls}>Publisher</label>
                  <input value={form.publisher || ""} onChange={(e) => setForm({ ...form, publisher: e.target.value })} className={inputCls} placeholder="e.g. Pearson" />
                </div>
                <div>
                  <label className={labelCls}>Academic Subject</label>
                  <input value={form.subject || ""} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={inputCls} placeholder="e.g. Mechanics" />
                </div>
                <div>
                  <label className={labelCls}>Originating Department</label>
                  <input value={form.department || ""} onChange={(e) => setForm({ ...form, department: e.target.value })} className={inputCls} placeholder="e.g. EEE, CSE, Physics" />
                </div>
                <div>
                  <label className={labelCls}>Year Bought/Published</label>
                  <input value={form.buyingYear || ""} onChange={(e) => setForm({ ...form, buyingYear: e.target.value })} className={inputCls} placeholder="e.g. 2022" />
                </div>
              </div>
            </div>
          )}

          {activeSection === "pricing" && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              
              <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-widest mb-4 flex items-center gap-2">Core Rates</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className={labelCls}>Base Price (৳)</label>
                    <input type="number" min={0} value={form.price || ""} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className={inputCls} />
                  </div>
                  {form.type === "Selling" && (
                    <div>
                      <label className={labelCls}>Discount (৳)</label>
                      <input type="number" min={0} value={form.discountPrice || ""} onChange={(e) => setForm({ ...form, discountPrice: Number(e.target.value) })} className={inputCls} placeholder="Optional" />
                    </div>
                  )}
                  {form.type === "Lending" && (
                    <div>
                      <label className={labelCls}>Safekeeping (৳)</label>
                      <input type="number" min={0} value={form.safekeepingCharge || ""} onChange={(e) => setForm({ ...form, safekeepingCharge: Number(e.target.value) })} className={inputCls} placeholder="Security deposit" />
                    </div>
                  )}
                  <div>
                    <label className={labelCls}>Quantity Held</label>
                    <input type="number" min={1} value={form.quantity || ""} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} className={inputCls} />
                  </div>
                </div>
              </div>

              {form.type === "Lending" && (
                <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100/50">
                  <h4 className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-4 flex items-center gap-2">Lending Rules</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className={labelCls}>Borrow Duration (Days)</label>
                      <input type="number" min={1} value={form.borrowDuration || ""} onChange={(e) => setForm({ ...form, borrowDuration: Number(e.target.value) })} className={inputCls} placeholder="e.g. 14" />
                    </div>
                    <div>
                      <label className={labelCls}>Max Extension (Days)</label>
                      <input type="number" min={0} value={form.maxExtensionDuration || ""} onChange={(e) => setForm({ ...form, maxExtensionDuration: Number(e.target.value) })} className={inputCls} placeholder="e.g. 7" />
                    </div>
                  </div>
                  
                  <div className="mt-5">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className={`w-10 h-6 rounded-full relative transition-colors shadow-inner ${form.allowsExtension ? "bg-blue-600" : "bg-gray-300"}`}>
                        <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.allowsExtension ? "translate-x-4" : "translate-x-0"}`} />
                      </div>
                      <input type="checkbox" checked={!!form.allowsExtension} onChange={(e) => setForm({ ...form, allowsExtension: e.target.checked })} className="hidden" />
                      <span className="text-sm font-bold text-gray-700">Allow Borrower Extensions</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSection === "media" && (
            <div className="space-y-5 animate-in slide-in-from-right-4">
              <label className={labelCls}>Book Cover & Detail Photos</label>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {form.photos?.map((photo, i) => (
                  <div key={i} className="relative aspect-[3/4] rounded-xl border border-gray-200 shadow-sm overflow-hidden bg-white group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.url} alt="Book Photo" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button type="button" onClick={() => removePhoto(i)} className="bg-white/20 hover:bg-red-500 rounded-full p-2 text-white border border-white/40 transition">
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                
                <label className="relative aspect-[3/4] rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/30 bg-gray-50 flex flex-col items-center justify-center cursor-pointer transition shadow-sm group">
                  {uploading ? (
                    <div className="flex flex-col items-center">
                      <span className="w-6 h-6 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-2" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500">Uploading</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition">
                        <Plus className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-[11px] font-bold text-gray-400 group-hover:text-blue-600 uppercase tracking-widest">Add Image</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                </label>
              </div>
            </div>
          )}

          {activeSection === "contact" && (
            <div className="space-y-5 animate-in slide-in-from-right-4">
              <div className="bg-amber-50/50 p-4 border border-amber-100 rounded-xl mb-4 text-xs font-medium text-amber-800 leading-relaxed">
                By default, your profile settings dictate contact routing. Use these fields exclusively to override communications solely for this specific book asset.
              </div>
              
              <div>
                <label className={labelCls}>Pickup Base Address *</label>
                {addresses.length === 0 ? (
                  <div className="text-xs text-red-500 font-bold bg-red-50 p-3 rounded-lg border border-red-100">⚠ No addresses found. Please configure an address in 'My Addresses' module.</div>
                ) : (
                  <select required value={form.addressId || ""} onChange={(e) => setForm({ ...form, addressId: e.target.value })} className={inputCls}>
                    <option value="" disabled>Select physical logistics location...</option>
                    {addresses.map((a) => (
                      <option key={a._id} value={a._id}>{a.address}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3">
                <div className="col-span-2">
                  <label className={labelCls}>Proxy Contact Entity Name</label>
                  <input value={form.contactName || ""} onChange={(e) => setForm({ ...form, contactName: e.target.value })} className={inputCls} placeholder="e.g. John Doe / Bookshop Dept" />
                </div>
                <div>
                  <label className={labelCls}>Direct Support Phone</label>
                  <input value={form.contactPhone || ""} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} className={inputCls} placeholder="e.g. +880 1XXX-XXXXXX" />
                </div>
                <div>
                  <label className={labelCls}>Alternate Email Queue</label>
                  <input type="email" value={form.contactEmail || ""} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} className={inputCls} placeholder="support@books.org" />
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-6 mt-6 border-t border-gray-100 w-full justify-between items-center">
            <Button type="button" variant="ghost" uppercase={false} onClick={() => setView("list")} disabled={isPending || uploading}>
              Cancel Activity
            </Button>
            <Button type="submit" variant="primary" uppercase={false} disabled={isPending || uploading} className="px-8 shadow-md">
              {isPending ? "Executing System Save..." : (editingBook ? "Commit Book Update" : "Publish Book Item")}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // LIST VIEW

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <span className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4" />
        <span className="text-sm font-bold text-gray-400">Loading your literary assets...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex justify-between items-center px-2">
        <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase">System Catalogs ({books.length})</h3>
        <Button size="sm" onClick={handleAdd} uppercase={false} className="gap-2 px-5 py-2 shadow-sm rounded-xl"><Plus className="w-4 h-4"/> Create Book Asset</Button>
      </div>

      {books.length === 0 ? (
        <div className="bg-white p-14 text-center rounded-2xl border border-dashed border-gray-300 shadow-sm animate-in zoom-in-95">
          <div className="w-20 h-20 bg-blue-50 border border-blue-100 rounded-full flex flex-col items-center justify-center mx-auto mb-5">
            <BookOpen className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-gray-900 font-bold text-xl mb-2">No active book links found</p>
          <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6 leading-relaxed">System scan returns zero books linked to your organization ID. Initialize a manual upload sequence to build out your library cache.</p>
          <Button variant="outline" uppercase={false} onClick={handleAdd}>Initialize Stock Upload</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {books.map((b) => (
            <div key={b._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col group relative">
              
              {/* Image Block */}
              <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden border-b border-gray-100">
                {b.photos && b.photos.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.photos[0].url} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gray-100/50">
                    <BookOpen className="w-10 h-10 mb-2 opacity-40" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Missing Cover</span>
                  </div>
                )}
                
                {/* Overlay Tags */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[80%]">
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-sm border ${
                    b.type === 'Selling' ? 'bg-green-100/90 text-green-800 border-green-200' :
                    b.type === 'Lending' ? 'bg-blue-100/90 text-blue-800 border-blue-200' :
                    'bg-purple-100/90 text-purple-800 border-purple-200'
                  }`}>
                    {b.type}
                  </span>
                  {b.quality && (
                    <span className="px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-white/90 text-gray-700 border border-gray-200 shadow-sm backdrop-blur-sm">
                      {b.quality}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Content Detail Block */}
              <div className="p-5 flex flex-col flex-1 relative">
                <div className="mb-4">
                  <h4 className="font-bold text-gray-900 text-[15px] line-clamp-2 leading-snug mb-1 group-hover:text-blue-600 transition-colors" title={b.title}>{b.title}</h4>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5 line-clamp-1">{b.author}</p>
                </div>
                
                <div className="mt-auto pt-4 border-t border-gray-50/80 flex items-end justify-between">
                  <div>
                    {b.type === "Donation" ? (
                      <div className="text-lg font-black text-purple-600 leading-none">FREE</div>
                    ) : (
                      <>
                        <div className="text-lg font-black text-gray-900 leading-none">৳{b.discountPrice && b.discountPrice > 0 ? b.discountPrice : (b.price ?? 0)}</div>
                        {(b.discountPrice ?? 0) > 0 && (b.price ?? 0) > (b.discountPrice ?? 0) && (
                          <div className="text-[10px] font-bold text-red-500 line-through mt-1 tracking-wide">৳{b.price} BASE</div>
                        )}
                      </>
                    )}
                  </div>
                  
                  <div className="flex gap-1.5">
                    <button onClick={() => handleEdit(b)} className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 border border-gray-100 rounded-xl hover:bg-blue-50 transition" title="Modify Context">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(b._id)} disabled={isPending} className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 border border-gray-100 rounded-xl hover:bg-red-50 transition" title="Erase Item">
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
