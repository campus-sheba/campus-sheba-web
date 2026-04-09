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

interface BannersProps {
  bottomOverlay?: React.ReactNode;
}

const Banners = ({ bottomOverlay }: BannersProps) => {
  const { state } = useAppState();
  const selectedUniversityId = state.university.selected?._id;
  const { banners, isLoading, error, allImagesLoaded, handleImageLoad } =
    useHomeBanners(selectedUniversityId);

  const renderSkeleton = () => (
    <div className="relative h-[55vh] w-full animate-pulse bg-gray-100">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200" />
    </div>
  );

  if (error) {
    return (
      <div className="flex h-[55vh] items-center justify-center text-sm text-gray-400">
        Unable to load banners.
      </div>
    );
  }

  if (isLoading || banners.length === 0) return renderSkeleton();

  return (
    <div className="relative mb-20 w-full overflow-visible md:mb-28">
      {/* Hidden pre-loader */}
      {!allImagesLoaded && renderSkeleton()}

      <div
        className={`transition-opacity duration-700 ${allImagesLoaded ? "opacity-100" : "opacity-0 absolute inset-0"}`}
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
          className="banner-swiper"
        >
          {banners.map((banner) => (
            <SwiperSlide key={banner._id}>
              <div className="relative h-[30vh] md:h-[55vh] mx-4 rounded-lg md:rounded-none md:w-full">
                <Image
                  src={banner.photo?.url || "/placeholder.jpg"}
                  alt={banner.title}
                  fill
                  sizes="100vw"
                  priority
                  className="object-cover rounded-lg md:rounded-none"
                  onLoad={handleImageLoad}
                />
                {/* Subtle bottom gradient for overlay legibility */}
                <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/50 to-transparent rounded-b-lg md:rounded-b-none" />
              </div>
            </SwiperSlide>
          ))}

          {/* Pagination dots — top right */}
          <div className="custom-pagination absolute right-5 top-5 z-10" />
        </Swiper>
      </div>

      {/* Bottom overlay — 50% inside banner, 50% outside banner */}
      {bottomOverlay && (
        <div className="pointer-events-none relative md:absolute inset-x-0 bottom-0 z-20 mt-12 lg:mt-0 md:translate-y-1/2 px-4 md:px-8">
          <ContentWrapper maxWidth="container" padding="none">
            <div className="pointer-events-auto bg-transparent">
              {bottomOverlay}
            </div>
          </ContentWrapper>
        </div>
      )}
    </div>
  );
};

export default Banners;
