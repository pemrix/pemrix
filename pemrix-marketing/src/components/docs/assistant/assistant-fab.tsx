"use client";

import { Sparkle } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import * as React from "react";
import { createPortal } from "react-dom";

import { useAssistant } from "@/components/docs/assistant/assistant-context";

export function AssistantFab() {
  const t = useTranslations("docs.header");
  const { mode, restoreAssistant, openAssistant } = useAssistant();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isMinimized = mode === "minimized";
  const isClosed = mode === "closed";

  if (!isMinimized && !isClosed) return null;

  return createPortal(
    <button
      type="button"
      onClick={() => {
        if (isMinimized) restoreAssistant();
        else openAssistant();
      }}
      className="fixed z-[100] inline-flex h-12 items-center gap-2 rounded-full border border-white/10 bg-[#0f0f0f] px-4 text-sm font-medium text-white shadow-2xl transition-transform hover:scale-105 active:scale-95"
      style={{
        right: 24,
        bottom: 24,
      }}
      aria-label={isMinimized ? "Restore assistant" : "Open assistant"}
    >
      <Sparkle className="size-5 text-[var(--docs-accent)]" weight="fill" />
      <span>{t("askAssistant")}</span>
    </button>,
    document.body
  );
}
