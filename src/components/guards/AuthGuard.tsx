import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getMe } from "@/services/auth";

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
    console.error(error);
    // Session expired or completely invalid
    redirect(`/api/auth/clear`);
  }

  return <>{children}</>;
}
