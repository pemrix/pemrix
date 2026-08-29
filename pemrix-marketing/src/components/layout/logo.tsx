import Link from "next/link";

import { cn } from "@/lib/utils";

interface LogoProps {
  iconClassName?: string;
  wordmarkClassName?: string;
  className?: string;
  href?: string;
  noLink?: boolean;
  isDark?: boolean;
}

export default function Logo({
  iconClassName,
  wordmarkClassName,
  className,
  href = "/",
  noLink = false,
  isDark,
}: LogoProps) {
  const Element = noLink ? "div" : Link;

  const logoSrc =
    typeof isDark === "boolean"
      ? isDark
        ? "/logos/pemrix-white.svg"
        : "/logos/pemrix-black.svg"
      : undefined;

  return (
    <Element href={href} className={cn("flex items-center gap-1.75 text-xl font-medium", className)}>
      <span aria-hidden="true" className={cn("relative block size-6.5", iconClassName)}>
        {logoSrc ? (
          <img src={logoSrc} alt="PEMRIX" className="size-full object-contain" />
        ) : (
          <>
            <img
              src="/logos/pemrix-black.svg"
              alt="PEMRIX"
              className="absolute inset-0 size-full object-contain dark:hidden"
            />
            <img
              src="/logos/pemrix-white.svg"
              alt="PEMRIX"
              className="absolute inset-0 hidden size-full object-contain dark:block"
            />
          </>
        )}
      </span>
      <span className={cn("", wordmarkClassName)}>PEMRIX</span>
    </Element>
  );
}
