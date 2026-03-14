import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
    // A list of all locales that are supported
    locales: ["en", "bn"],

    // Used when no locale matches
    defaultLocale: "en",

    // Always prefix locales in the URL (including the default locale),
    // so that routes like `/en` and `/bn` exist and `/` can redirect properly.
    localePrefix: "always",
});