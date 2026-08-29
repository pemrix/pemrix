import { redirect } from "next/navigation";

import { routing } from "@/i18n/routing";

export default async function DocsIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const prefix =
    locale === routing.defaultLocale ? "" : `/${locale}`;
  redirect(`${prefix}/docs/pemrix`);
}

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
