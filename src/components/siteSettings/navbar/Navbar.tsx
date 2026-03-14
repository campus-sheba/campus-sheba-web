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
  Bell,
  User,
} from "lucide-react";
import Logo from "./Logo";

// ─── Nav Link Data ───────────────────────────────────────────
const servicesMenu = [
  { label: "Delivery Sheba", description: "Food & courier delivery", href: "/delivery", icon: Bike, color: "text-purple-600", bg: "bg-purple-50" },
  { label: "Buy & Sell", description: "Campus marketplace", href: "/marketplace", icon: ShoppingBag, color: "text-emerald-600", bg: "bg-emerald-50" },
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
  const servicesRef = useRef<HTMLDivElement>(null);

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
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleLanguageChange = (newLocale: string) => {
    const path = pathname ? pathname.split("/").slice(2).join("/") : "";
    router.push(`/${newLocale}/${path}`);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-neutral-100 py-3"
            : "bg-white py-4"
        }`}
        style={{ height: "var(--navbar-height)" }}
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
            {/* <div className="relative w-9 h-9 rounded-xl bg-brand-green-DEFAULT flex items-center justify-center shadow-sm group-hover:shadow-glow transition-all duration-200">
              <GraduationCap className="w-5 h-5 text-white" strokeWidth={2.5} />
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-brand-amber-DEFAULT rounded-full border-2 border-white" />
            </div> */}
            {/* <div className="flex flex-col leading-none">
              <span className="font-display font-bold text-[18px] text-neutral-900 leading-none tracking-tight">
                Campus
                <span className="text-brand-green-DEFAULT">Sheba</span>
              </span>
              <span className="text-[9px] font-medium text-neutral-400 tracking-widest uppercase leading-none mt-0.5">
                Your Campus. Your World.
              </span>
            </div> */}
            <Logo />
          </Link>

          {/* ─── Desktop Navigation ─── */}
          <div className="hidden lg:flex items-center gap-1">

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
                  {/* Header */}
                  <div className="col-span-2 mb-1">
                    <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">All Services</p>
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
                      <div className={`w-9 h-9 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-150`}>
                        <item.icon className={`w-4.5 h-4.5 ${item.color}`} strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-800 leading-none mb-0.5">{item.label}</p>
                        <p className="text-xs text-neutral-400">{item.description}</p>
                      </div>
                    </Link>
                  ))}

                  {/* Footer CTA */}
                  <div className="col-span-2 mt-2 pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <p className="text-xs text-neutral-400">Available at 3+ universities in Bangladesh</p>
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

            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href.startsWith("#") ? link.href : `/${locale}${link.href}`}
                id={`nav-link-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-all duration-150"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* ─── Desktop Right CTAs ─── */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Language */}
            <select
              value={locale}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="text-xs font-medium text-neutral-500 bg-transparent border-none focus:outline-none cursor-pointer hover:text-neutral-700 transition-colors"
              aria-label="Select language"
              id="nav-language-select"
            >
              <option value="en">EN</option>
              <option value="bn">বাং</option>
            </select>

            <div className="w-px h-5 bg-neutral-200" />

            <Link
              href={`/${locale}/login`}
              id="nav-login-btn"
              className="btn-ghost text-sm"
            >
              Log In
            </Link>

            <Link
              href={`/${locale}/login`}
              id="nav-signup-btn"
              className="btn-primary text-sm"
            >
              Get Started
            </Link>

            {/* Blood SOS Button */}
            <Link
              href={`/${locale}/blood-bank`}
              id="nav-sos-btn"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-all duration-150 border border-red-100"
              title="Emergency Blood Request"
            >
              <Droplets className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span>SOS</span>
            </Link>
          </div>

          {/* ─── Mobile Right ─── */}
          <div className="flex lg:hidden items-center gap-2">
            <Link href={`/${locale}/blood-bank`} id="mobile-nav-sos" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-bold border border-red-100">
              <Droplets className="w-3.5 h-3.5" />
              SOS
            </Link>
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

        </div>
      </nav>

      {/* ─── Mobile Menu Overlay ─── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ─── Mobile Menu Drawer ─── */}
      <div
        className={`fixed top-0 right-0 w-[85vw] max-w-sm h-full bg-white z-50 lg:hidden flex flex-col shadow-2xl transition-transform duration-300 ease-spring ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Mobile navigation"
        aria-modal="true"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-green-DEFAULT flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-base text-neutral-900">
              Campus<span className="text-brand-green-DEFAULT">Sheba</span>
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

          {/* Primary Links */}
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href.startsWith("#") ? link.href : `/${locale}${link.href}`}
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
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3 px-1">Services</p>
            <div className="grid grid-cols-2 gap-2">
              {servicesMenu.map((item) => (
                <Link
                  key={item.label}
                  href={`/${locale}${item.href}`}
                  id={`mobile-service-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}>
                    <item.icon className={`w-4 h-4 ${item.color}`} strokeWidth={2} />
                  </div>
                  <span className="text-xs font-semibold text-neutral-700 leading-tight">{item.label}</span>
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
            className="btn-primary-lg w-full justify-center"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;
