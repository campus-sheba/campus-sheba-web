"use client";

import Link from "next/link";
import { ChevronDown, Droplets, MapPin } from "lucide-react";
import { useAppState } from "@/contexts/AppStateContext";

type CampusTopbarProps = {
  locale: string;
  onLanguageChange: (newLocale: string) => void;
};

export default function CampusTopbar({
  locale,
  onLanguageChange,
}: CampusTopbarProps) {
  const { state, dispatch } = useAppState();

  const selectedUniversity = state.university.selected;

  const handleChangeUniversity = () => {
    dispatch({ type: "OPEN_UNIVERSITY_SELECTOR" });
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[51] flex items-center bg-white/95 backdrop-blur-sm border-b border-neutral-200 text-neutral-900"
      style={{ height: "var(--topbar-height)" }}
      id="campus-topbar"
    >
      <div className="cs-container flex items-center justify-between h-full">
        {/* University Selector */}
        <button
          onClick={handleChangeUniversity}
          className="flex items-center gap-2 text-sm font-medium hover:text-emerald-600 transition-colors"
          title="Change university"
        >
          <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="text-neutral-700 font-semibold">
            {selectedUniversity?.name || "Select University"}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
        </button>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <select
            value={locale}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="text-xs font-medium text-neutral-500 bg-transparent border-none focus:outline-none cursor-pointer hover:text-neutral-900 transition-colors appearance-none"
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

          <div className="w-px h-3.5 bg-neutral-200" />

          <Link
            href={`/${locale}/login?redirect=/marketplace/shop/create`}
            className="rounded-lg border border-red-100 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 hover:text-red-700"
          >
            Be a Provider
          </Link>

          <Link
            href={`/${locale}/blood-bank`}
            id="topbar-sos-btn"
            className="flex items-center gap-1 rounded-lg border border-red-100 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600 transition-colors hover:bg-red-100 hover:text-red-700"
            title="Emergency Blood Request"
          >
            <Droplets className="w-3 h-3" />
            <span>SOS</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
