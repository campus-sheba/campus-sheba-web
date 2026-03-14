/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import {
  Menu,
  X,
  ChevronDown,
  Droplets,
  ShoppingBag,
  BookOpen,
  Bike,
  Briefcase,
  Heart,
  Package,
  Search,
  GraduationCap,
  Trash2,
  MapPin,
  User,
  Store,
  ShoppingCart,
  Check,
} from "lucide-react";
import Logo from "./Logo";

// ─── Campus Data ─────────────────────────────────────────────
const CAMPUSES = [
  { id: "ju", name: "Jahangirnagar University", short: "JU", location: "Savar, Dhaka" },
  { id: "du", name: "Dhaka University", short: "DU", location: "Nilkhet, Dhaka" },
  { id: "cu", name: "Chittagong University", short: "CU", location: "Hathazari, Chittagong" },
  { id: "buet", name: "BUET", short: "BUET", location: "Palashi, Dhaka" },
  { id: "kuet", name: "KUET", short: "KUET", location: "Khulna" },
  { id: "ruet", name: "RUET", short: "RUET", location: "Rajshahi" },
];

// ─── Nav Link Data ───────────────────────────────────────────
const servicesMenu = [
  { label: "Delivery Sheba", description: "Food & courier delivery", href: "/delivery", icon: Bike, color: "text-purple-600", bg: "bg-purple-50" },
  { label: "Buy & Sell", description: "Campus marketplace", href: "/marketplace", icon: ShoppingBag, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Entrepreneurship", description: "Student shops & skill services", href: "/marketplace/shop/create", icon: Store, color: "text-red-600", bg: "bg-red-50" },
  { label: "Book Sheba", description: "Buy, sell, loan & swap", href: "/books", icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Blood Bank", description: "Emergency blood network", href: "/blood-bank", icon: Droplets, color: "text-red-600", bg: "bg-red-50" },
  { label: "Tuition Sheba", description: "Find or become a tutor", href: "/tuition", icon: GraduationCap, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Jobs", description: "Campus opportunities", href: "/jobs", icon: Briefcase, color: "text-sky-600", bg: "bg-sky-50" },
  { label: "Donation", description: "Social causes & drives", href: "/donation", icon: Heart, color: "text-green-600", bg: "bg-green-50" },
  { label: "Parcel Delivery", description: "Send packages on campus", href: "/parcel", icon: Package, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Garbage Collector", description: "Eco-friendly waste pickup", href: "/garbage", icon: Trash2, color: "text-slate-600", bg: "bg-slate-50" },
  { label: "Lost & Found", description: "Recover lost items", href: "/lost-found", icon: MapPin, color: "text-yellow-600", bg: "bg-yellow-50" },
];

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "About", href: "/about" },
];

// ─── Navbar Component ─────────────────────────────────────────
const Navbar = ({ locale }: { locale: string }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState<string | null>(null);
  const [campusOpen, setCampusOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);
  const campusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
      if (campusRef.current && !campusRef.current.contains(e.target as Node)) {
        setCampusOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    const saved = localStorage.getItem("cs-selected-campus");
    if (saved) setSelectedCampus(saved);
  }, []);

  const handleLanguageChange = (newLocale: string) => {
    const path = pathname ? pathname.split("/").slice(2).join("/") : "";
    router.push(`/${newLocale}/${path}`);
  };

  const handleCampusSelect = (campusName: string) => {
    setSelectedCampus(campusName);
    localStorage.setItem("cs-selected-campus", campusName);
    setCampusOpen(false);
  };

  return (
    <>
      {/* ─── Top Utility Bar ─── */}
      <div
        className="fixed top-0 left-0 right-0 z-[51] flex text-black items-center bg-[white] backdrop-blur-sm border-b border-black/10"
        style={{ height: "var(--topbar-height)" }}
        id="campus-topbar"
      >
        <div className="cs-container flex items-center justify-between h-full">
          {/* ── Campus Selector ── */}
          <div className="relative" ref={campusRef}>
            <button
              onClick={() => setCampusOpen(!campusOpen)}
              className="flex items-center gap-1.5 text-xs font-medium  transition-colors"
              aria-label="Select campus"
              aria-expanded={campusOpen}
            >
              <MapPin
                className="w-3 h-3 text-[#00A651] flex-shrink-0"
                strokeWidth={2.5}
              />
              {selectedCampus ? (
                <span className="max-w-[110px] sm:max-w-[220px] truncate text-primary font-semibold flex items-center gap-1.5">
                  {selectedCampus}
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  Select Your Campus
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                </span>
              )}
              <ChevronDown
                className={`w-3 h-3 text-white/50 transition-transform duration-200 flex-shrink-0 ${campusOpen ? "rotate-180" : ""}`}
              />
            </button>
            {campusOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-72 bg-white rounded-xl shadow-2xl border border-neutral-100 overflow-hidden z-[60]">
                <div className="px-3 py-2 border-b border-neutral-100 bg-neutral-50">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Select Your Campus
                  </p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    Choose a campus to personalize your feed
                  </p>
                </div>
                {CAMPUSES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleCampusSelect(c.name)}
                    className={`w-full text-left px-3 py-2.5 hover:bg-neutral-50 transition-colors flex items-center gap-2.5 ${
                      selectedCampus === c.name ? "bg-green-50" : ""
                    }`}
                  >
                    <span className="text-[10px] font-bold text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded w-11 text-center flex-shrink-0">
                      {c.short}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs font-semibold leading-none mb-0.5 ${selectedCampus === c.name ? "text-[#00A651]" : "text-neutral-800"}`}
                      >
                        {c.name}
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        {c.location}
                      </p>
                    </div>
                    {selectedCampus === c.name && (
                      <Check className="w-3.5 h-3.5 text-[#00A651] flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Language + SOS ── */}
          <div className="flex items-center gap-3">
            <select
              value={locale}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="text-xs font-medium  bg-transparent border-none focus:outline-none cursor-pointer  transition-colors appearance-none"
              aria-label="Select language"
              id="topbar-language-select"
            >
              <option value="en" className="bg-white text-neutral-900">
                EN
              </option>
              <option value="bn" className="bg-white text-neutral-900">
                বাং
              </option>
            </select>
            <div className="w-px h-3.5 bg-white/20" />
            {/* Become a provider/shop owner */}
            <Link
              href={`/${locale}/login?redirect=/marketplace/shop/create`}
              className="text-xs font-medium text-[#E30A13] hover:text-red-700 transition-colors  border-red-200 px-2 py-1 rounded-lg"
            >
              Become a Provider
            </Link>
            <Link
              href={`/${locale}/blood-bank`}
              id="topbar-sos-btn"
              className="flex items-center gap-1 text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
              title="Emergency Blood Request"
            >
              <Droplets className="w-3 h-3" strokeWidth={2.5} />
              <span>SOS</span>
            </Link>
          </div>
        </div>
      </div>

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
          {/* ─── Logo ─── */}
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2.5 flex-shrink-0 group"
            aria-label="Campus Sheba Home"
            id="navbar-logo"
          >
            <Logo />
          </Link>

          {/* ─── Desktop Navigation ─── */}
          <div className="hidden lg:flex items-center gap-1">
            <div className="relative w-[320px] xl:w-[480px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search services, shops, products..."
                className="h-10 w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-3 text-sm text-neutral-700 outline-none transition-all placeholder:text-neutral-400 focus:border-[#E30A13]/50 focus:ring-2 focus:ring-[#E30A13]/15"
                aria-label="Search campus services"
              />
            </div>
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
                      href={`/${locale}${item.href}`}
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
                      href={`/${locale}/login`}
                      className="btn-primary text-xs px-4 py-2"
                      id="nav-services-cta"
                      onClick={() => setServicesOpen(false)}
                    >
                      Get Started Free
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ─── Desktop Right CTAs ─── */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href={`/${locale}/cart`}
              id="nav-cart-btn"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 text-neutral-700 transition-colors hover:border-[#E30A13]/40 hover:text-[#E30A13]"
              title="Cart"
            >
              <ShoppingCart className="h-4.5 w-4.5" />
              <span className="absolute -right-1.5 -top-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#E30A13] px-1 text-[10px] font-bold leading-none text-white">
                0
              </span>
            </Link>

            <div className="w-px h-5 bg-neutral-200" />

            <Link
              href={`/${locale}/login`}
              id="nav-login-btn"
              className="inline-flex items-center justify-center rounded-xl border border-brand-green-DEFAULT/30 px-4 py-2 text-sm font-semibold text-brand-green-DEFAULT transition-colors hover:bg-brand-green-50"
            >
              Log In
            </Link>

            <Link
              href={`/${locale}/login`}
              id="nav-signup-btn"
              className="inline-flex items-center justify-center rounded-xl bg-[#E30A13] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              Get Started
            </Link>
          </div>

          {/* ─── Mobile Right ─── */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              id="mobile-nav-search"
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-neutral-200 text-neutral-600"
              aria-label="Search"
            >
              <Search className="w-4.5 h-4.5" />
            </button>
            <Link
              href={`/${locale}/cart`}
              id="mobile-nav-cart"
              className="relative w-9 h-9 flex items-center justify-center rounded-lg border border-neutral-200 text-neutral-600"
            >
              <ShoppingCart className="w-4.5 h-4.5" />
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#E30A13] px-1 text-[9px] font-bold leading-none text-white">
                0
              </span>
            </Link>
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
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E30A13] flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-base text-neutral-900">
              <span className="text-[#E30A13]">Campus</span>
              <span className="text-brand-green-DEFAULT">Sheba</span>
            </span>
          </div>
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
              {selectedCampus ? (
                <p className="text-xs font-semibold text-neutral-800 truncate">
                  {selectedCampus}
                </p>
              ) : (
                <p className="text-xs font-semibold text-amber-500">
                  No campus selected yet
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
                    : `/${locale}${link.href}`
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
                  href={`/${locale}${item.href}`}
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
          <Link
            href={`/${locale}/login`}
            id="mobile-nav-login"
            onClick={() => setMobileOpen(false)}
            className="btn-secondary-lg w-full justify-center"
          >
            <User className="w-4 h-4" />
            Log In
          </Link>
          <Link
            href={`/${locale}/login`}
            id="mobile-nav-signup"
            onClick={() => setMobileOpen(false)}
            className="w-full justify-center inline-flex items-center rounded-xl bg-[#E30A13] px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;
