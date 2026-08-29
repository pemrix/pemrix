"use client";

import {
  ArrowRight,
  BookOpen,
  Layers,
  Rocket,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Folder, Item, Node, Root } from "fumadocs-core/page-tree";

import {
  docsProductsConfig,
  type DocsProductId,
} from "@/config/docs-products";
import { getDocsPath } from "@/lib/docs-i18n";

function isFolder(node: Node): node is Folder {
  return node.type === "folder";
}

function isItem(node: Node): node is Item {
  return node.type === "page";
}

function getNodeUrl(node: Node): string | undefined {
  if (isItem(node)) return node.url;
  if (isFolder(node) && node.index) return node.index.url;
  return undefined;
}

function getNodeDescription(node: Node): React.ReactNode {
  if (isFolder(node)) return node.description;
  if (isItem(node)) return node.description;
  return null;
}

interface DocsLandingPageProps {
  pageTree: Root;
  product: DocsProductId;
}

function getQuickLinks(product: DocsProductId, locale: string) {
  return [
    {
      title: "Quickstart",
      href: getDocsPath(locale, "/docs/getting-started"),
      description: "Install PEMRIX and join the testnet in minutes.",
    },
    {
      title: "Validators",
      href: getDocsPath(locale, "/docs/validators"),
      description: "Run a validator node and secure the network.",
    },
    {
      title: "API Reference",
      href: getDocsPath(locale, "/docs/api"),
      description: "Explore RPC endpoints and response schemas.",
    },
    {
      title: "Developers",
      href: getDocsPath(locale, "/docs/developers"),
      description: "Official SDKs and integration guides.",
    },
  ];
}

export function DocsLandingPage({ pageTree, product }: DocsLandingPageProps) {
  const t = useTranslations("docs");
  const locale = useLocale();

  useEffect(() => {
    const layout = document.getElementById("nd-docs-layout");
    layout?.classList.add("docs-landing");
    return () => layout?.classList.remove("docs-landing");
  }, []);

  const categories = pageTree.children.filter(isFolder);
  const productConfig = docsProductsConfig[product];
  const productName = productConfig?.name ?? "PEMRIX";
  const quickLinks = getQuickLinks(product, locale);

  return (
    <div className="flex flex-col gap-14">
      {/* Hero */}
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-fd-accent/10 via-fd-background to-fd-accent/5 px-6 py-14 sm:px-10 sm:py-18">
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <Badge
            variant="secondary"
            className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-fd-background/80 px-3 py-1 text-xs font-medium text-[var(--docs-accent)] backdrop-blur-sm"
          >
            <Sparkles className="size-3.5" />
            {t("landing.heroBadge", { product: productName })}
          </Badge>
          <h1 className="mb-5 text-4xl font-bold tracking-tight text-fd-foreground sm:text-5xl">
            {t("landing.heroTitle", { product: productName })}
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-fd-muted-foreground">
            {t("landing.heroDescription", { product: productName })}
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="h-11 gap-2 rounded-full bg-[var(--docs-accent)] px-6 text-white hover:bg-[var(--docs-accent)]/90"
              onClick={() => {
                const trigger = document.querySelector(
                  "[data-search-full]"
                ) as HTMLElement | null;
                trigger?.click();
              }}
            >
              <Search className="size-4" />
              {t("landing.searchDocs")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-11 gap-2 rounded-full border-fd-border px-6 bg-fd-background hover:bg-fd-accent/5 hover:text-[var(--docs-accent)]"
              asChild
            >
              <Link href="/docs/getting-started">
                <Rocket className="size-4" />
                {t("landing.quickstart")}
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Quick links */}
      <section aria-labelledby="quick-links-heading">
        <div className="mb-5 flex items-center gap-2">
          <Zap className="size-5 text-[var(--docs-accent)]" />
          <h2
            id="quick-links-heading"
            className="text-lg font-semibold tracking-tight text-fd-foreground"
          >
            {t("landing.popularGuides")}
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group rounded-xl bg-fd-muted/40 p-4 transition-colors hover:bg-[var(--docs-accent-soft)]"
            >
              <h3 className="mb-1 flex items-center gap-1.5 font-semibold text-fd-foreground">
                {link.title}
                <ArrowRight className="size-3.5 text-fd-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--docs-accent)]" />
              </h3>
              <p className="text-sm text-fd-muted-foreground">
                {link.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section aria-labelledby="categories-heading">
        <div className="mb-5 flex items-center gap-2">
          <Layers className="size-5 text-[var(--docs-accent)]" />
          <h2
            id="categories-heading"
            className="text-lg font-semibold tracking-tight text-fd-foreground"
          >
            {t("landing.browseByTopic")}
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const url = getNodeUrl(category);
            const description = getNodeDescription(category);
            const childCount = category.children.filter(
              (c) => c.type === "page" || c.type === "folder"
            ).length;

            const card = (
              <div className="group h-full rounded-xl bg-fd-muted/40 p-4 transition-colors hover:bg-[var(--docs-accent-soft)]">
                <div className="mb-3 flex items-center gap-3">
                  {category.icon ? (
                    <div className="flex size-10 items-center justify-center rounded-lg bg-fd-background text-[var(--docs-accent)] shadow-sm">
                      {category.icon}
                    </div>
                  ) : (
                    <div className="flex size-10 items-center justify-center rounded-lg bg-fd-background text-fd-muted-foreground shadow-sm">
                      <BookOpen className="size-5" />
                    </div>
                  )}
                  <h3 className="text-base font-semibold text-fd-foreground">
                    {category.name}
                  </h3>
                </div>
                <p className="mb-4 line-clamp-2 text-sm text-fd-muted-foreground">
                  {description ?? t("landing.articles", { count: childCount })}
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--docs-accent)]">
                  {t("landing.explore")}
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            );

            return url ? (
              <Link
                key={category.$id ?? category.name?.toString()}
                href={url}
                className="block"
              >
                {card}
              </Link>
            ) : (
              <div
                key={category.$id ?? category.name?.toString()}
                className="block"
              >
                {card}
              </div>
            );
          })}
        </div>
      </section>

      {/* API CTA */}
      <section className="rounded-3xl bg-gradient-to-r from-fd-accent/10 to-fd-accent/5 px-6 py-10 sm:px-10">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="mb-2 text-2xl font-semibold tracking-tight text-fd-foreground">
              {t("landing.readyToIntegrate")}
            </h2>
            <p className="max-w-xl text-fd-muted-foreground">
              {t("landing.apiReferenceCta")}
            </p>
          </div>
          <Button
            className="h-11 gap-2 rounded-full bg-[var(--docs-accent)] px-6 text-white hover:bg-[var(--docs-accent)]/90"
            asChild
          >
            <Link href={getDocsPath(locale, "/docs/api")}>
              {t("landing.apiReference")}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
