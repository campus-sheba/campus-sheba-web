"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  BookOpen,
  Droplets,
  GraduationCap,
  Briefcase,
  Heart,
  Archive,
  MapPin,
  Wallet,
  Settings,
  User,
  Bike,
  FileText,
  LogOut,
  X,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { logoutAction } from "@/app/[locale]/(protected)/(dashboard)/profile/actions";

interface SidebarUser {
  name?: string;
  phone?: string;
  email?: string;
}

interface Props {
  locale: string;
  user: SidebarUser | null;
}

const navItems = [
  { label: "Dashboard", href: "/profile", icon: LayoutDashboard, color: "text-gray-600" },
  { label: "My Orders", href: "/orders", icon: Package, color: "text-purple-600" },
  { label: "My Uploads & Requests", href: "/orders?tab=lostfound", icon: FileText, color: "text-amber-600" },
  { label: "Delivery", href: "/orders?tab=delivery", icon: Bike, color: "text-purple-600" },
  { label: "Marketplace", href: "/orders?tab=marketplace", icon: ShoppingBag, color: "text-emerald-600" },
  { label: "Books", href: "/orders?tab=books", icon: BookOpen, color: "text-blue-600" },
  { label: "Blood Requests", href: "/orders?tab=blood", icon: Droplets, color: "text-red-600" },
  { label: "Tuition", href: "/orders?tab=tuition", icon: GraduationCap, color: "text-amber-600" },
  { label: "Job Applications", href: "/orders?tab=jobs", icon: Briefcase, color: "text-sky-600" },
  { label: "Donations", href: "/orders?tab=donations", icon: Heart, color: "text-green-600" },
  { label: "Parcels", href: "/orders?tab=parcels", icon: Archive, color: "text-violet-600" },
  { label: "Lost & Found", href: "/orders?tab=lostfound", icon: MapPin, color: "text-yellow-600" },
  { label: "Wallet", href: "/wallet", icon: Wallet, color: "text-[#00A651]" },
  { label: "Settings", href: "/profile?tab=settings", icon: Settings, color: "text-gray-500" },
];

export default function DashboardSidebar({ locale, user }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    const fullHref = `/${locale}${href.split("?")[0]}`;
    return pathname === fullHref || pathname.startsWith(fullHref + "/");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* User Info */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E30A13] to-[#ff4d56] flex items-center justify-center text-white font-bold text-base flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-gray-900 truncate">{user?.name || "Student"}</p>
            <p className="text-xs text-gray-500 truncate">{user?.phone || user?.email || "—"}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={`/${locale}${item.href}`}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
              isActive(item.href)
                ? "bg-[#E30A13]/8 text-[#E30A13]"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive(item.href) ? "text-[#E30A13]" : item.color}`} />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-100">
        <form action={logoutAction.bind(null, locale)}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Log Out
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-24 left-4 z-50 w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-700"
        aria-label="Open dashboard menu"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[60] lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white z-[61] shadow-2xl transform transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-700">Dashboard</span>
          <button onClick={() => setMobileOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm sticky top-6 self-start max-h-[calc(100vh-6rem)] overflow-hidden">
        <SidebarContent />
      </aside>
    </>
  );
}
