import { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";

const BASE_URL = "https://campussheba.com";

/** Public, indexable top-level routes (locale prefix added per-locale below). */
const PUBLIC_PATHS = [
  "", // landing
  "/explore",
  "/marketplace",
  "/food",
  "/books",
  "/buy-sell",
  "/lost-found",
  "/blood-bank",
  "/campus-map",
  "/emergency-contacts",
  "/parcel",
  "/search",
  "/privacy-policy",
  "/terms-condition",
  "/login",
  "/signup",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return routing.locales.flatMap((locale) =>
    PUBLIC_PATHS.map((path) => ({
      url: `${BASE_URL}/${locale}${path}`,
      lastModified: now,
      changeFrequency: path === "" ? "daily" : "weekly",
      priority: path === "" ? 1 : 0.7,
    })),
  );
}
