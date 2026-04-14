export type NotificationPlatform = "android" | "ios" | "web";

export type NotificationAppChannel =
  | "customer"
  | "delivery_hero"
  | "provider"
  | "admin_portal"
  | "guest";

export type SubscribeNotificationPayload = {
  token: string;
  fcmToken?: string;
  fcm_token?: string;
  platform: NotificationPlatform;
  deviceId: string;
  appChannel: NotificationAppChannel;
};

export type UnsubscribeNotificationPayload = {
  token: string;
  fcmToken?: string;
  fcm_token?: string;
  platform?: NotificationPlatform;
  deviceId?: string;
  appChannel?: NotificationAppChannel;
};

export type NotificationItem = {
  _id: string;
  type: string;
  title: string;
  message: string;
  contentId?: string | null;
  image?: string | null;
  deeplink?: string | null;
  webUrl?: string | null;
  ctaLabel?: string | null;
  metadata?: string | Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
  isRead?: boolean;
};
