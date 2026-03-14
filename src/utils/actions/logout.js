"use server";

import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { cookies } from "next/headers";

export async function logout() {
  const locale = await getLocale();
  const cookieStore = await cookies();
  cookieStore.delete("user");
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  cookieStore.delete("country");
  const cookieList = cookieStore.getAll();
  cookieList.forEach((cookie) => {
    cookieStore.delete(cookie.name);
  });
  redirect({ href: "/", locale: locale });
}

export async function logoutMobile() {
  const locale = await getLocale();
  const cookieStore = await cookies();
  cookieStore.delete("user");
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  cookieStore.delete("country");
  const cookieList = cookieStore.getAll();
  cookieList.forEach((cookie) => {
    cookieStore.delete(cookie.name);
  });

  redirect({ href: "/", locale: locale });
}
