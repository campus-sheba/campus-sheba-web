"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, CheckCheck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  listGuestNotificationsAction,
  listUserNotificationsAction,
  markNotificationAsReadAction,
} from "@/app/actions/notifications";
import type { NotificationItem } from "@/types/notification";

type NotificationDropdownProps = {
  isAuthenticated: boolean;
};

type ForegroundBarContent = {
  title: string;
  message: string;
  image?: string;
};

function resolveTargetUrl(item: NotificationItem): string {
  const deeplink = item.deeplink?.trim();
  const webUrl = item.webUrl?.trim();

  if (deeplink) {
    if (deeplink.startsWith("http://") || deeplink.startsWith("https://")) {
      return deeplink;
    }

    if (deeplink.startsWith("sheba://")) {
      const raw = deeplink.replace("sheba://", "");
      const [host, ...rest] = raw.split("/");
      const path = rest.length ? `/${rest.join("/")}` : "";
      return `/${host}${path}`;
    }
  }

  if (webUrl) return webUrl;
  if (item.contentId) return `/marketplace/${encodeURIComponent(item.contentId)}`;
  return "/profile";
}

function isExternal(url: string) {
  return url.startsWith("http://") || url.startsWith("https://");
}

function formatTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function NotificationDropdown({ isAuthenticated }: NotificationDropdownProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [foregroundBar, setForegroundBar] = useState<ForegroundBarContent | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = useMemo(
    () => items.reduce((sum, item) => sum + (item.isRead ? 0 : 1), 0),
    [items],
  );

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    const onIncomingPush = (event: Event) => {
      const customEvent = event as CustomEvent<Record<string, unknown>>;
      const incoming = customEvent.detail ?? {};
      const notification =
        typeof incoming.notification === "object" && incoming.notification
          ? (incoming.notification as Record<string, unknown>)
          : {};

      setForegroundBar({
        title:
          typeof notification.title === "string" && notification.title.trim()
            ? notification.title
            : "New notification",
        message:
          typeof notification.body === "string" && notification.body.trim()
            ? notification.body
            : "You have received a new notification.",
        image:
          typeof notification.image === "string" && notification.image.trim()
            ? notification.image
            : undefined,
      });
      setRefreshKey((prev) => prev + 1);
    };

    window.addEventListener("campus-sheba:notification-received", onIncomingPush);
    return () => {
      window.removeEventListener("campus-sheba:notification-received", onIncomingPush);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const response = isAuthenticated
          ? await listUserNotificationsAction()
          : await listGuestNotificationsAction();
        if (!cancelled) {
          setItems(Array.isArray(response?.data) ? response.data : []);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isOpen, refreshKey]);

  const onOpenNotification = async (item: NotificationItem) => {
    if (isAuthenticated && item._id && !item.isRead) {
      await markNotificationAsReadAction(item._id).catch(() => undefined);
      setItems((prev) => prev.map((n) => (n._id === item._id ? { ...n, isRead: true } : n)));
    }

    const targetUrl = resolveTargetUrl(item);
    if (isExternal(targetUrl)) {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
      return;
    }

    setIsOpen(false);
    router.push(targetUrl);
  };

  const onMarkAllAsRead = async () => {
    if (!isAuthenticated) return;
    const unreadIds = items.filter((item) => !item.isRead).map((item) => item._id);
    if (unreadIds.length === 0) return;

    setLoading(true);
    try {
      await Promise.all(unreadIds.map((id) => markNotificationAsReadAction(id).catch(() => undefined)));
      setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {foregroundBar ? (
        <div className="fixed right-4 top-[calc(var(--topbar-height)+var(--navbar-height)+12px)] z-[90] w-[22rem] rounded-2xl border border-emerald-200 bg-white shadow-2xl">
          <div className="flex items-start gap-3 p-3">
            {foregroundBar.image ? (
              <Image
                src={foregroundBar.image}
                alt={foregroundBar.title}
                width={56}
                height={56}
                unoptimized
                className="h-14 w-14 rounded-xl border border-neutral-200 object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-neutral-200 bg-emerald-50 text-xs font-bold text-emerald-700">
                NEW
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-sm font-semibold text-neutral-900">{foregroundBar.title}</p>
              <p className="mt-0.5 line-clamp-2 text-xs text-neutral-600">{foregroundBar.message}</p>
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="mt-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Open notification center
              </button>
            </div>
            <button
              type="button"
              onClick={() => setForegroundBar(null)}
              className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
              aria-label="Close notification bar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      <div className="relative" ref={containerRef}>
      <button
        type="button"
        id="nav-notification-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 transition-colors hover:bg-neutral-50"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[24rem] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-neutral-100 bg-gradient-to-r from-emerald-50 to-cyan-50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-neutral-900">Notifications</p>
              <p className="text-xs text-neutral-500">{unreadCount} unread</p>
            </div>
            {isAuthenticated && unreadCount > 0 ? (
              <button
                type="button"
                onClick={() => void onMarkAllAsRead()}
                className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            ) : null}
          </div>
          <div className="max-h-96 space-y-1 overflow-y-auto p-1">
            {loading ? (
              <p className="px-3 py-8 text-center text-sm text-neutral-500">Loading notifications...</p>
            ) : items.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-neutral-500">No notifications yet.</p>
            ) : (
              items.map((item) => (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => void onOpenNotification(item)}
                  className={`w-full rounded-xl border px-3 py-2 text-left transition-all hover:shadow-sm ${
                    item.isRead
                      ? "border-neutral-100 bg-white hover:bg-neutral-50"
                      : "border-emerald-100 bg-gradient-to-r from-emerald-50/60 to-cyan-50/50 hover:from-emerald-50 hover:to-cyan-50"
                  }`}
                >
                  <div className="flex gap-3">
                    {item.image && item.image.trim() ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        width={48}
                        height={48}
                        unoptimized
                        className="h-12 w-12 rounded-lg border border-neutral-200 object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-[10px] font-semibold text-neutral-500">
                        {item.type.toUpperCase().slice(0, 6)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-semibold text-neutral-900">{item.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-neutral-600">{item.message}</p>
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="text-[11px] font-medium text-neutral-400">
                          {formatTime(item.createdAt)}
                        </span>
                        {!item.isRead ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            New
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
      </div>
    </>
  );
}
