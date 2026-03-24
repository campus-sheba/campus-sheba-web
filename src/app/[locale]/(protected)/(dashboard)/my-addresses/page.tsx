/* eslint-disable @typescript-eslint/no-explicit-any */
 

'use client'

import StandardDataTable from "@/components/ui/StandardDataTable";
import AddressForm from "./AddressForm";
import AddressActions from "./AddressActions";
import { useEffect, useState } from "react";
import { Address, getAddressesAction } from "./actions";

export default function MyAddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  // const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editAddress, setEditAddress] = useState<Address | null>(null);

  const fetchAddresses = async () => {
    const res:any = await getAddressesAction();
    console.log("Fetched addresses:", res);
    setAddresses(res?.data || []);
  };




  useEffect(() => {
    (async () => {
      await fetchAddresses();
    })();
  }, []);

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Addresses</h1>
      <div className="flex justify-end mb-4">
        <button className="btn btn-primary" onClick={() => { setEditAddress(null); setShowForm(true); }}>Add Address</button>
      </div>
      <StandardDataTable
        columns={[
          {
            key: "address",
            header: "Address",
            render: (row: Address) => (
              <div className="whitespace-pre-line break-words max-w-xs">{row.address}</div>
            ),
          },
          {
            key: "type",
            header: "Type",
            render: (row: Address) => row.type,
          },
          {
            key: "latitude",
            header: "Latitude",
            render: (row: Address) => row.latitude,
          },
          {
            key: "longitude",
            header: "Longitude",
            render: (row: Address) => row.longitude,
          },
          {
            key: "description",
            header: "Description",
            render: (row: Address) => row.description || "—",
          },
          {
            key: "isDefault",
            header: "Default",
            render: (row: Address) => row.isDefault ? (
              <span className="badge badge-success">Default</span>
            ) : "",
          },
          {
            key: "actions",
            header: "Actions",
            render: (row: Address) => (
              <AddressActions
                address={row}
                onEdit={() => { setEditAddress(row); setShowForm(true); }}
                onDelete={fetchAddresses}
              />
            ),
          },
        ]}
        rows={addresses}
        getRowKey={(row: Address) => row._id || row.address}
      />
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-4 relative">
            <button className="absolute top-2 right-2 btn btn-xs btn-ghost" onClick={() => setShowForm(false)}>✕</button>
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
