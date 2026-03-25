import { getMe } from "@/services/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import ProfileLogoutButton from "./ProfileLogoutButton";
import {
  Package,
  Wallet,
  Phone,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  Calendar,
  ShoppingBag,
  BookOpen,
  MapPin,
  Heart,
  Briefcase,
  Droplets,
  Archive,
  GraduationCap
} from "lucide-react";

const DASHBOARD_CENTERS = [
  {
    title: "Marketplace center",
    href: "/my-marketplace",
    icon: ShoppingBag,
    color: "bg-pink-50 text-pink-600",
    description: "Manage marketplace order activities.",
  },
  {
    title: "Books Center",
    href: "/my-books",
    icon: BookOpen,
    color: "bg-blue-50 text-blue-600",
    description: "See your books exchange and requests.",
  },
  {
    title: "Delivery Center",
    href: "/my-delivery",
    icon: Package,
    color: "bg-violet-50 text-violet-600",
    description: "View delivery-related requests.",
  },
  {
    title: "Lost & Found",
    href: "/my-lost-found",
    icon: MapPin,
    color: "bg-yellow-50 text-yellow-600",
    description: "Track your reports and resolves.",
  },
  {
    title: "Blood Requests",
    href: "/my-blood-requests",
    icon: Droplets,
    color: "bg-red-50 text-red-600",
    description: "Monitor blood request submissions.",
  },
  {
    title: "Tuition Center",
    href: "/my-tuition",
    icon: GraduationCap,
    color: "bg-amber-50 text-amber-600",
    description: "Follow tuition applications and updates.",
  },
  {
    title: "Job Applications",
    href: "/my-job-applications",
    icon: Briefcase,
    color: "bg-sky-50 text-sky-600",
    description: "Track your job application flow.",
  },
  {
    title: "Donations",
    href: "/my-donations",
    icon: Heart,
    color: "bg-green-50 text-green-600",
    description: "Manage donation request progress.",
  },
  {
    title: "Parcels Center",
    href: "/my-parcels",
    icon: Archive,
    color: "bg-indigo-50 text-indigo-600",
    description: "Review parcel movement history.",
  },
];

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  let response;
  try {
    response = await getMe();
  } catch {
    redirect(`/api/auth/clear?locale=${locale}`);
  }
  if (!response) return null;
  const user = response.data;

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : "Recently joined";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <AppBreadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard overview" },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: User Profile & Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Main ID Card */}
          <div className="rounded-3xl bg-white border border-gray-100 p-8 shadow-sm text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-[#E30A13]/10 to-[#ff4d56]/5" />
            
            <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[#E30A13] to-[#ff4d56] text-white text-3xl font-black shadow-lg shadow-red-200 mb-4 ring-4 ring-white">
              {initials}
            </div>
            
            <h1 className="text-2xl font-black text-gray-900 mb-1">{user?.name || "Student"}</h1>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="font-medium text-gray-700">{user?.role || "Verified Student"}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <Link
                href={`/settings`}
                className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:border-[#E30A13] hover:text-[#E30A13] hover:bg-red-50 transition-all flex justify-center items-center"
              >
                Settings
              </Link>
              <ProfileLogoutButton locale={locale} />
            </div>

            <div className="pt-6 border-t border-gray-100 flex flex-col gap-3 text-sm text-gray-600 text-left">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-gray-400" />
                </div>
                <div className="truncate font-medium">{user?.email || "No email linked"}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-gray-400" />
                </div>
                <div className="truncate font-medium">{user?.phone || "No phone linked"}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-gray-400" />
                </div>
                <div className="truncate font-medium">Joined {joinDate}</div>
              </div>
            </div>
          </div>

          {/* Quick Access Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Link
              href={`/my-orders`}
              className="rounded-3xl bg-indigo-50 border border-indigo-100 p-5 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-indigo-600 mb-3 shadow-sm group-hover:scale-110 transition-transform">
                <Package className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-indigo-900 mb-1">My Orders</h3>
              <p className="text-xs text-indigo-600/80 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                Track status <ArrowRight className="w-3 h-3" />
              </p>
            </Link>
            
            <Link
              href={`/wallet`}
              className="rounded-3xl bg-emerald-50 border border-emerald-100 p-5 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-emerald-600 mb-3 shadow-sm group-hover:scale-110 transition-transform">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-emerald-900 mb-1">Wallet</h3>
              <p className="text-xs text-emerald-600/80 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                View balance <ArrowRight className="w-3 h-3" />
              </p>
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: Dashboard Service Centers */}
        <div className="lg:col-span-8 space-y-6">
          {/* Welcome Banner */}
          <div className="rounded-3xl bg-gray-900 p-8 shadow-xl relative overflow-hidden text-white flex flex-col justify-center">
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20" />
            <div className="absolute left-10 bottom-0 w-40 h-40 bg-[#E30A13]/20 rounded-full blur-3xl -mb-10" />
            
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight">
                Welcome back, {user?.name?.split(" ")[0] || "Student"}! 👋
              </h2>
              <p className="text-gray-300 font-medium text-lg max-w-xl">
                Your campus services are ready. Manage your activities, track orders, and explore the marketplace all from your central hub.
              </p>
            </div>
          </div>

          {/* Service Centers Grid */}
          <div className="rounded-3xl bg-white border border-gray-100 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Your Activity Centers</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {DASHBOARD_CENTERS.map((center) => (
                <Link
                  key={center.href}
                  href={`${center.href}`}
                  className="group rounded-2xl border border-gray-100 p-5 hover:border-[#E30A13]/30 hover:shadow-[0_4px_20px_-4px_rgba(227,10,19,0.1)] transition-all bg-white"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${center.color}`}>
                    <center.icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1.5 flex items-center justify-between">
                    {center.title}
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#E30A13] group-hover:translate-x-1 transition-all" />
                  </h4>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {center.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}