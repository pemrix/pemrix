import { routing } from "@/i18n/routing";

/**
 * Returns the locale path prefix for docs URLs.
 * With `localePrefix: "as-needed"`, the default locale (English) has no prefix.
 */
export function getDocsPathPrefix(locale: string): string {
  if (locale === routing.defaultLocale) return "";
  return `/${locale}`;
}

/**
 * Build a locale-aware docs URL.
 */
export function getDocsPath(locale: string, path: string): string {
  const prefix = getDocsPathPrefix(locale);
  // `path` should start with `/docs/...`
  return `${prefix}${path}`;
}
