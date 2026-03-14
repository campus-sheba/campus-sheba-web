import { getMe } from "@/services/auth";
import { logoutAction } from "./actions";

export default async function ProfilePage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const response = await getMe();
    const user = response.data;

    return (
        <div className="mx-auto max-w-4xl px-6 py-10">
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                        <p className="mt-1 text-sm text-gray-500">Authenticated via cookie-based access token</p>
                    </div>
                    <form action={logoutAction.bind(null, locale)}>
                        <button
                            type="submit"
                            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                        >
                            Logout
                        </button>
                    </form>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <ProfileItem label="Name" value={user.name} />
                    <ProfileItem label="Phone" value={user.phone} />
                    <ProfileItem label="Email" value={user.email} />
                    <ProfileItem label="Gender" value={user.gender} />
                    <ProfileItem label="Active" value={String(Boolean(user.isActive))} />
                    <ProfileItem label="Notifications" value={String(Boolean(user.isNotificationEnabled))} />
                    <ProfileItem label="Created At" value={user.createdAt} />
                    <ProfileItem label="Updated At" value={user.updatedAt} />
                </div>
            </div>
        </div>
    );
}

function ProfileItem({ label, value }: { label: string; value?: string }) {
    return (
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{value || "-"}</p>
        </div>
    );
}