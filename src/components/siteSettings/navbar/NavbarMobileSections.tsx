"use client";

import Link from "next/link";
import {
  Home,
  LayoutGrid,
  MapPin,
  Menu,
  Search,
  ShoppingCart,
  User,
  Wallet,
  X,
} from "lucide-react";
import Logo from "./Logo";
import type { ServiceMenuItem } from "./navbar.constants";

type MobileSectionsProps = {
  pathname: string | null;
  isLoggedIn: boolean;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  navLinks: Array<{ label: string; href: string }>;
  servicesMenu: ServiceMenuItem[];
  selectedUniversityName?: string;
  onOpenLogin: () => void;
  onOpenSignup: () => void;
};

export function NavbarMobileToggle({
  mobileOpen,
  setMobileOpen,
}: Pick<MobileSectionsProps, "mobileOpen" | "setMobileOpen">) {
  return (
    <div className="flex lg:hidden items-center gap-2">
      <button
        id="mobile-nav-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="w-9 h-9 flex items-center justify-center rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors"
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>
    </div>
  );
}

export function NavbarMobileBottom({
  pathname,
  isLoggedIn,
  onOpenLogin,
}: Pick<MobileSectionsProps, "pathname" | "isLoggedIn" | "onOpenLogin">) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/60 backdrop-blur-md border-t border-white/20 pb-[env(safe-area-inset-bottom)]"
      aria-label="Bottom navigation"
    >
      <div className="flex items-center justify-around h-14">
        <Link
          href="/"
          id="bottom-nav-home"
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[64px] py-2 transition-colors ${
            pathname === "/" ? "text-[#E30A13]" : "text-neutral-600"
          }`}
        >
          <Home className="w-5 h-5" strokeWidth={2} />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link
          href="/marketplace"
          id="bottom-nav-service"
          className={`flex flex-col items-center justify-center gap-0.5 min-w-[64px] py-2 transition-colors ${
            pathname?.includes("/marketplace")
              ? "text-[#E30A13]"
              : "text-neutral-600"
          }`}
        >
          <LayoutGrid className="w-5 h-5" strokeWidth={2} />
          <span className="text-[10px] font-medium">Service</span>
        </Link>
        <Link
          href="/cart"
          id="bottom-nav-cart"
          className={`relative flex flex-col items-center justify-center gap-0.5 min-w-[64px] py-2 transition-colors ${
            pathname?.includes("/cart") ? "text-[#E30A13]" : "text-neutral-600"
          }`}
        >
          <span className="relative inline-flex">
            <ShoppingCart className="w-5 h-5" strokeWidth={2} />
            <span className="absolute -right-2 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#E30A13] px-0.5 text-[9px] font-bold leading-none text-white">
              0
            </span>
          </span>
          <span className="text-[10px] font-medium">Cart</span>
        </Link>
        {isLoggedIn ? (
          <Link
            href="/profile"
            id="bottom-nav-profile"
            className={`flex flex-col items-center justify-center gap-0.5 min-w-[64px] py-2 transition-colors ${
              pathname?.includes("/profile")
                ? "text-[#E30A13]"
                : "text-neutral-600"
            }`}
          >
            <User className="w-5 h-5" strokeWidth={2} />
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
        ) : (
          <button
            onClick={onOpenLogin}
            id="bottom-nav-profile"
            className="flex flex-col items-center justify-center gap-0.5 min-w-[64px] py-2 transition-colors text-neutral-600 hover:text-[#E30A13]"
          >
            <User className="w-5 h-5" strokeWidth={2} />
            <span className="text-[10px] font-medium">Sign In</span>
          </button>
        )}
      </div>
    </nav>
  );
}

export function NavbarMobileDrawer({
  mobileOpen,
  setMobileOpen,
  isLoggedIn,
  navLinks,
  servicesMenu,
  selectedUniversityName,
  onOpenLogin,
  onOpenSignup,
}: Omit<MobileSectionsProps, "pathname">) {
  return (
    <div
      className={`fixed top-0 right-0 w-[85vw] max-w-sm h-full bg-white z-[63] lg:hidden flex flex-col shadow-2xl transition-transform duration-300 ease-spring ${
        mobileOpen ? "translate-x-0" : "translate-x-full"
      }`}
      role="dialog"
      aria-label="Mobile navigation"
      aria-modal="true"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
        <Logo />
        <button
          onClick={() => setMobileOpen(false)}
          id="mobile-nav-close"
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 text-neutral-500 transition-colors"
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200">
          <MapPin
            className="w-4 h-4 text-[#00A651] flex-shrink-0"
            strokeWidth={2.5}
          />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider leading-none mb-0.5">
              Your Campus
            </p>
            {selectedUniversityName ? (
              <p className="text-xs font-semibold text-neutral-800 truncate">
                {selectedUniversityName}
              </p>
            ) : (
              <p className="text-xs font-semibold text-amber-500">
                No university selected yet
              </p>
            )}
          </div>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search services, products..."
            className="h-10 w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-3 text-sm text-neutral-700 outline-none placeholder:text-neutral-400 focus:border-[#E30A13]/50 focus:ring-2 focus:ring-[#E30A13]/15"
            aria-label="Search campus services"
          />
        </div>

        <div className="space-y-1">
          {/* {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href.startsWith("#") ? link.href : `/${link.href}`}
              id={`mobile-nav-${link.label.toLowerCase()}`}
              onClick={() => setMobileOpen(false)}
              className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
            >
              {link.label}
            </Link>
          ))} */}
        </div>

        <div>
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3 px-1">
            Services
          </p>
          <div className="grid grid-cols-2 gap-2">
            {servicesMenu.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                id={`mobile-service-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors"
              >
                <div
                  className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}
                >
                  <item.icon
                    className={`w-4 h-4 ${item.color}`}
                    strokeWidth={2}
                  />
                </div>
                <span className="text-xs font-semibold text-neutral-700 leading-tight">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="p-5 border-t border-neutral-100 space-y-2.5">
        {isLoggedIn ? (
          <>
            <Link
              href="/wallet"
              id="mobile-nav-wallet"
              onClick={() => setMobileOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-[#00A651] transition-colors hover:bg-emerald-100"
            >
              <Wallet className="w-4 h-4" />
              Wallet
            </Link>
            <Link
              href="/profile"
              id="mobile-nav-profile"
              onClick={() => setMobileOpen(false)}
              className="btn-secondary-lg w-full justify-center"
            >
              <User className="w-4 h-4" />
              Go to Profile
            </Link>
          </>
        ) : (
          <>
            <button
              type="button"
              id="mobile-nav-login"
              onClick={() => {
                setMobileOpen(false);
                onOpenLogin();
              }}
              className="btn-secondary-lg w-full justify-center"
            >
              <User className="w-4 h-4" />
              Log In
            </button>
            <button
              type="button"
              id="mobile-nav-signup"
              onClick={() => {
                setMobileOpen(false);
                onOpenSignup();
              }}
              className="w-full justify-center inline-flex items-center rounded-xl bg-[#E30A13] px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
            >
              Get Started Free
            </button>
          </>
        )}
      </div>
    </div>
  );
}
