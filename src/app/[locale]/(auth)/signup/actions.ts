"use server";

import {
  getMe,
  signupComplete,
  signupSendOtp,
  signupVerifyOtp,
} from "@/services/auth";

export async function sendOtpAction(payload: { phone: string; role: string }) {
  try {
    const response = await signupSendOtp(payload);
    return { success: true as const, message: response.data.message };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send OTP";
    return { success: false as const, message };
  }
}

export async function verifyOtpAction(payload: { phone: string; code: string }) {
  try {
    const response = await signupVerifyOtp(payload);
    return { success: true as const, message: response.data.message };
  } catch (error) {
    const message = error instanceof Error ? error.message : "OTP verification failed";
    return { success: false as const, message };
  }
}

export async function completeSignupAction(payload: {
  phone: string;
  university: string;
  name: string;
  role: string;
  pin: string;
}) {
  try {
    await signupComplete(payload);
    const me = await getMe({ persistUserCookie: true });
    return { success: true as const, profile: me.data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Signup completion failed";
    return { success: false as const, message };
  }
}
