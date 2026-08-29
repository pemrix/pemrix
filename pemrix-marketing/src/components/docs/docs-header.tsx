"use client";

import {
  Bot,
  Box,
  Code2,
  Menu,
  Moon,
  Search,
  Sparkles,
  Sun,
  User,
} from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";

import { SidebarTrigger } from "fumadocs-ui/layouts/docs/slots/sidebar";
import { FullSearchTrigger } from "fumadocs-ui/layouts/shared/slots/search-trigger";

import { useAssistant } from "@/components/docs/assistant";
import { LanguageSwitcher } from "@/components/docs/language-switcher";
import { ProductLogo } from "@/components/docs/product-logo";
import { ProductSearchLauncher } from "@/components/docs/product-search-launcher";
import {
  docsProductIds,
  docsProductsConfig,
  fillProductHref,
  getDocsProductConfig,
  type DocsProductId,
} from "@/config/docs-products";
import Logo from "@/components/layout/logo";
import { getDocsPath } from "@/lib/docs-i18n";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex items-center justify-center rounded-md p-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      aria-label="Toggle theme"
    >
      {mounted ? (
        isDark ? <Sun className="size-4" /> : <Moon className="size-4" />
      ) : (
        <Moon className="size-4 opacity-50" />
      )}
    </button>
  );
}

function AccountButton() {
  // TODO: wire to real auth state when dashboard/login is ready.
  const isLoggedIn = false;

  return (
    <Link
      href={isLoggedIn ? "/account" : "/signin"}
      className="inline-flex items-center justify-center rounded-md p-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      aria-label={isLoggedIn ? "My account" : "Sign in"}
      title={isLoggedIn ? "My account" : "Sign in"}
    >
      <User className="size-4" />
    </Link>
  );
}

function GithubButton() {
  return (
    <a
      href="https://github.com/pemrix"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center rounded-md p-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      aria-label="GitHub"
    >
      <svg
        viewBox="0 0 16 16"
        fill="currentColor"
        className="size-4"
        aria-hidden="true"
      >
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
      </svg>
    </a>
  );
}

function AskAssistantButton() {
  const { openAssistant } = useAssistant();
  const t = useTranslations("docs");

  return (
    <button
      type="button"
      onClick={() => openAssistant()}
      className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg border-0 bg-muted px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      <Sparkles className="size-4" />
      {t("header.askAssistant")}
    </button>
  );
}

const defaultProduct: DocsProductId = "pemrix";

export function DocsHeader() {
  const t = useTranslations("docs");
  const locale = useLocale();
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const product = useMemo(() => {
    const match = pathname.match(/^\/docs\/([^/]+)/);
    const id = match?.[1];
    return id && docsProductIds.includes(id as typeof defaultProduct)
      ? (id as typeof defaultProduct)
      : defaultProduct;
  }, [pathname]);

  const productConfig = getDocsProductConfig(product);
  const sectionTitles: Record<string, string> = {
    docs: t("nav.docs"),
    "api-reference": t("nav.apiReference"),
    "client-sdks": t("nav.clientSdks"),
    "agent-sdk": t("nav.agentSdk"),
    cookbook: t("nav.cookbook"),
  };

  const sections = useMemo(
    () =>
      productConfig?.sections.map((s) => ({
        ...s,
        title: sectionTitles[s.id] ?? s.title,
        href: getDocsPath(locale, fillProductHref(s.href, product)),
      })) ?? [],
    [productConfig, product, locale]
  );

  return (
    <header className="[grid-area:header] sticky top-0 z-30 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top bar */}
      <div className="mx-auto flex h-14 w-full max-w-[1408px] items-center px-4 lg:px-6">
        <SidebarTrigger className="-ms-2 mr-2 inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground md:hidden">
          <Menu className="size-5" />
        </SidebarTrigger>

        <Link href={getDocsPath(locale, `/docs/${product}`)} className="flex items-center gap-2">
          {product === "pemrix" ? (
            <Logo noLink className="text-lg" iconClassName="size-6" isDark={isDark} />
          ) : (
            <>
              <ProductLogo
                light={productConfig?.logo?.light ?? "/layout/logo.svg"}
                dark={productConfig?.logo?.dark}
                alt={productConfig?.logo?.alt ?? productConfig?.shortName ?? "PEMRIX"}
                className="h-6 w-auto"
                isDark={isDark}
              />
              <span className="text-lg font-semibold tracking-tight text-foreground">
                {productConfig?.shortName ?? "PEMRIX"}
              </span>
            </>
          )}
        </Link>

        <nav className="ms-auto hidden items-center gap-1 text-sm md:flex">
          <FullSearchTrigger className="h-9 w-56 justify-start gap-2 rounded-lg !border-0 bg-muted px-3 text-sm text-muted-foreground ring-0 shadow-none transition-colors hover:bg-accent hover:text-foreground lg:w-72">
            <Search className="size-4" />
            <span className="flex-1 text-left">{t("header.searchPlaceholder")}</span>
            <kbd className="rounded border-0 bg-background px-1 py-0 text-[10px] leading-none">
              {t("header.searchShortcut")}
            </kbd>
          </FullSearchTrigger>

          <AskAssistantButton />

          <LanguageSwitcher />
          <ProductSearchLauncher locale={locale} />
          <ThemeToggle />
          <AccountButton />
          <GithubButton />
        </nav>
      </div>

      {/* Secondary docs tabs */}
      <div className="mx-auto flex h-12 w-full max-w-[1408px] items-center gap-1 overflow-x-auto whitespace-nowrap px-3 lg:px-4 scrollbar-hide">
        {sections.map((tab) => {
          const Icon = tab.icon;
          const active =
            pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${
                active
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {tab.title}
              {active && (
                <span className="absolute inset-x-3 -bottom-[9px] h-0.5 rounded-full bg-[var(--docs-accent)]" />
              )}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
