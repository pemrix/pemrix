"use client";

import { ArrowBendUpLeft, Check, Copy } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import * as React from "react";

import { type ChatMessage } from "@/ask-ai";
import { cn } from "@/lib/utils";

interface AssistantMessageProps {
  message: ChatMessage;
  onReply?: (message: ChatMessage) => void;
  onFollowUp?: (question: string) => void;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function extractFollowUps(text: string): { content: string; questions: string[] } {
  // Match an optional closing tag; if the model omits it, strip to end of message.
  const match = text.match(/<!--followups-->([\s\S]*?)(?:<!--\/followups-->|$)/);
  if (!match) return { content: text, questions: [] };
  const block = match[1];
  const questions = block
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^[-*•\d.)]\s+/.test(line))
    .map((line) => line.replace(/^[-*•\d.)]+\s+/, "").trim())
    .filter(Boolean);
  const content = text.replace(match[0], "").trim();
  return { content, questions };
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-white/10 px-1 py-0.5 text-xs text-white/90">
      {children}
    </code>
  );
}

function isInternalUrl(url: string): boolean {
  if (typeof window === "undefined") return false;
  if (url.startsWith("#")) return true;
  if (url.startsWith("/")) return true;
  try {
    const parsed = new URL(url, window.location.href);
    return parsed.origin === window.location.origin;
  } catch {
    return false;
  }
}

function AssistantLink({ href, children }: { href: string; children: React.ReactNode }) {
  const isInternal = isInternalUrl(href);
  const className = "break-all text-[var(--docs-accent)] underline underline-offset-2 hover:text-white";
  if (isInternal) {
    return (
      <Link href={href} className={className} onClick={(e) => e.stopPropagation()}>
        {children}
      </Link>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </a>
  );
}

function renderInline(text: string): React.ReactNode {
  const nodes: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  const patterns: { regex: RegExp; render: (m: RegExpExecArray) => React.ReactNode }[] = [
    {
      regex: /\*\*(.+?)\*\*/g,
      render: (m) => <strong key={key++} className="font-semibold text-white">{renderInline(m[1])}</strong>,
    },
    {
      regex: /\*(.+?)\*/g,
      render: (m) => <em key={key++} className="italic text-white/90">{renderInline(m[1])}</em>,
    },
    {
      regex: /`([^`]+)`/g,
      render: (m) => <InlineCode key={key++}>{m[1]}</InlineCode>,
    },
    {
      regex: /\[([^\]]+)\]\(([^)]+)\)/g,
      render: (m) => (
        <AssistantLink key={key++} href={m[2]}>
          {m[1]}
        </AssistantLink>
      ),
    },
  ];

  while (remaining.length > 0) {
    let earliest: { index: number; match: RegExpExecArray; render: (m: RegExpExecArray) => React.ReactNode } | null = null;
    for (const p of patterns) {
      p.regex.lastIndex = 0;
      const m = p.regex.exec(remaining);
      if (m && (earliest === null || m.index < earliest.index)) {
        earliest = { index: m.index, match: m, render: p.render };
      }
    }

    if (!earliest) {
      nodes.push(<span key={key++}>{remaining}</span>);
      break;
    }

    if (earliest.index > 0) {
      nodes.push(<span key={key++}>{remaining.slice(0, earliest.index)}</span>);
    }
    nodes.push(earliest.render(earliest.match));
    remaining = remaining.slice(earliest.index + earliest.match[0].length);
  }

  return <>{nodes}</>;
}

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="my-2 overflow-hidden rounded-lg border border-white/10 bg-black/30">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-1.5">
        <span className="text-[10px] uppercase text-white/40">{lang || "code"}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 text-[10px] text-white/50 transition-colors hover:text-white"
          aria-label="Copy code"
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 text-xs text-white/90">
        <code className="whitespace-pre-wrap break-words">{code}</code>
      </pre>
    </div>
  );
}

function TableBlock({ rows }: { rows: string[][] }) {
  if (rows.length < 2) return null;
  const [header, ...body] = rows;
  return (
    <div className="my-2 overflow-x-auto rounded-lg border border-white/10">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-white/10 bg-white/5">
            {header.map((h, i) => (
              <th key={i} className="px-3 py-2 font-medium text-white/80">
                {renderInline(h.trim())}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, ri) => (
            <tr key={ri} className="border-b border-white/5 last:border-0">
              {row.map((cell, ci) => (
                <td key={ci} className="px-3 py-2 text-white/70">
                  {renderInline(cell.trim())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ListBlock({ items, ordered }: { items: string[]; ordered: boolean }) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag className={cn("mb-2 pl-4 text-sm text-white/85", ordered ? "list-decimal" : "list-disc")}>
      {items.map((item, i) => (
        <li key={i} className="mb-1 leading-relaxed">
          {renderInline(item.replace(/^\s*[-*\d.]\s+/, ""))}
        </li>
      ))}
    </Tag>
  );
}

function SimpleMarkdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      blocks.push(<CodeBlock key={i} lang={lang} code={codeLines.join("\n")} />);
      continue;
    }

    // Table
    if (line.includes("|") && i + 1 < lines.length && lines[i + 1].includes("---")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|")) {
        rows.push(lines[i].split("|").filter((c) => c.trim() !== ""));
        i++;
      }
      // Skip separator row
      if (rows.length > 1) rows.splice(1, 1);
      blocks.push(<TableBlock key={i} rows={rows} />);
      continue;
    }

    // Heading
    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const content = headingMatch[2];
      const sizeClass =
        level === 1 ? "text-lg" : level === 2 ? "text-base" : level === 3 ? "text-sm" : "text-sm";
      blocks.push(
        <h3 key={i} className={cn("mb-1 mt-3 font-semibold text-white", sizeClass)}>
          {renderInline(content)}
        </h3>
      );
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      blocks.push(
        <blockquote key={i} className="mb-2 border-l-2 border-[var(--docs-accent)] pl-3 text-sm italic text-white/70">
          {quoteLines.join(" ")}
        </blockquote>
      );
      continue;
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i]);
        i++;
      }
      blocks.push(<ListBlock key={i} items={items} ordered />);
      continue;
    }

    // Unordered list
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i]);
        i++;
      }
      blocks.push(<ListBlock key={i} items={items} ordered={false} />);
      continue;
    }

    // Horizontal rule
    if (/^(---|___|\*\*\*)$/.test(line.trim())) {
      blocks.push(<hr key={i} className="my-3 border-white/10" />);
      i++;
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph
    const paraLines: string[] = [line];
    i++;
    while (i < lines.length && lines[i].trim() !== "" && !lines[i].startsWith("#") && !lines[i].startsWith("```") && !lines[i].startsWith("> ") && !/^\s*[-*\d]/.test(lines[i])) {
      paraLines.push(lines[i]);
      i++;
    }
    blocks.push(
      <p key={i} className="mb-2 text-sm leading-relaxed text-white/85">
        {renderInline(paraLines.join(" "))}
      </p>
    );
  }

  return <>{blocks}</>;
}

export function AssistantMessage({ message, onReply, onFollowUp }: AssistantMessageProps) {
  const t = useTranslations("docs.assistant");
  const isUser = message.role === "user";
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const { content: displayContent, questions: followUps } = isUser
    ? { content: message.content, questions: [] as string[] }
    : extractFollowUps(message.content);

  return (
    <div className={cn("group flex gap-2.5", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-medium",
          isUser ? "bg-[var(--docs-accent)] text-white" : "bg-white/10 text-white/80"
        )}
      >
        {isUser ? "Y" : "AI"}
      </div>

      <div className={cn("min-w-0 max-w-[85%]", isUser && "items-end")}>
        <div
          className={cn(
            "relative min-w-0 rounded-2xl px-3.5 py-2.5 break-words",
            isUser
              ? "bg-[var(--docs-accent)] text-white"
              : "border border-white/10 bg-white/[0.04] text-white/90"
          )}
        >
          {message.attachments && message.attachments.length > 0 && (
            <div className="mb-2 flex gap-2">
              {message.attachments.map((a) => (
                <div key={a.id} className="relative overflow-hidden rounded-lg border border-white/10">
                  <img src={a.dataUrl} alt="" className="h-16 w-16 object-cover" />
                </div>
              ))}
            </div>
          )}
          <SimpleMarkdown text={displayContent} />
        </div>

        {!isUser && followUps.length > 0 && onFollowUp && (
          <div className="mt-2 flex flex-wrap gap-1.5 px-1">
            {followUps.map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onFollowUp(q)}
                className="max-w-full truncate rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/70 transition-colors hover:border-[var(--docs-accent)]/50 hover:text-white"
                title={q}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <div className="mt-1 flex items-center gap-2 px-1">
          <span className="text-[10px] text-white/40">{formatTime(message.createdAt)}</span>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 text-[10px] text-white/40 transition-colors hover:text-white/70"
            aria-label={t("copy")}
          >
            {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
            {copied ? t("copied") : t("copy")}
          </button>
          {!isUser && onReply && (
            <button
              type="button"
              onClick={() => onReply(message)}
              className="inline-flex items-center gap-1 text-[10px] text-white/40 transition-colors hover:text-white/70"
              aria-label={t("reply")}
            >
              <ArrowBendUpLeft className="size-3" />
              {t("reply")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
