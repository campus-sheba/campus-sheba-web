"use client";

import { useEffect, useState } from "react";
import { ChevronDown, MapPin, Siren } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useAppState } from "@/contexts/AppStateContext";
import { ContentWrapper } from "@/components/wrappers";
import { useTranslations } from "next-intl";
import { getAddressesAction } from "@/services/addresses";
import { getDefaultDeliveryAddress } from "@/utils/address/defaultAddress";
import { emitClientLogout, isSessionExpiredMessage } from "@/lib/sessionSync";
import LanguageDropdown from "./LanguageDropdown";
import NotificationDropdown from "./NotificationDropdown";

export default function CampusTopbar() {
  const t = useTranslations("common.campusTopbar");
  const { state, dispatch } = useAppState();

  const selectedUniversity = state.university.selected;
  const isLoggedIn = state.auth.isAuthenticated;
  const [defaultAddressLine, setDefaultAddressLine] = useState<string | null>(
    null,
  );
  const [addressLoading, setAddressLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;

    let cancelled = false;
    void (async () => {
      setAddressLoading(true);
      const res = await getAddressesAction("DELIVERY");
      if (cancelled) return;
      if (res.success) {
        const def = getDefaultDeliveryAddress(res.data);
        setDefaultAddressLine(def?.address?.trim() || null);
      } else {
        if (res.message && isSessionExpiredMessage(res.message)) {
          emitClientLogout();
        }
        setDefaultAddressLine(null);
      }
      setAddressLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  const savedAddressLine = isLoggedIn ? defaultAddressLine : null;

  const handleChangeUniversity = () => {
    if (isLoggedIn) return;
    dispatch({ type: "OPEN_UNIVERSITY_SELECTOR" });
  };

  const locationPrimary = isLoggedIn
    ? addressLoading
      ? t("loadingAddress")
      : savedAddressLine || t("noDefaultAddress")
    : selectedUniversity?.name || t("selectUniversity");

  const locationContent = (
    <>
      <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-neutral-700 font-semibold">
          {locationPrimary}
        </span>
        {/* {locationSecondary ? (
          <span className="block truncate text-[11px] font-medium text-neutral-400">
            {locationSecondary}
          </span>
        ) : null} */}
      </span>
      <ChevronDown className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
    </>
  );

  const locationClassName = `flex max-w-[min(100%,14rem)] sm:max-w-[min(100%,20rem)] items-center gap-2 text-left text-sm font-medium transition-colors ${
    isLoggedIn
      ? "cursor-pointer hover:text-emerald-600"
      : "hover:text-emerald-600"
  }`;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[51] flex items-center bg-white/95 backdrop-blur-sm border-b border-neutral-200 text-neutral-900"
      style={{ height: "var(--topbar-height)" }}
      id="campus-topbar"
    >
      <ContentWrapper
        maxWidth="container"
        padding="none"
        className="flex h-full items-center justify-between w-full px-6 lg:px-0"
      >
        {isLoggedIn ? (
          <Link
            href="/my-addresses"
            id="topbar-location-link"
            className={locationClassName}
            title={t("manageAddresses")}
          >
            {locationContent}
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleChangeUniversity}
            id="topbar-university-btn"
            className={locationClassName}
            title={t("changeUniversity")}
          >
            {locationContent}
          </button>
        )}

        <div className="flex items-center gap-2 sm:gap-2.5">
          {isLoggedIn ? (
            <NotificationDropdown isAuthenticated variant="topbar" />
          ) : null}
          <LanguageDropdown compact />
          <div className="hidden h-3.5 w-px bg-neutral-200 sm:block" />
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
