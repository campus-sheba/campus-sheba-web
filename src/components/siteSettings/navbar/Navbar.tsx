"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import {
  Menu,
  X,
  ChevronDown,
  Search,
  MapPin,
  User,
  Wallet,
  ShoppingCart,
  Home,
  LayoutGrid,
} from "lucide-react";
import Logo from "./Logo";
import CampusTopbar from "./CampusTopbar";
import {
  mapUniversityFeaturesToServicesMenu,
  navLinks,
  servicesMenu as fallbackServicesMenu,
  type UniversityFeature,
} from "./navbar.constants";
import { useAppState } from "@/contexts/AppStateContext";
import { landingPageEndpoints } from "@/utils/endpoints/endpoints";

// ─── Navbar Component ─────────────────────────────────────────
const Navbar = ({ locale }: { locale: string }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { state: appState, dispatch: appDispatch } = useAppState();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  // Use global auth state instead of local state
  const isLoggedIn = appState.auth.isAuthenticated;
  const [servicesOpen, setServicesOpen] = useState(false);
  const [walletPoints, setWalletPoints] = useState(120);
  const [servicesMenu, setServicesMenu] = useState(fallbackServicesMenu);
  const servicesRef = useRef<HTMLDivElement>(null);
  const selectedUniversityId = appState.university.selected?._id;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

useEffect(() => {
  // fetch wallet balance from API later
  setWalletPoints(120);
}, []);

  useEffect(() => {
    const fetchUniversityFeatures = async () => {
      if (!selectedUniversityId) {
        setServicesMenu(fallbackServicesMenu);
        return;
      }

      try {
        const response = await fetch(
          landingPageEndpoints.universityFeatures(selectedUniversityId),
          {
            method: "GET",
            headers: { Accept: "application/json" },
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch features (${response.status})`);
        }

        const result = (await response.json()) as {
          data?: Array<{ feature?: UniversityFeature }>;
        };
        const features = (result.data ?? [])
          .map((item) => item.feature)
          .filter((feature): feature is UniversityFeature => Boolean(feature));

        const nextMenu = mapUniversityFeaturesToServicesMenu(features);
        setServicesMenu(nextMenu.length ? nextMenu : fallbackServicesMenu);
      } catch {
        setServicesMenu(fallbackServicesMenu);
      }
    };

    void fetchUniversityFeatures();
  }, [selectedUniversityId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (document.body.dataset.modalScrollLock === "university-required") {
      return;
    }

    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      if (document.body.dataset.modalScrollLock !== "university-required") {
        document.body.style.overflow = "";
      }
    };
  }, [mobileOpen]);

  // Now using global auth state from AppStateContext

  const handleLanguageChange = (newLocale: string) => {
    const path = pathname ? pathname.split("/").slice(2).join("/") : "";
    router.push(`/${newLocale}/${path}`);
  };

  return (
    <>
      <CampusTopbar
        locale={locale}
        onLanguageChange={handleLanguageChange}
      />

      {/* ─── Main Navbar ─── */}
      <nav
        className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-neutral-100 py-3"
            : "bg-white py-4"
        }`}
        style={{ height: "var(--navbar-height)", top: "var(--topbar-height)" }}
        aria-label="Main navigation"
      >
        <div className="cs-container h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* ─── Logo ─── */}
            <Link
              href={`/`}
              className="flex items-center gap-2.5 flex-shrink-0 group border-red-700"
              aria-label="Campus Sheba Home"
              id="navbar-logo"
            >
              <Logo />
            </Link>
            {/* ─── Desktop Navigation ─── */}
            <div className="hidden lg:flex items-center gap-1 ">
              <div className="relative w-[320px] xl:w-[480px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search services, shops, products..."
                  className="h-10 w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-3 text-sm text-neutral-700 outline-none transition-all placeholder:text-neutral-400 focus:border-[#E30A13]/50 focus:ring-2 focus:ring-[#E30A13]/15"
                  aria-label="Search campus services"
                />
              </div>
              {/* Primary Links */}

              {/* Services Mega Menu */}
              <div ref={servicesRef} className="relative">
                <button
                  id="nav-services-btn"
                  onClick={() => setServicesOpen(!servicesOpen)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    servicesOpen
                      ? "bg-brand-green-50 text-brand-green-700"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                  }`}
                  aria-expanded={servicesOpen}
                  aria-haspopup="true"
                >
                  Services
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${servicesOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Mega dropdown */}
                {servicesOpen && (
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[640px] bg-white rounded-2xl shadow-xl border border-neutral-100 p-5 grid grid-cols-2 gap-2 animate-fade-in"
                    role="menu"
                    aria-label="Services menu"
                  >
                    <div className="col-span-2 mb-1">
                      <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                        All Services
                      </p>
                    </div>

                    {servicesMenu.map((item) => (
                      <Link
                        key={item.label}
                        href={`${item.href}`}
                        role="menuitem"
                        id={`nav-service-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                        onClick={() => setServicesOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors duration-150 group"
                      >
                        <div
                          className={`w-9 h-9 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-150`}
                        >
                          <item.icon
                            className={`w-4.5 h-4.5 ${item.color}`}
                            strokeWidth={2}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-neutral-800 leading-none mb-0.5">
                            {item.label}
                          </p>
                          <p className="text-xs text-neutral-400">
                            {item.description}
                          </p>
                        </div>
                      </Link>
                    ))}

                    {/* Footer CTA */}
                    <div className="col-span-2 mt-2 pt-3 border-t border-neutral-100 flex items-center justify-between">
                      <p className="text-xs text-neutral-400">
                        Available at 3+ universities in Bangladesh
                      </p>
                      <Link
                        href={
                          isLoggedIn ? `/profile` : "#"
                        }
                        onClick={(e) => {
                          if (!isLoggedIn) {
                            e.preventDefault();
                            appDispatch({ type: "OPEN_AUTH_MODAL", payload: { defaultTab: "login" } });
                          }
                          setServicesOpen(false);
                        }}
                        className="btn-primary text-xs px-4 py-2"
                        id="nav-services-cta"
                      >
                        {isLoggedIn ? "Go to Profile" : "Get Started Free"}
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={
                      link.href.startsWith("#")
                        ? link.href
                        : `/${link.href}`
                    }
                    id={`mobile-nav-${link.label.toLowerCase()}`}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          {/* ─── Desktop Right CTAs ─── */}
          <div className="hidden lg:flex items-center gap-3">
            {isLoggedIn && (
              <Link
                href={`/wallet`}
                id="nav-wallet-btn"
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 transition-colors hover:border-[#00A651]/40 hover:text-[#00A651]"
                title="Wallet"
              >
                <Wallet className="h-4.5 w-4.5" />

                {walletPoints > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4.5 min-w-5 items-center justify-center rounded-full bg-[#00A651] px-1 text-[10px] font-bold leading-none text-white">
                    {walletPoints}
                  </span>
                )}
              </Link>
            )}
            <Link
              href={`/cart`}
              id="nav-cart-btn"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 transition-colors hover:border-[#E30A13]/40 hover:text-[#E30A13]"
              title="Cart"
            >
              <ShoppingCart className="h-4.5 w-4.5" />
              <span className="absolute -right-1.5 -top-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#E30A13] px-1 text-[10px] font-bold leading-none text-white">
                0
              </span>
            </Link>

            <div className="w-px h-5 bg-neutral-200" />

            {isLoggedIn ? (
              <Link
                href={`/profile`}
                id="nav-profile-btn"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-green-DEFAULT/30 text-brand-green-DEFAULT transition-colors hover:bg-brand-green-50"
                title="Profile"
              >
                <User className="h-4.5 w-4.5" />
              </Link>
            ) : (
              <>
                <button
                  onClick={() => appDispatch({ type: "OPEN_AUTH_MODAL", payload: { defaultTab: "login" } })}
                  id="nav-login-btn"
                  className="inline-flex items-center justify-center rounded-xl border border-brand-green-DEFAULT/30 px-4 py-2 text-sm font-semibold text-brand-green-DEFAULT transition-colors hover:bg-brand-green-50"
                >
                  Log In
                </button>

                <button
                  onClick={() => appDispatch({ type: "OPEN_AUTH_MODAL", payload: { defaultTab: "signup" } })}
                  id="nav-signup-btn"
                  className="inline-flex items-center justify-center rounded-xl bg-[#E30A13] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* ─── Mobile Right: logo + bar icon only ─── */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              id="mobile-nav-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-neutral-700 hover:bg-neutral-100 transition-colors"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Mobile Menu Overlay ─── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[62] lg:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ─── Mobile Bottom Navbar (small devices only) ─── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/60 backdrop-blur-md border-t border-white/20 pb-[env(safe-area-inset-bottom)]"
        aria-label="Bottom navigation"
      >
        <div className="flex items-center justify-around h-14">
          <Link
            href={`/`}
            id="bottom-nav-home"
            className={`flex flex-col items-center justify-center gap-0.5 min-w-[64px] py-2 transition-colors ${
              pathname === `/` || pathname === `/`
                ? "text-[#E30A13]"
                : "text-neutral-600"
            }`}
          >
            <Home className="w-5 h-5" strokeWidth={2} />
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          <Link
            href={`/marketplace`}
            id="bottom-nav-service"
            className={`flex flex-col items-center justify-center gap-0.5 min-w-[64px] py-2 transition-colors ${
              pathname?.includes("/marketplace") ? "text-[#E30A13]" : "text-neutral-600"
            }`}
          >
            <LayoutGrid className="w-5 h-5" strokeWidth={2} />
            <span className="text-[10px] font-medium">Service</span>
          </Link>
          <Link
            href={`/cart`}
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
              href={`/profile`}
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
              onClick={() => appDispatch({ type: "OPEN_AUTH_MODAL", payload: { defaultTab: "login" } })}
              id="bottom-nav-profile"
              className="flex flex-col items-center justify-center gap-0.5 min-w-[64px] py-2 transition-colors text-neutral-600 hover:text-[#E30A13]"
            >
              <User className="w-5 h-5" strokeWidth={2} />
              <span className="text-[10px] font-medium">Sign In</span>
            </button>
          )}
        </div>
      </nav>

      {/* ─── Mobile Menu Drawer ─── */}
      <div
        className={`fixed top-0 right-0 w-[85vw] max-w-sm h-full bg-white z-[63] lg:hidden flex flex-col shadow-2xl transition-transform duration-300 ease-spring ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Mobile navigation"
        aria-modal="true"
      >
        {/* Drawer Header */}
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

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Campus indicator */}
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200">
            <MapPin
              className="w-4 h-4 text-[#00A651] flex-shrink-0"
              strokeWidth={2.5}
            />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider leading-none mb-0.5">
                Your Campus
              </p>
              {appState.university.selected ? (
                <p className="text-xs font-semibold text-neutral-800 truncate">
                  {appState.university.selected.name}
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

          {/* Primary Links */}
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={
                  link.href.startsWith("#")
                    ? link.href
                    : `/${link.href}`
                }
                id={`mobile-nav-${link.label.toLowerCase()}`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Services Grid */}
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

        {/* Drawer Footer CTAs */}
        <div className="p-5 border-t border-neutral-100 space-y-2.5">
          {isLoggedIn ? (
            <Link
              href={`/profile`}
              id="mobile-nav-profile"
              onClick={() => setMobileOpen(false)}
              className="btn-secondary-lg w-full justify-center"
            >
              <User className="w-4 h-4" />
              Go to Profile
            </Link>
          ) : (
            <>
              <button
                type="button"
                id="mobile-nav-login"
                onClick={() => {
                  setMobileOpen(false);
                  appDispatch({ type: "OPEN_AUTH_MODAL", payload: { defaultTab: "login" } });
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
                  appDispatch({ type: "OPEN_AUTH_MODAL", payload: { defaultTab: "signup" } });
                }}
                className="w-full justify-center inline-flex items-center rounded-xl bg-[#E30A13] px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
              >
                Get Started Free
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
