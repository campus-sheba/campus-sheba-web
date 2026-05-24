"use server";

import { redirect } from "@/i18n/navigation";
import { logout } from "@/services/auth";
import { unsubscribeUserNotifications } from "@/services/notifications";
import { getPrivate } from "@/utils/api/get";
import { patchPrivate } from "@/utils/api/patch";
import { postPrivate } from "@/utils/api/post";
import { putPrivate } from "@/utils/api/put";
import { cookies } from "next/headers";
import {
    universityMetadataEndpoints,
    userEndpoints,
    userProfileEndpoints,
} from "@/utils/endpoints/endpoints";
import type { ApiEnvelope, AuthMe } from "@/types/auth";
import type { University } from "@/types/global";

export async function logoutAction(locale: string) {
    const cookieStore = await cookies();
    const webPushToken = cookieStore.get("webPushToken")?.value;
    const webPushDeviceId = cookieStore.get("webPushDeviceId")?.value;

    if (webPushToken) {
        await unsubscribeUserNotifications({
            token: webPushToken,
            fcmToken: webPushToken,
            platform: "web",
            appChannel: "customer",
            deviceId: webPushDeviceId,
        }).catch(() => undefined);
    }

    await logout();
    cookieStore.delete("webPushToken");
    cookieStore.delete("webPushDeviceId");
    redirect({ href: "/", locale });
}

type MetadataItem = {
    _id: string;
    name: string;
    code?: string;
};

type UniversityMetadataResponse = {
    halls?: MetadataItem[];
    departments?: MetadataItem[];
};

export type ProfilePayload = {
    name?: string;
    bio?: string;
    gender?: string;
    isNotificationEnabled?: boolean;
    accountType?: string;
    blood?: string;
    university?: string;
    hall?: string;
    roomNo?: string;
    campus?: string;
    birthDate?: string;
    registrationNo?: string;
    rollNumber?: string;
    session?: string;
    subject?: string;
    teacherId?: string;
    designation?: string;
    department?: string;
    employeeId?: string;
    description?: string;
    photo?: { url: string; key: string; size: number };
};

export async function getProfileAction() {
    try {
        const response = await getPrivate<ApiEnvelope<DashboardProfile>>(userEndpoints.me);
        return { success: true as const, data: response.data };
    } catch (error) {
        return {
            success: false as const,
            message: error instanceof Error ? error.message : "Failed to load profile",
            data: null,
        };
    }
}

export async function getUniversityMetadataAction(universityId?: string) {
    try {
        const query = universityId ? `?universityId=${encodeURIComponent(universityId)}` : "";
        const response = await getPrivate<UniversityMetadataResponse>(
            `${universityMetadataEndpoints.base}${query}`,
        );
        return {
            success: true as const,
            halls: response.halls ?? [],
            departments: response.departments ?? [],
        };
    } catch (error) {
        return {
            success: false as const,
            message: error instanceof Error ? error.message : "Failed to load metadata",
            halls: [] as MetadataItem[],
            departments: [] as MetadataItem[],
        };
    }
}

export async function updateProfileAction(payload: ProfilePayload) {
    try {
        const response = await patchPrivate<ApiEnvelope<AuthMe>>(userEndpoints.update, payload);
        return { success: true as const, data: response.data };
    } catch (error) {
        return {
            success: false as const,
            message: error instanceof Error ? error.message : "Failed to update profile",
        };
    }
}

export async function updateUserLocationAction(latitude: number, longitude: number) {
    try {
        await patchPrivate(userEndpoints.updateLocation, { latitude, longitude });
        return { success: true as const };
    } catch (error) {
        return {
            success: false as const,
            message: error instanceof Error ? error.message : "Failed to update location",
        };
    }
}

export async function sendUpdateEmailCodeAction(email: string) {
    try {
        await postPrivate(userProfileEndpoints.updateEmailSendCode, { email });
        return { success: true as const };
    } catch (error) {
        return {
            success: false as const,
            message: error instanceof Error ? error.message : "Failed to send email code",
        };
    }
}

export async function verifyUpdateEmailAction(email: string, code: string) {
    try {
        await putPrivate(userProfileEndpoints.updateEmailVerify, { email, code });
        return { success: true as const };
    } catch (error) {
        return {
            success: false as const,
            message: error instanceof Error ? error.message : "Failed to verify email",
        };
    }
}

/** Send a verification code to the student's institutional email. */
export async function sendStudentVerificationCodeAction(email: string) {
    try {
        await postPrivate(userProfileEndpoints.studentVerificationSendCode, { email });
        return { success: true as const };
    } catch (error) {
        return {
            success: false as const,
            message:
                error instanceof Error ? error.message : "Failed to send verification code",
        };
    }
}

/** Verify the emailed code and mark the account as a verified student. */
export async function verifyStudentAccountAction(email: string, code: string) {
    try {
        await putPrivate(userProfileEndpoints.studentVerificationVerify, { email, code });
        return { success: true as const };
    } catch (error) {
        return {
            success: false as const,
            message: error instanceof Error ? error.message : "Failed to verify student account",
        };
    }
}

export type DashboardProfile = AuthMe & {
    bio?: string;
    blood?: string;
    accountType?: string;
    registrationNo?: string;
    rollNumber?: string;
    session?: string;
    subject?: string;
    department?: string | { _id?: string; name?: string; code?: string } | null;
    hall?: string | { _id?: string; name?: string; code?: string } | null;
    hallName?: string;
    roomNo?: string;
    campus?: string;
    university?: University | string | null;
    referralCode?: string;
    totalReferrals?: number;
    // Student-account verification via institutional email.
    studentEmail?: string;
    isStudentVerified?: boolean;
    studentVerifiedAt?: string | null;
};
