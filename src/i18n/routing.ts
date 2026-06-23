import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
    // A list of all locales that are supported
    locales: ["en", "bn"],

    // Used when no locale matches
    defaultLocale: "en",

    // Default locale (en) serves URLs without a prefix (e.g. `/delete-account`);
    // non-default locales stay prefixed (e.g. `/bn/delete-account`).
    localePrefix: "as-needed",
});