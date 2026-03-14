"use server";

import { getMe, login } from "@/services/auth";

type LoginActionPayload = {
  phone: string;
  pin: string;
  role?: string;
};

export async function loginAction(payload: LoginActionPayload) {
  try {
    await login({
      phone: payload.phone,
      pin: payload.pin,
      role: payload.role || "User",
    });

    await getMe({ persistUserCookie: true });

    return { success: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    return { success: false as const, message };
  }
}
