"use client";

import { Carousel, Modal } from "antd";
import { X } from "lucide-react";
import type { Banner } from "@/types/banner";
import BannerLink from "@/components/banner/BannerLink";
import BannerMedia from "@/components/banner/BannerMedia";

type PopupModalProps = {
  open: boolean;
  onClose: () => void;
  popups: Banner[];
  /** When false the modal can only be dismissed by tapping a banner CTA (§8.3). */
  dismissible?: boolean;
};

/**
 * Launch-popup presentation — a borderless antd Modal hosting an autoplaying
 * Carousel of banners. Each slide renders by `contentType` ({@link BannerMedia})
 * and navigates per its `redirectionType` ({@link BannerLink}); tapping a CTA
 * also closes the modal.
 */
export default function PopupModal({
  open,
  onClose,
  popups,
  dismissible = true,
}: PopupModalProps) {
  return (
    <>
      <style>{`
        .cs-popup-modal .ant-modal-content {
          padding: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
          border: none !important;
        }
        .cs-popup-modal .ant-modal-body { padding: 0 !important; margin: 0 !important; }
      `}</style>

      <Modal
        open={open}
        onCancel={dismissible ? onClose : undefined}
        footer={null}
        width={840}
        centered
        destroyOnHidden
        closable={false}
        maskClosable={dismissible}
        className="cs-popup-modal"
      >
        <div className="relative w-full overflow-hidden rounded-lg bg-white">
          {dismissible ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-3 z-50 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
            >
              <X size={14} />
            </button>
          ) : null}

          <Carousel
            autoplay
            dots={popups.length > 1}
            autoplaySpeed={5000}
            draggable
          >
            {popups.map((banner, index) => (
              <div key={banner._id}>
                <BannerLink
                  banner={banner}
                  onNavigate={onClose}
                  className="relative block h-[260px] w-full bg-gray-100 md:h-[550px]"
                >
                  <BannerMedia
                    banner={banner}
                    priority={index === 0}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 60vw"
                    className="object-contain"
                  />
                </BannerLink>
              </div>
            ))}
          </Carousel>
        </div>
      </Modal>
    </>
  );
}
