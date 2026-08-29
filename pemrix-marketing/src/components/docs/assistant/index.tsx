"use client";

import * as React from "react";

import { AssistantFab } from "@/components/docs/assistant/assistant-fab";
import { AssistantPanel } from "@/components/docs/assistant/assistant-panel";
import { AssistantProvider } from "@/components/docs/assistant/assistant-context";
import { AssistantTextHelper } from "@/components/docs/assistant/assistant-text-helper";

export function DocsAssistant({ children }: { children?: React.ReactNode }) {
  return (
    <AssistantProvider>
      {children}
      <AssistantPanel />
      <AssistantFab />
      <AssistantTextHelper />
    </AssistantProvider>
  );
}

export { useAssistant } from "@/components/docs/assistant/assistant-context";
