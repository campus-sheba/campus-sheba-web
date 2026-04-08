import { useState } from "react";
import Button from "@/components/ui/Button";
import type { ShopPayload } from "@/app/[locale]/(protected)/(dashboard)/my-shop/actions";

const defaultShop: ShopPayload = {
  type: "Student Shop",
  name: "",
  description: "",
  address: "",
  logo: { url: "", key: "", size: 0 },
  coverPhoto: { url: "", key: "", size: 0 },
  contactEmail: "",
  phoneNumber: "",
  website: "",
  socialLinks: { facebook: "", instagram: "", twitter: "" },
  minimumOrderAmount: 0,
  operatingHours: [],
  location: { type: "Point", coordinates: [0, 0] },
};


interface ShopFormProps {
  initial?: ShopPayload;
  onSubmit: (form: ShopPayload) => void;
  loading: boolean;
  onCancel?: () => void;
  isEdit?: boolean;
}

export default function ShopForm({ initial, onSubmit, loading, onCancel, isEdit }: ShopFormProps) {
  const [form, setForm] = useState<ShopPayload>(initial || defaultShop);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!form.name) return setError("Name is required");
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Shop Name</label>
        <input name="name" value={form.name} onChange={handleChange} className="input input-bordered w-full" />
      </div>
      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} className="input input-bordered w-full" />
      </div>
      <div>
        <label className="block text-sm font-medium">Address</label>
        <input name="address" value={form.address} onChange={handleChange} className="input input-bordered w-full" />
      </div>
      <div>
        <label className="block text-sm font-medium">Contact Email</label>
        <input name="contactEmail" value={form.contactEmail} onChange={handleChange} className="input input-bordered w-full" />
      </div>
      <div>
        <label className="block text-sm font-medium">Phone Number</label>
        <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} className="input input-bordered w-full" />
      </div>
      <div>
        <label className="block text-sm font-medium">Website</label>
        <input name="website" value={form.website} onChange={handleChange} className="input input-bordered w-full" />
      </div>
      {/* Add more fields as needed */}
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div className="flex items-center gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : isEdit ? "Update Shop" : "Save Shop"}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
