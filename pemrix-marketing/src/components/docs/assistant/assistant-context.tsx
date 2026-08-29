"use client";

import * as React from "react";

type AssistantPosition = { x: number; y: number };

export type AssistantPanelMode = "floating" | "minimized" | "closed";

export type AssistantPageContext = {
  product: string;
  title: string;
  url: string;
  section?: string;
};

type AssistantContextValue = {
  open: boolean;
  minimized: boolean;
  position: AssistantPosition;
  defaultPosition: AssistantPosition;
  selectedText: string;
  pageContext: AssistantPageContext | null;
  mode: AssistantPanelMode;
  openAssistant: (opts?: { prefill?: string; context?: AssistantPageContext }) => void;
  closeAssistant: () => void;
  toggleAssistant: () => void;
  minimizeAssistant: () => void;
  restoreAssistant: () => void;
  resetPosition: () => void;
  setPosition: (pos: AssistantPosition) => void;
  setSelectedText: (text: string) => void;
  setPageContext: (ctx: AssistantPageContext | null) => void;
};

const AssistantContext = React.createContext<AssistantContextValue | null>(null);

const STORAGE_KEY_UI = "pemrix-assistant-ui-v1";
const PANEL_WIDTH = 420;
const PANEL_HEIGHT = 640;

function getDefaultPosition(): AssistantPosition {
  if (typeof window === "undefined") return { x: 0, y: 0 };
  const padding = 24;
  return {
    x: Math.max(0, window.innerWidth - PANEL_WIDTH - padding),
    y: Math.max(0, window.innerHeight - PANEL_HEIGHT - padding),
  };
}

function clampPosition(pos: AssistantPosition): AssistantPosition {
  if (typeof window === "undefined") return pos;
  const padding = 8;
  return {
    x: Math.max(
      padding,
      Math.min(window.innerWidth - 120, pos.x)
    ),
    y: Math.max(
      padding,
      Math.min(window.innerHeight - 80, pos.y)
    ),
  };
}

function loadUiState(): {
  open: boolean;
  minimized: boolean;
  position?: AssistantPosition;
} {
  if (typeof window === "undefined") return { open: false, minimized: false };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_UI);
    if (!raw) return { open: false, minimized: false };
    const parsed = JSON.parse(raw);
    return {
      open: Boolean(parsed.open),
      minimized: Boolean(parsed.minimized),
      position: parsed.position,
    };
  } catch {
    return { open: false, minimized: false };
  }
}

function saveUiState(state: {
  open: boolean;
  minimized: boolean;
  position: AssistantPosition;
}) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY_UI, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function AssistantProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [minimized, setMinimized] = React.useState(false);
  const [selectedText, setSelectedText] = React.useState("");
  const [pageContext, setPageContextState] = React.useState<AssistantPageContext | null>(null);
  const defaultPositionRef = React.useRef<AssistantPosition>(getDefaultPosition());
  const [position, setPositionState] = React.useState<AssistantPosition>(
    defaultPositionRef.current
  );

  React.useEffect(() => {
    setMounted(true);
    const ui = loadUiState();
    const def = getDefaultPosition();
    defaultPositionRef.current = def;
    setPositionState(clampPosition(ui.position ?? def));
    setOpen(ui.open);
    setMinimized(ui.minimized);
  }, []);

  const saveState = React.useCallback(
    (next: { open: boolean; minimized: boolean; position: AssistantPosition }) => {
      saveUiState(next);
    },
    []
  );

  const setPosition = React.useCallback(
    (pos: AssistantPosition) => {
      const clamped = clampPosition(pos);
      setPositionState(clamped);
      saveState({ open, minimized, position: clamped });
    },
    [open, minimized, saveState]
  );

  const openAssistant = React.useCallback(
    (opts?: { prefill?: string; context?: AssistantPageContext }) => {
      if (opts?.prefill) setSelectedText(opts.prefill);
      if (opts?.context) setPageContextState(opts.context);
      setOpen(true);
      setMinimized(false);
      saveState({ open: true, minimized: false, position });
    },
    [position, saveState]
  );

  const closeAssistant = React.useCallback(() => {
    setOpen(false);
    setMinimized(false);
    saveState({ open: false, minimized: false, position });
  }, [position, saveState]);

  const toggleAssistant = React.useCallback(() => {
    if (open && !minimized) {
      closeAssistant();
    } else {
      openAssistant();
    }
  }, [open, minimized, openAssistant, closeAssistant]);

  const minimizeAssistant = React.useCallback(() => {
    setMinimized(true);
    saveState({ open: true, minimized: true, position });
  }, [position, saveState]);

  const restoreAssistant = React.useCallback(() => {
    setMinimized(false);
    setOpen(true);
    saveState({ open: true, minimized: false, position });
  }, [position, saveState]);

  const resetPosition = React.useCallback(() => {
    const def = getDefaultPosition();
    defaultPositionRef.current = def;
    setPositionState(def);
    saveState({ open, minimized, position: def });
  }, [open, minimized, saveState]);

  const setPageContext = React.useCallback((ctx: AssistantPageContext | null) => {
    setPageContextState(ctx);
  }, []);

  const value = React.useMemo<AssistantContextValue>(
    () => ({
      open,
      minimized,
      position,
      defaultPosition: defaultPositionRef.current,
      selectedText,
      pageContext,
      mode: !open ? "closed" : minimized ? "minimized" : "floating",
      openAssistant,
      closeAssistant,
      toggleAssistant,
      minimizeAssistant,
      restoreAssistant,
      resetPosition,
      setPosition,
      setSelectedText,
      setPageContext,
    }),
    [
      open,
      minimized,
      position,
      selectedText,
      pageContext,
      openAssistant,
      closeAssistant,
      toggleAssistant,
      minimizeAssistant,
      restoreAssistant,
      resetPosition,
      setPosition,
    ]
  );

  return (
    <AssistantContext.Provider value={value}>
      {children}
    </AssistantContext.Provider>
  );
}

export function useAssistant() {
  const ctx = React.useContext(AssistantContext);
  if (!ctx) throw new Error("useAssistant must be used within AssistantProvider");
  return ctx;
}
