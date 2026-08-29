import {
  type AskAiSettings,
  type ChatMessage,
  type PersistedState,
  PROVIDER_DEFAULTS,
} from "@/ask-ai/types";

const STORAGE_KEY = "pemrix-assistant-v1";
const MAX_MESSAGES = 50;

function getDefaultSettings(): AskAiSettings {
  return {
    provider: "openrouter",
    model: PROVIDER_DEFAULTS.openrouter.defaultModel,
    apiKey: "",
  };
}

export function loadPersisted(): PersistedState {
  if (typeof window === "undefined") {
    return { settings: getDefaultSettings(), messages: [] };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { settings: getDefaultSettings(), messages: [] };
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    const settings: AskAiSettings = {
      ...getDefaultSettings(),
      ...(parsed.settings ?? {}),
    };
    // If the persisted model is not in the provider's list, reset to default.
    if (!PROVIDER_DEFAULTS[settings.provider].models.some((m) => m.id === settings.model)) {
      settings.model = PROVIDER_DEFAULTS[settings.provider].defaultModel;
    }
    const messages = (parsed.messages ?? []).slice(-MAX_MESSAGES);
    return { settings, messages };
  } catch {
    return { settings: getDefaultSettings(), messages: [] };
  }
}

export function savePersisted(state: PersistedState): void {
  if (typeof window === "undefined") return;
  try {
    const toSave: PersistedState = {
      settings: state.settings,
      messages: state.messages.slice(-MAX_MESSAGES),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // Ignore quota errors.
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    const state = loadPersisted();
    state.messages = [];
    savePersisted(state);
  } catch {
    // ignore
  }
}

export function clearAll(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function stripForSave(
  messages: ChatMessage[]
): Pick<ChatMessage, "id" | "role" | "content" | "createdAt">[] {
  return messages.slice(-MAX_MESSAGES).map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    createdAt: m.createdAt,
  }));
}
