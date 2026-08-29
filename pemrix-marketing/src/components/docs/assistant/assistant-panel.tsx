"use client";

import {
  ArrowCounterClockwise,
  CaretDown,
  Gear,
  PaperPlaneRight,
  X,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import * as React from "react";
import { createPortal } from "react-dom";

import {
  answerQuestion,
  loadPersisted,
  savePersisted,
  stripForSave,
  type ChatAttachment,
  type ChatMessage,
  type AskAiSettings,
} from "@/ask-ai";
import { AssistantMessage } from "@/components/docs/assistant/assistant-message";
import { AssistantSettings } from "@/components/docs/assistant/assistant-settings";
import { useAssistant } from "@/components/docs/assistant/assistant-context";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const MAX_PAGE_MARKDOWN_CHARS = 6000;

function useDocumentTitle(): string {
  const [title, setTitle] = React.useState(() => getPageTitle());
  React.useEffect(() => {
    const el = document.querySelector("title");
    if (!el) return;
    const observer = new MutationObserver(() => setTitle(getPageTitle()));
    observer.observe(el, { childList: true });
    return () => observer.disconnect();
  }, []);
  return title;
}

function useCurrentSection(): string | undefined {
  const [section, setSection] = React.useState<string | undefined>(undefined);
  React.useEffect(() => {
    const headings = Array.from(document.querySelectorAll("h2, h3"));
    const update = () => {
      for (const h of headings) {
        const r = h.getBoundingClientRect();
        if (r.top > 0 && r.top < window.innerHeight * 0.55) {
          setSection(h.textContent?.trim());
          return;
        }
      }
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return section;
}

function getDocsSlugFromPathname(pathname: string): string | null {
  let p = pathname;
  for (const locale of routing.locales) {
    if (locale === routing.defaultLocale) continue;
    p = p.replace(new RegExp(`^/${locale}`), "");
  }
  const match = p.match(/^\/docs\/(.+)$/);
  return match ? match[1] : null;
}

function getPageTitle(): string {
  if (typeof document === "undefined") return "";
  return document.title.split("|")[0].trim();
}

function stripFrontmatter(md: string): string {
  return md.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, "").trim();
}

function getQuickLinks(ctx: { product: string; title: string; section?: string }): string[] {
  const productNames: Record<string, string> = {
    pemrix: "PEMRIX",
  };
  const name = productNames[ctx.product] ?? ctx.product;
  return [
    `Summarize ${ctx.title || "this page"}`,
    `Show me a code example for ${name}`,
    ctx.section ? `Explain "${ctx.section}"` : `What is ${name}?`,
    `Where can I read more about ${name}?`,
  ];
}

const PANEL_WIDTH = 420;
const PANEL_HEIGHT = 640;

function newId(): string {
  return `m${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function readImageFile(file: File): Promise<ChatAttachment | null> {
  if (!file.type.startsWith("image/")) return null;
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
  return { id: newId(), type: "image", dataUrl, name: file.name || "image.png" };
}

function useMounted() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return mounted;
}

export function AssistantPanel() {
  const mounted = useMounted();
  const t = useTranslations("docs.assistant");
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const {
    open,
    minimized,
    position,
    selectedText,
    pageContext,
    closeAssistant,
    minimizeAssistant,
    resetPosition,
    setPosition,
    setSelectedText,
    setPageContext,
  } = useAssistant();

  const documentTitle = useDocumentTitle();
  const currentSection = useCurrentSection();

  const activePageContext = React.useMemo(
    () =>
      pageContext ?? {
        product: getDocsSlugFromPathname(pathname ?? "")?.split("/")[0] ?? "pemrix",
        title: documentTitle,
        url: typeof window !== "undefined" ? window.location.href : "",
        section: currentSection,
      },
    [pageContext, pathname, documentTitle, currentSection]
  );

  const [settings, setSettings] = React.useState<AskAiSettings>(() => loadPersisted().settings);
  const [messages, setMessages] = React.useState<ChatMessage[]>(() => loadPersisted().messages);
  const [input, setInput] = React.useState("");
  const [pendingAttachments, setPendingAttachments] = React.useState<ChatAttachment[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [streaming, setStreaming] = React.useState(false);
  const [streamingText, setStreamingText] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [replyTo, setReplyTo] = React.useState<ChatMessage | null>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const [textareaHeight, setTextareaHeight] = React.useState(44);
  const [tokenUsage, setTokenUsage] = React.useState<{ prompt?: number; completion?: number; total?: number } | null>(null);
  const [pageMarkdown, setPageMarkdown] = React.useState("");
  const abortRef = React.useRef<(() => void) | null>(null);

  const panelRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const dragState = React.useRef<{ startX: number; startY: number; initialX: number; initialY: number; dragging: boolean } | null>(null);
  const resizeStartY = React.useRef(0);
  const resizeStartHeight = React.useRef(44);

  React.useEffect(() => {
    savePersisted({ settings, messages: stripForSave(messages) });
  }, [settings, messages]);

  React.useEffect(() => {
    if (open && !minimized) {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "auto" });
      const t = window.setTimeout(() => textareaRef.current?.focus(), 80);
      return () => window.clearTimeout(t);
    }
  }, [open, minimized]);

  React.useEffect(() => {
    if (open && !minimized) {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, streamingText, loading, open, minimized]);

  React.useEffect(() => {
    if (!open) return;
    const slug = getDocsSlugFromPathname(pathname ?? "");
    if (!slug) {
      setPageMarkdown("");
      return;
    }
    let cancelled = false;
    fetch(`/api/docs/markdown?slug=${encodeURIComponent(`products/${slug}`)}`)
      .then((res) => (res.ok ? res.text() : ""))
      .then((text) => {
        if (cancelled) return;
        const cleaned = stripFrontmatter(text);
        setPageMarkdown(cleaned.slice(0, MAX_PAGE_MARKDOWN_CHARS));
      })
      .catch(() => setPageMarkdown(""));
    return () => {
      cancelled = true;
    };
  }, [open, pathname]);

  React.useEffect(() => {
    if (selectedText) {
      setInput((prev) => {
        if (prev.includes(selectedText)) return prev;
        return prev ? `${prev}\n\n${selectedText}` : selectedText;
      });
      setSelectedText("");
    }
  }, [selectedText, setSelectedText]);

  const addFiles = React.useCallback(async (files: FileList | File[]) => {
    const list = Array.from(files);
    const images = (await Promise.all(list.map((f) => readImageFile(f)))).filter(
      Boolean
    ) as ChatAttachment[];
    if (images.length > 0) {
      setPendingAttachments((prev) => [...prev, ...images].slice(0, 3));
    }
    const textFile = list.find(
      (f) => f.type.startsWith("text/") || f.name.endsWith(".sql") || f.name.endsWith(".md")
    );
    if (textFile) {
      const text = await textFile.text();
      setInput((prev) => (prev ? `${prev}\n\n${text}` : text));
    }
  }, []);

  const send = React.useCallback(
    async (overrideText?: string) => {
      const text = (overrideText ?? input).trim();
      if (loading) return;
      if (!text && pendingAttachments.length === 0) return;

      setError(null);
      setInput("");
      const activeReply = replyTo;
      setReplyTo(null);
      const attachments = [...pendingAttachments];
      setPendingAttachments([]);

      const displayText = text || "See attached image.";

      const userMsg: ChatMessage = {
        id: newId(),
        role: "user",
        content: displayText,
        createdAt: Date.now(),
        attachments,
        replyToId: activeReply?.id,
      };

      const history = [...messages, userMsg];
      setMessages(history);
      setLoading(true);
      setStreaming(false);
      setStreamingText("");
      setTokenUsage(null);
      setPageContext(null);

      const themeMatch = text.match(/^(?:switch to |turn on |change to |use )?(light|dark) mode$/i);
      if (themeMatch) {
        const nextTheme = themeMatch[1].toLowerCase() as "light" | "dark";
        setTheme(nextTheme);
        setLoading(false);
        setMessages((prev) => [
          ...prev,
          {
            id: newId(),
            role: "assistant",
            content: `Switched to ${nextTheme} mode.`,
            createdAt: Date.now(),
          },
        ]);
        abortRef.current = null;
        return;
      }

      abortRef.current = answerQuestion(
        settings,
        messages,
        displayText,
        attachments,
        {
          onChunk: (chunk) => {
            setLoading(false);
            setStreaming(true);
            setStreamingText((prev) => prev + chunk);
          },
          onUsage: (usage) => {
            setTokenUsage({
              prompt: usage.prompt_tokens,
              completion: usage.completion_tokens,
              total: usage.total_tokens,
            });
          },
          onError: (err) => {
            setLoading(false);
            setStreaming(false);
            setStreamingText("");
            setMessages((prev) => prev.slice(0, -1));
            setInput(text);
            setPendingAttachments(attachments);
            if (activeReply) setReplyTo(activeReply);
            setError(err.message || "Request failed.");
            abortRef.current = null;
          },
          onDone: () => {
            setLoading(false);
            setStreaming(false);
            setMessages((prev) => [
              ...prev,
              {
                id: newId(),
                role: "assistant",
                content: streamingTextRef.current || "(no response)",
                createdAt: Date.now(),
              },
            ]);
            setStreamingText("");
            abortRef.current = null;
          },
        },
        { pageContext: activePageContext, pageMarkdown }
      );
    },
    [input, loading, pendingAttachments, replyTo, messages, settings, activePageContext, pageMarkdown, setPageContext, setTheme]
  );

  const streamingTextRef = React.useRef(streamingText);
  React.useEffect(() => {
    streamingTextRef.current = streamingText;
  }, [streamingText]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest("input") ||
      target.closest("textarea") ||
      target.closest("select") ||
      target.closest("a") ||
      target.closest('[role="separator"]')
    ) {
      return;
    }
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
      dragging: false,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    if (!dragState.current.dragging && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
      dragState.current.dragging = true;
    }
    if (dragState.current.dragging) {
      setPosition({
        x: dragState.current.initialX + dx,
        y: dragState.current.initialY + dy,
      });
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    dragState.current = null;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const startResize = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    resizeStartY.current = e.clientY;
    resizeStartHeight.current = textareaHeight;
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);

    const onMove = (ev: PointerEvent) => {
      const dy = ev.clientY - resizeStartY.current;
      setTextareaHeight(Math.max(44, Math.min(240, resizeStartHeight.current + dy)));
    };
    const onUp = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      (ev.target as HTMLElement | null)?.releasePointerCapture(ev.pointerId);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
  };

  if (!mounted || !open) return null;

  if (minimized) {
    return createPortal(
      <button
        type="button"
        onClick={() => {
          /* restored by AssistantFab */
        }}
        className="pointer-events-none fixed z-[100] hidden"
        aria-hidden
      />,
      document.body
    );
  }

  const canSend = Boolean(input.trim() || pendingAttachments.length > 0);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[90] bg-black/20 backdrop-blur-[1px] md:hidden"
        onClick={closeAssistant}
        aria-hidden={false}
      />
      <div
        ref={panelRef}
        data-docs-assistant-panel
        role="dialog"
        aria-modal="true"
        aria-label="Ask Assistant"
        className={cn(
          "fixed z-[100] flex flex-col overflow-hidden rounded-2xl border shadow-2xl",
          "bg-[#0f0f0f] text-white border-white/10"
        )}
        style={{
          width: PANEL_WIDTH,
          height: PANEL_HEIGHT,
          left: isMobile ? "50%" : position.x,
          top: isMobile ? "50%" : position.y,
          transform: isMobile ? "translate(-50%, -50%)" : "none",
        }}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* Header */}
        <div
          className="flex cursor-grab items-center justify-between border-b border-white/10 px-4 py-3 active:cursor-grabbing"
          data-drag-handle
        >
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-full bg-[var(--docs-accent)] text-xs font-semibold text-white">
              AI
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">{t("title")}</h2>
              <p className="text-[11px] text-white/50">{t("subtitle")}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSettingsOpen((v) => !v)}
              className={cn(
                "inline-flex size-8 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white",
                settingsOpen && "bg-white/10 text-white"
              )}
              aria-label="Settings"
            >
              <Gear className="size-4" />
            </button>
            <button
              type="button"
              onClick={resetPosition}
              className="inline-flex size-8 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              aria-label={t("resetPosition")}
              title={t("resetPosition")}
            >
              <ArrowCounterClockwise className="size-4" />
            </button>
            <button
              type="button"
              onClick={minimizeAssistant}
              className="hidden size-8 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white md:inline-flex"
              aria-label={t("minimize")}
              title={t("minimize")}
            >
              <CaretDown className="size-4" />
            </button>
            <button
              type="button"
              onClick={closeAssistant}
              className="inline-flex size-8 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              aria-label={t("close")}
              title={t("close")}
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Settings */}
        {settingsOpen && (
          <div className="border-b border-white/10">
            <AssistantSettings
              settings={settings}
              onChange={setSettings}
              onClearMessages={() => setMessages([])}
            />
          </div>
        )}

        {/* Body */}
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Status */}
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2 text-xs text-white/60">
            <span className="size-2 rounded-full bg-[var(--docs-accent)]" />
            {t("statusReady")}
            {settings.apiKey.trim() ? ` · ${settings.provider}` : ` · ${t("statusNoKey")}`}
          </div>

          {/* Messages */}
          <div
            ref={listRef}
            className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4"
          >
            {messages.length === 0 && (
              <div className="space-y-4 text-sm text-white/70">
                <p>{t("emptyHint")}</p>
                <div className="flex flex-wrap gap-2">
                  {getQuickLinks(activePageContext).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => void send(q)}
                      className="max-w-full truncate rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition-colors hover:border-[var(--docs-accent)]/50 hover:text-white"
                      title={q}
                    >
                      {q}
                    </button>
                  ))}
                </div>
                <ul className="list-disc space-y-1.5 pl-4 text-white/55">
                  <li>{t("sample1")}</li>
                  <li>{t("sample2")}</li>
                  <li>{t("sample3")}</li>
                </ul>
              </div>
            )}
            {messages.map((m) => (
              <AssistantMessage
                key={m.id}
                message={m}
                onReply={(msg) => {
                  setReplyTo(msg);
                  textareaRef.current?.focus();
                }}
                onFollowUp={(q) => void send(q)}
              />
            ))}
            {streaming && (
              <AssistantMessage
                message={{
                  id: "streaming",
                  role: "assistant",
                  content: streamingText,
                  createdAt: Date.now(),
                }}
              />
            )}
            {loading && (
              <div className="flex items-center gap-2 text-sm text-white/60">
                <span className="size-4 animate-pulse rounded-full bg-[var(--docs-accent)]" />
                {t("thinking")}
              </div>
            )}
            {tokenUsage && !streaming && !loading && (
              <div className="flex justify-end px-1">
                <span className="text-[10px] text-white/40">
                  {tokenUsage.total ?? tokenUsage.prompt} tokens
                </span>
              </div>
            )}
          </div>

          {error && (
            <div className="mx-4 mb-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {error}
            </div>
          )}

          {/* Composer */}
          <div
            className={cn(
              "relative border-t border-white/10 p-3 transition-colors",
              dragOver && "bg-white/5"
            )}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files.length > 0) void addFiles(e.dataTransfer.files);
            }}
          >
            {dragOver && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-[var(--docs-accent)]/10 text-sm text-[var(--docs-accent)]">
                {t("dropHint")}
              </div>
            )}

            {pendingAttachments.length > 0 && (
              <div className="mb-2 flex gap-2">
                {pendingAttachments.map((a) => (
                  <div
                    key={a.id}
                    className="group relative size-12 overflow-hidden rounded-lg border border-white/10"
                  >
                    <img src={a.dataUrl} alt="" className="size-full object-cover" />
                    <button
                      type="button"
                      onClick={() =>
                        setPendingAttachments((prev) => prev.filter((x) => x.id !== a.id))
                      }
                      className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                      aria-label="Remove attachment"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {replyTo && (
              <div className="mb-2 flex items-center gap-2 rounded-md bg-white/5 px-2 py-1.5 text-xs text-white/70">
                <span className="truncate">
                  Replying to {replyTo.role === "assistant" ? "Assistant" : "You"}:{" "}
                  {replyTo.content.slice(0, 60)}
                  {replyTo.content.length > 60 ? "…" : ""}
                </span>
                <button
                  type="button"
                  onClick={() => setReplyTo(null)}
                  className="ml-auto text-white/50 hover:text-white"
                  aria-label="Cancel reply"
                >
                  ×
                </button>
              </div>
            )}

            <div className="relative flex items-end gap-2">
              <textarea
                ref={textareaRef}
                rows={1}
                placeholder={t("placeholder")}
                value={input}
                disabled={loading}
                onChange={(e) => setInput(e.target.value)}
                onPaste={(e) => {
                  const items = e.clipboardData?.items;
                  if (!items) return;
                  const files: File[] = [];
                  for (const item of items) {
                    if (item.kind === "file") {
                      const f = item.getAsFile();
                      if (f) files.push(f);
                    }
                  }
                  if (files.length > 0) {
                    e.preventDefault();
                    void addFiles(files);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                style={{ height: textareaHeight }}
                className="max-h-60 min-h-[44px] flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-[var(--docs-accent)] focus:outline-none"
              />
              <div
                role="separator"
                aria-orientation="vertical"
                onPointerDown={startResize}
                className="absolute bottom-1 right-12 h-5 w-1.5 cursor-ns-resize rounded-full bg-white/20 hover:bg-white/40"
                title="Drag to resize"
              />
              <button
                type="button"
                disabled={loading || !canSend}
                onClick={() => void send()}
                className={cn(
                  "inline-flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                  canSend
                    ? "bg-[var(--docs-accent)] text-white hover:bg-[var(--docs-accent)]/90"
                    : "bg-white/10 text-white/40"
                )}
                aria-label="Send"
              >
                <PaperPlaneRight className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
