"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import * as React from "react";

import {
  SearchableSelect,
  type SearchableSelectOption,
} from "@/components/ui/searchable-select";
import { routing } from "@/i18n/routing";

function replaceLocalePrefix(pathname: string, nextLocale: string): string {
  const withoutPrefix = pathname.replace(/^\/(hi|ar)(\/|$)/, "/");
  if (nextLocale === routing.defaultLocale) return withoutPrefix;
  return withoutPrefix === "/" ? `/${nextLocale}` : `/${nextLocale}${withoutPrefix}`;
}

export function LanguageSwitcher() {
  const t = useTranslations("docs.language");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const options: SearchableSelectOption[] = React.useMemo(
    () =>
      routing.locales.map((code) => ({
        value: code,
        label: t(code),
      })),
    [t]
  );

  function onChange(nextLocale: string) {
    startTransition(() => {
      document.cookie = `NEXT_LOCALE=${nextLocale};path=/;max-age=31536000;SameSite=Lax`;
      router.push(replaceLocalePrefix(pathname, nextLocale));
    });
  }

  return (
    <SearchableSelect
      options={options}
      value={locale}
      onChange={onChange}
      placeholder={t(locale as "en" | "hi" | "ar")}
      searchPlaceholder={t("label")}
      disabled={isPending}
      triggerClassName="h-9 w-auto min-w-[6rem] rounded-lg border-0 bg-muted px-3 text-sm text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
      contentClassName="min-w-[8rem]"
    />
  );
}
