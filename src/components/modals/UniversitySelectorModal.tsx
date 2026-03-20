"use client";

import { useEffect, useState } from "react";
import { useAppState } from "@/contexts/AppStateContext";
import { University } from "@/types/global";
import { CookieHelper, StorageHelper } from "@/lib/appStateHelper";
import { fetchUniversities } from "@/utils/api/universities";
import { Loader } from "lucide-react";

type UniversitySelectorModalProps = {
  isOpen: boolean;
  isMandatory?: boolean;
  onSelect?: (university: University) => void;
};

export default function UniversitySelectorModal({
  isOpen,
  isMandatory = false,
  onSelect,
}: UniversitySelectorModalProps) {
  const { state, dispatch, selectUniversity } = useAppState();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [universities, setUniversities] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const shouldHardLockScroll = isOpen && Boolean(isMandatory) && !state.university.selected;

  // Lock page scroll while popup is open (extra strict for mandatory flow).
  useEffect(() => {
    if (!isOpen) return;

    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyPosition = body.style.position;
    const previousBodyTop = body.style.top;
    const previousBodyWidth = body.style.width;
    const previousOverscroll = body.style.overscrollBehavior;
    const scrollY = window.scrollY;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    if (shouldHardLockScroll) {
      body.dataset.modalScrollLock = "university-required";
      body.style.position = "fixed";
      body.style.top = `-${scrollY}px`;
      body.style.width = "100%";
      body.style.overscrollBehavior = "none";
    }

    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;

      if (shouldHardLockScroll) {
        delete body.dataset.modalScrollLock;
        body.style.position = previousBodyPosition;
        body.style.top = previousBodyTop;
        body.style.width = previousBodyWidth;
        body.style.overscrollBehavior = previousOverscroll;
        window.scrollTo(0, scrollY);
      }
    };
  }, [isOpen, shouldHardLockScroll]);

  // Preselect current university from state/cookie whenever popup opens.
  useEffect(() => {
    if (!isOpen) return;
    const cookieUniversity = CookieHelper.getUniversity();
    const initialId = state.university.selected?._id ?? cookieUniversity?._id ?? null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedId(initialId);
  }, [isOpen, state.university.selected?._id]);

  // Mandatory mode hard lock: ignore Escape; non-mandatory allows Escape close.
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      if (isMandatory) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      dispatch({ type: "CLOSE_UNIVERSITY_SELECTOR" });
      setSelectedId(null);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dispatch, isMandatory, isOpen]);

  // Fetch universities on mount
  useEffect(() => {
    const loadUniversities = async () => {
      setIsLoading(true);
      const data = await fetchUniversities(1, 100);
      setUniversities(data);
      setIsLoading(false);
    };

    if (isOpen) {
      loadUniversities();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!selectedId) return;

    const university = universities?.find((u) => u._id === selectedId);
    if (university) {
      // Update global state
      selectUniversity(university);

      // Clear temp storage
      StorageHelper.setPendingUniversity(null);

      onSelect?.(university);

      // Close modal
      dispatch({ type: "CLOSE_UNIVERSITY_SELECTOR" });
      setSelectedId(null);
    }
  };

  const handleClose = () => {
    // Can only close if not mandatory
    if (!isMandatory) {
      dispatch({ type: "CLOSE_UNIVERSITY_SELECTOR" });
      setSelectedId(null);
    }
  };

  return (
    <div
      onMouseDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (isMandatory) return;
        handleClose();
      }}
      className={`fixed inset-0 z-[80] flex items-center justify-center px-4 backdrop-blur-sm overscroll-none touch-none ${
        isMandatory ? "bg-neutral-900/60" : "bg-neutral-900/45"
      }`}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-neutral-900">
            Select Your University
          </h2>
          {!isMandatory && (
            <button
              onClick={handleClose}
              className="text-neutral-400 hover:text-neutral-600 transition"
              aria-label="Close"
            >
              ✕
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-6 h-6 text-emerald-600 animate-spin" />
            </div>
          ) : (
            <>
              {/* Dropdown */}
              <select
                value={selectedId || ""}
                onChange={(e) => setSelectedId(e.target.value || null)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 outline-none text-sm font-medium text-neutral-900 bg-white"
              >
                <option value="">Choose a university...</option>
                {universities?.map((university) => (
                  <option key={university._id} value={university._id}>
                    {university.name}
                  </option>
                ))}
              </select>

              {/* Info Text */}
              <p className="mt-3 text-xs text-neutral-500">
                {isMandatory
                  ? "Select your university to continue browsing Campus Sheba."
                  : "You can change this anytime in your profile settings."}
              </p>

              {/* Actions */}
              <div className="mt-6 flex gap-3">
                {!isMandatory && (
                  <button
                    onClick={handleClose}
                    className="flex-1 px-4 py-2.5 border border-neutral-300 rounded-lg font-medium text-sm text-neutral-700 hover:bg-neutral-50 transition"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleConfirm}
                  disabled={!selectedId}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm text-white transition disabled:opacity-50 disabled:cursor-not-allowed ${
                    selectedId
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-neutral-400"
                  }`}
                >
                  Confirm
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
