"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { Paragraph, Title } from "@/components/ui";
import { SectionWrapper } from "@/components/wrappers";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";

type AuthTab = "login" | "signup";

type AuthModalProps = {
  isOpen: boolean;
  defaultTab?: AuthTab;
  onClose: () => void;
};

/**
 * Inline auth modal — a thin shell around the shared LoginForm / SignupForm so
 * it stays in lock-step with the dedicated /login and /signup pages. On success
 * the modal simply closes (AppState already reflects the new session); the pages
 * redirect instead.
 */
export default function AuthModal({
  isOpen,
  defaultTab = "login",
  onClose,
}: AuthModalProps) {
  const t = useTranslations("common.authModal");
  const [activeTab, setActiveTab] = useState<AuthTab>(defaultTab);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isOpen) setActiveTab(defaultTab);
  }, [defaultTab, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-900/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Decorative brand banner */}
        <div className="relative h-28 w-full overflow-hidden bg-gradient-to-br from-rose-50 via-white to-rose-50">
          <Image
            src="/assets/images/splash-bg.png"
            alt=""
            aria-hidden
            fill
            priority
            sizes="(max-width: 768px) 100vw, 28rem"
            className="object-cover object-top opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-white" />
          <div className="absolute inset-x-0 bottom-2 flex justify-center">
            <Image
              src="/assets/images/logo-icon.svg"
              alt="Campus Sheba"
              width={44}
              height={44}
              className="h-11 w-11 drop-shadow-sm"
            />
          </div>
        </div>

        <SectionWrapper
          spacing="none"
          background="transparent"
          className="my-0 border-b border-neutral-100 px-6 py-4"
        >
          <div className="flex items-center justify-between">
            <Title
              as="h2"
              size="lg"
              weight="semibold"
              className="text-neutral-900"
            >
              {activeTab === "login" ? t("signIn") : t("createAccount")}
            </Title>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600"
              aria-label={t("close")}
            >
              ✕
            </button>
          </div>
        </SectionWrapper>

        <SectionWrapper
          spacing="none"
          background="transparent"
          className="my-0 p-6"
        >
          {activeTab === "login" ? (
            <LoginForm
              onSuccess={onClose}
              switchToSignup={
                <Paragraph
                  className="mt-4 text-center text-xs text-neutral-600"
                  color="default"
                >
                  {t("dontHaveAccount")}{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("signup")}
                    className="font-semibold text-[#E30B12] hover:underline"
                  >
                    {t("signUp")}
                  </button>
                </Paragraph>
              }
            />
          ) : (
            <SignupForm
              onSuccess={onClose}
              switchToLogin={
                <Paragraph
                  className="mt-4 text-center text-xs text-neutral-600"
                  color="default"
                >
                  {t("alreadyHaveAccount")}{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("login")}
                    className="font-semibold text-[#E30B12] hover:underline"
                  >
                    {t("signIn")}
                  </button>
                </Paragraph>
              }
            />
          )}
        </SectionWrapper>
      </div>
    </div>
  );
}
