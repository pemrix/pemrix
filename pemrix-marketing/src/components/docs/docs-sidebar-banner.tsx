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
          src="/logos/pemrix-black.svg"
          alt="PEMRIX"
          className="docs-logo h-6 w-auto dark:hidden"
        />
        <img
          src="/logos/pemrix-white.svg"
          alt="PEMRIX"
          className="docs-logo hidden h-6 w-auto dark:block"
        />
        <span className="text-lg font-semibold tracking-tight text-foreground">
          PEMRIX
        </span>
      </Link>
      <ThemeToggle />
    </div>
  );
}
