
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import Image from "next/image";
// Import Swiper components and styles
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";

// Import custom pagination styles
import "./banner-pagination.css";
import { landingPageEndpoints } from "@/utils/endpoints/endpoints";
import { getPublic } from "@/utils/api/get";

interface Banner {
  _id: string;
  title: string;
  description: string;
  photo?: { url: string };
  link?: string;
}

const Banners = () => {
  // State to manage banners, loading state, and error
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res: any = await getPublic(landingPageEndpoints.heroBanner);
        console.log("Fetched banners:", res);
        setBanners(res?.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    if (!isLoading && banners.length > 0 && imagesLoaded === banners.length) {
      setAllImagesLoaded(true);
    }
  }, [imagesLoaded, banners.length, isLoading]);

  const handleImageLoad = () => {
    setImagesLoaded(prev => prev + 1);
  };

  const renderSkeleton = () => (
    <div className="relative my-10 h-96 w-full animate-pulse rounded-xl bg-gray-200">
      <div className="absolute right-4 bottom-4 flex space-x-2">
        {[1].map(i => (
          <div key={i} className="h-2 w-8 rounded-full bg-gray-300"></div>
        ))}
      </div>
    </div>
  );

  if (error) {
    return <div className="text-red-500">Error loading banners. Please try again later.</div>;
  }

  if (isLoading || banners.length === 0) {
    return renderSkeleton();
  }

  return (
    <div className="relative my-10 w-full overflow-hidden rounded-xl bg-gray-100">
      {!allImagesLoaded && renderSkeleton()}

      <div
        className={`transition-opacity duration-500 ${allImagesLoaded ? 'opacity-100' : 'opacity-0'}`}
      >
        <Swiper
          modules={[Autoplay, Pagination, Navigation, EffectFade]}
          spaceBetween={0}
          slidesPerView={1}
          effect="fade"
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
            el: '.custom-pagination',
            type: 'bullets',
          }}
          className="banner-swiper"
        >
          {banners.map(banner => (
            <SwiperSlide key={banner._id}>
              <div className="relative h-96 w-full">
                <Image
                  src={banner.photo?.url || "/placeholder.jpg"}
                  alt={banner.title}
                  fill
                  sizes="100vw"
                  priority
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  onLoad={handleImageLoad}
                />
                <div className="bg-opacity-40 absolute inset-0 flex flex-col items-start justify-center px-8 md:px-16">
                  {/* Banner content can be uncommented if needed */}
                </div>
              </div>
            </SwiperSlide>
          ))}
          <div className="custom-pagination absolute right-4 bottom-4 z-10"></div>
        </Swiper>
      </div>
    </div>
  );
};

export default Banners;
