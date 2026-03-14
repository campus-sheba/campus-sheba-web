"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { Facebook, Youtube, Twitter, Rss } from "lucide-react";
import { cn } from "@/utils/utils";
import XIcon from "@/components/ui/icons/XIcon";
import SearchIcon from "@/components/ui/icons/SearchIcon";

export interface NavItem {
  label: string;
  href: string;
}

export interface SidebarProps {
  open: boolean;
  onClose: () => void;
  items: NavItem[];
}

export default function Sidebar({ open, onClose, items }: SidebarProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  return (
    <div
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-50 transition",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      {/* Backdrop */}
      <button
        aria-label="Close menu overlay"
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/40 transition-opacity",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      {/* Close button - only visible when sidebar is open on mobile/tablet */}
      {open && (
        <button
          onClick={onClose}
          className={cn(
            "lg:hidden absolute right-6 top-6 z-60 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-black/60 text-white shadow-lg backdrop-blur hover:bg-black transition-colors",
          )}
          aria-label="Close menu"
        >
          <XIcon className="h-5 w-5" />
        </button>
      )}

      {/* Sidebar Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        className={cn(
          "absolute left-0 top-0 h-full w-[350px] max-w-[85vw] bg-white shadow-xl outline-none transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Search */}
          <div className="relative p-6">
            <input
              type="search"
              placeholder="Search..."
              className="w-full rounded-full border border-gray-200 bg-white px-4 py-3 pr-10 text-sm outline-none focus:border-gray-400 transition-colors"
            />
            <SearchIcon className="absolute right-10 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-600" />
          </div>

          <hr className="border-gray-200" />

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-6">
            <ul className="space-y-5">
              {items.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="block text-lg font-semibold text-gray-900 hover:text-gray-700 transition-colors"
                    onClick={onClose}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="mt-6 pt-4 text-xs text-gray-500 mb-2 p-6">
            <div className="flex items-center gap-4 mb-8">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Youtube"
              >
                <Youtube className="h-5 w-5" />
              </Link>
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="RSS"
              >
                <Rss className="h-5 w-5" />
              </Link>
            </div>
            <p>
              © 2026 <span className="underline">JNews</span> - Premium
              WordPress news & magazine theme by{" "}
              <span className="underline">Jegtheme</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
