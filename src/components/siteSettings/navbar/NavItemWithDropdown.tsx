"use client";

import React, { useState, useRef, useEffect } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/utils/utils";
import ChevronDownIcon from "@/components/ui/icons/ChevronDownIcon";

export interface DropdownItem {
  label: string;
  href: string;
}

export interface NavItemWithDropdownProps {
  label: string;
  href: string;
  dropdownItems?: DropdownItem[];
  className?: string;
}

export default function NavItemWithDropdown({
  label,
  href,
  dropdownItems = [],
  className,
}: NavItemWithDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);
  const pathname = usePathname();
  // Normalize paths for comparison (remove trailing slashes)
  const normalizedPathname = pathname !== "/" ? pathname.replace(/\/$/, "") : "/";
  const normalizedHref = href !== "/" ? href.replace(/\/$/, "") : "/";
  const isActive = normalizedPathname === normalizedHref || normalizedPathname.startsWith(normalizedHref + "/");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (dropdownItems.length === 0) {
    return (
      <li>
        <Link
          href={href}
          className={cn(
            "inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-black hover:text-gray-700 transition-colors",
            isActive && "text-gray-700 underline underline-offset-4",
            className,
          )}
        >
          {label}
        </Link>
      </li>
    );
  }

  return (
    <li className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-black hover:text-gray-700 transition-colors",
          isActive && "text-gray-700 underline underline-offset-4",
          className,
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {label}
        <ChevronDownIcon
          className={cn(
            "h-3 w-3 -mt-px transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg z-50">
          <ul className="py-2">
            <li>
              <Link
                href={href}
                className="block px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-700 hover:bg-gray-100 hover:text-black transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {label} Home
              </Link>
            </li>
            {dropdownItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-700 hover:bg-gray-100 hover:text-black transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}
