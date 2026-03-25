"use server";

import { cookies } from "next/headers";
import { getPrivate, getPublic } from "@/utils/api/get";
import { postPrivate, postPublic } from "@/utils/api/post";
import { authenticationEndpoints, userEndpoints } from "@/utils/endpoints/endpoints";
import type {
  ApiEnvelope,
  AuthMe,
  AuthTokens,
  GenericMessageResponseData,
  LoginPayload,
  SignupCompletePayload,
  SignupSendOtpPayload,
  SignupSendOtpResponseData,
  SignupVerifyOtpPayload,
} from "@/types/auth";

const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;

async function setAuthCookies(tokens: AuthTokens) {
  const cookieStore = await cookies();

  cookieStore.set("accessToken", tokens.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: THIRTY_DAYS_SECONDS,
  });

  cookieStore.set("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: THIRTY_DAYS_SECONDS,
  });
}

async function setUserCookie(profile: AuthMe) {
  const cookieStore = await cookies();

  const minimalProfile: AuthMe = {
    _id: profile._id,
    name: profile.name,
    phone: profile.phone,
    email: profile.email,
    photo: profile.photo,
    role: profile.role,
  };

  cookieStore.set("user", JSON.stringify(minimalProfile), {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: THIRTY_DAYS_SECONDS,
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  cookieStore.delete("user");
}

export async function signupSendOtp(payload: SignupSendOtpPayload) {
  return postPublic<ApiEnvelope<SignupSendOtpResponseData>>(
    authenticationEndpoints.signupSendOtp,
    payload,
  );
}

export async function signupVerifyOtp(payload: SignupVerifyOtpPayload) {
  return postPublic<ApiEnvelope<GenericMessageResponseData>>(
    authenticationEndpoints.signupVerifyOtp,
    payload,
  );
}

export async function signupComplete(payload: SignupCompletePayload) {
  const response = await postPublic<ApiEnvelope<AuthTokens>>(
    authenticationEndpoints.signupComplete,
    payload,
  );

  await setAuthCookies(response.data);

  return response;
}

export async function login(payload: LoginPayload) {
  const response = await postPublic<ApiEnvelope<AuthTokens>>(
    authenticationEndpoints.login,
    payload,
  );

  await setAuthCookies(response.data);

  return response;
}

export async function refreshAuth() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  const response = await getPublic<ApiEnvelope<AuthTokens>>(
    authenticationEndpoints.refresh,
    {
      headers: refreshToken
        ? {
            Authorization: `Bearer ${refreshToken}`,
            "x-refresh-token": refreshToken,
          }
        : undefined,
    },
  );

  await setAuthCookies(response.data);

  return response;
}

export async function logout() {
  try {
    await postPrivate<ApiEnvelope<GenericMessageResponseData>>(authenticationEndpoints.logout);
  } finally {
    await clearAuthCookies();
  }
}

export async function getMe(options?: { persistUserCookie?: boolean }) {
  const response = await getPrivate<ApiEnvelope<AuthMe>>(userEndpoints.me);

  if (options?.persistUserCookie) {
    await setUserCookie(response.data);
  }

  return response;
}

export async function getUserFromCookie(): Promise<AuthMe | null> {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;

  if (!userCookie) {
    return null;
  }

  try {
    return JSON.parse(userCookie) as AuthMe;
  } catch {
    return null;
  }
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  return Boolean(cookieStore.get("accessToken")?.value);
}
