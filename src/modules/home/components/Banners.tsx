import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import "../styles/banner-pagination.css";
import { useAppState } from "@/contexts/AppStateContext";
import { ContentWrapper } from "@/components/wrappers";
import { useHomeBanners } from "../hooks/useHomeBanners";
import { useTranslations } from "next-intl";
import { cn } from "@/utils/utils";

interface BannersProps {
  bottomOverlay?: React.ReactNode;
}

/** Matches slide heights to avoid CLS between skeleton and real banners */
const BANNER_H = "h-[30vh] min-h-[200px] md:h-[55vh] md:min-h-0";
const BANNER_FRAME = "mr-4 overflow-hidden  md:mr-4 md:rounded-none lg:mr-0";

function BannerShimmer() {
  return (
    <div className="absolute inset-0 z-0" aria-hidden>
      <div className="absolute inset-0 bg-gray-100" />
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100" />
      <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/50 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-gray-200/40 to-transparent" />
    </div>
  );
}

const Banners = ({ bottomOverlay }: BannersProps) => {
  const t = useTranslations("common.home");
  const { state } = useAppState();
  const selectedUniversityId = state.university.selected?._id;
  const { banners, isLoading, error, allImagesLoaded, handleImageLoad } =
    useHomeBanners(selectedUniversityId);

  const hasBanners = banners.length > 0;
  const showShimmer = Boolean(
    !error && (isLoading || (hasBanners && !allImagesLoaded)),
  );
  const showEmptyShell = Boolean(!error && !isLoading && !hasBanners);

  return (
    <div className="relative w-full overflow-visible">
      {/*
        Stable bottom spacing: overlay uses translate-y-1/2 on md, so reserve room for
        the features strip + gap before the next section (hero). Same in all states.
      */}
      <div className="relative mb-24 w-full md:mb-32">
        <div
          className={cn("relative w-full bg-gray-50", BANNER_FRAME, BANNER_H)}
        >
          {error ? (
            <div className="flex h-full min-h-[inherit] items-center justify-center px-4 text-center text-sm text-gray-500">
              {t("unableToLoadBanners")}
            </div>
          ) : null}

          {!error && showShimmer ? <BannerShimmer /> : null}

          {!error && showEmptyShell ? (
            <div
              className="absolute inset-0 bg-gradient-to-b from-gray-50 to-gray-100/90"
              aria-hidden
            />
          ) : null}

          {!error && hasBanners ? (
            <div
              className={cn(
                "w-full transition-opacity duration-500 ease-out",
                BANNER_H,
                allImagesLoaded
                  ? "relative z-10 opacity-100"
                  : "pointer-events-none absolute inset-0 z-[1] opacity-0",
              )}
            >
              <Swiper
                modules={[Autoplay, Pagination, Navigation, EffectFade]}
                spaceBetween={0}
                slidesPerView={1}
                effect="fade"
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                pagination={{
                  clickable: true,
                  el: ".custom-pagination",
                  type: "bullets",
                }}
                className="banner-swiper h-full w-full"
              >
                {banners.map((banner, index) => (
                  <SwiperSlide key={banner._id}>
                    <div className={cn("relative h-full w-full")}>
                      <Image
                        src={banner.photo?.url || "/placeholder.jpg"}
                        alt={banner.title}
                        fill
                        sizes="100vw"
                        priority={index === 0}
                        className="object-cover"
                        onLoad={handleImageLoad}
                      />
                      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                  </SwiperSlide>
                ))}
                <div className="custom-pagination absolute right-5 top-5 z-10" />
              </Swiper>
            </div>
          ) : null}
        </div>

        {bottomOverlay ? (
          <div className="pointer-events-none relative z-20 mt-8 px-4 md:absolute md:inset-x-0 md:bottom-0 md:mt-0 md:translate-y-1/2 md:px-8">
            <ContentWrapper maxWidth="container" padding="none">
              <div className="pointer-events-auto bg-transparent">
                {bottomOverlay}
              </div>
            </ContentWrapper>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Banners;
