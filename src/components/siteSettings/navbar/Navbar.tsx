"use client";

import React, { useMemo, useState } from "react";
import Logo from "./Logo";
import NavItem from "./NavItem";
import NavItemWithDropdown from "./NavItemWithDropdown";
import SearchButton from "./SearchButton";
import Sidebar from "./Sidebar";
import MobileNavbar from "./MobileNavbar";

export type NavItemType = { label: string; href: string };

const navItems: NavItemType[] = [
  { label: "Home", href: "/" },
  { label: "News", href: "/news" },
  { label: "Politics", href: "/politics" },
  { label: "Business", href: "/business" },
  { label: "National", href: "/national" },
  { label: "Culture", href: "/culture" },
  { label: "Opinion", href: "/opinion" },
  { label: "Lifestyle", href: "/lifestyle" },
  { label: "Sports", href: "/sports" },
];

const homeDropdownItems = [
  { label: "Breaking News", href: "/breaking-news" },
  { label: "Latest Updates", href: "/latest" },
  { label: "Featured Stories", href: "/featured" },
  { label: "Editor's Pick", href: "/editors-pick" },
];

export default function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const nav = useMemo(() => navItems, []);

  return (
    <header className="w-full bg-white">
      {/* Desktop (lg+) */}
      <div className="hidden lg:block">
        <Logo variant="desktop" />
        <div className="border-t border-black">
          <div className="mx-auto flex max-w-container items-center justify-between px-6 py-5">
            <div className="w-8" /> {/* Spacer to center nav */}

            <nav aria-label="Primary" className="flex-1">
              <ul className="flex items-center justify-center gap-7">
                {nav.map((item) => {
                  const isHome = item.label === "Home";
                  if (isHome) {
                    return (
                      <NavItemWithDropdown
                        key={item.label}
                        label={item.label}
                        href={item.href}
                        dropdownItems={homeDropdownItems}
                      />
                    );
                  }
                  return (
                    <NavItem
                      key={item.label}
                      label={item.label}
                      href={item.href}
                    />
                  );
                })}
              </ul>
            </nav>

            <SearchButton size="md" />
          </div>
        </div>
      </div>

      {/* Mobile/Tablet (<lg) */}
      <MobileNavbar
        onMenuClick={() => setSidebarOpen(true)}
        onSearchClick={() => {
          // Handle search click
        }}
        sidebarOpen={sidebarOpen}
      />

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        items={nav}
      />
    </header>
  );
}
