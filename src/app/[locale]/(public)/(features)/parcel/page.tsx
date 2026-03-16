"use client";

import { useState } from "react";
import {
  MapPin,
  Phone,
  Weight,
  CheckCircle2,
  ArrowRight,
  Shield,
  Package,
  User,
  History,
  Send,
} from "lucide-react";
import { useParcelNavigation } from "./utils";

const SIZES = [
  { id: "small", label: "Small", desc: "Up to 2 kg", price: 30 },
  { id: "medium", label: "Medium", desc: "2–5 kg", price: 60 },
  { id: "large", label: "Large", desc: "5–15 kg", price: 100 },
];

const HISTORY = [
  { id: "PKG101", status: "delivered" },
  { id: "PKG102", status: "delivered" },
  { id: "PKG103", status: "cancelled" },
];
const ACTIVE = [
  { id: "PKG001", status: "inTransit" },
  { id: "PKG002", status: "pickedUp" },
  { id: "PKG003", status: "pending" },
];

export default function ParcelPage() {
  const { goToParcel } = useParcelNavigation();
  const [tab, setTab] = useState<"send" | "active" | "history">("send");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const LOCATIONS = [
    "Al Beruni Hall",
    "Rokeya Hall",
    "TSC",
    "Central Library",
    "Faculty of Science",
    "Faculty of Arts",
    "Admin Building",
    "Cafeteria",
    "Playground",
    "Other",
  ];
  const [parcelSize, setParcelSize] = useState("");
  const [weight, setWeight] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Responsive container
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header & Tabs */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="cs-container flex items-center gap-3 py-4">
          <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl text-red-600">
            <ArrowRight className="rotate-180 w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Parcel</h1>
        </div>
        <div className="cs-container flex gap-2 pb-2">
          <button
            className={`flex-1 py-2 rounded-xl font-semibold text-sm ${
              tab === "send"
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
            onClick={() => setTab("send")}
          >
            Send
          </button>
          <button
            className={`flex-1 py-2 rounded-xl font-semibold text-sm ${
              tab === "active"
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
            onClick={() => setTab("active")}
          >
            Active
          </button>
          <button
            className={`flex-1 py-2 rounded-xl font-semibold text-sm ${
              tab === "history"
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
            onClick={() => setTab("history")}
          >
            History
          </button>
        </div>
      </div>

      {/* Promo Card */}
      {tab === "send" && (
        <div className="cs-container mt-4">
          <div className="bg-red-600 rounded-2xl p-4 text-white mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">✨</span>
              <span className="font-semibold">Save Big on Campus Travel!</span>
            </div>
            <p className="text-sm mb-2">
              Inter-campus delivery starting at just ৳20. Skip the costly
              rickshaw fare!
            </p>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <span className="text-lg">⚡</span>30-45 min
              </span>
              <span className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Secure delivery
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="cs-container py-4  max-w-5xl mx-auto">
        {tab === "send" && (
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
          >
            {/* Delivery Route */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
              <h2 className="font-bold text-lg mb-3">Delivery Route</h2>
              <div className="space-y-3">
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <select
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-md border border-gray-200 text-sm outline-none focus:border-red-400 bg-white"
                  >
                    <option value="">Pickup Location</option>
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <select
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-md border border-gray-200 text-sm outline-none focus:border-red-400 bg-white"
                  >
                    <option value="">Delivery Location</option>
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Recipient Details */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
              <h2 className="font-bold text-lg mb-3">Recipient Details</h2>
              <div className="space-y-3">
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full pl-9 pr-3 py-2.5 rounded-md border border-gray-200 text-sm outline-none focus:border-red-400"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="Phone Number"
                    className="w-full pl-9 pr-3 py-2.5 rounded-md border border-gray-200 text-sm outline-none focus:border-red-400"
                  />
                </div>
              </div>
            </div>

            {/* Parcel Size */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
              <h2 className="font-bold text-lg mb-3">Parcel Size</h2>
              <div className="flex gap-2 mb-3">
                {SIZES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setParcelSize(s.id)}
                    className={`flex-1 py-2 rounded-md border text-sm font-medium ${
                      parcelSize === s.id
                        ? "bg-red-600 text-white border-red-600"
                        : "bg-white text-gray-700 border-gray-200"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <div className="relative mb-3">
                <Weight className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Estimated Weight (e.g., 2kg)"
                  className="w-full pl-9 pr-3 py-2.5 rounded-md border border-gray-200 text-sm outline-none focus:border-red-400"
                />
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={7}
                placeholder="Description (Optional)"
                className="w-full px-3 py-2.5 rounded-md border border-gray-200 text-sm outline-none focus:border-red-400 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={
                !recipientName ||
                !recipientPhone ||
                !pickupLocation ||
                !deliveryLocation ||
                !parcelSize
              }
              className="w-full py-3 rounded-md bg-red-600 text-white font-semibold text-base hover:bg-red-700 disabled:opacity-50 mt-2"
            >
              Create Parcel
            </button>
          </form>
        )}

        {tab === "active" && (
          <div className=" grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ACTIVE.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white rounded-xl border border-gray-100 flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => goToParcel(pkg.id)}
              >
                <div className="flex items-center justify-between gap-3">
                  <Package className="w-6 h-6 text-red-600" />
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">
                      {pkg.id}
                    </div>
                    <div className="text-xs text-gray-500">{pkg.status}</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
        )}

        {tab === "history" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {HISTORY.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white rounded-xl border border-gray-100 flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => goToParcel(pkg.id)}
              >
                <div className="flex items-center gap-3">
                  <Package className="w-6 h-6 text-red-600" />
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">
                      {pkg.id}
                    </div>
                    <div className="text-xs text-gray-500">{pkg.status}</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
        )}

        {/* Confirmation Dialog */}
        {submitted && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center max-w-xs w-full">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Parcel Booked!
              </h2>
              <p className="text-gray-500 text-sm mb-1">
                Your parcel delivery has been confirmed.
              </p>
              <p className="text-gray-400 text-sm mb-1">
                From: <strong>{pickupLocation}</strong>
              </p>
              <p className="text-gray-400 text-sm mb-6">
                To: <strong>{deliveryLocation}</strong>
              </p>
              <div className="inline-block bg-red-50 border border-red-200 rounded-xl px-6 py-3 mb-6">
                <p className="text-xs text-red-500">Total Charge</p>
                <p className="text-2xl font-bold text-red-700">
                  ৳{SIZES.find((s) => s.id === parcelSize)?.price}
                </p>
              </div>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setRecipientName("");
                  setRecipientPhone("");
                  setPickupLocation("");
                  setDeliveryLocation("");
                  setParcelSize("");
                  setWeight("");
                  setDescription("");
                }}
                className="px-6 py-3 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700"
              >
                Send Another Parcel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
