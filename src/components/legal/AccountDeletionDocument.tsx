import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const SUPPORT = "support@campussheba.com";

const STEPS = ["1", "2", "3", "4", "5", "6"] as const;

export default async function AccountDeletionDocument() {
  const t = await getTranslations("legal.accountDeletion");

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-5xl px-6">
        <div className="border-b border-gray-200 py-16 sm:py-20">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E30B12]">
            Legal · Account
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-600">
            {t("intro")}
          </p>
          <div className="mt-8 text-[13px] text-gray-400">{t("lastUpdated")}</div>
        </div>

        <div className="py-12">
          <h2 className="text-xl font-bold tracking-tight text-gray-900">
            {t("processTitle")}
          </h2>

          <ol className="mt-8 space-y-5">
            {STEPS.map((step) => (
              <li
                key={step}
                className="flex gap-4 rounded-xl border border-gray-200 bg-gray-50/60 px-5 py-4"
              >
                <span
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E30B12]/10 text-[#E30B12]"
                  aria-hidden
                >
                  <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </span>
                <p className="text-[15px] leading-relaxed text-gray-700">
                  <span className="mr-2 font-semibold text-gray-900">{step}.</span>
                  {t(`steps.${step}`)}
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-10 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-800">
              {t("note.title")}
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-amber-950/80">
              {t("note.body")}
            </p>
          </div>

          <section className="mt-12 border-t border-gray-200 pt-12">
            <h2 className="text-xl font-bold tracking-tight text-gray-900">
              {t("contact.title")}
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-gray-600">
              {t("contact.body")}{" "}
              <a
                href={`mailto:${SUPPORT}`}
                className="font-medium text-[#E30B12] underline-offset-2 hover:underline"
              >
                {SUPPORT}
              </a>
              .
            </p>
          </section>
        </div>
      </div>

      <footer className="border-t border-gray-200">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 py-10 text-center">
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">
            <Link href="/privacy-policy" className="transition-colors hover:text-gray-900">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-gray-900">
              Terms of Service
            </Link>
            <Link href="/account-deletion" className="transition-colors hover:text-gray-900">
              Account Deletion
            </Link>
            <a href={`mailto:${SUPPORT}`} className="transition-colors hover:text-gray-900">
              Support
            </a>
          </nav>
          <p className="text-[13px] text-gray-400">© 2026 Campus Sheba. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
