"use client";

import { useTranslations } from "next-intl";
import * as React from "react";

import {
  clearAll,
  clearSession,
  loadPersisted,
  PROVIDER_DEFAULTS,
  type AiProvider,
  type AskAiSettings,
} from "@/ask-ai";
import { Label } from "@/components/ui/label";
import {
  SearchableSelect,
  type SearchableSelectOption,
} from "@/components/ui/searchable-select";

const TAG_LABELS: Record<string, string> = {
  cheap: "Cheap",
  fast: "Fast",
  docs: "Good for docs",
  reasoning: "Reasoning",
};

const providerOptions: SearchableSelectOption[] = (
  Object.keys(PROVIDER_DEFAULTS) as AiProvider[]
).map((p) => ({
  value: p,
  label: PROVIDER_DEFAULTS[p].label,
}));

function modelOptions(provider: AiProvider): SearchableSelectOption[] {
  return PROVIDER_DEFAULTS[provider].models.map((m) => ({
    value: m.id,
    label: m.label,
    tags: m.tags.map((t) => TAG_LABELS[t] ?? t),
  }));
}

interface AssistantSettingsProps {
  settings: AskAiSettings;
  onChange: (settings: AskAiSettings) => void;
  onClearMessages: () => void;
}

export function AssistantSettings({
  settings,
  onChange,
  onClearMessages,
}: AssistantSettingsProps) {
  const t = useTranslations("docs.assistant");
  const providerMeta = PROVIDER_DEFAULTS[settings.provider];
  const models = React.useMemo(
    () => modelOptions(settings.provider),
    [settings.provider]
  );

  const handleProviderChange = (provider: string) => {
    onChange({
      ...settings,
      provider: provider as AiProvider,
      model: PROVIDER_DEFAULTS[provider as AiProvider].defaultModel,
    });
  };

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-1.5">
        <Label className="text-xs text-white/70">{t("provider")}</Label>
        <SearchableSelect
          options={providerOptions}
          value={settings.provider}
          onChange={handleProviderChange}
          placeholder={t("provider")}
          searchPlaceholder={t("searchProvider")}
          zIndex={110}
          variant="dark"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-white/70">{t("model")}</Label>
        <SearchableSelect
          options={models}
          value={settings.model}
          onChange={(model) => onChange({ ...settings, model })}
          placeholder={t("model")}
          searchPlaceholder={t("searchModel")}
          zIndex={110}
          variant="dark"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-white/70">{t("apiKey")}</Label>
        <input
          type="password"
          autoComplete="off"
          placeholder={`${providerMeta.label} ${t("apiKey")}`}
          value={settings.apiKey}
          onChange={(e) => onChange({ ...settings, apiKey: e.target.value })}
          className="h-9 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none"
        />
        <p className="text-xs text-white/40">{t("apiKeyHint")}</p>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={() => {
            clearSession();
            onClearMessages();
          }}
          className="flex-1 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 transition-colors hover:bg-white/10"
        >
          {t("clearChat")}
        </button>
        <button
          type="button"
          onClick={() => {
            clearAll();
            onChange(loadPersisted().settings);
            onClearMessages();
          }}
          className="flex-1 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 transition-colors hover:bg-white/10"
        >
          {t("clearAll")}
        </button>
      </div>
    </div>
  );
}
