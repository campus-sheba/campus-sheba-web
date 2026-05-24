"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

import { normalizeCallbackPath } from "@/i18n/callbackUrl";
import { Link, useRouter } from "@/i18n/navigation";
import { Heading, Paragraph } from "@/components/ui";
import SignupForm from "@/components/auth/SignupForm";

function SignupPageInner() {
  const t = useTranslations("common.authModal");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <Heading as="h1" size="2xl" weight="bold" className="text-neutral-900">
          {t("createAccount")}
        </Heading>
        <Paragraph size="sm" color="muted">
          {t("signupSubtitle")}
        </Paragraph>
      </div>

      <SignupForm
        onSuccess={() => router.replace(safeCallback(callbackUrl))}
        switchToLogin={
          <Paragraph className="mt-4 text-center text-xs text-neutral-600" color="default">
            {t("alreadyHaveAccount")}{" "}
            <Link
              href={loginHref(callbackUrl)}
              className="font-semibold text-[#E30B12] hover:underline"
            >
              {t("signIn")}
            </Link>
          </Paragraph>
        }
      />
    </div>
  );
}

/** Only allow same-origin relative callbacks to avoid open-redirects. */
function safeCallback(callbackUrl: string | null): string {
  return normalizeCallbackPath(callbackUrl);
}

function loginHref(callbackUrl: string | null): string {
  const safe = safeCallback(callbackUrl);
  return safe === "/" ? "/login" : `/login?callbackUrl=${encodeURIComponent(safe)}`;
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupPageInner />
    </Suspense>
  );
}
