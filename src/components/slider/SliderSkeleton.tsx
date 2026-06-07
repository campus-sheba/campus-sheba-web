import { cn } from "@/utils/utils";

type SliderSkeletonProps = {
  /** Tailwind height classes — keep in sync with the real slider to avoid CLS. */
  sliderHeight?: string;
  /** Round nav-arrow placeholders (inline sliders). */
  showArrows?: boolean;
  /** Pagination-dot placeholder pill. */
  showDots?: boolean;
  rounded?: boolean;
  className?: string;
};

/**
 * Loading placeholder for {@link SliderClient}. Mirrors its footprint (slide
 * area + arrows + dots) so the swap from skeleton → content doesn't shift layout.
 */
export default function SliderSkeleton({
  sliderHeight = "h-24 md:h-56 lg:h-96",
  showArrows = true,
  showDots = true,
  rounded = true,
  className,
}: SliderSkeletonProps) {
  return (
    <div className={cn("relative w-full", sliderHeight, className)}>
      {/* Slide area */}
      <div className={cn("h-full overflow-hidden", rounded && "rounded-2xl")}>
        <div className="h-full w-full animate-pulse bg-gray-200" />
      </div>

      {showArrows ? (
        <>
          <div className="absolute -left-4 top-1/2 z-20 h-9 w-9 -translate-y-1/2 animate-pulse rounded-full bg-gray-300" />
          <div className="absolute -right-4 top-1/2 z-20 h-9 w-9 -translate-y-1/2 animate-pulse rounded-full bg-gray-300" />
        </>
      ) : null}

      {showDots ? (
        <div className="absolute -bottom-1 left-1/2 z-20 -translate-x-1/2 translate-y-1/2">
          <div className="flex items-center gap-2 rounded-full bg-gray-200 px-4 py-1.5 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-2 w-2 rounded-full bg-gray-400" />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
