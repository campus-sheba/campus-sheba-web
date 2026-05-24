"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

import { normalizeCallbackPath } from "@/i18n/callbackUrl";
import { Link, useRouter } from "@/i18n/navigation";
import { Heading, Paragraph } from "@/components/ui";
import LoginForm from "@/components/auth/LoginForm";

function LoginPageInner() {
  const t = useTranslations("common.authModal");

  const router = useRouter();

  const searchParams = useSearchParams();

  const callbackUrl = searchParams.get("callbackUrl");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-3 text-center">
        <Heading as="h1" size="3xl" weight="bold" className="text-neutral-900">
          {t("signIn")}
        </Heading>

        <Paragraph
          size="sm"
          color="muted"
          className="mx-auto max-w-sm leading-6"
        >
          {t("loginSubtitle")}
        </Paragraph>
      </div>

      {/* Form */}
      <LoginForm
        onSuccess={() => router.replace(safeCallback(callbackUrl))}
        switchToSignup={
          <Paragraph
            className="mt-6 text-center text-sm text-neutral-600"
            color="default"
          >
            {t("dontHaveAccount")}{" "}
            <Link
              href={signupHref(callbackUrl)}
              className="font-semibold text-[#E30B12] transition-colors hover:text-[#c10810] hover:underline"
            >
              {t("signUp")}
            </Link>
          </Paragraph>
        }
      />
    </div>
  );
}

/**
 * Prevent open redirects. With no (or an unusable) callbackUrl, land the user
 * on their profile rather than the home page.
 */
function safeCallback(callbackUrl: string | null): string {
  const normalized = normalizeCallbackPath(callbackUrl);
  return normalized === "/" ? "/profile" : normalized;
}

function signupHref(callbackUrl: string | null): string {
  const safe = safeCallback(callbackUrl);

  return safe === "/"
    ? "/signup"
    : `/signup?callbackUrl=${encodeURIComponent(safe)}`;
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}
