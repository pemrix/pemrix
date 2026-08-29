import { defineRouting } from "next-intl/routing";

/**
 * Supported locales for the docs site.
 *
 * `localePrefix: "as-needed` exposes /docs/quanvio for the default locale
 * (English) and /hi/docs/quanvio, /ar/docs/quanvio for other locales.
 * Cloudflare can later redirect users from /docs/quanvio to the appropriate
 * locale based on CF-IPCountry or a cookie.
 */
export const routing = defineRouting({
  locales: ["en", "hi", "ar"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});

export const RTL_LOCALES = new Set(["ar"]);
