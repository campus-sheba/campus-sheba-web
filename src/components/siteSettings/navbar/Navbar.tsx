"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Search, User, ShoppingCart } from "lucide-react";
import Logo from "./Logo";
import CampusTopbar from "./CampusTopbar";
import {
  mapUniversityFeaturesToServicesMenu,
  navLinks,
  servicesMenu as fallbackServicesMenu,
} from "./navbar.constants";
import { useAppState } from "@/contexts/AppStateContext";
import { fetchUniversityFeatures } from "@/services/home";
import { ContentWrapper } from "@/components/wrappers";
import {
  NavbarMobileBottom,
  NavbarMobileDrawer,
  NavbarMobileToggle,
} from "./NavbarMobileSections";
import { useTranslations } from "next-intl";

// ─── Navbar Component ─────────────────────────────────────────
const Navbar = ({ locale }: { locale: string }) => {
  const t = useTranslations("common.navbar");
  const pathname = usePathname();
  const { state: appState, dispatch: appDispatch } = useAppState();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  // Use global auth state instead of local state
  const isLoggedIn = appState.auth.isAuthenticated;
  const [servicesOpen, setServicesOpen] = useState(false);
  const [servicesMenu, setServicesMenu] = useState(fallbackServicesMenu);
  const servicesRef = useRef<HTMLDivElement>(null);
  const selectedUniversityId = appState.university.selected?._id;
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const loadUniversityFeatures = async () => {
      if (!selectedUniversityId) {
        setServicesMenu(fallbackServicesMenu);
        return;
      }

      try {
        const features = await fetchUniversityFeatures(selectedUniversityId);
        const nextMenu = mapUniversityFeaturesToServicesMenu(features);
        setServicesMenu(nextMenu.length ? nextMenu : fallbackServicesMenu);
      } catch {
        setServicesMenu(fallbackServicesMenu);
      }
    };

    void loadUniversityFeatures();
  }, [selectedUniversityId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        servicesRef.current &&
        !servicesRef.current.contains(e.target as Node)
      ) {
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

  const openLogin = () =>
    appDispatch({ type: "OPEN_AUTH_MODAL", payload: { defaultTab: "login" } });
  const openSignup = () =>
    appDispatch({ type: "OPEN_AUTH_MODAL", payload: { defaultTab: "signup" } });

  return (
    <>
      <CampusTopbar />

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
        <ContentWrapper
          maxWidth="container"
          padding="none"
          className="h-full flex items-center justify-between px-4 sm:px-6 lg:px-8"
        >
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
          </div>
          {/* ─── Desktop Right CTAs ─── */}
          <div className="hidden lg:flex items-center gap-3">
            {/* ─── Desktop Navigation ─── */}
            <div className="hidden lg:flex items-center gap-1 me-5">
              <div className="relative w-[320px] xl:w-[680px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  className="h-10 w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-3 text-sm text-neutral-700 outline-none transition-all placeholder:text-neutral-400 focus:border-[#E30A13]/50 focus:ring-2 focus:ring-[#E30A13]/15"
                  aria-label={t("searchAria")}
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
                  {t("services")}
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
                        {t("allServices")}
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
                        {t("availableAtUniversities")}
                      </p>
                      <Link
                        href={isLoggedIn ? `/profile` : "#"}
                        onClick={(e) => {
                          if (!isLoggedIn) {
                            e.preventDefault();
                            appDispatch({
                              type: "OPEN_AUTH_MODAL",
                              payload: { defaultTab: "login" },
                            });
                          }
                          setServicesOpen(false);
                        }}
                        className="btn-primary text-xs px-4 py-2"
                        id="nav-services-cta"
                      >
                        {isLoggedIn ? t("goToProfile") : t("getStartedFree")}
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* <div className="flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={
                      link.href.startsWith("#") ? link.href : `/${link.href}`
                    }
                    id={`mobile-nav-${link.label.toLowerCase()}`}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div> */}
            </div>
            {/* <div className="w-px h-5 bg-neutral-200" /> */}
            {/* cart icon */}
            <Link
              href="/cart"
              id="nav-cart-btn"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-green-DEFAULT/30 text-brand-green-DEFAULT transition-colors hover:bg-brand-green-50"
            >
              <ShoppingCart className="h-5 w-5" strokeWidth={2} />
            </Link>
            {isLoggedIn ? (
              <Link
                href={`/profile`}
                id="nav-profile-btn"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-green-DEFAULT/30 text-brand-green-DEFAULT transition-colors hover:bg-brand-green-50"
                title="Profile"
                aria-label={t("profile")}
              >
                <User className="h-4.5 w-4.5" />
              </Link>
            ) : (
              <>
                <button
                  onClick={() =>
                    appDispatch({
                      type: "OPEN_AUTH_MODAL",
                      payload: { defaultTab: "login" },
                    })
                  }
                  id="nav-login-btn"
                  className="inline-flex items-center justify-center rounded-xl border border-brand-green-DEFAULT/30 px-4 py-2 text-sm font-semibold text-brand-green-DEFAULT transition-colors hover:bg-brand-green-50"
                >
                  {t("login")}
                </button>
              </>
            )}
            <select
              value={locale}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="text-xs font-medium text-neutral-500 bg-transparent border-none focus:outline-none cursor-pointer hover:text-neutral-900 transition-colors appearance-none"
              aria-label={t("selectLanguage")}
              id="topbar-language-select"
            >
              <option value="en" className="bg-white text-neutral-900">
                EN
              </option>
              <option value="bn" className="bg-white text-neutral-900">
                বাং
              </option>
            </select>
          </div>

          {/* ─── Mobile Right: logo + bar icon only ─── */}
          <NavbarMobileToggle
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
          />
        </ContentWrapper>
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
      <NavbarMobileBottom
        pathname={pathname}
        isLoggedIn={isLoggedIn}
        onOpenLogin={openLogin}
      />

      <NavbarMobileDrawer
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        isLoggedIn={isLoggedIn}
        navLinks={navLinks}
        servicesMenu={servicesMenu}
        selectedUniversityName={appState.university.selected?.name}
        onOpenLogin={openLogin}
        onOpenSignup={openSignup}
      />
    </>
  );
};

export default Navbar;
