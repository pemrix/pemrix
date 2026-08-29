"use client";

import { useEffect } from "react";

export function DocsHtmlAttributes({
  locale,
  dir,
}: {
  locale: string;
  dir: "ltr" | "rtl";
}) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    return () => {
      document.documentElement.lang = "en";
      document.documentElement.dir = "ltr";
    };
  }, [locale, dir]);

  return null;
}
