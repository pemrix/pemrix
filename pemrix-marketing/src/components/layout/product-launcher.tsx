"use client";

import {
  BookOpen,
  Brain,
  Database,
  DotsNine,
  Gear,
  Headset,
  House,
  MagnifyingGlass,
  Printer,
  Robot,
  ShoppingCart,
  X,
  type Icon,
} from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import * as React from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { ProductLogo } from "@/components/docs/product-logo";
import { quanvioProducts, type QuanvioProduct } from "@/data/products";
import { cn } from "@/lib/utils";

const ANIMATION_DURATION = 360;

const productIcons: Record<string, Icon> = {
  qora: Robot,
  qprint: Printer,
  quanpos: ShoppingCart,
  qorvia: Headset,
  pegus: Database,
  quanvio: Gear,
  docs: BookOpen,
  home: House,
};

function getHostname(href: string) {
  try {
    return new URL(href).hostname;
  } catch {
    return "";
  }
}

function isCurrentProduct(product: QuanvioProduct) {
  if (typeof window === "undefined") return false;
  return window.location.hostname === getHostname(product.href);
}

function StatusBadge({ status }: { status?: QuanvioProduct["status"] }) {
  if (!status || status === "live") return null;

  const labels = { beta: "BETA", new: "NEW" };
  const styles = {
    beta: "bg-amber-500 text-amber-50",
    new: "bg-sky-500 text-sky-50",
  };

  return (
    <span
      className={cn(
        "absolute -top-1.5 -right-1 rounded-md px-1 py-0 text-[6px] font-bold tracking-wider shadow-sm",
        styles[status],
      )}
    >
      {labels[status]}
    </span>
  );
}

function AppIcon({
  product,
  onClick,
  isDark,
}: {
  product: QuanvioProduct;
  onClick?: () => void;
  isDark: boolean;
}) {
  const Icon = productIcons[product.id] || Brain;
  const current = isCurrentProduct(product);
  const [from, to] = product.gradient || [product.color, product.color];
  const hasLogo = Boolean(product.logo?.light);

  return (
    <Link
      href={product.href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      aria-label={`${product.name}${current ? " (current)" : ""}`}
      className={cn(
        "group flex flex-col items-center gap-2 rounded-2xl p-3 transition-all duration-200",
        isDark
          ? "hover:bg-white/10 focus-visible:ring-white/30"
          : "hover:bg-black/5 focus-visible:ring-black/20",
        "focus-visible:outline-none focus-visible:ring-2",
        current && (isDark ? "bg-white/10 ring-1 ring-white/20" : "bg-black/5 ring-1 ring-black/10"),
      )}
    >
      <div
        className={cn(
          "relative flex size-14 items-center justify-center overflow-hidden rounded-[18px] shadow-sm transition-all duration-200 group-hover:scale-105 group-hover:shadow-lg sm:size-16 sm:rounded-[22px]",
          current && (isDark ? "ring-2 ring-white/50" : "ring-2 ring-black/30"),
          hasLogo && (isDark ? "bg-[#111]" : "bg-white")
        )}
        style={
          hasLogo
            ? undefined
            : {
                background: `linear-gradient(180deg, ${from} 0%, ${to} 100%)`,
                boxShadow: `0 6px 18px -5px ${from}90`,
              }
        }
      >
        {hasLogo ? (
          <ProductLogo
            light={product.logo!.light}
            dark={product.logo!.dark}
            alt={product.name}
            className="h-9 w-auto sm:h-10"
          />
        ) : (
          <Icon className="size-7 text-white drop-shadow-md sm:size-8" weight="fill" />
        )}
        <StatusBadge status={product.status} />
        {current && (
          <span className="absolute bottom-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-white/90 text-black shadow-sm">
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.5 5.5L3.5 7.5L8.5 2.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}
      </div>
      <p
        className={cn(
          "max-w-[88px] truncate text-center text-sm font-medium drop-shadow",
          isDark ? "text-white/90" : "text-foreground/90",
        )}
      >
        {product.name}
      </p>
    </Link>
  );
}

function LauncherContent({
  onSelect,
  onClose,
  isDark,
}: {
  onSelect: (product: QuanvioProduct) => void;
  onClose: () => void;
  isDark: boolean;
}) {
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;
      if (isTyping) return;

      if (
        e.key.length === 1 &&
        /[a-zA-Z0-9]/.test(e.key) &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return quanvioProducts;
    return quanvioProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-[36px] border p-6 shadow-2xl backdrop-blur-3xl",
        isDark
          ? "border-white/12 bg-black/[0.28]"
          : "border-black/10 bg-white/80",
      )}
      style={{
        width: "min(900px, 92vw)",
        height: "min(540px, 90vh)",
        boxShadow: isDark
          ? "0 32px 100px -20px rgba(0,0,0,0.45), inset 0 1px 0 0 rgba(255,255,255,0.10)"
          : "0 32px 100px -20px rgba(0,0,0,0.15), inset 0 1px 0 0 rgba(255,255,255,0.60)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-5 flex items-center justify-between">
        <h2
          className={cn(
            "text-lg font-semibold tracking-tight drop-shadow",
            isDark ? "text-white" : "text-foreground",
          )}
        >
          Applications
        </h2>
        <div className="flex items-center gap-2">
          <KbdGroup className="hidden sm:flex">
            <Kbd
              className={cn(
                isDark
                  ? "border-white/20 bg-white/10 text-white/70"
                  : "border-black/10 bg-black/5 text-black/60",
              )}
            >
              ⌘
            </Kbd>
            <Kbd
              className={cn(
                isDark
                  ? "border-white/20 bg-white/10 text-white/70"
                  : "border-black/10 bg-black/5 text-black/60",
              )}
            >
              Shift
            </Kbd>
            <Kbd
              className={cn(
                isDark
                  ? "border-white/20 bg-white/10 text-white/70"
                  : "border-black/10 bg-black/5 text-black/60",
              )}
            >
              A
            </Kbd>
          </KbdGroup>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className={cn(
              "size-8 rounded-full",
              isDark
                ? "text-white/70 hover:bg-white/10 hover:text-white"
                : "text-black/60 hover:bg-black/5 hover:text-foreground",
            )}
            aria-label="Close"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>

      <div className="relative mb-5 flex justify-center">
        <div className="relative w-full max-w-md">
          <MagnifyingGlass
            className={cn(
              "absolute top-1/2 left-4 size-4 -translate-y-1/2",
              isDark ? "text-white/50" : "text-black/40",
            )}
          />
          <Input
            ref={inputRef}
            autoFocus={false}
            placeholder="Search apps"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={cn(
              "h-11 rounded-full pl-11 pr-4 text-sm focus-visible:ring-0 focus-visible:ring-offset-0",
              isDark
                ? "border-white/10 bg-white/10 text-white placeholder:text-white/40 focus-visible:border-white/25 focus-visible:bg-white/15"
                : "border-black/10 bg-black/5 text-foreground placeholder:text-black/40 focus-visible:border-black/20 focus-visible:bg-black/[0.07]",
            )}
          />
        </div>
      </div>

      <div className="flex flex-1 items-start justify-center overflow-y-auto">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7">
            {filtered.map((product) => (
              <AppIcon
                key={product.id}
                product={product}
                onClick={() => onSelect(product)}
                isDark={isDark}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <MagnifyingGlass
              className={cn("mb-3 size-10", isDark ? "text-white/40" : "text-black/30")}
            />
            <p className={cn("font-medium", isDark ? "text-white/90" : "text-foreground/90")}>
              No apps found
            </p>
            <p className={cn("text-sm", isDark ? "text-white/50" : "text-black/50")}>
              Try a different search
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-center">
        <Link
          href="https://quanvio.com/products"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "rounded-full px-4 py-2 text-xs font-medium transition-colors",
            isDark
              ? "text-white/40 hover:bg-white/10 hover:text-white"
              : "text-black/40 hover:bg-black/5 hover:text-foreground",
          )}
        >
          View all products
        </Link>
      </div>
    </div>
  );
}

export function ProductLauncher({ className }: { className?: string }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const openLauncher = React.useCallback(() => {
    setMounted(true);
    requestAnimationFrame(() => setOpen(true));
  }, []);

  const closeLauncher = React.useCallback(() => {
    setOpen(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setMounted(false), ANIMATION_DURATION);
  }, []);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey &&
        e.key.toLowerCase() === "a"
      ) {
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

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={openLauncher}
        className={cn(
          "text-muted-foreground hover:bg-accent hover:text-foreground size-9 rounded-lg",
          className,
        )}
        aria-label="Quanvio products"
      >
        <DotsNine className="size-5" weight="regular" />
      </Button>

      {mounted &&
        createPortal(
          <div
            className={cn(
              "fixed inset-0 z-50 flex items-center justify-center backdrop-blur-2xl transition-opacity",
              isDark ? "bg-black/25" : "bg-black/10",
              open ? "opacity-100" : "opacity-0",
            )}
            style={{
              transitionDuration: `${ANIMATION_DURATION}ms`,
            }}
            onClick={closeLauncher}
            aria-hidden={!open}
          >
            <div
              className={cn(
                "transition-transform ease-out will-change-transform",
                open ? "scale-100" : "scale-[0.72]",
              )}
              style={{
                transitionDuration: `${ANIMATION_DURATION}ms`,
                transitionTimingFunction: open
                  ? "cubic-bezier(0.16, 1, 0.3, 1)"
                  : "cubic-bezier(0.7, 0, 0.84, 0)",
              }}
            >
              <LauncherContent onSelect={closeLauncher} onClose={closeLauncher} isDark={isDark} />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
