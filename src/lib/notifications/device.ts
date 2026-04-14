const DEVICE_ID_KEY = "campus_sheba_device_id";
const TOKEN_KEY = "campus_sheba_web_push_token";

export function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "";
  const existing = localStorage.getItem(DEVICE_ID_KEY);
  if (existing) {
    document.cookie = `webPushDeviceId=${encodeURIComponent(existing)}; path=/; max-age=2592000; SameSite=Lax`;
    return existing;
  }

  const generated =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  localStorage.setItem(DEVICE_ID_KEY, generated);
  document.cookie = `webPushDeviceId=${encodeURIComponent(generated)}; path=/; max-age=2592000; SameSite=Lax`;
  return generated;
}

export function getStoredPushToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredPushToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  document.cookie = `webPushToken=${encodeURIComponent(token)}; path=/; max-age=2592000; SameSite=Lax`;
}

export function clearStoredPushToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  document.cookie = "webPushToken=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "webPushDeviceId=; path=/; max-age=0; SameSite=Lax";
}
