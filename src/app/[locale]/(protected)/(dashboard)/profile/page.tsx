import ProfilePage from "@/modules/dashboard/ProfilePage";
import { getProfileAction } from "@/services/user";
import { getTranslations } from "next-intl/server";

export default async function DashboardProfilePage() {
  const t = await getTranslations("common.profile");
  const profileResult = await getProfileAction();
  const profile =
    profileResult.success && profileResult.data ? profileResult.data : null;

  if (!profile) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-600">
        {t("unableToLoad")}
      </div>
    );
  }

  // Halls/departments are only needed for the edit-form dropdowns, so they're
  // loaded lazily on the client (see ProfilePage) instead of blocking this
  // navigation on a second sequential API round-trip.
  return <ProfilePage profile={profile} />;
}
