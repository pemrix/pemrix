import "./docs.css";

import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";

import { baseOptions } from "@/app/layout.config";
import { DocsAssistant } from "@/components/docs/assistant";
import { DocsHeader } from "@/components/docs/docs-header";
import { DocsHtmlAttributes } from "@/components/docs/docs-html-attributes";
import { DocsSidebarBanner } from "@/components/docs/docs-sidebar-banner";
import { EmptySlot } from "@/components/docs/empty-slot";
import { routing, RTL_LOCALES } from "@/i18n/routing";
import { getDocsSource, isDocsProduct } from "@/lib/docs-source";

export default async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string; product?: string }>;
}) {
  const { locale, product } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    return null;
  }

  const messages = await getMessages();
  const dir = RTL_LOCALES.has(locale) ? "rtl" : "ltr";

  const docsProduct = product && isDocsProduct(product) ? product : "quanvio";
  const source = getDocsSource(docsProduct);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <DocsHtmlAttributes locale={locale} dir={dir} />
      <div data-docs-locale={locale} data-docs-dir={dir}>
        <DocsAssistant>
          <DocsLayout
            tree={source.pageTree}
            {...baseOptions}
            tabs={false}
            sidebar={{
              banner: <DocsSidebarBanner />,
              collapsible: false,
              defaultOpenLevel: 1,
            }}
            slots={{
              header: DocsHeader,
              themeSwitch: EmptySlot,
              searchTrigger: false,
            }}
          >
            {children}
          </DocsLayout>
        </DocsAssistant>
      </div>
    </NextIntlClientProvider>
  );
}
