import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";

import { routing } from "@/i18n/routing";
import { LayoutClientProviders } from "@/components/providers/LayoutClientProviders";

/**
 * Locale layout — validates the `[locale]` segment, loads its messages, and
 * mounts the i18n + global client-provider stack. Site chrome is intentionally
 * not here: each route group (`(public)`, `(protected)`, `(auth)`) owns its own
 * shell so auth pages can render chrome-free.
 */
export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LayoutClientProviders>{children}</LayoutClientProviders>
    </NextIntlClientProvider>
  );
}
