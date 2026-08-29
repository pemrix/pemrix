"use client";

import { Sparkle } from "@phosphor-icons/react";
import * as React from "react";

import { useAssistant } from "@/components/docs/assistant/assistant-context";

function getPageContext() {
  const productMatch = window.location.pathname.match(/\/docs\/([^/]+)/);
  const product = productMatch?.[1] ?? "quanvio";
  const title = document.title || document.querySelector("h1")?.textContent?.trim() || "";
  let section = "";
  const headings = Array.from(document.querySelectorAll("h2, h3"));
  for (const h of headings) {
    const r = h.getBoundingClientRect();
    if (r.top > 0 && r.top < window.innerHeight / 2) {
      section = h.textContent?.trim() ?? "";
      break;
    }
  }
  return {
    product,
    title,
    url: window.location.href,
    section,
  };
}

export function AssistantTextHelper() {
  const { openAssistant } = useAssistant();
  const [state, setState] = React.useState<{
    text: string;
    x: number;
    y: number;
    visible: boolean;
  }>({ text: "", x: 0, y: 0, visible: false });

  React.useEffect(() => {
    let hideTimeout: ReturnType<typeof setTimeout> | null = null;

    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim() ?? "";

      if (!text || text.length < 3) {
        setState((s) => ({ ...s, visible: false }));
        return;
      }

      const range = selection?.getRangeAt(0);
      if (!range) return;

      const rect = range.getBoundingClientRect();
      setState({
        text,
        x: rect.right + 8,
        y: rect.top - 8,
        visible: true,
      });

      if (hideTimeout) clearTimeout(hideTimeout);
      hideTimeout = setTimeout(() => {
        setState((s) => ({ ...s, visible: false }));
      }, 4000);
    };

    const handleMouseUp = () => {
      window.requestAnimationFrame(handleSelection);
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("selectionchange", handleSelection);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("selectionchange", handleSelection);
      if (hideTimeout) clearTimeout(hideTimeout);
    };
  }, []);

  if (!state.visible) return null;

  return (
    <button
      type="button"
      onClick={() => {
        openAssistant({ prefill: state.text, context: getPageContext() });
        setState((s) => ({ ...s, visible: false }));
      }}
      className="fixed z-[110] inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#0f0f0f] px-2.5 py-1.5 text-xs font-medium text-white shadow-xl transition-transform hover:scale-105"
      style={{
        left: Math.min(state.x, window.innerWidth - 120),
        top: Math.max(8, state.y),
      }}
      aria-label="Ask AI about selection"
    >
      <Sparkle className="size-3.5 text-[var(--docs-accent)]" weight="fill" />
      Ask
    </button>
  );
}
