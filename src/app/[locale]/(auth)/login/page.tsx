"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

import { Link, useRouter } from "@/i18n/navigation";
import { Heading, Paragraph } from "@/components/ui";
import LoginForm from "@/components/auth/LoginForm";

function LoginPageInner() {
  const t = useTranslations("common.authModal");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <Heading as="h1" size="2xl" weight="bold" className="text-neutral-900">
          {t("signIn")}
        </Heading>
        <Paragraph size="sm" color="muted">
          {t("loginSubtitle")}
        </Paragraph>
      </div>

      <LoginForm
        onSuccess={() => router.replace(safeCallback(callbackUrl))}
        switchToSignup={
          <Paragraph className="mt-4 text-center text-xs text-neutral-600" color="default">
            {t("dontHaveAccount")}{" "}
            <Link
              href={signupHref(callbackUrl)}
              className="font-semibold text-emerald-600 hover:underline"
            >
              {t("signUp")}
            </Link>
          </Paragraph>
        }
      />
    </div>
  );
}

/** Only allow same-origin relative callbacks to avoid open-redirects. */
function safeCallback(callbackUrl: string | null): string {
  if (callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")) {
    return callbackUrl;
  }
  return "/";
}

function signupHref(callbackUrl: string | null): string {
  const safe = safeCallback(callbackUrl);
  return safe === "/" ? "/signup" : `/signup?callbackUrl=${encodeURIComponent(safe)}`;
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}
