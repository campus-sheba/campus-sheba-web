"use client";

import { useEffect, useRef } from "react";
import {
  subscribeGuestNotificationsAction,
  subscribeUserNotificationsAction,
  unsubscribeGuestNotificationsAction,
} from "@/app/actions/notifications";
import { useAppState } from "@/contexts/AppStateContext";
import { clearStoredPushToken, getOrCreateDeviceId, getStoredPushToken, setStoredPushToken } from "@/lib/notifications/device";
import { bindForegroundNotifications, getWebPushToken } from "@/lib/notifications/push";
import type { NotificationAppChannel } from "@/types/notification";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useNotificationBootstrap() {
  const { state } = useAppState();
  const subscribedAsRef = useRef<"guest" | "user" | null>(null);
  const inFlightRef = useRef(false);
  const noTokenWarnedRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    let removeListener: (() => void) | undefined;
    const emitIncoming = (incoming: Record<string, unknown>) => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("campus-sheba:notification-received", {
            detail: incoming,
          }),
        );
      }
    };

    const setup = async () => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;

      if (!removeListener) {
        removeListener = await bindForegroundNotifications((incoming) => {
          emitIncoming(incoming);
        });
      }

      const token =
        getStoredPushToken() ??
        (await getWebPushToken({
          requestPermission: state.auth.isAuthenticated,
        }));
      if (!mounted || !token) {
        if (state.auth.isAuthenticated) {
          if (!noTokenWarnedRef.current) {
            console.warn("[notifications] No FCM token generated for authenticated user.");
            noTokenWarnedRef.current = true;
          }
        }
        inFlightRef.current = false;
        return;
      }
      noTokenWarnedRef.current = false;

      setStoredPushToken(token);
      const deviceId = getOrCreateDeviceId();
      const appChannel: NotificationAppChannel = state.auth.isAuthenticated ? "customer" : "guest";
      const payload = {
        token,
        fcmToken: token,
        deviceId,
        platform: "web" as const,
        appChannel,
      };

      const alreadySubscribed =
        typeof window !== "undefined" &&
        localStorage.getItem("campus_sheba_subscribed_push_token") === token &&
        localStorage.getItem("campus_sheba_subscribed_push_channel") === appChannel;

      if (alreadySubscribed) {
        subscribedAsRef.current = state.auth.isAuthenticated ? "user" : "guest";
        inFlightRef.current = false;
        return;
      }

      if (state.auth.isAuthenticated) {
        if (subscribedAsRef.current !== "user") {
          if (subscribedAsRef.current === "guest") {
            await unsubscribeGuestNotificationsAction({
              token,
              fcmToken: token,
              deviceId,
              platform: "web",
              appChannel: "guest",
            }).catch(
              () => undefined,
            );
          }
          try {
            await subscribeUserNotificationsAction(payload);
          } catch {
            await wait(500);
            await subscribeUserNotificationsAction(payload);
          }
          subscribedAsRef.current = "user";
        }
      } else if (subscribedAsRef.current !== "guest") {
        try {
          await subscribeGuestNotificationsAction(payload);
        } catch {
          await wait(500);
          await subscribeGuestNotificationsAction(payload);
        }
        subscribedAsRef.current = "guest";
      }

      localStorage.setItem("campus_sheba_subscribed_push_token", token);
      localStorage.setItem("campus_sheba_subscribed_push_channel", appChannel);

      inFlightRef.current = false;
    };

    setup().catch((error) => {
      if (mounted) {
        console.error("[notifications] Subscription flow failed.", error);
        clearStoredPushToken();
        inFlightRef.current = false;
      }
    });

    return () => {
      mounted = false;
      if (removeListener) removeListener();
    };
  }, [state.auth.isAuthenticated]);

  useEffect(() => {
    const token = getStoredPushToken();
    if (!token) return;
    document.cookie = `webPushToken=${encodeURIComponent(token)}; path=/; max-age=2592000; SameSite=Lax`;
  }, []);
}
