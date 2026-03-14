"use server";

import { redirect } from "@/i18n/navigation";
import { logout } from "@/services/auth";

export async function logoutAction(locale: string) {
  await logout();
  redirect({ href: "/login", locale });
}
