"use server";

import { getPrivate, getPublic } from "@/utils/api/get";
import { patchPrivate } from "@/utils/api/patch";
import { postPrivate, postPublic } from "@/utils/api/post";
import { notificationEndpoints } from "@/utils/endpoints/endpoints";
import type { ApiEnvelope, GenericMessageResponseData } from "@/types/auth";
import type {
  NotificationItem,
  SubscribeNotificationPayload,
  UnsubscribeNotificationPayload,
} from "@/types/notification";

function withTokenAliases<T extends { token: string; fcmToken?: string; fcm_token?: string }>(payload: T): T {
  return {
    ...payload,
    fcmToken: payload.fcmToken ?? payload.token,
    fcm_token: payload.fcm_token ?? payload.token,
  };
}

function withOptionalTokenAliases(payload: UnsubscribeNotificationPayload): UnsubscribeNotificationPayload {
  if (!payload.token) return payload;
  return {
    ...payload,
    fcmToken: payload.fcmToken ?? payload.token,
    fcm_token: payload.fcm_token ?? payload.token,
  };
}

export async function subscribeUserNotifications(payload: SubscribeNotificationPayload) {
  console.log("payload >> subscribeUserNotifications", payload);
  return postPrivate<ApiEnvelope<GenericMessageResponseData>>(
    notificationEndpoints.userSubscribe,
    withTokenAliases(payload),
  );
}

export async function unsubscribeUserNotifications(payload: UnsubscribeNotificationPayload) {
  return postPrivate<ApiEnvelope<GenericMessageResponseData>>(
    notificationEndpoints.userUnsubscribe,
    withOptionalTokenAliases(payload),
  );
}

export async function listUserNotifications() {
  return getPrivate<ApiEnvelope<NotificationItem[]>>(notificationEndpoints.userBase);
}

export async function markNotificationAsRead(notificationId: string) {
  return patchPrivate<ApiEnvelope<GenericMessageResponseData>>(
    notificationEndpoints.userRead(notificationId),
  );
}

export async function subscribeGuestNotifications(payload: SubscribeNotificationPayload) {
  return postPublic<ApiEnvelope<GenericMessageResponseData>>(
    notificationEndpoints.guestSubscribe,
    withTokenAliases(payload),
  );
}

export async function unsubscribeGuestNotifications(payload: UnsubscribeNotificationPayload) {
  return postPublic<ApiEnvelope<GenericMessageResponseData>>(
    notificationEndpoints.guestUnsubscribe,
    withOptionalTokenAliases(payload),
  );
}

export async function listGuestNotifications() {
  return getPublic<ApiEnvelope<NotificationItem[]>>(notificationEndpoints.guestBase);
}
