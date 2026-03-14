"use client";

import React from "react";
import Logo from "./Logo";
import MenuButton from "./MenuButton";
import SearchButton from "./SearchButton";

export interface MobileNavbarProps {
  onMenuClick: () => void;
  onSearchClick?: () => void;
  sidebarOpen?: boolean;
}

export default function MobileNavbar({
  onMenuClick,
  onSearchClick,
  sidebarOpen = false,
}: MobileNavbarProps) {
  return (
    <div className="lg:hidden">
      <div className="fixed left-0 right-0 top-0 z-40 border-b border-black bg-white">
        <div className="mx-auto flex h-16 max-w-container items-center justify-between px-4">
          <MenuButton onClick={onMenuClick} size="md" />

          <div className="flex-1 px-3">
            <div className="mx-auto max-w-[260px]">
              <Logo variant="mobile" />
            </div>
          </div>

          {!sidebarOpen && (
            <SearchButton onClick={onSearchClick} size="md" />
          )}
        </div>
      </div>

      {/* Spacer so content isn't hidden under the fixed bar */}
      <div className="h-16" />
    </div>
  );
}
