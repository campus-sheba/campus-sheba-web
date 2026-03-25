import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getMe, isAuthenticated, refreshAuth } from "@/services/auth";

type AuthGuardProps = {
	children: ReactNode;
	locale: string;
};

export default async function AuthGuard({ children, locale }: AuthGuardProps) {
	try {
		// getMe calls getPrivate under the hood, which now natively intercepts 
		// 401s and attempts a silent refresh. 
		// Note: We cannot use persistUserCookie: true here because Next.js prevents 
		// setting cookies during a Server Component render phase.
		await getMe({ persistUserCookie: false });
	} catch (error) {
		// Session expired or completely invalid
		redirect(`/api/auth/clear?locale=${locale}`);
	}

	return <>{children}</>;
}
