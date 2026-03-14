import { getMe } from "@/services/auth";
import { logoutAction } from "./actions";
import Link from "next/link";
import {
  Package,
  Wallet,
  ShoppingBag,
  Bike,
  BookOpen,
  Droplets,
  GraduationCap,
  Briefcase,
  Heart,
  MapPin,
  ArrowRight,
  Star,
  TrendingUp,
  Bell,
  Edit3,
  Phone,
  Mail,
  User,
  Shield,
} from "lucide-react";

const MOCK_RECENT_ORDERS = [
  { id: "ORD-001", type: "Delivery", item: "Chicken Fried Rice + Coke", status: "Delivered", date: "Today, 1:30 PM", amount: "৳ 280", color: "bg-green-100 text-green-700" },
  { id: "ORD-002", type: "Books", item: "Data Structures — Cormen", status: "Picked Up", date: "Yesterday", amount: "৳ 450", color: "bg-blue-100 text-blue-700" },
  { id: "ORD-003", type: "Parcel", item: "Package to Dormitory Block C", status: "In Transit", date: "Dec 11", amount: "৳ 60", color: "bg-amber-100 text-amber-700" },
  { id: "ORD-004", type: "Marketplace", item: "Casio FX-991EX Calculator", status: "Completed", date: "Dec 8", amount: "৳ 1,200", color: "bg-emerald-100 text-emerald-700" },
];

const SERVICES_QUICK = [
  { label: "Delivery", href: "/delivery", icon: Bike, bg: "bg-purple-50", color: "text-purple-600" },
  { label: "Marketplace", href: "/marketplace", icon: ShoppingBag, bg: "bg-emerald-50", color: "text-emerald-600" },
  { label: "Books", href: "/books", icon: BookOpen, bg: "bg-blue-50", color: "text-blue-600" },
  { label: "Blood Bank", href: "/blood-bank", icon: Droplets, bg: "bg-red-50", color: "text-red-600" },
  { label: "Tuition", href: "/tuition", icon: GraduationCap, bg: "bg-amber-50", color: "text-amber-600" },
  { label: "Jobs", href: "/jobs", icon: Briefcase, bg: "bg-sky-50", color: "text-sky-600" },
  { label: "Donation", href: "/donation", icon: Heart, bg: "bg-green-50", color: "text-green-600" },
  { label: "Lost & Found", href: "/lost-found", icon: MapPin, bg: "bg-yellow-50", color: "text-yellow-600" },
];

const MOCK_NOTIFICATIONS = [
  { id: 1, text: "Your delivery order ORD-001 has been delivered.", time: "2 min ago", unread: true },
  { id: 2, text: "Tutor Rakibul confirmed your session for Dec 15.", time: "1 hr ago", unread: true },
  { id: 3, text: "You received ৳50 cashback in your wallet.", time: "Yesterday", unread: false },
];

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const response = await getMe();
  const user = response.data;

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#E30A13] to-[#c00910] p-6 text-white">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold">
              {initials}
            </div>
            <div>
              <p className="text-red-200 text-sm">Welcome back,</p>
              <h1 className="text-2xl font-bold">{user?.name || "Student"}</h1>
              <p className="text-red-200 text-sm mt-0.5">{user?.phone || user?.email || "Campus Sheba Member"}</p>
            </div>
          </div>
          <Link
            href={`/${locale}/profile?tab=settings`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-sm font-medium transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit Profile
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Orders", value: "28", icon: Package },
            { label: "Wallet Balance", value: "৳ 1,240", icon: Wallet },
            { label: "Points Earned", value: "480 pts", icon: Star },
            { label: "Services Used", value: "7", icon: TrendingUp },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/15 rounded-xl p-3">
              <stat.icon className="w-4 h-4 text-red-200 mb-1.5" />
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-xs text-red-200">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Services */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Quick Access</h2>
          <Link href={`/${locale}`} className="text-xs text-[#E30A13] font-medium flex items-center gap-1 hover:underline">
            All Services <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {SERVICES_QUICK.map((s) => (
            <Link key={s.label} href={`/${locale}${s.href}`} className="flex flex-col items-center gap-1.5 group">
              <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <span className="text-[10px] font-medium text-gray-600 text-center leading-tight">{s.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Recent Orders</h2>
            <Link href={`/${locale}/orders`} className="text-xs text-[#E30A13] font-medium flex items-center gap-1 hover:underline">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {MOCK_RECENT_ORDERS.map((order) => (
              <div key={order.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{order.item}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-gray-400">{order.type}</span>
                    <span className="text-[10px] text-gray-300">•</span>
                    <span className="text-[10px] text-gray-400">{order.date}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-semibold text-gray-900">{order.amount}</span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${order.color}`}>{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <Link href={`/${locale}/wallet`} className="block bg-gradient-to-br from-[#00A651] to-[#007a3c] rounded-2xl p-5 text-white hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-green-200" />
            </div>
            <p className="text-green-100 text-xs">Campus Wallet</p>
            <p className="text-2xl font-bold mt-0.5">৳ 1,240</p>
            <p className="text-green-100 text-xs mt-1">480 reward points</p>
          </Link>

          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-gray-400" />
                Notifications
              </h2>
              <span className="w-5 h-5 rounded-full bg-[#E30A13] text-white text-[10px] font-bold flex items-center justify-center">2</span>
            </div>
            <div className="space-y-2">
              {MOCK_NOTIFICATIONS.map((n) => (
                <div key={n.id} className={`p-2.5 rounded-xl text-xs ${n.unread ? "bg-red-50 border border-red-100" : "bg-gray-50"}`}>
                  <p className={`${n.unread ? "text-gray-900 font-medium" : "text-gray-600"} leading-relaxed`}>{n.text}</p>
                  <p className="text-gray-400 mt-0.5">{n.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Profile Details</h2>
          <Link href={`/${locale}/profile?tab=settings`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <Edit3 className="w-3.5 h-3.5" />
            Edit
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: "Full Name", value: user?.name, icon: User },
            { label: "Phone Number", value: user?.phone, icon: Phone },
            { label: "Email Address", value: user?.email || "Not set", icon: Mail },
            { label: "Account Status", value: user?.isActive ? "Active" : "Inactive", icon: Shield },
            { label: "Notifications", value: user?.isNotificationEnabled ? "Enabled" : "Disabled", icon: Bell },
            { label: "Member Since", value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-BD", { year: "numeric", month: "long" }) : "—", icon: Star },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-3 p-4 rounded-xl bg-gray-50">
              <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">{item.value || "—"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <form action={logoutAction.bind(null, locale)}>
          <button type="submit" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-50 border border-red-100 text-sm font-semibold text-[#E30A13] hover:bg-red-100 transition-colors">
            Log Out
          </button>
        </form>
      </div>
    </div>
  );
}