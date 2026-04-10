/* eslint-disable react-hooks/static-components */
"use client";

import { Link, usePathname } from "@/i18n/navigation";
import {
  UserRound,
  MapPin,
  ClipboardList,
  Tag,
  BookOpen,
  LogOut,
  X,
  Menu,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui";
import { logoutAction } from "@/services/user";

interface SidebarUser {
  _id?: string;
  name?: string;
  phone?: string;
  email?: string;
  role?: string;
  blood?: string;
  university?:
    | string
    | {
        _id?: string;
        name?: string;
        shortName?: string;
      };
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
    label: "Profile",
    href: "/profile",
    icon: UserRound,
    color: "text-gray-600",
  },
  {
    label: "Addresses",
    href: "/my-addresses",
    icon: MapPin,
    color: "text-blue-500",
  },
  {
    label: "My orders",
    href: "/my-orders",
    icon: ClipboardList,
    color: "text-indigo-600",
  },
  {
    label: "My Buy & Sell",
    href: "/my-buy-sell",
    icon: Tag,
    color: "text-teal-600",
  },
  {
    label: "My Books",
    href: "/my-books",
    icon: BookOpen,
    color: "text-blue-600",
  },
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
      <item.icon
        className={`w-4 h-4 flex-shrink-0 ${isActive(item.href) ? "text-[#E30A13]" : item.color}`}
      />
      {item.label}
    </Link>
  );

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";
  const universityName =
    typeof user?.university === "string"
      ? user.university
      : user?.university?.name;
  const universityShortName =
    typeof user?.university === "object"
      ? user.university?.shortName
      : undefined;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* User Info */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E30A13] to-[#ff4d56] flex items-center justify-center text-white font-bold text-base flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-gray-900 truncate">
              {user?.name || "Student"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.phone || user?.email || "—"}
            </p>
            {(universityName || user?.blood) && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {universityName && (
                  <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                    {universityShortName || universityName}
                  </span>
                )}
                {user?.blood && (
                  <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                    {user.blood}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <div className="space-y-0.5">{primaryItems.map(renderNavItem)}</div>
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-100">
        <form action={logoutAction.bind(null, locale)}>
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
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1 rounded-lg hover:bg-gray-100"
          >
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
