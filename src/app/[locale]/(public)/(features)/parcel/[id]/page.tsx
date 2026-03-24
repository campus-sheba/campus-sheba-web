/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  MapPin,
  Package,
  Copy,
  User,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

// Mock data for different parcels
const PARCELS_DATA: Record<string, any> = {
  PKG001: {
    id: "PKG001",
    status: "inTransit",
    createdAt: "Mar 16, 2026 18:34",
    estimatedDelivery: "Mar 16, 2026 21:04",
    pickup: "mainGate",
    delivery: "academicBuilding1",
    recipient: {
      name: "John Doe",
      phone: "01712345678",
    },
    size: "small",
    weight: "2kg",
    description: "Books and documents",
    amount: 20,
  },
  PKG002: {
    id: "PKG002",
    status: "pickedUp",
    createdAt: "Mar 16, 2026 17:00",
    estimatedDelivery: "Mar 16, 2026 19:00",
    pickup: "alBeruniHall",
    delivery: "tsccafeteria",
    recipient: {
      name: "Jane Smith",
      phone: "01912345678",
    },
    size: "medium",
    weight: "3kg",
    description: "Course materials",
    amount: 60,
  },
  PKG003: {
    id: "PKG003",
    status: "pending",
    createdAt: "Mar 16, 2026 20:00",
    estimatedDelivery: "Mar 16, 2026 22:30",
    pickup: "rokeya",
    delivery: "libraryMain",
    recipient: {
      name: "Ahmed Hassan",
      phone: "01712999678",
    },
    size: "small",
    weight: "1.5kg",
    description: "Books",
    amount: 30,
  },
  PKG101: {
    id: "PKG101",
    status: "delivered",
    createdAt: "Mar 15, 2026 10:00",
    estimatedDelivery: "Mar 15, 2026 12:00",
    pickup: "maingate",
    delivery: "dormitory",
    recipient: {
      name: "Ali Khan",
      phone: "01812345678",
    },
    size: "small",
    weight: "2kg",
    description: "Package",
    amount: 20,
  },
  PKG102: {
    id: "PKG102",
    status: "delivered",
    createdAt: "Mar 14, 2026 15:00",
    estimatedDelivery: "Mar 14, 2026 17:00",
    pickup: "library",
    delivery: "centrallawn",
    recipient: {
      name: "Fatima Begum",
      phone: "01712555678",
    },
    size: "medium",
    weight: "4kg",
    description: "Documents",
    amount: 60,
  },
  PKG103: {
    id: "PKG103",
    status: "cancelled",
    createdAt: "Mar 14, 2026 09:00",
    estimatedDelivery: "Mar 14, 2026 11:00",
    pickup: "rokeya",
    delivery: "sciencebuilding",
    recipient: {
      name: "Karim Ahmed",
      phone: "01612345678",
    },
    size: "large",
    weight: "8kg",
    description: "Lab equipment",
    amount: 100,
  },
};

export default async function ParcelDetailsPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  const parcel = PARCELS_DATA[id] || PARCELS_DATA.PKG001;
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <Link href={`/parcel`} className="">
          <div className="cs-container flex items-center gap-3 py-4 w-10 h-10 rounded-full bg-gray-100 justify-center text-xl text-red-600 hover:bg-gray-200 cursor-pointer">
            <ArrowRight className="rotate-180 w-5 h-5" />
            <h1 className="text-xl font-bold text-gray-900">Parcel</h1>
          </div>
        </Link>
      </div>

      <div className="cs-container py-4 max-w-lg">
        {/* Status Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 flex flex-col items-center relative">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-6 h-6 text-red-600" />
            <span className="font-bold text-lg text-gray-900">Status</span>
            <span className="font-semibold text-red-600 ml-2">
              {parcel.status}
            </span>
            <button className="absolute top-4 right-4 p-2 rounded hover:bg-gray-100">
              <Copy className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <div className="font-bold text-xl text-gray-900 mt-2">
            {parcel.id}
          </div>
        </div>

        {/* Delivery Timeline */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
          <h2 className="font-bold text-lg mb-2">Delivery Timeline</h2>
          <div className="text-sm text-gray-700 mb-1">
            Created at: {parcel.createdAt}
          </div>
          <div className="text-sm text-gray-700">
            Estimated delivery: {parcel.estimatedDelivery}
          </div>
        </div>

        {/* Route */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
          <h2 className="font-bold text-lg mb-2 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-600" /> Route
          </h2>
          <div className="text-sm text-gray-700 mb-1">
            Pickup: {parcel.pickup}
          </div>
          <div className="text-sm text-gray-700">
            Delivery: {parcel.delivery}
          </div>
        </div>

        {/* Recipient & Details */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
          <h2 className="font-bold text-lg mb-2 flex items-center gap-2">
            <User className="w-5 h-5 text-red-600" /> Recipient & Details
          </h2>
          <div className="text-sm text-gray-700 mb-1">
            Name: {parcel.recipient.name}
          </div>
          <div className="text-sm text-gray-700 mb-1">
            Phone: {parcel.recipient.phone}
          </div>
          <div className="text-sm text-gray-700 mb-1">Size: {parcel.size}</div>
          <div className="text-sm text-gray-700 mb-1">
            Weight: {parcel.weight}
          </div>
          <div className="text-sm text-gray-700">
            Description: {parcel.description}
          </div>
        </div>

        {/* Total Amount */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between text-lg font-bold mb-6">
          <span>Total Amount</span>
          <span className="text-red-600">৳{parcel.amount}</span>
        </div>
      </div>
    </div>
  );
}
