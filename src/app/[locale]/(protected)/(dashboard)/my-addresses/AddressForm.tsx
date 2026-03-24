"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { Address, createAddressAction, updateAddressAction } from "./actions";
import { MapPin, Info, Navigation, Navigation2 } from "lucide-react";

interface Props {
  initial?: Partial<Address>;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddressForm({ initial, onSuccess, onCancel }: Props) {
  const [form, setForm] = useState<Partial<Address>>(initial || { type: "DELIVERY", isDefault: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    // Convert string inputs to proper types
    const payload = {
      ...form,
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
    };

    try {
      let res;
      if (form._id) {
        res = await updateAddressAction(form._id, payload);
      } else {
        res = await createAddressAction(payload as Omit<Address, "_id" | "user" | "createdAt" | "updatedAt">);
      }
      
      if (!res.success) {
        setError(res.message || "Something went wrong.");
      } else {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E30A13]/30 focus:border-[#E30A13] transition";
  const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1";

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-2xl shadow-xl w-full max-w-lg mx-auto border border-gray-100 relative">
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 rounded-xl bg-[#E30A13]/10 flex items-center justify-center">
          <MapPin className="w-5 h-5 text-[#E30A13]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">{form._id ? "Edit Address" : "Add New Address"}</h2>
          <p className="text-xs text-gray-500">Provide accurate delivery details.</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          ⚠ {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className={labelCls}>Type</label>
          <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
            <label className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-lg cursor-pointer transition ${form.type === "DELIVERY" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              <input type="radio" name="type" value="DELIVERY" checked={form.type === "DELIVERY"} onChange={handleChange} className="hidden" />
              Delivery
            </label>
            <label className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-lg cursor-pointer transition ${form.type === "PICKUP" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              <input type="radio" name="type" value="PICKUP" checked={form.type === "PICKUP"} onChange={handleChange} className="hidden" />
              Pickup
            </label>
          </div>
        </div>

        <div>
          <label className={labelCls}>Full Address</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input name="address" value={form.address || ""} onChange={handleChange} className={`${inputCls} pl-9`} placeholder="e.g. Building A, Floor 2, Room 101" required />
          </div>
        </div>

        <div>
          <label className={labelCls}>Description / Landmarks</label>
          <div className="relative">
            <Info className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <textarea name="description" value={form.description || ""} onChange={handleChange} rows={2} className={`${inputCls} pl-9 resize-none`} placeholder="Any clues to find this location?" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Latitude</label>
            <div className="relative">
              <Navigation className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input name="latitude" type="number" step="any" value={form.latitude || ""} onChange={handleChange} className={`${inputCls} pl-9`} placeholder="23.8103" required />
            </div>
          </div>
          <div>
            <label className={labelCls}>Longitude</label>
            <div className="relative">
              <Navigation2 className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input name="longitude" type="number" step="any" value={form.longitude || ""} onChange={handleChange} className={`${inputCls} pl-9`} placeholder="90.4125" required />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 pb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <div className={`w-10 h-5 rounded-full relative transition-colors ${form.isDefault ? "bg-[#E30A13]" : "bg-gray-300"}`}>
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isDefault ? "translate-x-5" : "translate-x-0"}`} />
            </div>
            <input type="checkbox" name="isDefault" checked={!!form.isDefault} onChange={handleChange} className="hidden" />
            <span className="text-sm font-medium text-gray-700">Set as default address</span>
          </label>
        </div>
      </div>

      <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-100">
        <Button type="button" variant="ghost" uppercase={false} onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="secondary" className="!bg-[#E30A13] border-none" uppercase={false} disabled={loading}>{loading ? "Saving..." : (form._id ? "Update Address" : "Save Address")}</Button>
      </div>
    </form>
  );
}
