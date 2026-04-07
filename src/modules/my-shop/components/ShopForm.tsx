import { useState } from "react";
import Button from "@/components/ui/Button";

const defaultShop = {
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
  initial?: typeof defaultShop;
  onSubmit: (form: typeof defaultShop) => void;
  loading: boolean;
}

export default function ShopForm({ initial, onSubmit, loading }: ShopFormProps) {
  const [form, setForm] = useState<typeof defaultShop>(initial || defaultShop);
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
      <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Shop"}</Button>
    </form>
  );
}
