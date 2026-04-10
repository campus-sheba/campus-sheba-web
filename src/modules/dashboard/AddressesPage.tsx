"use client";

import { useMemo, useState, useTransition } from "react";
import { Check, MapPin, Pencil, ShoppingBag, Trash2 } from "lucide-react";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import { Button } from "@/components/ui";
import { ContentWrapper, SectionWrapper } from "@/components/wrappers";
import { CookieHelper } from "@/lib/appStateHelper";
import {
  createAddressAction,
  deleteAddressAction,
  getAddressesAction,
  updateAddressAction,
} from "@/services/addresses";
import type { CreateAddressPayload, UserAddress, UserAddressType } from "@/types/address";

type AddressesPageProps = {
  initialAddresses: UserAddress[];
};

const emptyForm: CreateAddressPayload = {
  address: "",
  latitude: 23.88,
  longitude: 90.27,
  type: "DELIVERY",
  description: "",
  isDefault: false,
};

export default function AddressesPage({ initialAddresses }: AddressesPageProps) {
  const [isPending, startTransition] = useTransition();
  const [addresses, setAddresses] = useState<UserAddress[]>(initialAddresses);
  const [filterType, setFilterType] = useState<"" | UserAddressType>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateAddressPayload>(emptyForm);
  const [feedback, setFeedback] = useState<string>("");
  const [checkoutId, setCheckoutId] = useState<string | null>(() =>
    CookieHelper.getAddressId(),
  );

  const filtered = useMemo(() => {
    if (!filterType) return addresses;
    return addresses.filter((a) => a.type === filterType);
  }, [addresses, filterType]);

  const refresh = () => {
    startTransition(async () => {
      const res = await getAddressesAction();
      if (res.success) setAddresses(res.data);
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const startEdit = (a: UserAddress) => {
    setEditingId(a._id);
    setForm({
      address: a.address,
      latitude: a.latitude,
      longitude: a.longitude,
      type: a.type,
      description: a.description ?? "",
      isDefault: a.isDefault,
    });
  };

  const onSubmit = () => {
    setFeedback("");
    if (!form.address.trim()) {
      setFeedback("Address line is required.");
      return;
    }
    startTransition(async () => {
      const payload: CreateAddressPayload = {
        ...form,
        description: form.description?.trim() || undefined,
      };
      if (editingId) {
        const res = await updateAddressAction(editingId, {
          latitude: payload.latitude,
          longitude: payload.longitude,
          address: payload.address,
          description: payload.description ?? null,
          isDefault: payload.isDefault,
        });
        setFeedback(
          res.success ? "Address updated." : (res.message ?? "Update failed."),
        );
        if (res.success) {
          resetForm();
          refresh();
        }
        return;
      }
      const res = await createAddressAction(payload);
      setFeedback(
        res.success ? "Address added." : (res.message ?? "Could not add address."),
      );
      if (res.success) {
        resetForm();
        refresh();
      }
    });
  };

  const onDelete = (id: string) => {
    if (!confirm("Delete this address?")) return;
    setFeedback("");
    startTransition(async () => {
      const res = await deleteAddressAction(id);
      setFeedback(
        res.success ? "Address removed." : (res.message ?? "Delete failed."),
      );
      if (res.success) {
        if (checkoutId === id) {
          setCheckoutId(null);
        }
        refresh();
      }
    });
  };

  const onSetDefault = (id: string) => {
    setFeedback("");
    startTransition(async () => {
      const res = await updateAddressAction(id, { isDefault: true });
      setFeedback(
        res.success ? "Default address updated." : (res.message ?? "Update failed."),
      );
      if (res.success) refresh();
    });
  };

  const onUseForCheckout = (id: string) => {
    CookieHelper.setAddressId(id);
    setCheckoutId(id);
    setFeedback("This address is now used for cart checkout and order summary.");
  };

  return (
    <div className="space-y-5">
      <AppBreadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/profile" },
          { label: "Addresses" },
        ]}
      />

      <SectionWrapper
        spacing="none"
        background="white"
        className="rounded-2xl border border-gray-100"
      >
        <ContentWrapper className="px-6 py-6">
          <h1 className="text-2xl font-bold text-gray-900">My addresses</h1>
          <p className="mt-1 text-sm text-gray-500">
            Save delivery and pickup locations. Choose one for checkout — it is stored in your
            browser for cart totals and orders.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {(["", "DELIVERY", "PICKUP"] as const).map((t) => (
              <button
                key={t || "all"}
                type="button"
                onClick={() => setFilterType(t)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  filterType === t
                    ? "bg-[#E30A13]/10 text-[#E30A13]"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {t === "" ? "All" : t === "DELIVERY" ? "Delivery" : "Pickup"}
              </button>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-gray-100 bg-gray-50/80 p-4 md:p-5">
            <h2 className="text-sm font-semibold text-gray-800">
              {editingId ? "Edit address" : "Add address"}
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="text-xs font-medium text-gray-600 md:col-span-2">
                Address
                <input
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm"
                  value={form.address}
                  onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  placeholder="House, road, area"
                />
              </label>
              <label className="text-xs font-medium text-gray-600">
                Latitude
                <input
                  type="number"
                  step="any"
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm"
                  value={form.latitude}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, latitude: Number(e.target.value) }))
                  }
                />
              </label>
              <label className="text-xs font-medium text-gray-600">
                Longitude
                <input
                  type="number"
                  step="any"
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm"
                  value={form.longitude}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, longitude: Number(e.target.value) }))
                  }
                />
              </label>
              <label className="text-xs font-medium text-gray-600">
                Type
                <select
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm"
                  value={form.type}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, type: e.target.value as UserAddressType }))
                  }
                >
                  <option value="DELIVERY">Delivery</option>
                  <option value="PICKUP">Pickup</option>
                </select>
              </label>
              <label className="flex items-center gap-2 text-xs font-medium text-gray-600 md:col-span-2">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, isDefault: e.target.checked }))
                  }
                />
                Set as default
              </label>
              <label className="text-xs font-medium text-gray-600 md:col-span-2">
                Description (optional)
                <textarea
                  rows={2}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm"
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                uppercase={false}
                onClick={onSubmit}
                disabled={isPending}
              >
                {editingId ? "Save changes" : "Add address"}
              </Button>
              {editingId && (
                <Button type="button" variant="ghost" uppercase={false} onClick={resetForm}>
                  Cancel edit
                </Button>
              )}
            </div>
          </div>

          {feedback && (
            <p className="mt-4 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700">
              {feedback}
            </p>
          )}

          <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Saved addresses
          </h2>
          <ul className="mt-3 space-y-3">
            {filtered.length === 0 ? (
              <li className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-500">
                No addresses yet. Add one above.
              </li>
            ) : (
              filtered.map((a) => (
                <li
                  key={a._id}
                  className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:flex-row md:items-start md:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0 text-[#00A651]" />
                      <span className="font-semibold text-gray-900">{a.address}</span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                          a.type === "DELIVERY"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-800"
                        }`}
                      >
                        {a.type}
                      </span>
                      {a.isDefault && (
                        <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                          Default
                        </span>
                      )}
                      {checkoutId === a._id && (
                        <span className="rounded-md bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-700">
                          Checkout
                        </span>
                      )}
                    </div>
                    {a.description && (
                      <p className="mt-1 whitespace-pre-wrap text-xs text-gray-500">{a.description}</p>
                    )}
                    <p className="mt-2 text-[11px] text-gray-400">
                      {a.latitude.toFixed(5)}, {a.longitude.toFixed(5)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 md:justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      uppercase={false}
                      className="gap-1 text-xs"
                      onClick={() => onUseForCheckout(a._id)}
                      disabled={isPending}
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      Use for checkout
                    </Button>
                    {!a.isDefault && (
                      <Button
                        type="button"
                        variant="ghost"
                        uppercase={false}
                        className="gap-1 text-xs"
                        onClick={() => onSetDefault(a._id)}
                        disabled={isPending}
                      >
                        <Check className="h-3.5 w-3.5" />
                        Set default
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      uppercase={false}
                      className="gap-1 text-xs"
                      onClick={() => startEdit(a)}
                      disabled={isPending}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      uppercase={false}
                      className="gap-1 text-xs text-red-600 hover:bg-red-50"
                      onClick={() => onDelete(a._id)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </ContentWrapper>
      </SectionWrapper>
    </div>
  );
}
