"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface ProductLogoProps {
  light: string;
  dark?: string;
  alt: string;
  className?: string;
  isDark?: boolean;
}

export function ProductLogo({ light, dark, alt, className, isDark }: ProductLogoProps) {
  if (!dark) {
    return (
      <img
        src={light}
        alt={alt}
        className={cn("object-contain", className)}
      />
    );
  }

  // When the caller already knows the resolved theme, render only the
  // matching image. This avoids relying on the global `.dark` class inside
  // portals or other contexts where Tailwind's `dark:` variant can lag.
  if (typeof isDark === "boolean") {
    return (
      <img
        src={isDark ? dark : light}
        alt={alt}
        className={cn("object-contain", className)}
      />
    );
  }

  return (
    <>
      <img
        src={light}
        alt={alt}
        className={cn("object-contain dark:hidden", className)}
      />
      <img
        src={dark}
        alt={alt}
        className={cn("hidden object-contain dark:block", className)}
      />
    </>
  );
}
