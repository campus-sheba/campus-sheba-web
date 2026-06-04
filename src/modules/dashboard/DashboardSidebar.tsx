/* eslint-disable react-hooks/static-components */
"use client";

import { Link, usePathname } from "@/i18n/navigation";
import {
  LayoutDashboard,
  MapPin,
  Wallet,
  Coins,
  Users,
  Settings,
  BookOpen,
  BookMarked,
  BookCopy,
  BookUp,
  BookHeart,
  Tag,
  Receipt,
  Store,
  ShieldAlert,
  Droplets,
  HeartPulse,
  ChevronDown,
  LogOut,
  X,
  Menu,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui";
import { logoutAction } from "@/services/user";

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
};

type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

/**
 * Phase-1 dashboard navigation. Trimmed to the modules we actually ship and
 * organised into domain groups (Account, Books, Marketplace, Blood Bank) so the
 * sidebar reads as a clean, scannable menu rather than one long flat list.
 */
const NAV_GROUPS: NavGroup[] = [
  {
    id: "account",
    label: "Account",
    items: [
      { label: "Dashboard", href: "/profile", icon: LayoutDashboard },
      { label: "Addresses", href: "/my-addresses", icon: MapPin },
      { label: "Wallet", href: "/wallet", icon: Wallet },
      { label: "Campus Coins", href: "/campus-coins", icon: Coins },
      { label: "Refer & Earn", href: "/refer-and-earn", icon: Users },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
  {
    id: "books",
    label: "Books",
    items: [
      { label: "My Books", href: "/my-books", icon: BookOpen },
      { label: "My Library", href: "/my-library", icon: BookMarked },
      // { label: "Borrowed Books", href: "/my-book-borrowed", icon: BookCopy },
      // { label: "Lent Books", href: "/my-book-lent", icon: BookUp },
      // { label: "Book Donations", href: "/my-book-donations", icon: BookHeart },
    ],
  },
  {
    id: "marketplace",
    label: "Marketplace",
    items: [
      { label: "Buy & Sell", href: "/my-buy-sell", icon: Tag },
      { label: "My Orders", href: "/my-orders", icon: Receipt },
      { label: "My Sales", href: "/my-sales", icon: Store },
      { label: "My Disputes", href: "/my-disputes", icon: ShieldAlert },
    ],
  },
  {
    id: "blood",
    label: "Blood Bank",
    items: [
      { label: "Blood Requests", href: "/my-blood-requests", icon: Droplets },
      { label: "Donor Profile", href: "/my-blood-donor", icon: HeartPulse },
    ],
  },
];

export default function DashboardSidebar({ user }: Props) {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const toggleGroup = (id: string) =>
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));

  const renderNavItem = (item: NavItem) => {
    const active = isActive(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setMobileOpen(false)}
        aria-current={active ? "page" : undefined}
        className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          active
            ? "bg-[#E30B12]/10 text-[#E30B12]"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }`}
      >
        <item.icon
          className={`h-[18px] w-[18px] flex-shrink-0 ${
            active
              ? "text-[#E30B12]"
              : "text-gray-400 group-hover:text-gray-600"
          }`}
        />
        {item.label}
      </Link>
    );
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* User card */}
      {/* <div className="border-b border-gray-100 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#E30B12] to-[#00c46a] text-base font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">
              {user?.name || "Student"}
            </p>
            <p className="truncate text-xs text-gray-500">
              {user?.phone || user?.email || "—"}
            </p>
          </div>
        </div>
      </div> */}

      {/* Grouped navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3 scrollbar-hide">
        {NAV_GROUPS.map((group) => {
          const isCollapsed = collapsed[group.id];
          return (
            <div key={group.id} className="pb-1">
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className="flex w-full items-center justify-between px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400 transition-colors hover:text-gray-600"
                aria-expanded={!isCollapsed}
              >
                {group.label}
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${
                    isCollapsed ? "-rotate-90" : ""
                  }`}
                />
              </button>
              {!isCollapsed && (
                <div className="mt-0.5 space-y-0.5">
                  {group.items.map(renderNavItem)}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-100 p-3">
        <form action={logoutAction.bind(null, locale)}>
          <Button
            type="submit"
            variant="ghost"
            fullWidth
            uppercase={false}
            className="justify-start gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-[18px] w-[18px] flex-shrink-0" />
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
        className="fixed bottom-24 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-md lg:hidden"
        aria-label="Open dashboard menu"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed left-0 top-0 z-[61] h-full w-64 transform bg-white shadow-2xl transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <span className="text-sm font-semibold text-gray-700">Dashboard</span>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1 text-gray-500 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-full w-60 flex-shrink-0 flex-col overflow-hidden rounded border border-gray-100 bg-white shadow-sm lg:flex">
        <SidebarContent />
      </aside>
    </>
  );
}
