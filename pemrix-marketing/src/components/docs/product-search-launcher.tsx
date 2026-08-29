"use client";

import {
  ArrowRight,
  BookOpen,
  Headphones,
  Lightning,
  MagnifyingGlass,
  Newspaper,
  X,
} from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import * as React from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { ProductLogo } from "@/components/docs/product-logo";
import {
  docsProductIds,
  docsProductsConfig,
  getDocsProductConfig,
  type DocsProductId,
} from "@/config/docs-products";
import { getDocsPath } from "@/lib/docs-i18n";
import { cn } from "@/lib/utils";

const ANIMATION_DURATION = 280;

export interface ProductSearchLauncherProps {
  locale?: string;
  className?: string;
}

export function ProductSearchLauncher({
  locale = "en",
  className,
}: ProductSearchLauncherProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

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
          p.description.toLowerCase().includes(q)
      );
  }, [query]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={openLauncher}
        className={cn(
          "text-muted-foreground hover:bg-accent hover:text-foreground size-9 rounded-lg border-0 focus-visible:ring-0 focus-visible:ring-offset-0",
          className
        )}
        aria-label="Product docs"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-5"
        >
          <circle cx="5" cy="5" r="1.75" />
          <circle cx="12" cy="5" r="1.75" />
          <circle cx="19" cy="5" r="1.75" />
          <circle cx="5" cy="12" r="1.75" />
          <circle cx="12" cy="12" r="1.75" />
          <circle cx="19" cy="12" r="1.75" />
          <circle cx="5" cy="19" r="1.75" />
          <circle cx="12" cy="19" r="1.75" />
          <circle cx="19" cy="19" r="1.75" />
        </svg>
      </Button>

      {mounted &&
        createPortal(
          <div
            className={cn(
              "fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 backdrop-blur-2xl transition-opacity sm:items-center",
              isDark ? "bg-black/30" : "bg-black/15",
              open ? "opacity-100" : "opacity-0"
            )}
            style={{ transitionDuration: `${ANIMATION_DURATION}ms` }}
            onClick={closeLauncher}
            aria-hidden={!open}
          >
            <div
              className={cn(
                "transition-transform ease-out will-change-transform",
                open ? "scale-100" : "scale-[0.96]"
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
                  "relative flex flex-col rounded-3xl border shadow-2xl",
                  isDark
                    ? "border-white/10 bg-[#0f0f10]/95"
                    : "border-black/10 bg-white/95"
                )}
                style={{
                  width: "min(720px, 92vw)",
                  maxHeight: "min(680px, 90vh)",
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between p-6 pb-4">
                  <div>
                    <h2
                      className={cn(
                        "text-xl font-semibold tracking-tight",
                        isDark ? "text-white" : "text-foreground"
                      )}
                    >
                      Product docs
                    </h2>
                    <p
                      className={cn(
                        "mt-1 text-sm",
                        isDark ? "text-white/60" : "text-muted-foreground"
                      )}
                    >
                      Find the docs you need, fast.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <KbdGroup className="hidden sm:flex">
                      <Kbd
                        className={cn(
                          isDark
                            ? "border-white/20 bg-white/10 text-white/70"
                            : "border-black/10 bg-black/5 text-black/60"
                        )}
                      >
                        ⌘
                      </Kbd>
                      <Kbd
                        className={cn(
                          isDark
                            ? "border-white/20 bg-white/10 text-white/70"
                            : "border-black/10 bg-black/5 text-black/60"
                        )}
                      >
                        K
                      </Kbd>
                    </KbdGroup>
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
                </div>

                {/* Search */}
                <div className="px-6 pb-4">
                  <div className="relative">
                    <MagnifyingGlass
                      className={cn(
                        "absolute top-1/2 left-3 size-4 -translate-y-1/2",
                        isDark ? "text-white/50" : "text-black/40"
                      )}
                    />
                    <Input
                      ref={inputRef}
                      placeholder='Search products, e.g. "invoices", "api", "integrations"'
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className={cn(
                        "h-11 rounded-xl pl-9 pr-20 text-sm focus-visible:ring-0 focus-visible:ring-offset-0",
                        isDark
                          ? "border-white/10 bg-white/10 text-white placeholder:text-white/40"
                          : "border-black/10 bg-black/5 text-foreground placeholder:text-black/40"
                      )}
                    />
                    <div className="absolute top-1/2 right-2 -translate-y-1/2">
                      <KbdGroup>
                        <Kbd
                          className={cn(
                            isDark
                              ? "border-white/20 bg-white/10 text-white/70"
                              : "border-black/10 bg-black/5 text-black/60"
                          )}
                        >
                          ⌘
                        </Kbd>
                        <Kbd
                          className={cn(
                            isDark
                              ? "border-white/20 bg-white/10 text-white/70"
                              : "border-black/10 bg-black/5 text-black/60"
                          )}
                        >
                          K
                        </Kbd>
                      </KbdGroup>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 pb-2">
                  {filtered.length > 0 ? (
                    <div className="space-y-6">
                      {/* Popular products */}
                      <section>
                        <div className="mb-3 flex items-center gap-2">
                          <Lightning
                            className={cn(
                              "size-4",
                              isDark ? "text-white/60" : "text-muted-foreground"
                            )}
                          />
                          <h3
                            className={cn(
                              "text-sm font-semibold",
                              isDark ? "text-white" : "text-foreground"
                            )}
                          >
                            Popular products
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {filtered.map((product) => (
                            <ProductCard
                              key={product.id}
                              product={product}
                              locale={locale}
                              isDark={isDark}
                              onClick={closeLauncher}
                            />
                          ))}
                        </div>
                      </section>

                      {/* Quick actions */}
                      <section>
                        <h3
                          className={cn(
                            "mb-3 text-sm font-semibold",
                            isDark ? "text-white" : "text-foreground"
                          )}
                        >
                          Quick actions
                        </h3>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                          <QuickAction
                            href={getDocsPath(locale, "/docs")}
                            icon={Newspaper}
                            title="What\'s new"
                            subtitle="Latest updates"
                            isDark={isDark}
                            onClick={closeLauncher}
                          />
                          <QuickAction
                            href={getDocsPath(locale, "/docs/getting-started")}
                            icon={BookOpen}
                            title="Guides"
                            subtitle="Step-by-step"
                            isDark={isDark}
                            onClick={closeLauncher}
                          />
                          <QuickAction
                            href="/contact"
                            icon={Headphones}
                            title="Contact support"
                            subtitle="Get help"
                            isDark={isDark}
                            onClick={closeLauncher}
                          />
                        </div>
                      </section>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <p
                        className={cn(
                          "font-medium",
                          isDark ? "text-white/90" : "text-foreground/90"
                        )}
                      >
                        No products found
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div
                  className={cn(
                    "flex items-center justify-between border-t px-6 py-3 text-xs",
                    isDark
                      ? "border-white/10 text-white/50"
                      : "border-black/10 text-muted-foreground"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="6" height="6" x="3" y="3" rx="1" />
                      <rect width="6" height="6" x="15" y="3" rx="1" />
                      <rect width="6" height="6" x="15" y="15" rx="1" />
                      <rect width="6" height="6" x="3" y="15" rx="1" />
                    </svg>
                    <span>
                      Tip: Use <kbd className="font-sans">↑</kbd>{" "}
                      <kbd className="font-sans">↓</kbd> to navigate,{" "}
                      <kbd className="font-sans">Enter</kbd> to select
                    </span>
                  </div>
                  <Link
                    href="/contact"
                    onClick={closeLauncher}
                    className={cn(
                      "flex items-center gap-1 transition-colors",
                      isDark
                        ? "text-white/70 hover:text-white"
                        : "text-foreground hover:text-foreground"
                    )}
                  >
                    Can&apos;t find what you need? Request docs
                  </Link>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

function ProductCard({
  product,
  locale,
  isDark,
  onClick,
}: {
  product: ReturnType<typeof getDocsProductConfig> & {};
  locale: string;
  isDark: boolean;
  onClick: () => void;
}) {
  const active = product.id === "pemrix";

  return (
    <Link
      href={getDocsPath(locale, `/docs/${product.id}`)}
      onClick={onClick}
      className={cn(
        "group relative flex items-start gap-3 rounded-2xl border p-3 transition-all",
        isDark
          ? "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
          : "border-black/5 bg-white hover:bg-black/[0.02]",
        active &&
          (isDark
            ? "bg-white/[0.06] ring-1 ring-white/20"
            : "bg-black/[0.03] ring-1 ring-black/10")
      )}
    >
      <div
        className={cn(
          "flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border p-1.5",
          isDark
            ? "border-white/10 bg-white/[0.06]"
            : "border-black/5 bg-black/[0.03]"
        )}
      >
        <ProductLogo
          light={product.logo.light}
          dark={product.logo.dark}
          alt={product.logo.alt}
          className="h-full w-full"
          isDark={isDark}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p
            className={cn(
              "font-semibold",
              isDark ? "text-white" : "text-foreground"
            )}
          >
            {product.name}
          </p>
          <span
            className={cn(
              "text-xs",
              isDark ? "text-white/50" : "text-muted-foreground"
            )}
          >
            Docs
          </span>
        </div>
        <p
          className={cn(
            "mt-0.5 line-clamp-2 text-xs leading-relaxed",
            isDark ? "text-white/60" : "text-muted-foreground"
          )}
        >
          {product.description}
        </p>
      </div>

      <ArrowRight
        className={cn(
          "mt-1 size-4 shrink-0 transition-transform group-hover:translate-x-0.5",
          isDark ? "text-white/40" : "text-black/30"
        )}
      />
    </Link>
  );
}

function QuickAction({
  href,
  icon: Icon,
  title,
  subtitle,
  isDark,
  onClick,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  isDark: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 rounded-xl border p-3 transition-colors",
        isDark
          ? "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
          : "border-black/5 bg-white hover:bg-black/[0.02]"
      )}
    >
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          isDark ? "bg-white/10 text-white" : "bg-black/5 text-foreground"
        )}
      >
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm font-medium",
            isDark ? "text-white" : "text-foreground"
          )}
        >
          {title}
        </p>
        <p
          className={cn(
            "text-xs",
            isDark ? "text-white/50" : "text-muted-foreground"
          )}
        >
          {subtitle}
        </p>
      </div>
      <ArrowRight
        className={cn(
          "size-4 shrink-0 transition-transform group-hover:translate-x-0.5",
          isDark ? "text-white/40" : "text-black/30"
        )}
      />
    </Link>
  );
}
