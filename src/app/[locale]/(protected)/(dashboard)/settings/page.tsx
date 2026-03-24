import { getMe } from "@/services/auth";
import AppBreadcrumb from "@/components/common/AppBreadcrumb";
import ProfileLogoutButton from "../profile/ProfileLogoutButton";
import { redirect } from "next/navigation";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  let profile;
  try {
    profile = await getMe();
  } catch {
    redirect(`/api/auth/clear?locale=${locale}`);
  }
  const user = profile.data;

  return (
    <div className="space-y-5">
      <AppBreadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: `/profile` },
          { label: "Settings" },
        ]}
      />

      <div className="rounded-2xl bg-white border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Keep your account details and preferences up to date.
        </p>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Name</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{user?.name || "Not set"}</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Email</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{user?.email || "Not set"}</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Phone</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{user?.phone || "Not set"}</p>
          </div>
          <div className="rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Role</p>
            <p className="mt-1 text-sm font-semibold text-gray-900 capitalize">{user?.role || "user"}</p>
          </div>
        </div>

        <div className="mt-6">
          <ProfileLogoutButton locale={locale} />
        </div>
      </div>
    </div>
  );
}
