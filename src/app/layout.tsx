import "@/app/globals.css";

import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import { Toaster } from "sonner";

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
 * Root layout — the only place that renders `<html>`/`<body>`.
 *
 * Locale-aware concerns (NextIntlClientProvider, the client provider stack, and
 * site chrome) live below in `app/[locale]/layout.tsx` and the route-group
 * layouts. Keeping the document shell here lets `global-error` and the root
 * `not-found` render even when the locale tree fails to mount.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={urbanist.className} data-scroll-behavior="smooth">
      <body className="antialiased font-body bg-white text-neutral-900">
        {children}
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
      </body>
    </html>
  );
}
