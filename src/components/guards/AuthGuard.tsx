import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getMe, isAuthenticated, refreshAuth } from "@/services/auth";

type AuthGuardProps = {
	children: ReactNode;
	locale: string;
};

export default async function AuthGuard({ children, locale }: AuthGuardProps) {
	let authenticated = await isAuthenticated();

	if (!authenticated) {
		try {
			await refreshAuth();
			authenticated = await isAuthenticated();
		} catch {
			authenticated = false;
		}
	}

	if (authenticated) {
		try {
			await getMe();
		} catch {
			try {
				await refreshAuth();
				await getMe();
			} catch {
				redirect(`/api/auth/clear?locale=${locale}`);
			}
		}
	} else {
			redirect(`/api/auth/clear?locale=${locale}`);
	}

	return <>{children}</>;
}
