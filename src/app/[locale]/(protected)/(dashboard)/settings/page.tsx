import SettingsPage from "@/modules/dashboard/SettingsPage";
import { getProfileAction } from "@/services/user";

export default async function DashboardSettingsPage() {
  const result = await getProfileAction();
  const profile = result.success && result.data ? result.data : null;

  return (
    <SettingsPage
      account={{
        name: profile?.name,
        phone: profile?.phone,
        email: profile?.email,
      }}
      notificationsEnabled={Boolean(profile?.isNotificationEnabled)}
    />
  );
}
