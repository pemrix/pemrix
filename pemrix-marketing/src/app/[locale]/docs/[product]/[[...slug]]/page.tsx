import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page";
import { notFound } from "next/navigation";

import { DocsLandingPage } from "@/components/docs/docs-landing-page";
import { PageActionsDropdown } from "@/components/docs/page-actions-dropdown";
import { getMDXComponents } from "@/components/mdx-components";
import { getDocsProductConfig, docsProductIds, isDocsProduct } from "@/config/docs-products";
import { routing } from "@/i18n/routing";
import { getDocsSource } from "@/lib/docs-source";

export default async function Page(props: {
  params: Promise<{ locale: string; product: string; slug?: string[] }>;
}) {
  const params = await props.params;

  if (!routing.locales.includes(params.locale as (typeof routing.locales)[number])) {
    notFound();
  }

  if (!isDocsProduct(params.product)) {
    notFound();
  }

  const source = getDocsSource();
  const page = source.getPage(params.slug);
  if (!page) notFound();

  // Render a custom landing page for /docs/[product] root.
  const isRoot = !params.slug || params.slug.length === 0;
  if (isRoot) {
    return (
      <DocsPage
        toc={page.data.toc}
        full={page.data.full}
        tableOfContent={{
          container: {
            className: "pt-0",
          },
        }}
        tableOfContentPopover={{ enabled: true }}
      >
        <DocsLandingPage
          pageTree={source.pageTree}
          product={params.product}
        />
      </DocsPage>
    );
  }

  const MDX = page.data.body;
  const markdownUrl = `/api/docs/markdown?slug=${page.slugs.join(",")}`;

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      tableOfContent={{
        container: {
          className: "pt-0",
        },
      }}
      tableOfContentPopover={{ enabled: true }}
    >
      <div className="flex items-start justify-between gap-4">
        <DocsTitle>{page.data.title}</DocsTitle>
        <PageActionsDropdown markdownUrl={markdownUrl} />
      </div>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody className="max-w-none">
        <MDX components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  const params: { locale: string; product: string; slug?: string[] }[] = [];

  for (const locale of routing.locales) {
    for (const product of docsProductIds) {
      const { getDocsSource } = await import("@/lib/docs-source");
      const source = getDocsSource();
      const pages = source.generateParams();
      for (const p of pages) {
        params.push({ locale, product, slug: p.slug ?? [] });
      }
    }
  }

  return params;
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string; product: string; slug?: string[] }>;
}) {
  const params = await props.params;

  if (!isDocsProduct(params.product)) {
    notFound();
  }

  const source = getDocsSource();
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const productConfig = getDocsProductConfig(params.product);
  const productSuffix = productConfig ? `${productConfig.name} Docs` : "Docs";

  return {
    title: {
      absolute: `${page.data.title} | ${productSuffix}`,
    },
    description: page.data.description,
  };
}
