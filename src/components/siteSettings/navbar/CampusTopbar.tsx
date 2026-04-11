"use client";

import { useRouter } from "next/navigation";
import { ChevronDown, MapPin, Siren } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useAppState } from "@/contexts/AppStateContext";
import { ContentWrapper } from "@/components/wrappers";
import { useTranslations } from "next-intl";

export default function CampusTopbar() {
  const t = useTranslations("common.campusTopbar");
  const router = useRouter();
  const { state, dispatch } = useAppState();

  const selectedUniversity = state.university.selected;
  const isLoggedIn = state.auth.isAuthenticated;

  const handleChangeUniversity = () => {
    if (isLoggedIn) return;
    dispatch({ type: "OPEN_UNIVERSITY_SELECTOR" });
  };

  const handleProviderClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (isLoggedIn) {
      router.push(`/en/marketplace/shop/create`);
      return;
    }
    dispatch({ type: "OPEN_AUTH_MODAL", payload: { defaultTab: "login" } });
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[51] flex items-center bg-white/95 backdrop-blur-sm border-b border-neutral-200 text-neutral-900"
      style={{ height: "var(--topbar-height)" }}
      id="campus-topbar"
    >
      <ContentWrapper
        maxWidth="container"
        padding="none"
        className="flex h-full items-center justify-between w-full"
      >
        {/* University Selector */}
        <button
          onClick={handleChangeUniversity}
          disabled={isLoggedIn}
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${
            isLoggedIn
              ? "cursor-not-allowed text-neutral-400"
              : "hover:text-emerald-600"
          }`}
          title={
            isLoggedIn
              ? t("disabledAfterLogin")
              : t("changeUniversity")
          }
        >
          <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="text-neutral-700 font-semibold">
            {selectedUniversity?.name || t("selectUniversity")}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
        </button>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <div className="w-px h-3.5 bg-neutral-200" />

          <button
            type="button"
            onClick={handleProviderClick}
            className="hidden lg:block rounded-lg border border-red-100 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 hover:text-red-700"
          >
            {t("createShop")}
          </button>

          <Link
            href="/emergency-contacts"
            id="topbar-emergency-btn"
            className="flex items-center gap-1 rounded-lg border border-red-100 bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-600 transition-colors hover:bg-red-100 hover:text-red-700 sm:px-2.5 sm:py-1 sm:text-xs"
            title="Emergency contacts"
          >
            <Siren className="h-3 w-3" />
            <span>SOS</span>
          </Link>
        </div>
      </ContentWrapper>
    </div>
  );
}
