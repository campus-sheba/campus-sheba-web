import "@/app/globals.css";

import type { Metadata } from "next";
import { Suspense } from "react";
import { Urbanist } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { Toaster } from "sonner";

import { routing } from "@/i18n/routing";
import Loading from "@/components/common/Loading";
import Navbar from "@/components/siteSettings/navbar/Navbar";
import Footer from "@/components/siteSettings/footer/Footer";
import CartButton from "@/modules/cart/CartButton";
import { LayoutClientProviders } from "@/components/providers/LayoutClientProviders";

const urbanist = Urbanist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Campus Sheba — Your Campus. Your World.",
    template: "%s | Campus Sheba",
  },
  description:
    "Campus Sheba is a 360-degree campus lifestyle platform connecting students, educators, and service providers in one seamless ecosystem. Food delivery, books, marketplace, blood bank, and more.",
  keywords: [
    "campus sheba",
    "student app",
    "campus delivery",
    "book exchange",
    "blood bank",
    "student marketplace",
    "tuition",
    "campus services",
    "bangladesh university",
    "student entrepreneur",
  ],
  authors: [{ name: "Campus Sheba Team" }],
  creator: "Campus Sheba",
  metadataBase: new URL("https://campussheba.com"),
  openGraph: {
    title: "Campus Sheba — Your Campus. Your World.",
    description:
      "A 360-degree campus lifestyle platform for students, educators, and service providers.",
    siteName: "Campus Sheba",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Campus Sheba",
    description: "Everything you need for campus life in one place.",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * Authenticated site chrome rendered inside every locale tree.
 * Kept separate from providers so provider wiring reads top-down without
 * being interleaved with layout markup.
 */
function AppShell({ locale, children }: { locale: string; children: React.ReactNode }) {
  return (
    <Suspense fallback={<Loading />}>
      <Navbar locale={locale} />
      <main className="pt-[calc(var(--navbar-height)+var(--topbar-height))]">
        {children}
      </main>
      <Footer />
      <CartButton />
    </Suspense>
  );
}

export default async function RootLayout({
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
    <html lang={locale} className={urbanist.className} data-scroll-behavior="smooth">
      <body className="antialiased font-body bg-white text-neutral-900">
        <NextIntlClientProvider messages={messages}>
          <LayoutClientProviders>
            <AppShell locale={locale}>{children}</AppShell>
            <Toaster
              position="top-right"
              richColors
              closeButton
              toastOptions={{
                style: {
                  fontFamily: "var(--font-inter)",
                  borderRadius: "12px",
                },
              }}
            />
          </LayoutClientProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
