"use client";

import { useEffect, useState } from "react";
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
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <SectionWrapper
          spacing="none"
          background="transparent"
          className="my-0 border-b border-neutral-100 px-6 py-4"
        >
          <div className="flex items-center justify-between">
            <Title as="h2" size="lg" weight="semibold" className="text-neutral-900">
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

        <SectionWrapper spacing="none" background="transparent" className="my-0 p-6">
          {activeTab === "login" ? (
            <LoginForm
              onSuccess={onClose}
              switchToSignup={
                <Paragraph className="mt-4 text-center text-xs text-neutral-600" color="default">
                  {t("dontHaveAccount")}{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("signup")}
                    className="font-semibold text-emerald-600 hover:underline"
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
                <Paragraph className="mt-4 text-center text-xs text-neutral-600" color="default">
                  {t("alreadyHaveAccount")}{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("login")}
                    className="font-semibold text-emerald-600 hover:underline"
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
