"use client";

import { useEffect, useState, useTransition } from "react";
import { Address, getAddressesAction, deleteAddressAction } from "./actions";
import AddressForm from "./AddressForm";
import Button from "@/components/ui/Button";
import { MapPin, Navigation, Navigation2, Info, Pencil, Trash, Plus, Map } from "lucide-react";

export default function MyAddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editAddress, setEditAddress] = useState<Address | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchAddresses = async () => {
    setLoading(true);
    const res: any = await getAddressesAction();
    setAddresses(res?.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    startTransition(async () => {
      await deleteAddressAction(id);
      await fetchAddresses();
    });
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="w-9 h-9 border-4 border-[#E30A13]/20 border-t-[#E30A13] rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading your addresses…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E30A13]/10 flex items-center justify-center">
            <Map className="w-5 h-5 text-[#E30A13]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Addresses</h1>
            <p className="text-xs text-gray-500">Manage delivery and pickup locations</p>
          </div>
        </div>
        <Button
          variant="secondary"
          uppercase={false}
          className="!bg-[#E30A13] border-none gap-2 px-4 shadow-sm"
          onClick={() => { setEditAddress(null); setShowForm(true); }}
        >
          <Plus className="w-4 h-4" /> Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#E30A13]/10 flex items-center justify-center mx-auto mb-3">
            <MapPin className="w-7 h-7 text-[#E30A13]" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">No addresses found</h3>
          <p className="text-sm text-gray-500 mb-4">You haven't added any addresses yet.</p>
          <Button
            variant="outline"
            uppercase={false}
            onClick={() => { setEditAddress(null); setShowForm(true); }}
          >
            Add your first address
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div
              key={address._id}
              className={`bg-white rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md flex flex-col ${
                address.isDefault ? "border-[#E30A13]/30 ring-1 ring-[#E30A13]/10" : "border-gray-100"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                      address.type === "DELIVERY" 
                        ? "bg-blue-50 text-blue-700 border-blue-100" 
                        : "bg-purple-50 text-purple-700 border-purple-100"
                    }`}
                  >
                    {address.type}
                  </span>
                  {address.isDefault && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-[#E30A13]/10 text-[#E30A13] border border-[#E30A13]/20">
                      Default
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                  <button
                    disabled={isPending}
                    onClick={() => { setEditAddress(address); setShowForm(true); }}
                    className="p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-gray-400 transition"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    disabled={isPending}
                    onClick={() => handleDelete(address._id!)}
                    className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-lg text-gray-400 transition"
                    title="Delete"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <div className="flex gap-2.5">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-gray-800 leading-snug">
                    {address.address}
                  </p>
                </div>

                {address.description && (
                  <div className="flex gap-2.5">
                    <Info className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-500 italic">
                      {address.description}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-4 pt-3 mt-auto border-t border-gray-50">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 truncate" title="Latitude">
                    <Navigation className="w-3 h-3 text-gray-400" />
                    {address.latitude}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 truncate" title="Longitude">
                    <Navigation2 className="w-3 h-3 text-gray-400" />
                    {address.longitude}
                  </div>
                  <a
                    href={`https://maps.google.com/?q=${address.latitude},${address.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-xs font-semibold text-[#E30A13] hover:underline"
                  >
                    View Map
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Overlay */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Note: AddressForm is configured to look beautiful out-of-the-box */}
            <AddressForm
              initial={editAddress || undefined}
              onSuccess={() => { setShowForm(false); fetchAddresses(); }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
