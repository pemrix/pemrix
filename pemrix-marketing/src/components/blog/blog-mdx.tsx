import type { MDXComponents } from "mdx/types";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export const blogMdxComponents: MDXComponents = {
  h2: ({ children, ...props }: ComponentProps<"h2">) => (
    <h3 className="text-accent-foreground mt-6 mb-3 text-lg font-medium" {...props}>
      {children}
    </h3>
  ),
  p: ({ children, ...props }: ComponentProps<"p">) => (
    <p className="text-muted-foreground text-base leading-relaxed md:text-lg" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }: ComponentProps<"ul">) => (
    <ul className="text-muted-foreground text-base md:text-lg" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: ComponentProps<"ol">) => (
    <ol className="text-muted-foreground list-decimal space-y-2 pl-6 text-base md:text-lg" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: ComponentProps<"li">) => (
    <li className="flex items-center gap-3" {...props}>
      <span className="bg-secondary flex size-1.5 shrink-0 rounded-full" />
      <span>{children}</span>
    </li>
  ),
  strong: ({ children, ...props }: ComponentProps<"strong">) => (
    <strong className="text-foreground font-medium" {...props}>
      {children}
    </strong>
  ),
};

export function formatBlogDate(date: string): string {
  const parsed = new Date(date);
  const month = parsed.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const day = parsed.getDate();
  const year = parsed.getFullYear();

  return `${month} ${day} ${year}`;
}

export function blogTag(tag: string): { label: string; className: string } {
  switch (tag) {
    case "Product":
      return { label: tag, className: "bg-chart-3/20 text-chart-3" };
    case "Security":
      return { label: tag, className: "bg-chart-2/15 text-chart-2" };
    case "Company":
      return { label: tag, className: "bg-secondary/15 text-secondary" };
    default:
      return { label: tag, className: "bg-muted text-muted-foreground" };
  }
}

export function blogTimelineEntryClass(isLast: boolean) {
  return cn("mb-16 flex-1", isLast && "mb-0");
}

export function getBlogExcerpt(content: string, maxLength = 220): string {
  const plain = content
    .replace(/^#+\s.*$/gm, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/^[-*+]\s+/gm, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)[0];

  if (!plain) return "";

  if (plain.length <= maxLength) return plain;

  return `${plain.slice(0, maxLength).replace(/\s+\S*$/, "")}…`;
}
