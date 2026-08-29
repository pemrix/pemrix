"use client";

import { ChevronDown, ChevronUp, MoreHorizontal } from "lucide-react";
import { Children, type ReactNode, isValidElement, useEffect, useMemo, useRef, useState } from "react";

import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock";

interface CollapsibleCodeBlockProps {
  children?: React.ReactNode;
  title?: React.ReactNode;
  icon?: React.ReactNode;
  expandable?: boolean | string;
  lines?: number | string;
  allowCopy?: boolean | "true" | "false";
  keepBackground?: boolean;
  [key: string]: unknown;
}

const DEFAULT_MAX_LINES = 12;
const AUTO_COLLAPSE_LINES = 20;
const LINE_HEIGHT_REM = 1.5;

function parseLines(value?: number | string): number | undefined {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

function hasLineClass(className: unknown): boolean {
  if (typeof className !== "string") return false;
  const classes = className.split(" ");
  return classes.includes("line");
}

function countLines(node: ReactNode): number {
  if (typeof node === "string") {
    const matches = node.match(/\n/g);
    return matches ? matches.length + 1 : 1;
  }
  if (Array.isArray(node)) {
    return node.reduce((sum, child) => sum + countLines(child), 0);
  }
  if (!isValidElement(node)) return 0;
  const props = node.props as { className?: unknown; children?: ReactNode };
  if (hasLineClass(props.className)) return 1;
  return countLines(props.children);
}

export function CollapsibleCodeBlock({
  children,
  title,
  icon,
  expandable,
  lines,
  allowCopy,
  keepBackground,
  ...rest
}: CollapsibleCodeBlockProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const declaredLines = parseLines(lines);
  const serverLineCount = useMemo(() => countLines(children), [children]);
  const [clientLineCount, setClientLineCount] = useState(serverLineCount);
  const [expanded, setExpanded] = useState(false);

  // Blocks marked with `expandable` or `lines` may collapse when they exceed the threshold.
  // If the MDX source declares a numeric `lines`, use it directly.
  // Otherwise, auto-collapse blocks longer than 20 lines.
  const autoCollapse =
    expandable == null && lines == null && serverLineCount > AUTO_COLLAPSE_LINES;
  const isExpandable =
    expandable === true || expandable === "true" || lines != null || autoCollapse;
  const maxLines = declaredLines ?? (autoCollapse ? AUTO_COLLAPSE_LINES : DEFAULT_MAX_LINES);

  useEffect(() => {
    if (!wrapperRef.current || !isExpandable || declaredLines != null) return;
    const lines = wrapperRef.current.querySelectorAll("pre span.line");
    setClientLineCount(lines.length);
  }, [isExpandable, declaredLines, children]);

  const lineCount = declaredLines ?? Math.max(serverLineCount, clientLineCount);
  const shouldCollapse = isExpandable && lineCount > maxLines;

  return (
    <div ref={wrapperRef} className="relative">
      <CodeBlock
        {...rest}
        title={title}
        icon={icon}
        allowCopy={allowCopy}
        keepBackground={keepBackground}
        viewportProps={{
          style:
            shouldCollapse && !expanded
              ? { maxHeight: `${maxLines * LINE_HEIGHT_REM}rem` }
              : undefined,
        }}
      >
        <Pre className="whitespace-pre-wrap break-words">{children}</Pre>
      </CodeBlock>

      {shouldCollapse && (
        <>
          {expanded ? null : (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-fd-card to-transparent" />
          )}
          <div className="absolute bottom-2 left-3 z-10">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-md bg-fd-card px-2 py-1 text-xs font-medium text-fd-muted-foreground shadow-sm ring-1 ring-fd-border transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
            >
              {expanded ? (
                <>
                  Collapse
                  <ChevronUp className="size-3.5" />
                </>
              ) : (
                <>
                  <MoreHorizontal className="size-3.5" />
                  See all {lineCount} lines
                  <ChevronDown className="size-3.5" />
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
