import type { LostFoundPost } from "@/types/lost-and-found";

export function lostFoundDisplayTitle(post: LostFoundPost): string {
  if (post.title?.trim()) return post.title.trim();
  const first = post.items?.[0]?.name?.trim();
  if (first) return first;
  return "Lost & found item";
}

export function lostFoundPrimaryImage(post: LostFoundPost): string | null {
  const itemImg = post.items?.[0]?.images?.[0]?.url;
  if (itemImg) return itemImg;
  const legacy = post.image?.[0]?.url;
  if (legacy) return legacy;
  return null;
}

export function lostFoundLocationLabel(post: LostFoundPost): string {
  const loc = post.location?.[0];
  if (!loc) return "—";
  if (typeof loc === "string") return loc;
  return loc.name || loc.description || "—";
}
