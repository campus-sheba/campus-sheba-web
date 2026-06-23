import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const SUPPORT = "support@campussheba.com";

const SECTIONS = [
  "acceptance",
  "service",
  "account",
  "conduct",
  "content",
  "ip",
  "disclaimer",
  "liability",
  "changes",
  "contact",
] as const;

export default async function TermsDocument() {
  const t = await getTranslations("legal.terms");

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-5xl px-6">
        {/* Masthead */}
        <div className="border-b border-gray-200 py-16 sm:py-20">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E30B12]">
            Legal · Terms
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-600">
            {t("intro")}
          </p>
          <div className="mt-8 text-[13px] text-gray-400">{t("lastUpdated")}</div>
        </div>

        {/* Sections */}
        <div className="space-y-12 py-12">
          {SECTIONS.map((key, i) => (
            <section
              key={key}
              className="grid gap-x-12 gap-y-5 border-t border-gray-200 pt-12 first:border-t-0 first:pt-0 lg:grid-cols-[200px_1fr]"
            >
              <div className="lg:sticky lg:top-10 self-start">
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E30B12]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="mt-2 text-xl font-bold leading-tight tracking-tight text-gray-900">
                  {t(`sections.${key}.title`)}
                </h2>
              </div>
              <div className="max-w-2xl whitespace-pre-line text-[15px] leading-relaxed text-gray-600">
                {t(`sections.${key}.body`)}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 py-10 text-center">
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">
            <Link href="/privacy-policy" className="transition-colors hover:text-gray-900">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-gray-900">
              Terms of Service
            </Link>
            <Link href="/delete-account" className="transition-colors hover:text-gray-900">
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
