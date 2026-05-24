"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useAppState } from "@/contexts/AppStateContext";
import { fetchBannersResolve, type BannerResolveItem } from "@/services/home";

const SESSION_KEY = "cs_popup_banner_shown";

export default function PopupBannerModal() {
  const { state } = useAppState();
  const [banners, setBanners] = useState<BannerResolveItem[]>([]);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);

  const universityId =
    state.university.selected?._id ?? state.user.profile?.university?._id;

  useEffect(() => {
    if (!universityId) return;
    if (sessionStorage.getItem(SESSION_KEY)) return;

    void fetchBannersResolve({ displayType: "popup", universityId }).then(
      (data) => {
        if (data.length > 0) {
          setBanners(data);
          setOpen(true);
          sessionStorage.setItem(SESSION_KEY, "1");
        }
      },
    );
  }, [universityId]);

  if (!open || banners.length === 0) return null;

  const banner = banners[index];
  const total = banners.length;

  function prev() {
    setIndex((i) => (i - 1 + total) % total);
  }
  function next() {
    setIndex((i) => (i + 1) % total);
  }
  function close() {
    setOpen(false);
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="relative w-full max-w-4xl overflow-hidden  bg-white "
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {banner.photo?.url ? (
          <div className="relative w-full aspect-[16/9] bg-gray-100">
            <Image
              src={banner.photo.url}
              alt={banner.title}
              fill
              className="object-contain"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 60vw"
              priority
            />
          </div>
        ) : null}

        {/* <div className="p-5">
          <h3 className="text-base font-bold text-gray-900">{banner.title}</h3>
          {banner.description ? (
            <p className="mt-1 text-sm text-gray-600">{banner.description}</p>
          ) : null}

          {banner.link ? (
            <a
              href={banner.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#00A651] py-2.5 text-sm font-bold text-white transition hover:brightness-110"
              onClick={close}
            >
              View offer
            </a>
          ) : null}
        </div> */}

        {total > 1 ? (
          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
            <button
              type="button"
              onClick={prev}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs text-gray-400">
              {index + 1} / {total}
            </span>
            <button
              type="button"
              onClick={next}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
