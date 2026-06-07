"use client";

import Image from "next/image";
import type { Banner } from "@/types/banner";
import {
  getBannerMediaUrl,
  getYoutubeEmbedUrl,
  isYoutubeVideo,
} from "@/utils/banner/media";
import { shouldUnoptimizeRemoteImage } from "@/utils/media/remoteImage";
import { cn } from "@/utils/utils";

type BannerMediaProps = {
  banner: Banner;
  /** Eager-load the first/visible slide. */
  priority?: boolean;
  /** next/image `sizes` hint. */
  sizes?: string;
  className?: string;
  /** Fired once the image/iframe finishes loading (drives the shimmer swap). */
  onLoad?: () => void;
};

/**
 * Renders a banner's visual by `contentType` (BANNER_PUBLIC_API.md §5.4):
 * - `image` / `gif` → fill <Image> (GIFs render unoptimized to keep animation)
 * - `youtube_video` → autoplaying muted embed (poster falls back to the image)
 *
 * Expects a positioned (`relative`) parent — uses `fill` / absolute layout.
 */
export default function BannerMedia({
  banner,
  priority,
  sizes = "100vw",
  className,
  onLoad,
}: BannerMediaProps) {
  if (isYoutubeVideo(banner.contentType)) {
    const embed = getYoutubeEmbedUrl(banner.mediaUrl);
    if (embed) {
      return (
        <iframe
          src={embed}
          title={banner.title || "banner-video"}
          className={cn("absolute inset-0 h-full w-full border-0", className)}
          allow="autoplay; encrypted-media"
          allowFullScreen
          onLoad={onLoad}
        />
      );
    }
  }

  const src = getBannerMediaUrl(banner) || "/placeholder.jpg";

  return (
    <Image
      src={src}
      alt={banner.title || "Banner"}
      fill
      priority={priority}
      sizes={sizes}
      className={cn("object-cover", className)}
      onLoad={onLoad}
      unoptimized={banner.contentType === "gif" || shouldUnoptimizeRemoteImage(src)}
    />
  );
}
