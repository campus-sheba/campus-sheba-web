"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppState } from "@/contexts/AppStateContext";
import { fetchPopupBanners } from "@/services/banner";
import type { Banner } from "@/types/banner";
import PopupModal from "./PopupModal";

// Popup suppression is client-enforced (BANNER_PUBLIC_API.md §8.3): the server
// stores the rules, the client honours them.
//   - showOncePerSession → suppress after the first dismiss this session
//   - frequencyCapPerUser → cap total impressions per user (persisted)
const SESSION_PREFIX = "cs_popup_seen_";
const FREQ_PREFIX = "cs_popup_freq_";
const SHOW_DELAY_MS = 1000;

function sessionSeen(id: string): boolean {
  try {
    return sessionStorage.getItem(SESSION_PREFIX + id) === "1";
  } catch {
    return false;
  }
}

function markSessionSeen(id: string): void {
  try {
    sessionStorage.setItem(SESSION_PREFIX + id, "1");
  } catch {
    /* storage unavailable (private mode) — degrade to showing again */
  }
}

function impressionCount(id: string): number {
  try {
    return Number(localStorage.getItem(FREQ_PREFIX + id)) || 0;
  } catch {
    return 0;
  }
}

function recordImpression(id: string): void {
  try {
    localStorage.setItem(FREQ_PREFIX + id, String(impressionCount(id) + 1));
  } catch {
    /* storage unavailable — cap simply won't persist */
  }
}

/** A popup is eligible when it isn't session-suppressed or over its frequency cap. */
function isEligible(banner: Banner): boolean {
  if (banner.showOncePerSession && sessionSeen(banner._id)) return false;
  if (
    typeof banner.frequencyCapPerUser === "number" &&
    banner.frequencyCapPerUser > 0 &&
    impressionCount(banner._id) >= banner.frequencyCapPerUser
  ) {
    return false;
  }
  return true;
}

/**
 * Launch-popup container ("section"): resolves popups for the selected campus
 * (`displayType=popup`), filters by the client suppression rules, then surfaces
 * {@link PopupModal} after a short delay. Mirrors the data → modal split used by
 * the other app-launch surfaces.
 */
export default function PopupBannerModal() {
  const { state } = useAppState();
  const [popups, setPopups] = useState<Banner[]>([]);
  const [open, setOpen] = useState(false);

  const universityId =
    state.university.selected?._id ?? state.user.profile?.university?._id;

  useEffect(() => {
    if (!universityId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    void fetchPopupBanners(universityId).then((data) => {
      if (cancelled) return;
      const eligible = data.filter(isEligible);
      if (eligible.length === 0) return;
      // Count one impression per popup the moment it's queued for display.
      eligible.forEach((b) => recordImpression(b._id));
      setPopups(eligible);
      timer = setTimeout(() => {
        if (!cancelled) setOpen(true);
      }, SHOW_DELAY_MS);
    });

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [universityId]);

  // A set is dismissible only if every popup in it allows dismissal (§8.3).
  const dismissible = useMemo(
    () => popups.every((b) => b.isDismissible !== false),
    [popups],
  );

  const close = useCallback(() => {
    popups.forEach((b) => {
      if (b.showOncePerSession) markSessionSeen(b._id);
    });
    setOpen(false);
  }, [popups]);

  if (popups.length === 0) return null;

  return (
    <PopupModal
      open={open}
      onClose={close}
      popups={popups}
      dismissible={dismissible}
    />
  );
}
