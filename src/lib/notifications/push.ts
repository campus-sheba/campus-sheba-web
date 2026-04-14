import { getToken, isSupported, Messaging, onMessage } from "firebase/messaging";
import { getFirebaseAppAsync } from "./firebase";

let messagingInstance: Messaging | null = null;
const SW_VERSION = "v3";

function isLikelyInAppWebView(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const hasIOSBridge =
    typeof (window as Window & { webkit?: unknown }).webkit !== "undefined";
  const isAndroidWebView = /wv|; wv\)/i.test(ua);
  const isLikelyIOSWebView = isIOS && hasIOSBridge && !/Safari/i.test(ua);
  return isLikelyIOSWebView || isAndroidWebView;
}

async function getMessagingInstance(): Promise<Messaging | null> {
  if (messagingInstance) return messagingInstance;

  const supported = await isSupported().catch(() => false);
  if (!supported) return null;

  const app = await getFirebaseAppAsync();
  if (!app) return null;

  const { getMessaging } = await import("firebase/messaging");
  messagingInstance = getMessaging(app);
  return messagingInstance;
}

export async function getWebPushToken(options?: { requestPermission?: boolean }) {
  const shouldRequestPermission = options?.requestPermission ?? false;

  if (
    typeof window === "undefined" ||
    !("Notification" in window) ||
    !("serviceWorker" in navigator) ||
    !window.isSecureContext
  ) {
    return null;
  }

  if (isLikelyInAppWebView()) return null;
  if (Notification.permission === "denied") return null;
  if (Notification.permission !== "granted" && shouldRequestPermission) {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;
  }
  if (Notification.permission !== "granted") return null;

  const messaging = await getMessagingInstance();
  if (!messaging) return null;

  try {
    const registration = await navigator.serviceWorker.register(
      `/firebase-messaging-sw.js?${SW_VERSION}`,
      { updateViaCache: "none" },
    );
    await navigator.serviceWorker.ready;
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
    return token || null;
  } catch (error) {
    console.error("[notifications] Failed to generate web push token.", error);
    return null;
  }
}

export async function bindForegroundNotifications(
  onPayload: (payload: Record<string, unknown>) => void,
) {
  const messaging = await getMessagingInstance();
  if (!messaging) return () => undefined;

  const unsubscribe = onMessage(messaging, (payload) => {
    onPayload(payload as unknown as Record<string, unknown>);
  });
  return unsubscribe;
}
