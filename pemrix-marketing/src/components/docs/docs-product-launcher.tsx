"use client";

import { DotsNine, X } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import * as React from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductLogo } from "@/components/docs/product-logo";
import {
  docsProductIds,
  docsProductsConfig,
  getDocsProductConfig,
} from "@/config/docs-products";
import { getDocsPath } from "@/lib/docs-i18n";
import { cn } from "@/lib/utils";

const ANIMATION_DURATION = 280;

export function DocsProductLauncher({ className }: { className?: string }) {
  const t = useTranslations("docs");
  const locale = useLocale();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  const currentProduct = React.useMemo(() => {
    const match = pathname.match(/^\/docs\/([^/]+)/);
    return match ? match[1] : "pemrix";
  }, [pathname]);

  const openLauncher = React.useCallback(() => {
    setMounted(true);
    requestAnimationFrame(() => {
      setOpen(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    });
  }, []);

  const closeLauncher = React.useCallback(() => {
    setOpen(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setMounted(false), ANIMATION_DURATION);
  }, []);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeLauncher();
        return;
      }
      if (e.repeat) return;
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        if (open) closeLauncher();
        else openLauncher();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, openLauncher, closeLauncher]);

  React.useEffect(() => {
    if (open) {
      document.documentElement.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return docsProductIds
      .map((id) => getDocsProductConfig(id)!)
      .filter(
        (p) =>
          !q ||
          p.name.toLowerCase().includes(q) ||
          p.shortName.toLowerCase().includes(q)
      );
  }, [query]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={openLauncher}
        className={cn(
          "text-muted-foreground hover:bg-accent hover:text-foreground size-9 rounded-lg",
          className
        )}
        aria-label={t("header.switchProduct")}
      >
        <DotsNine className="size-5" weight="regular" />
      </Button>

      {mounted &&
        createPortal(
          <div
            className={cn(
              "fixed inset-0 z-50 flex items-center justify-center backdrop-blur-2xl transition-opacity",
              isDark ? "bg-black/25" : "bg-black/10",
              open ? "opacity-100" : "opacity-0"
            )}
            style={{ transitionDuration: `${ANIMATION_DURATION}ms` }}
            onClick={closeLauncher}
            aria-hidden={!open}
          >
            <div
              className={cn(
                "transition-transform ease-out will-change-transform",
                open ? "scale-100" : "scale-[0.92]"
              )}
              style={{
                transitionDuration: `${ANIMATION_DURATION}ms`,
                transitionTimingFunction: open
                  ? "cubic-bezier(0.16, 1, 0.3, 1)"
                  : "cubic-bezier(0.7, 0, 0.84, 0)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={cn(
                  "relative flex flex-col rounded-3xl border p-6 shadow-2xl",
                  isDark
                    ? "border-white/10 bg-black/80"
                    : "border-black/10 bg-white/90"
                )}
                style={{
                  width: "min(720px, 92vw)",
                  maxHeight: "min(520px, 90vh)",
                }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2
                    className={cn(
                      "text-lg font-semibold tracking-tight",
                      isDark ? "text-white" : "text-foreground"
                    )}
                  >
                    {t("launcher.title")}
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={closeLauncher}
                    className={cn(
                      "size-8 rounded-full",
                      isDark
                        ? "text-white/70 hover:bg-white/10 hover:text-white"
                        : "text-black/60 hover:bg-black/5 hover:text-foreground"
                    )}
                    aria-label="Close"
                  >
                    <X className="size-4" />
                  </Button>
                </div>

                <div className="relative mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={cn(
                      "absolute top-1/2 left-3 size-4 -translate-y-1/2",
                      isDark ? "text-white/50" : "text-black/40"
                    )}
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.34-4.34" />
                  </svg>
                  <Input
                    ref={inputRef}
                    placeholder={t("launcher.searchPlaceholder")}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className={cn(
                      "h-10 rounded-full pl-9 pr-4 text-sm focus-visible:ring-0 focus-visible:ring-offset-0",
                      isDark
                        ? "border-white/10 bg-white/10 text-white placeholder:text-white/40"
                        : "border-black/10 bg-black/5 text-foreground placeholder:text-black/40"
                    )}
                  />
                </div>

                <div className="flex-1 overflow-y-auto">
                  {filtered.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {filtered.map((product) => {
                        const active = product.id === currentProduct;
                        return (
                          <Link
                            key={product.id}
                            href={getDocsPath(locale, `/docs/${product.id}`)}
                            onClick={closeLauncher}
                            className={cn(
                              "group flex items-center gap-3 rounded-xl p-3 transition-colors",
                              isDark
                                ? "hover:bg-white/10"
                                : "hover:bg-black/5",
                              active &&
                                (isDark
                                  ? "bg-white/10 ring-1 ring-white/20"
                                  : "bg-black/5 ring-1 ring-black/10")
                            )}
                          >
                            <ProductLogo
                              light={product.logo.light}
                              dark={product.logo.dark}
                              alt={product.logo.alt}
                              className="h-6 w-auto shrink-0"
                            />
                            <span
                              className={cn(
                                "truncate text-sm font-semibold",
                                isDark ? "text-white" : "text-foreground"
                              )}
                            >
                              {product.name}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
                      <p
                        className={cn(
                          "font-medium",
                          isDark ? "text-white/90" : "text-foreground/90"
                        )}
                      >
                        {t("launcher.noResults")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
