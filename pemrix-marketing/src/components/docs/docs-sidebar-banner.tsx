"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

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

export function DocsSidebarBanner() {
  return (
    <div className="flex items-center justify-between md:hidden">
      <Link href="/" className="flex items-center gap-2">
        <img
          src="/layout/logo.svg"
          alt="Quanvio"
          className="docs-logo h-6 w-auto"
        />
        <span className="text-lg font-semibold tracking-tight text-foreground">
          Quanvio
        </span>
      </Link>
      <ThemeToggle />
    </div>
  );
}
