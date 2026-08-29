import {
  type AskAiSettings,
  type ChatAttachment,
  type ChatMessage,
  PROVIDER_DEFAULTS,
} from "@/ask-ai/types";

const REQUEST_TIMEOUT_MS = 120_000;

type ApiMessage =
  | { role: "system"; content: string }
  | { role: "user" | "assistant"; content: string }
  | {
      role: "user";
      content: (
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string } }
      )[];
    };

function buildMessages(
  systemPrompt: string,
  history: ChatMessage[],
  userText: string,
  attachments: ChatAttachment[]
): ApiMessage[] {
  const messages: ApiMessage[] = [];
  if (systemPrompt) messages.push({ role: "system", content: systemPrompt });

  for (const m of history) {
    if (m.role === "system") messages.push({ role: "system", content: m.content });
    else if (m.role === "assistant") messages.push({ role: "assistant", content: m.content });
    else messages.push({ role: "user", content: m.content });
  }

  if (attachments.length > 0) {
    const content: ApiMessage["content"] = [{ type: "text", text: userText }];
    for (const a of attachments) {
      content.push({ type: "image_url", image_url: { url: a.dataUrl } });
    }
    messages.push({ role: "user", content });
  } else {
    messages.push({ role: "user", content: userText });
  }

  return messages;
}

export type StreamCallbacks = {
  onChunk: (text: string) => void;
  onUsage?: (usage: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number }) => void;
  onError: (error: Error) => void;
  onDone: () => void;
};

export function completeChatStream(
  settings: AskAiSettings,
  history: ChatMessage[],
  systemPrompt: string,
  userText: string,
  attachments: ChatAttachment[] = [],
  callbacks: StreamCallbacks
): () => void {
  const meta = PROVIDER_DEFAULTS[settings.provider];
  const apiKey = settings.apiKey.trim();

  if (!apiKey) {
    window.setTimeout(() => callbacks.onError(new Error("Please add an API key in the assistant settings.")), 0);
    return () => {};
  }

  const messages = buildMessages(systemPrompt, history, userText, attachments);
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let done = false;

  const cleanup = () => {
    done = true;
    window.clearTimeout(timeout);
    controller.abort();
  };

  const fail = (err: Error) => {
    if (done) return;
    done = true;
    window.clearTimeout(timeout);
    callbacks.onError(err);
  };

  fetch(`${meta.baseUrl}/chat/completions`, {
    method: "POST",
    signal: controller.signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      Accept: "text/event-stream",
      ...(settings.provider === "openrouter"
        ? { "HTTP-Referer": window.location.href, "X-Title": "Quanvio Docs" }
        : {}),
    },
    body: JSON.stringify({
      model: settings.model,
      messages,
      stream: true,
      ...(settings.provider !== "minimax" ? { stream_options: { include_usage: true } } : {}),
      temperature: 0.6,
    }),
  })
    .then(async (res) => {
      if (!res.ok) {
        let detail = `HTTP ${res.status}`;
        try {
          const err = await res.json();
          detail = err?.error?.message ?? JSON.stringify(err);
        } catch {
          // ignore
        }
        throw new Error(detail);
      }
      if (!res.body) throw new Error("No response body.");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const pump = async (): Promise<void> => {
        if (done) return;
        const { value, done: readerDone } = await reader.read();
        if (readerDone) {
          if (!done) {
            done = true;
            window.clearTimeout(timeout);
            callbacks.onDone();
          }
          return;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === "data: [DONE]") continue;
          if (!trimmed.startsWith("data: ")) continue;
          const jsonStr = trimmed.slice(6);
          try {
            const json = JSON.parse(jsonStr);
            if (json.usage && callbacks.onUsage) {
              callbacks.onUsage(json.usage);
            }
            const delta = json?.choices?.[0]?.delta;
            if (delta?.content) {
              callbacks.onChunk(delta.content);
            }
          } catch {
            // ignore malformed lines
          }
        }

        return pump();
      };

      await pump();
    })
    .catch((err) => {
      fail(err instanceof Error ? err : new Error(String(err)));
    });

  return cleanup;
}
