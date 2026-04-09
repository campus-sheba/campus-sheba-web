/* eslint-disable react-hooks/static-components */
"use client";

import { Link, usePathname } from "@/i18n/navigation";
import {
  LayoutDashboard,
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
  Bike,
  LogOut,
  X,
  Menu,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { logoutAction } from "@/app/[locale]/(protected)/(dashboard)/profile/actions";
import { Button } from "@/components/ui";

interface SidebarUser {
  name?: string;
  phone?: string;
  email?: string;
}

interface Props {
  user: SidebarUser | null;
}

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  color: string;
};

const primaryItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/profile",
    icon: LayoutDashboard,
    color: "text-gray-600",
  },
  {
    label: "My Shop",
    href: "/my-shop",
    icon: ShoppingBag,
    color: "text-pink-600",
  },
  {
    label: "Addresses",
    href: "/my-addresses",
    icon: MapPin,
    color: "text-blue-500",
  },
  { label: "Wallet", href: "/wallet", icon: Wallet, color: "text-[#00A651]" },

  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    color: "text-gray-500",
  },
];

const serviceItems: NavItem[] = [
  { label: "Lost & Found", href: "/my-lost-found", icon: MapPin, color: "text-yellow-600" },
  { label: "Delivery", href: "/my-delivery", icon: Bike, color: "text-purple-600" },
  { label: "Marketplace", href: "/my-marketplace", icon: ShoppingBag, color: "text-emerald-600" },
  { label: "Books", href: "/my-books", icon: BookOpen, color: "text-blue-600" },
  { label: "Blood Requests", href: "/my-blood-requests", icon: Droplets, color: "text-red-600" },
  { label: "Tuition", href: "/my-tuition", icon: GraduationCap, color: "text-amber-600" },
  { label: "Job Applications", href: "/my-job-applications", icon: Briefcase, color: "text-sky-600" },
  { label: "Donations", href: "/my-donations", icon: Heart, color: "text-green-600" },
  { label: "Parcels", href: "/my-parcels", icon: Archive, color: "text-violet-600" },
];


export default function DashboardSidebar({ user }: Props) {
  const pathname = usePathname();
  // Extract locale from pathname (e.g. /en/..., /bn/...)
  const locale = pathname.split("/")[1] || "en";
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    // next-intl's usePathname returns the locale-prefixed path
    return pathname === href || pathname.startsWith(href + "/");
  };

  const renderNavItem = (item: NavItem) => (
    <Link
      key={item.href + item.label}
      href={`${item.href}`}
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
  );

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
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
      <nav className="flex-1 overflow-y-auto p-3">
        <div className="space-y-0.5">
          {primaryItems.map(renderNavItem)}
        </div>

        <div className="pt-3 mt-3 border-t border-gray-100">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400">
            Service Centers
          </p>
          <div className="space-y-0.5">
            {serviceItems.map(renderNavItem)}
          </div>
        </div>
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-100">
        <form action={logoutAction.bind(null, locale)} method="POST">
          <Button
            type="submit"
            variant="ghost"
            fullWidth
            uppercase={false}
            className="justify-start gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Log Out
          </Button>
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
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm sticky top-0 h-full overflow-hidden">
        <SidebarContent />
      </aside>
    </>
  );
}
