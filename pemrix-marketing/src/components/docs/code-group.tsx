"use client";

import {
  CodeBlockTab,
  CodeBlockTabs,
  CodeBlockTabsList,
  CodeBlockTabsTrigger,
} from "fumadocs-ui/components/codeblock";
import { Check, Copy, Info, Sparkles } from "lucide-react";
import {
  Children,
  type ReactElement,
  type ReactNode,
  cloneElement,
  isValidElement,
  useRef,
  useState,
} from "react";

// Group adjacent code blocks into a tabbed container like OpenRouter
export function CodeGroup({ children }: { children?: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  // Collect titled code blocks. MDX may pass them directly or wrapped in fragments.
  const blocks = Children.toArray(children).flatMap((child) => {
    if (!isValidElement(child)) return [];
    if ((child.props as { title?: string }).title) {
      return [child as ReactElement<{ title?: string }>];
    }
    const grand = (child.props as { children?: ReactNode }).children;
    return Children.toArray(grand).filter(
      (c): c is ReactElement<{ title?: string }> =>
        isValidElement(c) && !!(c.props as { title?: string }).title
    );
  });

  const items = blocks.map((child) => {
    return ((child.props as { title?: string }).title ?? "").toString();
  });

  if (items.length === 0 || items.every((t) => !t)) {
    return <div className="my-4 rounded-lg border overflow-hidden">{children}</div>;
  }

  const copyActiveCode = async () => {
    const activeValue = active ?? items[0];
    const escaped = typeof CSS !== "undefined" && CSS.escape ? CSS.escape(activeValue) : activeValue;
    const panel = containerRef.current?.querySelector(
      `[role="tabpanel"][data-state="active"][data-value="${escaped}"] pre, [role="tabpanel"][data-state="active"] pre`
    );
    if (!panel) return;
    const clone = panel.cloneNode(true) as HTMLPreElement;
    clone.querySelectorAll(".nd-copy-ignore").forEach((node) => node.replaceWith("\n"));
    await navigator.clipboard.writeText(clone.textContent ?? "");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div ref={containerRef}>
      <CodeBlockTabs className="my-4" value={active} onValueChange={setActive} defaultValue={items[0]}>
        <CodeBlockTabsList>
          {items.map((item) => (
            <CodeBlockTabsTrigger key={item} value={item}>
              {item}
            </CodeBlockTabsTrigger>
          ))}
          <div className="ml-auto flex items-center gap-1 ps-4">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-1.5 text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
              aria-label="Snippet info"
            >
              <Info className="size-4" />
            </button>
            <button
              type="button"
              onClick={copyActiveCode}
              className="inline-flex items-center justify-center rounded-md p-1.5 text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
              aria-label={copied ? "Copied" : "Copy snippet"}
            >
              {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-1.5 text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
              aria-label="Ask AI about this snippet"
            >
              <Sparkles className="size-4" />
            </button>
          </div>
        </CodeBlockTabsList>
        {blocks.map((child, i) => {
          const value = items[i];
          // Strip title/icon so the inner code block doesn't render its own tab header.
          // Keep expandable/lines so long snippets can still collapse inside the tab.
          const {
            title: _title,
            icon: _icon,
            ...rest
          } = child.props as {
            title?: string;
            icon?: ReactNode;
            [key: string]: unknown;
          };
          return (
            <CodeBlockTab key={`${value}-${i}`} value={value}>
              {cloneElement(child, { ...rest, allowCopy: false } as Record<string, unknown>)}
            </CodeBlockTab>
          );
        })}
      </CodeBlockTabs>
    </div>
  );
}
