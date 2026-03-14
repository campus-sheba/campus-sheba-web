import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import "@/app/globals.css";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Loading from "@/components/common/Loading";
import Navbar from "@/components/siteSettings/navbar/Navbar";
import Footer from "@/components/siteSettings/footer/Footer";
import CartButton from "@/components/cart/CartButton";
import { Toaster } from "sonner";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
    "campus sheba", "student app", "campus delivery", "book exchange",
    "blood bank", "student marketplace", "tuition", "campus services",
    "bangladesh university", "student entrepreneur",
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
    <html lang={locale} className={`${sora.variable} ${inter.variable}`}>
      <body className="antialiased font-body bg-white text-neutral-900">
        <NextIntlClientProvider messages={messages}>
          <Suspense fallback={<Loading />}>
            <Navbar locale={locale} />
            <main>{children}</main>
            <Footer locale={locale} />
            <CartButton locale={locale} />
          </Suspense>
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
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
