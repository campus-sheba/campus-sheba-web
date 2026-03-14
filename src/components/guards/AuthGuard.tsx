import { ReactNode } from "react";
import { redirect } from "@/i18n/navigation";
import { isAuthenticated, refreshAuth } from "@/services/auth";

type AuthGuardProps = {
	children: ReactNode;
	locale: string;
};

export default async function AuthGuard({ children, locale }: AuthGuardProps) {
	let authenticated = await isAuthenticated();

	if (!authenticated) {
		try {
			await refreshAuth();
		} catch {
			// Ignore refresh failures and redirect below.
		}

		authenticated = await isAuthenticated();
	}

	if (!authenticated) {
		redirect({ href: "/login", locale });
	}

	return <>{children}</>;
}
