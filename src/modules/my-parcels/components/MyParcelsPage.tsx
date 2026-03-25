"use client";

import { useEffect, useState, useTransition } from "react";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import { 
  Archive, 
  Plus, 
  MapPin, 
  MapPinOff, 
  AlertCircle,
  Truck,
  RotateCcw,
  Star,
  PackageCheck
} from "lucide-react";
import Button from "@/components/ui/Button";
import {
  getMyParcelsAction,
  createParcelBookingAction,
  cancelParcelAction,
  requestParcelRefundAction,
  type Parcel,
  type ParcelPayload
} from "@/app/[locale]/(protected)/(dashboard)/my-parcels/actions";
import { getAddressesAction, type Address } from "@/app/[locale]/(protected)/(dashboard)/my-addresses/actions";
import { uploadMediaFiles } from "@/lib/media/client";
import { MediaFeatureName } from "@/types/media";

const STATUS_FILTERS = ["All", "Pending", "Picked Up", "In Transit", "Delivered", "Cancelled"];
const PARCEL_SIZES = ["Small", "Medium", "Large", "Document"];

export default function MyParcelsPage() {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "book">("list");
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState("All");

  // Booking Form State
  const [form, setForm] = useState<Partial<ParcelPayload>>({
    size: "Small",
    paymentMethod: "Cash on Delivery"
  });
  
  const [pickupInst, setPickupInst] = useState("");
  const [deliveryInst, setDeliveryInst] = useState("");

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function fetchData() {
    setLoading(true);
    const params: Record<string, string> = {};
    if (statusFilter !== "All") params.status = statusFilter;

    const [parcelRes, addrRes] = await Promise.all([
      getMyParcelsAction(params),
      getAddressesAction()
    ]);

    if (parcelRes.success) {
      setParcels(parcelRes.data);
    }
    
    if ((addrRes as any)?.data) {
      setAddresses((addrRes as any).data);
    }
    
    setLoading(false);
  }

  function handleStartBooking() {
    setForm({ size: "Small", paymentMethod: "Cash on Delivery", photos: [] });
    setPickupInst("");
    setDeliveryInst("");
    setError(null);
    setView("book");
  }

  function handleCancelBooking(id: string) {
    if (!confirm("Are you sure you want to cancel this delivery request?")) return;
    startTransition(async () => {
      await cancelParcelAction(id);
      await fetchData();
    });
  }

  function handleRequestRefund(id: string) {
    if (!confirm("Request refund for this parcel?")) return;
    startTransition(async () => {
      await requestParcelRefundAction(id);
      await fetchData();
    });
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadMediaFiles([file], MediaFeatureName.MISC);
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.pickupAddress || !form.deliveryAddress || !form.recipientName || !form.recipientPhone) {
      setError("Please fill in all critical routing details (Addresses & Recipient Info).");
      return;
    }

    if (form.pickupAddress === form.deliveryAddress) {
      setError("Pickup and Delivery addresses cannot be the identical physical marker.");
      return;
    }

    startTransition(async () => {
      try {
        const payload: ParcelPayload = {
          ...form as ParcelPayload,
          pickupLocation: pickupInst ? pickupInst.split(',').map(s => s.trim()) : [],
          deliveryLocation: deliveryInst ? deliveryInst.split(',').map(s => s.trim()) : []
        };
        
        const res = await createParcelBookingAction(payload);
        
        if (res.success) {
          await fetchData();
          setView("list");
        } else {
          setError(res.message);
        }
      } catch (err: any) {
        setError(err.message);
      }
    });
  }

  const inputCls = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600/30 focus:border-violet-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] transition";
  const labelCls = "block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5";

  const renderBadge = (status: string | undefined) => {
    let cls = "bg-gray-100 text-gray-700 border-gray-200";
    const s = (status || "Pending").toUpperCase();
    if (s === "DELIVERED") cls = "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (s === "IN TRANSIT" || s === "PICKED UP") cls = "bg-blue-100 text-blue-800 border-blue-200";
    if (s === "CANCELLED" || s === "REFUNDED") cls = "bg-red-100 text-red-800 border-red-200";
    if (s === "PENDING") cls = "bg-amber-100 text-amber-800 border-amber-200";
    
    return <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border shadow-sm ${cls}`}>{s}</span>;
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <AppBreadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: `/profile` },
          { label: "Parcel Tracking" },
        ]}
      />

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        
        {/* Header Graphic */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-violet-50/50 to-white relative overflow-hidden flex flex-col sm:flex-row justify-between sm:items-center">
          <div className="absolute top-0 right-0 p-6 opacity-30 pointer-events-none">
            <Archive className="w-24 h-24 text-violet-500" />
          </div>
          <div className="relative z-10">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Parcel Tracking</h1>
            <p className="mt-1 text-sm text-gray-600 max-w-lg leading-relaxed">
              Book intra-campus and external physical deliveries dynamically processed via independent delivery heroes.
            </p>
          </div>
          
          {view === "list" && (
            <div className="relative z-10 mt-4 sm:mt-0">
               <Button onClick={handleStartBooking} uppercase={false} className="bg-violet-600 hover:bg-violet-700 text-white font-bold gap-2 px-5 py-2 shadow-md rounded-xl whitespace-nowrap">
                 <Truck className="w-4 h-4"/> Book New Delivery
               </Button>
            </div>
          )}
        </div>

        {view === "list" ? (
          <div className="p-4 bg-gray-50/30 min-h-[500px]">
            
            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar mb-2 px-2">
              {STATUS_FILTERS.map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    statusFilter === s
                      ? "bg-violet-600 text-white shadow-md shadow-violet-600/20"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center">
                <span className="w-10 h-10 border-4 border-violet-600/20 border-t-violet-600 rounded-full animate-spin mb-4" />
                <span className="text-sm font-bold text-gray-400">Syncing logistic timelines...</span>
              </div>
            ) : parcels.length === 0 ? (
              <div className="bg-white p-14 text-center rounded-2xl border border-dashed border-gray-300 shadow-sm animate-in zoom-in-95 mt-2">
                <div className="w-20 h-20 bg-violet-50 border border-violet-100 rounded-full flex flex-col items-center justify-center mx-auto mb-5">
                  <Archive className="w-8 h-8 text-violet-500" />
                </div>
                <p className="text-gray-900 font-bold text-xl mb-2">No active logistics logs</p>
                <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6 leading-relaxed">You do not have any parcels matching this status filter. Adjust your criteria or book a new delivery trace.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {parcels.map(p => (
                  <div key={p._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-violet-200 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        {renderBadge(p.status)}
                        <h3 className="font-bold text-gray-900 mt-2 line-clamp-1">{p.description || "Campus Parcel Request"}</h3>
                        <div className="text-[10px] font-mono font-medium text-gray-400 mt-0.5">ID: #{p._id.slice(-6).toUpperCase()}</div>
                      </div>
                      {p.photos && p.photos.length > 0 ? (
                        <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shadow-inner shrink-0 leading-none">
                           {/* eslint-disable-next-line @next/next/no-img-element */}
                           <img src={p.photos[0].url} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                          <PackageCheck className="w-6 h-6 text-violet-300" />
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                        <div>
                           <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pickup Checkpoint</div>
                           {/* Fallback rendering assuming address could be populated or raw objectId */}
                           <div className="text-xs font-semibold text-gray-800 line-clamp-1">
                             {typeof p.pickupAddress === 'object' ? (p.pickupAddress as any).address ?? 'Pickup Zone' : p.pickupLocation?.join(', ') || 'Pickup Zone'}
                           </div>
                        </div>
                      </div>
                      
                      <div className="border-l-2 border-dashed border-gray-200 ml-1.5 pl-3 my-0.5" style={{ height: '10px' }}></div>
                      
                      <div className="flex items-start gap-2">
                        <MapPinOff className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <div>
                           <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Delivery Target</div>
                           <div className="text-xs font-semibold text-gray-800 line-clamp-1">
                             {typeof p.deliveryAddress === 'object' ? (p.deliveryAddress as any).address ?? 'Delivery Zone' : p.deliveryLocation?.join(', ') || 'Delivery Zone'}
                           </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-50 flex flex-wrap gap-2 items-center justify-between">
                       <div className="text-xs font-medium text-gray-500 border border-gray-200 px-2 py-1 rounded-md bg-white">
                         Size: <span className="font-bold text-gray-800">{p.size}</span>
                       </div>
                       
                       <div className="flex items-center gap-1.5">
                         {p.status === "Pending" && (
                           <button disabled={isPending} onClick={() => handleCancelBooking(p._id)} className="text-[10px] px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider bg-red-50 text-red-600 hover:bg-red-100 transition">
                             Cancel Logic
                           </button>
                         )}
                         {p.status === "Delivered" && (
                            <button disabled={isPending} onClick={() => handleRequestRefund(p._id)} className="text-[10px] px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider bg-amber-50 text-amber-700 hover:bg-amber-100 transition flex items-center gap-1">
                              <RotateCcw className="w-3 h-3" /> Refund
                            </button>
                         )}
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 bg-white max-w-4xl mx-auto py-10 animate-in slide-in-from-right-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Book Dynamic Delivery</h3>
            <p className="text-sm text-gray-500 mb-8 max-w-lg">Assign specific routing paths between your verified addresses or direct to individual recipients.</p>
            
            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-sm text-red-600 font-medium mb-6"><AlertCircle className="w-4 h-4 shrink-0" /> {error}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Routing Box */}
                <div className="space-y-6 bg-gray-50 p-5 rounded-2xl border border-gray-100">
                   <h4 className="text-xs font-bold text-gray-800 uppercase tracking-widest flex items-center gap-2"><MapPin className="w-4 h-4 text-violet-500"/> Physical Routing Log</h4>
                   
                   <div>
                      <label className={labelCls}>Pickup Base Origin *</label>
                      {addresses.length === 0 ? (
                        <div className="text-xs text-red-500 font-bold">⚠ Configure locations via My Addresses first.</div>
                      ) : (
                        <select required value={form.pickupAddress || ""} onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })} className={inputCls}>
                          <option value="" disabled>Select active registered coordinate...</option>
                          {addresses.map((a) => <option key={a._id} value={a._id}>{a.address}</option>)}
                        </select>
                      )}
                   </div>

                   <div>
                      <label className={labelCls}>Pickup Floor/Room Notes</label>
                      <input value={pickupInst} onChange={(e) => setPickupInst(e.target.value)} className={inputCls} placeholder="e.g. 2nd Floor Dormitory Box A, Lobby" />
                   </div>

                   <div className="h-px bg-gray-200/60 my-2 shadow-[0_1px_rgba(255,255,255,0.7)]"></div>

                   <div>
                      <label className={labelCls}>Delivery Destination Node *</label>
                      {addresses.length === 0 ? (
                         <div className="text-xs text-red-500 font-bold">⚠ Valid address required.</div>
                      ) : (
                        <select required value={form.deliveryAddress || ""} onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })} className={inputCls}>
                          <option value="" disabled>Select active target coordinate...</option>
                          {addresses.map((a) => <option key={a._id} value={a._id}>{a.address}</option>)}
                        </select>
                      )}
                   </div>

                   <div>
                      <label className={labelCls}>Delivery Floor/Room Notes</label>
                      <input value={deliveryInst} onChange={(e) => setDeliveryInst(e.target.value)} className={inputCls} placeholder="e.g. Hand to reception, Room 410" />
                   </div>
                </div>

                {/* Recipient & Detail Box */}
                <div className="space-y-6">
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                     <h4 className="text-xs font-bold text-gray-800 uppercase tracking-widest border-b border-gray-50 pb-2">Target End-User Verification</h4>
                     
                     <div>
                        <label className={labelCls}>Recipient Full Identity *</label>
                        <input required value={form.recipientName || ""} onChange={(e) => setForm({ ...form, recipientName: e.target.value })} className={inputCls} placeholder="John Doe Logistics Ops" />
                     </div>
                     <div>
                        <label className={labelCls}>Recipient Direct Line *</label>
                        <input required value={form.recipientPhone || ""} onChange={(e) => setForm({ ...form, recipientPhone: e.target.value })} className={inputCls} placeholder="+880 1XXX-XXXXXX" />
                     </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                     <h4 className="text-xs font-bold text-gray-800 uppercase tracking-widest border-b border-gray-50 pb-2">Package Weighting & Load</h4>
                     
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>Scale Identifier *</label>
                          <select required value={form.size || "Small"} onChange={(e) => setForm({ ...form, size: e.target.value })} className={inputCls}>
                             {PARCEL_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>Volumetric Weight</label>
                          <input value={form.estimatedWeight || ""} onChange={(e) => setForm({ ...form, estimatedWeight: e.target.value })} className={inputCls} placeholder="e.g. 1.2kg" />
                        </div>
                     </div>
                     <div>
                        <label className={labelCls}>Visual Context Payload</label>
                        <input value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} placeholder="e.g. Electronics, Books, Keys..." />
                     </div>
                  </div>
                </div>

              </div>

              {/* Action Bar */}
              <div className="sticky bottom-4 flex justify-between items-center bg-gray-900 rounded-2xl p-4 shadow-xl shadow-gray-900/10 z-10 mx-auto mt-10">
                 <div>
                    <div className="text-xs font-bold text-gray-400 capitalize tracking-wider">Settlement Method</div>
                    <div className="text-white text-sm font-semibold">{form.paymentMethod}</div>
                 </div>
                 
                 <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setView("list")} className="px-4 py-2 text-sm font-bold text-gray-300 hover:text-white transition">Abandon Hook</button>
                    <Button type="submit" uppercase={false} disabled={isPending || uploading} className="bg-violet-500 hover:bg-violet-400 text-white border-none shadow-md px-6">
                      {isPending ? "Validating Subsystem..." : "Confirm Logistics Push"}
                    </Button>
                 </div>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
}
