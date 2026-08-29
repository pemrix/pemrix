"use client";

import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  FileText,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function useCopyButton(onCopy: () => Promise<string>) {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    try {
      const text = await onCopy();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return { copied, onClick };
}

function DropdownItem({
  title,
  subtitle,
  onClick,
  href,
  icon: Icon,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const className =
    "flex items-start gap-3 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-fd-accent";

  const content = (
    <>
      <Icon className="mt-0.5 size-4 shrink-0 text-fd-muted-foreground" />
      <div className="flex flex-col items-start">
        <span className="font-medium text-fd-foreground">{title}</span>
        {subtitle && (
          <span className="text-xs text-fd-muted-foreground">{subtitle}</span>
        )}
      </div>
      {href && <ExternalLink className="ml-auto mt-0.5 size-3.5 shrink-0 text-fd-muted-foreground opacity-60" />}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

export function PageActionsDropdown({ markdownUrl }: { markdownUrl: string }) {
  const [open, setOpen] = useState(false);
  const pageUrl = typeof window === "undefined" ? "" : window.location.href;

  const { copied: copiedMarkdown, onClick: copyMarkdown } = useCopyButton(
    async () => {
      const res = await fetch(markdownUrl);
      if (!res.ok) throw new Error("Failed to fetch markdown");
      return await res.text();
    }
  );

  const llmPrompt = `Read ${pageUrl}, I want to ask questions about it.`;
  const ChevronIcon = open ? ChevronUp : ChevronDown;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 rounded-lg border bg-transparent px-2.5 text-xs font-medium text-fd-foreground shadow-none hover:bg-fd-accent hover:text-fd-accent-foreground"
        >
          <FileText className="size-3.5 text-fd-muted-foreground" />
          Copy page
          <ChevronIcon className="size-3.5 text-fd-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="flex w-64 flex-col gap-0.5 p-1.5"
      >
        <DropdownItem
          icon={copiedMarkdown ? Check : Copy}
          title={copiedMarkdown ? "Copied" : "Copy page"}
          subtitle="Copy page as Markdown for LLMs"
          onClick={() => {
            copyMarkdown();
            setTimeout(() => setOpen(false), 600);
          }}
        />

        <DropdownItem
          icon={FileText}
          title="View as Markdown"
          subtitle="View this page as plain text"
          href={markdownUrl}
        />

        <div className="my-1 h-px bg-fd-border" />

        <DropdownItem
          icon={ExternalLink}
          title="Open in ChatGPT"
          subtitle="Ask questions about this page"
          href={`https://chatgpt.com/?${new URLSearchParams({ prompt: llmPrompt, hints: "search" })}`}
        />

        <DropdownItem
          icon={ExternalLink}
          title="Open in Claude"
          subtitle="Ask questions about this page"
          href={`https://claude.ai/new?${new URLSearchParams({ q: llmPrompt })}`}
        />

        <DropdownItem
          icon={ExternalLink}
          title="Open in Perplexity"
          subtitle="Ask questions about this page"
          href={`https://www.perplexity.ai/?${new URLSearchParams({ q: llmPrompt })}`}
        />
      </PopoverContent>
    </Popover>
  );
}
