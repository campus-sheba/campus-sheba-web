// Banner media helpers — content-type predicates and YouTube embedding.
// Banners render as a static image, an animated GIF, or an embedded YouTube
// video (BANNER_PUBLIC_API.md §5.4). For video, `photo.url` is the poster and
// `mediaUrl` is the YouTube watch/shorts URL.

import type { Banner, BannerContentType } from "@/types/banner";

export function isImageLike(contentType?: BannerContentType | string): boolean {
  return contentType === "image" || contentType === "gif";
}

export function isYoutubeVideo(contentType?: BannerContentType | string): boolean {
  return contentType === "youtube_video";
}

/** Extract the video id from a watch / shorts / youtu.be URL. */
function extractYoutubeId(url: string): string {
  if (url.includes("youtube.com/shorts/")) {
    return url.split("shorts/")[1]?.split(/[?&/]/)[0] ?? "";
  }
  if (url.includes("watch?v=")) {
    return url.split("watch?v=")[1]?.split("&")[0] ?? "";
  }
  if (url.includes("youtu.be/")) {
    return url.split("youtu.be/")[1]?.split(/[?&/]/)[0] ?? "";
  }
  if (url.includes("youtube.com/embed/")) {
    return url.split("embed/")[1]?.split(/[?&/]/)[0] ?? "";
  }
  return "";
}

/** Build an autoplaying, muted, looping embed URL (empty string if unparseable). */
export function getYoutubeEmbedUrl(url?: string | null): string {
  if (!url) return "";
  const id = extractYoutubeId(url);
  if (!id) return "";
  return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&playsinline=1&controls=0&rel=0&modestbranding=1&loop=1&playlist=${id}`;
}

/** The URL a banner should display its visual from. */
export function getBannerMediaUrl(banner: Banner): string {
  if (isYoutubeVideo(banner.contentType)) {
    return banner.mediaUrl || banner.photo?.url || "";
  }
  // image / gif — prefer photo.url, fall back to mediaUrl (admin alt media).
  return banner.photo?.url || banner.mediaUrl || "";
}
