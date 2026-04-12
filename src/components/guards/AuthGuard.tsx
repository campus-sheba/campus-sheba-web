import { ReactNode } from "react";
import { getMe } from "@/services/auth";
import ProtectedSessionExpired from "@/components/guards/ProtectedSessionExpired";

type AuthGuardProps = {
  children: ReactNode;
};

export default async function AuthGuard({ children }: AuthGuardProps) {
  try {
    // getMe calls getPrivate under the hood, which now natively intercepts
    // 401s and attempts a silent refresh.
    // Note: We cannot use persistUserCookie: true here because Next.js prevents
    // setting cookies during a Server Component render phase.
    await getMe({ persistUserCookie: false });
  } catch (error) {
    if (!(error instanceof Error) || error.message !== "SESSION_EXPIRED") {
      console.error(error);
    }
    // Stay on the same URL; shell (navbar/footer) remains. Client clears cookies
    // and auth state so the navbar shows logged-out UI.
    return <ProtectedSessionExpired />;
  }

  return <>{children}</>;
}
