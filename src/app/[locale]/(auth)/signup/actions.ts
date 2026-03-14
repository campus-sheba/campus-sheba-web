"use server";

import {
  signupComplete,
  signupSendOtp,
  signupVerifyOtp,
} from "@/services/auth";

export async function sendOtpAction(payload: { phone: string; role: string }) {
  try {
    const response = await signupSendOtp(payload);
    console.log("OTP sent successfully:", response);
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
    const response = await signupComplete(payload);
    return { success: true as const, message: response.data.message };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Signup completion failed";
    return { success: false as const, message };
  }
}
