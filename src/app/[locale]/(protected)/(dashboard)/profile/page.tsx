import ProfilePage from "@/modules/dashboard/ProfilePage";
import { getProfileAction, getUniversityMetadataAction } from "@/services/user";

export default async function DashboardProfilePage() {
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
        Unable to load profile right now.
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
