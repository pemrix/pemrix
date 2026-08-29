export type AiRole = "user" | "assistant" | "system";

export type ChatAttachment = {
  id: string;
  type: "image";
  dataUrl: string;
  name: string;
};

export type ChatMessage = {
  id: string;
  role: AiRole;
  content: string;
  createdAt: number;
  attachments?: ChatAttachment[];
  replyToId?: string;
};

export type AiProvider = "openrouter" | "deepseek" | "openai" | "kimi" | "grok" | "minimax";

export type ModelTag = "cheap" | "fast" | "docs" | "reasoning";

export type ModelInfo = {
  id: string;
  label: string;
  tags: ModelTag[];
};

export type ProviderMeta = {
  label: string;
  baseUrl: string;
  defaultModel: string;
  models: ModelInfo[];
};

export const PROVIDER_DEFAULTS: Record<AiProvider, ProviderMeta> = {
  openrouter: {
    label: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1",
    defaultModel: "openrouter/quasar-alpha",
    models: [
      { id: "openrouter/quasar-alpha", label: "Quasar Alpha", tags: ["fast", "cheap", "docs"] },
      { id: "deepseek/deepseek-chat:free", label: "DeepSeek V3 (free)", tags: ["cheap", "docs"] },
      { id: "deepseek/deepseek-r1:free", label: "DeepSeek R1 (free)", tags: ["reasoning", "cheap"] },
      { id: "openai/gpt-4o-mini", label: "GPT-4o mini", tags: ["fast", "cheap", "docs"] },
      { id: "google/gemini-2.0-flash-exp:free", label: "Gemini 2.0 Flash (free)", tags: ["fast", "cheap", "docs"] },
      { id: "anthropic/claude-3.5-haiku", label: "Claude 3.5 Haiku", tags: ["fast", "docs"] },
      { id: "qwen/qwen2.5-vl-72b-instruct:free", label: "Qwen2.5 VL 72B (free)", tags: ["cheap", "docs"] },
      { id: "meta-llama/llama-3.1-8b-instruct:free", label: "Llama 3.1 8B (free)", tags: ["fast", "cheap"] },
    ],
  },
  deepseek: {
    label: "DeepSeek",
    baseUrl: "https://api.deepseek.com/v1",
    defaultModel: "deepseek-chat",
    models: [
      { id: "deepseek-chat", label: "DeepSeek V3", tags: ["cheap", "docs"] },
      { id: "deepseek-reasoner", label: "DeepSeek R1", tags: ["reasoning", "cheap"] },
      { id: "deepseek-coder", label: "DeepSeek Coder", tags: ["docs"] },
    ],
  },
  openai: {
    label: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o-mini",
    models: [
      { id: "gpt-4o-mini", label: "GPT-4o mini", tags: ["fast", "cheap", "docs"] },
      { id: "gpt-4o", label: "GPT-4o", tags: ["docs"] },
      { id: "gpt-4.1-mini", label: "GPT-4.1 mini", tags: ["fast", "cheap", "docs"] },
      { id: "gpt-4.1-nano", label: "GPT-4.1 nano", tags: ["fast", "cheap"] },
      { id: "o3-mini", label: "o3-mini", tags: ["reasoning", "cheap"] },
    ],
  },
  kimi: {
    label: "Kimi",
    baseUrl: "https://api.moonshot.cn/v1",
    defaultModel: "moonshot-v1-8k",
    models: [
      { id: "moonshot-v1-8k", label: "Moonshot v1 8K", tags: ["fast", "cheap", "docs"] },
      { id: "moonshot-v1-32k", label: "Moonshot v1 32K", tags: ["docs"] },
      { id: "moonshot-v1-128k", label: "Moonshot v1 128K", tags: ["docs"] },
    ],
  },
  grok: {
    label: "Grok",
    baseUrl: "https://api.x.ai/v1",
    defaultModel: "grok-2-latest",
    models: [
      { id: "grok-2-latest", label: "Grok 2", tags: ["fast", "docs"] },
      { id: "grok-3-mini-beta", label: "Grok 3 Mini", tags: ["fast", "cheap", "docs"] },
      { id: "grok-3-beta", label: "Grok 3", tags: ["docs"] },
    ],
  },
  minimax: {
    label: "MiniMax",
    baseUrl: "https://api.minimax.chat/v1",
    defaultModel: "minimax-text-01",
    models: [
      { id: "minimax-text-01", label: "MiniMax-Text-01", tags: ["cheap", "docs"] },
      { id: "abab6.5s-chat", label: "abab6.5s Chat", tags: ["fast", "cheap", "docs"] },
      { id: "abab6.5-chat", label: "abab6.5 Chat", tags: ["docs"] },
    ],
  },
};

export type AskAiSettings = {
  provider: AiProvider;
  model: string;
  apiKey: string;
};

export type PersistedState = {
  settings: AskAiSettings;
  messages: Pick<ChatMessage, "id" | "role" | "content" | "createdAt">[];
};
