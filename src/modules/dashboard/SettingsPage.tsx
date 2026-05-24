"use client";

import { useState, useTransition } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import {
  Bell,
  ChevronRight,
  LogOut,
  MapPin,
  UserCog,
  Wallet,
} from "lucide-react";

import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import { Button } from "@/components/ui";
import { logoutAction, updateProfileAction } from "@/services/user";

type SettingsPageProps = {
  account: {
    name?: string;
    phone?: string;
    email?: string;
  };
  notificationsEnabled: boolean;
};

const QUICK_LINKS = [
  { label: "Edit profile", href: "/profile", icon: UserCog },
  { label: "Saved addresses", href: "/my-addresses", icon: MapPin },
  { label: "Wallet & payments", href: "/wallet", icon: Wallet },
] as const;

export default function SettingsPage({
  account,
  notificationsEnabled,
}: SettingsPageProps) {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const [notify, setNotify] = useState(notificationsEnabled);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(
    null,
  );

  const toggleNotifications = () => {
    const next = !notify;
    setNotify(next); // optimistic
    setFeedback(null);
    startTransition(async () => {
      const result = await updateProfileAction({ isNotificationEnabled: next });
      if (!result.success) {
        setNotify(!next); // revert
        setFeedback({ ok: false, text: result.message ?? "Could not update." });
        return;
      }
      setFeedback({ ok: true, text: "Notification preference saved." });
    });
  };

  return (
    <div className="space-y-5">
      <AppBreadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/profile" },
          { label: "Settings" },
        ]}
      />

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account, preferences, and session.
        </p>
      </div>

      {/* Account summary */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Account
        </h2>
        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-gray-400">Name</dt>
            <dd className="mt-0.5 text-sm font-medium text-gray-900">
              {account.name || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400">Phone</dt>
            <dd className="mt-0.5 text-sm font-medium text-gray-900">
              {account.phone || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400">Email</dt>
            <dd className="mt-0.5 truncate text-sm font-medium text-gray-900">
              {account.email || "—"}
            </dd>
          </div>
        </dl>
      </section>

      {/* Preferences */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Preferences
        </h2>
        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E30B12]/10 text-[#E30B12]">
              <Bell className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-medium text-gray-900">Push notifications</p>
              <p className="text-xs text-gray-500">
                Order updates, blood requests, and campus alerts.
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={notify}
            disabled={isPending}
            onClick={toggleNotifications}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-60 ${
              notify ? "bg-[#E30B12]" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                notify ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
        {feedback && (
          <p
            className={`mt-3 text-xs ${
              feedback.ok ? "text-[#E30B12]" : "text-red-600"
            }`}
          >
            {feedback.text}
          </p>
        )}
      </section>

      {/* Quick links */}
      <section className="rounded-2xl border border-gray-100 bg-white p-2 shadow-sm">
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center justify-between rounded-xl px-3 py-3 transition-colors hover:bg-gray-50"
          >
            <span className="flex items-center gap-3 text-sm font-medium text-gray-800">
              <link.icon className="h-[18px] w-[18px] text-gray-400" />
              {link.label}
            </span>
            <ChevronRight className="h-4 w-4 text-gray-300" />
          </Link>
        ))}
      </section>

      {/* Session */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Session
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Sign out of Campus Sheba on this device.
        </p>
        <form action={logoutAction.bind(null, locale)} className="mt-4">
          <Button
            type="submit"
            variant="ghost"
            uppercase={false}
            className="gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </Button>
        </form>
      </section>
    </div>
  );
}
