import ProfilePage from "@/modules/dashboard/ProfilePage";
import { getProfileAction, getUniversityMetadataAction } from "@/services/user";
import { getTranslations } from "next-intl/server";

export default async function DashboardProfilePage() {
  const t = await getTranslations("common.profile");
  const profileResult = await getProfileAction();
  const profile =
    profileResult.success && profileResult.data ? profileResult.data : null;

  const universityId =
    profile && typeof profile.university === "object" && profile.university?._id
      ? profile.university._id
      : undefined;

  const metadataResult = await getUniversityMetadataAction(universityId);

  if (!profile) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-600">
        {t("unableToLoad")}
      </div>
    );
  }

  return (
    <ProfilePage
      profile={profile}
      halls={metadataResult.halls}
      departments={metadataResult.departments}
    />
  );
}
