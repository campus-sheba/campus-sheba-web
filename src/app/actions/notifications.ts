"use server";

import {
  listGuestNotifications,
  listUserNotifications,
  markNotificationAsRead,
  subscribeGuestNotifications,
  subscribeUserNotifications,
  unsubscribeGuestNotifications,
  unsubscribeUserNotifications,
} from "@/services/notifications";
import type {
  SubscribeNotificationPayload,
  UnsubscribeNotificationPayload,
} from "@/types/notification";

export async function subscribeGuestNotificationsAction(payload: SubscribeNotificationPayload) {
  return subscribeGuestNotifications(payload);
}

export async function unsubscribeGuestNotificationsAction(payload: UnsubscribeNotificationPayload) {
  return unsubscribeGuestNotifications(payload);
}

export async function subscribeUserNotificationsAction(payload: SubscribeNotificationPayload) {
  console.log("payload >> subscribeUserNotificationsAction", payload);
  return subscribeUserNotifications(payload);
}

export async function unsubscribeUserNotificationsAction(payload: UnsubscribeNotificationPayload) {
  return unsubscribeUserNotifications(payload);
}

export async function listUserNotificationsAction() {
  return listUserNotifications();
}

export async function listGuestNotificationsAction() {
  return listGuestNotifications();
}

export async function markNotificationAsReadAction(notificationId: string) {
  return markNotificationAsRead(notificationId);
}
