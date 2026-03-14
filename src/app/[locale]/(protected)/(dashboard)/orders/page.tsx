"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  Search,
  FileText,
  Upload,
  Droplets,
} from "lucide-react";

type OrderStatus = "delivered" | "processing" | "cancelled" | "pending";
type OrderCategory = "delivery" | "marketplace" | "books" | "tuition" | "jobs" | "donation" | "parcel" | "blood" | "all";
type ActivityStatus = "approved" | "in-review" | "rejected" | "matched";
type ActivityCategory = "lostfound" | "blood" | "tuition" | "marketplace" | "donation" | "all";

type Order = {
  id: string;
  title: string;
  vendor: string;
  date: string;
  amount: number | null;
  status: OrderStatus;
  category: OrderCategory;
  icon: string;
  detail: string;
};

type Activity = {
  id: string;
  title: string;
  category: ActivityCategory;
  type: "report" | "request" | "application" | "upload";
  date: string;
  status: ActivityStatus;
  icon: string;
  detail: string;
};

const ALL_ORDERS: Order[] = [
  { id: "ORD-001", title: "Chicken Burger Meal × 2", vendor: "Campus Bites", date: "Today, 2:30 PM", amount: 360, status: "delivered", category: "delivery", icon: "🍔", detail: "Delivered to Al Beruni Hall, Room 204" },
  { id: "ORD-002", title: "Introduction to Algorithms", vendor: "Rakib's Books", date: "Yesterday, 11:00 AM", amount: 350, status: "delivered", category: "books", icon: "📚", detail: "Book exchange confirmed" },
  { id: "ORD-003", title: "Wireless Mouse — Logitech M90", vendor: "TechShop BD", date: "Dec 18, 2024", amount: 850, status: "processing", category: "marketplace", icon: "🖱️", detail: "Awaiting seller confirmation" },
  { id: "ORD-004", title: "Tuition Session — Math (HSC)", vendor: "Anika Rahman", date: "Dec 17, 2024", amount: 500, status: "delivered", category: "tuition", icon: "🎓", detail: "Session completed: Saturday 3 PM" },
  { id: "ORD-005", title: "Job Application — Research Intern", vendor: "DU Research Lab", date: "Dec 16, 2024", amount: null, status: "pending", category: "jobs", icon: "💼", detail: "Application under review" },
  { id: "ORD-006", title: "Donation — Flood Relief Fund", vendor: "DU Welfare Club", date: "Dec 15, 2024", amount: 500, status: "delivered", category: "donation", icon: "💚", detail: "Donation confirmed. Thank you!" },
  { id: "ORD-007", title: "Parcel — Al Beruni → Rokeya Hall", vendor: "Campus Delivery", date: "Dec 14, 2024", amount: 60, status: "delivered", category: "parcel", icon: "📦", detail: "Package delivered in 45 minutes" },
  { id: "ORD-008", title: "Blood Donation Request — A+", vendor: "Blood Bank", date: "Dec 12, 2024", amount: null, status: "cancelled", category: "blood", icon: "🩸", detail: "Request cancelled — donor unavailable" },
  { id: "ORD-009", title: "Veg Fried Rice + Lemon Tea", vendor: "Green Bowl Café", date: "Dec 10, 2024", amount: 130, status: "delivered", category: "delivery", icon: "🍱", detail: "Delivered to Bijoy Hall" },
  { id: "ORD-010", title: "Operating Systems (Tanenbaum)", vendor: "StudentBook Store", date: "Dec 8, 2024", amount: 280, status: "cancelled", category: "books", icon: "📖", detail: "Cancelled by seller" },
];

const MY_ACTIVITY: Activity[] = [
  { id: "ACT-001", title: "Lost Report: Blue HP Laptop", category: "lostfound", type: "report", date: "Today, 9:40 AM", status: "in-review", icon: "💻", detail: "Posted in Lost & Found feed, awaiting verified claims." },
  { id: "ACT-002", title: "Found Report: Student ID Card", category: "lostfound", type: "report", date: "Yesterday, 6:10 PM", status: "matched", icon: "🪪", detail: "Owner matched and contacted successfully." },
  { id: "ACT-003", title: "Blood Request: B+ (1 bag)", category: "blood", type: "request", date: "Dec 20, 2024", status: "approved", icon: "🩸", detail: "Request approved and donor contact shared." },
  { id: "ACT-004", title: "Donor Registration", category: "blood", type: "application", date: "Dec 19, 2024", status: "approved", icon: "❤️", detail: "You are now listed as an active donor." },
  { id: "ACT-005", title: "Tutor Application", category: "tuition", type: "application", date: "Dec 18, 2024", status: "in-review", icon: "🎓", detail: "Application under verification by moderation team." },
  { id: "ACT-006", title: "Marketplace Shop Setup", category: "marketplace", type: "upload", date: "Dec 17, 2024", status: "approved", icon: "🛍️", detail: "Shop profile approved and now visible publicly." },
  { id: "ACT-007", title: "Donation Campaign Proposal", category: "donation", type: "request", date: "Dec 15, 2024", status: "rejected", icon: "💚", detail: "Rejected due to missing supporting documents." },
];

const ORDER_CATEGORIES: { id: OrderCategory; label: string }[] = [
  { id: "all", label: "All Orders" },
  { id: "delivery", label: "Delivery" },
  { id: "marketplace", label: "Marketplace" },
  { id: "books", label: "Books" },
  { id: "tuition", label: "Tuition" },
  { id: "jobs", label: "Jobs" },
  { id: "donation", label: "Donations" },
  { id: "parcel", label: "Parcels" },
  { id: "blood", label: "Blood" },
];

const ACTIVITY_CATEGORIES: { id: ActivityCategory; label: string }[] = [
  { id: "all", label: "All Submissions" },
  { id: "lostfound", label: "Lost & Found" },
  { id: "blood", label: "Blood" },
  { id: "tuition", label: "Tuition" },
  { id: "marketplace", label: "Marketplace" },
  { id: "donation", label: "Donations" },
];

const ORDER_STATUS_CONFIG: Record<OrderStatus, { color: string; icon: ReactNode; label: string }> = {
  delivered: { color: "bg-green-100 text-green-700", icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: "Delivered" },
  processing: { color: "bg-blue-100 text-blue-700", icon: <Clock className="w-3.5 h-3.5" />, label: "Processing" },
  pending: { color: "bg-amber-100 text-amber-700", icon: <AlertCircle className="w-3.5 h-3.5" />, label: "Pending" },
  cancelled: { color: "bg-red-100 text-red-600", icon: <XCircle className="w-3.5 h-3.5" />, label: "Cancelled" },
};

const ACTIVITY_STATUS_CONFIG: Record<ActivityStatus, { color: string; label: string }> = {
  approved: { color: "bg-green-100 text-green-700", label: "Approved" },
  "in-review": { color: "bg-amber-100 text-amber-700", label: "In Review" },
  rejected: { color: "bg-red-100 text-red-600", label: "Rejected" },
  matched: { color: "bg-blue-100 text-blue-700", label: "Matched" },
};

const mapTabToOrderCategory = (tab: string | null): OrderCategory => {
  switch ((tab || "").toLowerCase()) {
    case "delivery":
    case "marketplace":
    case "books":
    case "tuition":
    case "jobs":
    case "blood":
      return tab as OrderCategory;
    case "donation":
    case "donations":
      return "donation";
    case "parcel":
    case "parcels":
      return "parcel";
    default:
      return "all";
  }
};

const mapTabToActivityCategory = (tab: string | null): ActivityCategory => {
  switch ((tab || "").toLowerCase()) {
    case "blood":
    case "tuition":
    case "marketplace":
      return tab as ActivityCategory;
    case "donation":
    case "donations":
      return "donation";
    case "lostfound":
    case "lost-found":
      return "lostfound";
    default:
      return "all";
  }
};

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const tab = useMemo(() => searchParams.get("tab"), [searchParams]);

  const [orderCategory, setOrderCategory] = useState<OrderCategory>(() => mapTabToOrderCategory(tab));
  const [activityCategory, setActivityCategory] = useState<ActivityCategory>(() => mapTabToActivityCategory(tab));
  const [search, setSearch] = useState("");

  useEffect(() => {
    setOrderCategory(mapTabToOrderCategory(tab));
    setActivityCategory(mapTabToActivityCategory(tab));
  }, [tab]);

  const filteredOrders = ALL_ORDERS.filter((o) => {
    if (orderCategory !== "all" && o.category !== orderCategory) return false;
    if (
      search &&
      !o.title.toLowerCase().includes(search.toLowerCase()) &&
      !o.vendor.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const filteredActivities = MY_ACTIVITY.filter((item) => {
    if (activityCategory !== "all" && item.category !== activityCategory) return false;
    if (
      search &&
      !item.title.toLowerCase().includes(search.toLowerCase()) &&
      !item.detail.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const totalSpent = ALL_ORDERS
    .filter((o) => o.status === "delivered" && o.amount)
    .reduce((sum, o) => sum + (o.amount ?? 0), 0);
  const totalOrders = ALL_ORDERS.length;
  const delivered = ALL_ORDERS.filter((o) => o.status === "delivered").length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Orders & Requests</h1>
        <p className="text-sm text-gray-500 mt-1">Track purchases plus your own submitted reports, requests, and applications</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Orders", value: totalOrders, icon: <Package className="w-5 h-5" />, color: "text-blue-600 bg-blue-100" },
          { label: "Delivered", value: delivered, icon: <CheckCircle2 className="w-5 h-5" />, color: "text-green-600 bg-green-100" },
          { label: "Total Spent", value: `৳${totalSpent.toLocaleString()}`, icon: <span className="text-sm font-bold">৳</span>, color: "text-[#E30A13] bg-red-100" },
          { label: "My Submissions", value: MY_ACTIVITY.length, icon: <FileText className="w-5 h-5" />, color: "text-amber-600 bg-amber-100" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center mb-2`}>{s.icon}</div>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search orders, reports, requests..."
          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-red-400"
        />
      </div>

      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Purchase & Service History</h2>
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {ORDER_CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setOrderCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                orderCategory === c.id
                  ? "bg-[#E30A13] text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-red-300"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <Package className="w-9 h-9 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No matching orders found</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const statusConf = ORDER_STATUS_CONFIG[order.status];
              return (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">{order.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{order.title}</p>
                        <p className="text-xs text-gray-400">{order.vendor} · {order.date}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{order.detail}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        {order.amount ? (
                          <p className="font-bold text-gray-900 text-sm">৳{order.amount}</p>
                        ) : (
                          <p className="text-xs text-gray-400">Free</p>
                        )}
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConf.color}`}>
                          {statusConf.icon}
                          {statusConf.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                </div>
              );
            })
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-700">My Uploads & Requests History</h2>
          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
            <Upload className="w-3.5 h-3.5" />
            Includes lost reports, blood requests, tutor applications
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {ACTIVITY_CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setActivityCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                activityCategory === c.id
                  ? "bg-[#0D1B2A] text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredActivities.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <Droplets className="w-9 h-9 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No matching submission history found</p>
            </div>
          ) : (
            filteredActivities.map((item) => {
              const conf = ACTIVITY_STATUS_CONFIG[item.status];
              return (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">{item.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                    <p className="text-xs text-gray-400 capitalize">{item.type} · {item.date}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.detail}</p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${conf.color}`}>
                    {conf.label}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
