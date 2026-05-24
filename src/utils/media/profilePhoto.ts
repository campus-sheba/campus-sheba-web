const DEFAULT_PROFILE_AVATAR = "/assets/images/blank-phone.svg";

function photoUrlFromValue(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || null;
  }
  if (typeof value === "object" && value !== null && "url" in value) {
    const url = (value as { url?: unknown }).url;
    if (typeof url === "string") {
      const trimmed = url.trim();
      return trimmed || null;
    }
  }
  return null;
}

/** Resolves profile photo/avatar from API shapes (string URL or `{ url }` media). */
export function resolveProfilePhotoUrl(
  photo?: unknown,
  avatar?: unknown,
): string {
  return (
    photoUrlFromValue(avatar) ??
    photoUrlFromValue(photo) ??
    DEFAULT_PROFILE_AVATAR
  );
}
