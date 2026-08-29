"use client";

import { CaretDown, Check } from "@phosphor-icons/react";
import * as React from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type SearchableSelectOption = {
  value: string;
  label: string;
  tags?: string[];
};

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  triggerClassName?: string;
  contentClassName?: string;
  itemClassName?: string;
  zIndex?: number;
  disabled?: boolean;
  variant?: "default" | "dark";
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  triggerClassName,
  contentClassName,
  itemClassName,
  zIndex,
  disabled,
  variant = "default",
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.value.toLowerCase().includes(q) ||
        o.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }, [options, query]);

  React.useEffect(() => {
    if (open) {
      const t = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      return () => clearTimeout(t);
    }
    setQuery("");
  }, [open]);

  const handleSelect = (next: string) => {
    onChange(next);
    setOpen(false);
    setQuery("");
  };

  const isDark = variant === "dark";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-9 w-full items-center justify-between gap-2 rounded-lg px-3 text-sm transition-colors focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-50",
            isDark
              ? "border border-white/10 bg-white/5 text-white hover:bg-white/[0.07]"
              : "border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
            triggerClassName
          )}
        >
          <span className="truncate">{selected?.label ?? placeholder}</span>
          <CaretDown
            className={cn(
              "size-4 shrink-0 transition-transform",
              open && "rotate-180",
              isDark ? "text-white/50" : "text-muted-foreground"
            )}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={4}
        className={cn(
          "w-[var(--radix-popover-trigger-width)] min-w-[12rem] overflow-hidden p-0",
          isDark
            ? "border-white/10 bg-[#1a1a1a] text-white"
            : "bg-popover text-popover-foreground",
          contentClassName
        )}
        style={{ zIndex }}
      >
        <div className={cn("p-2", isDark ? "border-b border-white/10" : "border-b border-border/50")}>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className={cn(
              "h-8 w-full rounded-md px-2.5 text-sm focus:outline-none",
              isDark
                ? "border border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-[var(--docs-accent)]"
                : "border border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-ring"
            )}
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>
        <div className="max-h-60 overflow-y-auto p-1">
          {filtered.length === 0 && (
            <div
              className={cn(
                "px-3 py-2 text-sm",
                isDark ? "text-white/50" : "text-muted-foreground"
              )}
            >
              No results
            </div>
          )}
          {filtered.map((o) => {
            const active = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => handleSelect(o.value)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  isDark
                    ? "text-white/80 hover:bg-white/10 hover:text-white"
                    : "text-popover-foreground hover:bg-muted hover:text-foreground",
                  active &&
                    (isDark
                      ? "bg-white/10 text-white"
                      : "bg-muted text-foreground"),
                  itemClassName
                )}
              >
                <span className="flex-1 truncate">{o.label}</span>
                {o.tags && o.tags.length > 0 && (
                  <span className="flex shrink-0 gap-1">
                    {o.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className={cn(
                          "rounded-full border px-1.5 py-0.5 text-[10px]",
                          isDark
                            ? "border-white/10 bg-white/5 text-white/50"
                            : "border-border bg-muted text-muted-foreground"
                        )}
                      >
                        {tag}
                      </span>
                    ))}
                  </span>
                )}
                {active && (
                  <Check
                    className={cn(
                      "size-4 shrink-0",
                      isDark ? "text-[var(--docs-accent)]" : "text-foreground"
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
