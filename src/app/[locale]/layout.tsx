import type { Metadata } from "next";
import { Roboto_Condensed } from "next/font/google";
import "@/app/globals.css";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { Toaster } from "sonner";
import { Suspense } from "react";
import Loading from "@/components/common/Loading";
import Navbar from "@/components/siteSettings/navbar/Navbar";
import Footer from "@/components/siteSettings/footer/Footer";

const robotoCondensed = Roboto_Condensed({
  variable: "--font-roboto-condensed",
  subsets: ["latin"],
});

// While in coming-soon mode the whole site is rewritten to the coming-soon page,
// so the global Navbar/Footer are hidden to keep it clean.
const COMING_SOON = process.env.NEXT_PUBLIC_COMING_SOON === "true";

export const metadata: Metadata = {
  title: "Campus Sheba",
  description:
    "Campus Sheba is the digital home of campus life — one app to explore, move, eat, shop, and connect across your campus.",
  icons: {
    icon: "/favicon.ico",
  },
};

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
    <html lang={locale}>
      <body className={`${robotoCondensed.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <Suspense fallback={<Loading />}>
            {!COMING_SOON && <Navbar />}
            {children}
            {!COMING_SOON && <Footer />}
          </Suspense>
          <Toaster position="top-right" richColors closeButton />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
