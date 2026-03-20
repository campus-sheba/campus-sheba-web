"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { logoutAction } from "./actions";
import { useAppState } from "@/contexts/AppStateContext";

type ProfileLogoutButtonProps = {
  locale: string;
};

export default function ProfileLogoutButton({ locale }: ProfileLogoutButtonProps) {
  const router = useRouter();
  const { logout } = useAppState();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      // Clear client state first so navbar updates immediately.
      logout();

      try {
        await logoutAction(locale);
      } finally {
        router.replace(`/${locale}`);
        router.refresh();
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-50 border border-red-100 text-sm font-semibold text-[#E30A13] hover:bg-red-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isPending ? "Logging out..." : "Log Out"}
    </button>
  );
}
