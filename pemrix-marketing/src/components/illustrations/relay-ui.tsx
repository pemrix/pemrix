"use client";

import { CheckIcon as Check, GitBranchIcon as GitBranch, XIcon as X } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Shared building blocks for the code-built Relay CI/CD product illustrations
 * used across the home page sections (hero, features, features-tabs).
 *
 * Everything is styled with theme tokens so the visuals adapt to light and
 * dark mode. Motion is kept calm — gentle pulses, progress, and staggered
 * fades — and respects the user's reduced-motion preference.
 */

export type RunStatus = "success" | "running" | "queued" | "failed";

const DOT_COLOR: Record<RunStatus, string> = {
  success: "bg-chart-1",
  running: "bg-amber-500",
  queued: "bg-muted-foreground/50",
  failed: "bg-destructive",
};

const TEXT_COLOR: Record<RunStatus, string> = {
  success: "text-chart-1",
  running: "text-amber-500",
  queued: "text-muted-foreground",
  failed: "text-destructive",
};

/**
 * Cycles a status through queued → running → success on a slow, calm loop to
 * illustrate a job's lifecycle. Settles on `success` under reduced motion.
 */
export function useRunLifecycle({
  queued = 2600,
  running = 3600,
  hold = 2800,
}: { queued?: number; running?: number; hold?: number } = {}) {
  const reduce = useReducedMotion();
  const [status, setStatus] = useState<RunStatus>("queued");

  useEffect(() => {
    const run = () => {
      if (reduce) {
        setStatus("success");
        return;
      }
      const timers: ReturnType<typeof setTimeout>[] = [];
      const start = () => {
        setStatus("queued");
        timers.push(setTimeout(() => setStatus("running"), queued));
        timers.push(setTimeout(() => setStatus("success"), queued + running));
      };
      start();
      const loop = setInterval(start, queued + running + hold);
      return () => {
        clearInterval(loop);
        timers.forEach(clearTimeout);
      };
    };
    return run();
  }, [reduce, queued, running, hold]);

  return status;
}

/**
 * Drives a list of `count` jobs through queued → running → success, one after
 * another, then holds and loops. Returns the live status array so a UI can show
 * each task playing and completing in sequence (and derive overall progress).
 * A single chained timer is used so only one timeout is ever outstanding.
 * Settles on all-success under reduced motion.
 */
export function usePipelineSequence({
  count,
  runDuration = 1150,
  gap = 240,
  hold = 2600,
  startDelay = 500,
}: {
  count: number;
  runDuration?: number;
  gap?: number;
  hold?: number;
  startDelay?: number;
}) {
  const reduce = useReducedMotion();
  const [statuses, setStatuses] = useState<RunStatus[]>(() =>
    Array.from({ length: count }, () => "queued" as RunStatus),
  );

  useEffect(() => {
    const run = () => {
      const allQueued = () => Array.from({ length: count }, () => "queued" as RunStatus);

      if (reduce) {
        setStatuses(Array.from({ length: count }, () => "success" as RunStatus));
        return;
      }

      let alive = true;
      let timer: ReturnType<typeof setTimeout>;
      const at = (fn: () => void, ms: number) => {
        timer = setTimeout(() => alive && fn(), ms);
      };
      const setAt = (i: number, s: RunStatus) =>
        setStatuses((prev) => {
          const next = prev.slice();
          next[i] = s;
          return next;
        });

      const step = (i: number) => {
        if (i >= count) {
          at(() => {
            setStatuses(allQueued());
            at(() => step(0), gap);
          }, hold);
          return;
        }
        setAt(i, "running");
        at(() => {
          setAt(i, "success");
          at(() => step(i + 1), gap);
        }, runDuration);
      };

      setStatuses(allQueued());
      at(() => step(0), startDelay);

      return () => {
        alive = false;
        clearTimeout(timer);
      };
    };
    return run();
  }, [reduce, count, runDuration, gap, hold, startDelay]);

  return statuses;
}

/** macOS-style window traffic lights. */
export function TrafficLights({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className="bg-destructive/60 size-2.5 rounded-full" />
      <span className="size-2.5 rounded-full bg-amber-500/60" />
      <span className="bg-chart-1/60 size-2.5 rounded-full" />
    </div>
  );
}

/**
 * A status indicator dot. When `status === 'running'` the core dot "breathes"
 * (smooth scale/opacity) and emits a soft expanding ring. Both loops share the
 * same duration and easing so the motion reads as one calm, continuous pulse.
 * Falls back to a static dot for reduced motion.
 */
export function StatusDot({ status, className }: { status: RunStatus; className?: string }) {
  const reduce = useReducedMotion();
  const isRunning = status === "running";
  const animate = isRunning && !reduce;

  return (
    <span className={cn("relative flex size-2.5 shrink-0 items-center justify-center", className)}>
      {animate && (
        <motion.span
          className={cn("absolute inline-flex size-full rounded-full", DOT_COLOR[status])}
          animate={{ opacity: [0.4, 0], scale: [1, 2.4] }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      )}
      <motion.span
        className={cn("relative inline-flex size-full rounded-full", DOT_COLOR[status])}
        animate={animate ? { scale: [1, 1.18, 1], opacity: [1, 0.8, 1] } : {}}
        transition={animate ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
      />
    </span>
  );
}

/** Small pill describing a run status, matching the app's chip style. */
export function StatusChip({ status, label, className }: { status: RunStatus; label?: string; className?: string }) {
  const text = label ?? { success: "Passed", running: "Running", queued: "Queued", failed: "Failed" }[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[0.625rem] font-medium",
        "bg-muted/40",
        TEXT_COLOR[status],
        className,
      )}
    >
      <StatusDot status={status} className="size-1.5" />
      {text}
    </span>
  );
}

/**
 * Small status glyph used inside grids/lists (tick, cross, or spinner).
 * Every state renders inside the SAME fixed 16px box so the column never
 * changes width — no layout shift when a row moves queued → running → success.
 */
export function StatusGlyph({ status, className }: { status: RunStatus; className?: string }) {
  const reduce = useReducedMotion();

  const indicator =
    status === "success" ? (
      <span className="bg-chart-1/15 text-chart-1 flex size-4 items-center justify-center rounded-full">
        <Check className="size-2.5" />
      </span>
    ) : status === "failed" ? (
      <span className="bg-destructive/15 text-destructive flex size-4 items-center justify-center rounded-full">
        <X className="size-2.5" />
      </span>
    ) : status === "running" ? (
      <motion.span
        className="block size-3 rounded-full border-2 border-amber-500/30 border-t-amber-500"
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    ) : (
      <span className="border-muted-foreground/40 size-3 rounded-full border-2 border-dashed" />
    );

  return <span className={cn("flex size-4 shrink-0 items-center justify-center", className)}>{indicator}</span>;
}

/**
 * A gently advancing progress bar. Loops slowly to suggest an in-flight
 * build without being distracting. Static (full-ish) under reduced motion.
 */
export function ProgressBar({
  className,
  from = 0.15,
  to = 0.9,
  duration = 4,
}: {
  className?: string;
  from?: number;
  to?: number;
  duration?: number;
}) {
  const reduce = useReducedMotion();

  return (
    <span className={cn("bg-muted block h-1 w-full overflow-hidden rounded-full", className)}>
      <motion.span
        className="from-chart-1 to-chart-2 block h-full rounded-full bg-linear-to-r"
        initial={{ scaleX: from }}
        animate={reduce ? { scaleX: to } : { scaleX: [from, to, from] }}
        transition={reduce ? { duration: 0 } : { duration, repeat: Infinity, ease: "easeInOut" }}
        style={{ originX: 0, width: "100%" }}
      />
    </span>
  );
}

/** A single commit/pipeline row: status, hash, branch, message, meta. */
export function CommitRow({
  status,
  hash,
  branch,
  message,
  meta,
  showProgress,
  className,
}: {
  status: RunStatus;
  hash: string;
  branch: string;
  message: string;
  meta?: string;
  showProgress?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-md px-2.5 py-2 text-xs",
        status === "running" && "bg-muted/40",
        className,
      )}
    >
      <StatusDot status={status} />
      <span className="text-muted-foreground font-mono">{hash}</span>
      <span className="text-muted-foreground/80 hidden items-center gap-1 sm:flex">
        <GitBranch className="size-3" />
        {branch}
      </span>
      <span className="text-foreground/90 min-w-0 flex-1 truncate">{message}</span>
      {showProgress ? (
        <span className="hidden w-20 shrink-0 sm:block">
          <ProgressBar />
        </span>
      ) : (
        meta && <span className="text-muted-foreground/70 shrink-0 font-mono">{meta}</span>
      )}
    </div>
  );
}
