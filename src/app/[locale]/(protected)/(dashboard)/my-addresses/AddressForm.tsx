import { useState } from "react";
import { Address, createAddressAction, updateAddressAction } from "./actions";

interface Props {
  initial?: Partial<Address>;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddressForm({ initial, onSuccess, onCancel }: Props) {
  const [form, setForm] = useState<Partial<Address>>(initial || {});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (form._id) {
        await updateAddressAction(form._id, form);
      } else {
        await createAddressAction(form as Omit<Address, "_id" | "user" | "createdAt" | "updatedAt">);
      }
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-xl shadow">
      <div>
        <label className="block text-sm font-medium">Address</label>
        <input name="address" value={form.address || ""} onChange={handleChange} className="input input-bordered w-full" required />
      </div>
      <div>
        <label className="block text-sm font-medium">Type</label>
        <select name="type" value={form.type || "DELIVERY"} onChange={handleChange} className="input input-bordered w-full">
          <option value="DELIVERY">Delivery</option>
          <option value="PICKUP">Pickup</option>
        </select>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-sm font-medium">Latitude</label>
          <input name="latitude" type="number" value={form.latitude || ""} onChange={handleChange} className="input input-bordered w-full" required />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium">Longitude</label>
          <input name="longitude" type="number" value={form.longitude || ""} onChange={handleChange} className="input input-bordered w-full" required />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium">Description</label>
        <input name="description" value={form.description || ""} onChange={handleChange} className="input input-bordered w-full" />
      </div>
      <div className="flex items-center gap-2">
        <input name="isDefault" type="checkbox" checked={!!form.isDefault} onChange={handleChange} />
        <label className="text-sm">Set as default</label>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="btn btn-ghost">Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>{form._id ? "Update" : "Add"} Address</button>
      </div>
    </form>
  );
}
