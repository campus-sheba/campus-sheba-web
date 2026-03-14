"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Logo from "./Logo";

const Navbar = ({ locale }: { locale: string }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLanguageChange = (newLocale: string) => {
    const path = pathname ? pathname.split("/").slice(2).join("/") : "";
    router.push(`/${newLocale}/${path}`);
  };

  return (
    <nav
      className={`fixed top-0 z-50 mx-auto w-full transition-all duration-300 ${
        scrolled ? "bg-white py-2 shadow-md" : "bg-white py-3 shadow-sm"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-0">
        <div className="flex items-center justify-between">
          <Link className="flex-shrink-0" href={`/${locale}/`}>
            <Logo />
          </Link>

          <div className="hidden items-center space-x-4 md:flex">
            <div className="relative">
              <select
                value={locale}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="focus:ring-primary focus:ring-opacity-50 appearance-none rounded-md bg-gray-100 px-3 py-2 pr-8 text-sm font-medium text-gray-700 focus:outline-none"
              >
                <option value="en">English</option>
              </select>
            </div>
          </div>

          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="hover:text-primary text-gray-700 focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 border-t bg-white px-2 pt-2 pb-3">
            <div className="flex items-center justify-between px-3 py-3">
              <select
                value={locale}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="mr-2 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none"
              >
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
