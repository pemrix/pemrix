import { completeChatStream, type StreamCallbacks } from "@/ask-ai/providers";
import { SYSTEM_PROMPT } from "@/ask-ai/system-prompt";
import {
  type AskAiSettings,
  type ChatAttachment,
  type ChatMessage,
} from "@/ask-ai/types";

export type { AiProvider, AskAiSettings, ChatAttachment, ChatMessage } from "@/ask-ai/types";
export type { StreamCallbacks } from "@/ask-ai/providers";
export { PROVIDER_DEFAULTS } from "@/ask-ai/types";
export { loadPersisted, savePersisted, clearSession, clearAll, stripForSave } from "@/ask-ai/storage";

export function answerQuestion(
  settings: AskAiSettings,
  history: ChatMessage[],
  question: string,
  attachments: ChatAttachment[] = [],
  callbacks: StreamCallbacks,
  opts?: { pageMarkdown?: string; pageContext?: { product: string; title: string; url: string; section?: string } | null }
): () => void {
  const ctxParts: string[] = [];
  if (opts?.pageContext) {
    const { product, title, url, section } = opts.pageContext;
    ctxParts.push(`Current page: ${product} docs — ${title}${section ? ` / ${section}` : ""} (${url})`);
  }
  if (opts?.pageMarkdown) {
    ctxParts.push(`Current page content:\n${opts.pageMarkdown}`);
  }
  const systemPrompt = ctxParts.length > 0 ? `${SYSTEM_PROMPT}\n\n${ctxParts.join("\n\n")}` : SYSTEM_PROMPT;
  return completeChatStream(settings, history, systemPrompt, question, attachments, callbacks);
}
