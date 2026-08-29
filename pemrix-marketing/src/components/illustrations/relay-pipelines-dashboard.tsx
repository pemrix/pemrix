"use client";

import {
  ArrowsDownUpIcon as ChevronsUpDown,
  ChartLineIcon as LineChart,
  CheckIcon as Check,
  GitBranchIcon as GitBranch,
  HardDrivesIcon as Server,
  ListChecksIcon as ListChecks,
  MagnifyingGlassIcon as Search,
  PlusIcon as Plus,
  SquaresFourIcon as Boxes,
  TreeStructureIcon as Workflow,
} from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Code-built "Relay pipelines dashboard" mockup used on the product page in
 * place of a baked-in screenshot. Everything is theme-token styled so it reads
 * correctly in light and dark mode. Motion is intentionally calm: staggered row
 * fades, a slow spinner + ping on the running build, a ticking duration, and a
 * single queued → running transition. All of it respects reduced motion.
 */

type RunStatus = "passed" | "running" | "queued";

const NAV_ITEMS = [
  { label: "Pipelines", icon: Workflow, active: true },
  { label: "Runs", icon: ListChecks, active: false },
  { label: "Runners", icon: Server, active: false },
  { label: "Environments", icon: Boxes, active: false },
  { label: "Insights", icon: LineChart, active: false },
];

const METRICS = [
  { label: "Success rate", value: "98.6%", delta: "+1.2%" },
  { label: "Median time-to-green", value: "40s", delta: "−9%" },
  { label: "Queue time", value: "6s", delta: "−3s" },
  { label: "Cache hit rate", value: "78%", delta: "3.2x" },
];

type Run = {
  branch: string;
  hash: string;
  message: string;
  status: RunStatus;
  duration: string;
};

const RUNS: Run[] = [
  {
    branch: "feat/preview-env",
    hash: "a1f9c3e",
    message: "Add preview environment provisioning",
    status: "passed",
    duration: "2m 14s",
  },
  {
    branch: "main",
    hash: "4c2b9d1",
    message: "Bump checkout-api to v2.4.0",
    status: "running",
    duration: "",
  },
  {
    branch: "fix/cache-key",
    hash: "7e0a5f2",
    message: "Stabilize remote cache key hashing",
    status: "queued",
    duration: "—",
  },
  {
    branch: "chore/deps",
    hash: "b93c1aa",
    message: "Upgrade pnpm and refresh lockfile",
    status: "passed",
    duration: "1m 58s",
  },
  {
    branch: "feat/matrix",
    hash: "d21f7c8",
    message: "Parallelize test matrix shards",
    status: "passed",
    duration: "3m 06s",
  },
];

function StatusDot({ status }: { status: RunStatus }) {
  const reduce = useReducedMotion();
  const color = status === "passed" ? "bg-chart-1" : status === "running" ? "bg-amber-500" : "bg-muted-foreground/50";

  return (
    <span className="relative flex size-2.5 shrink-0">
      {status === "running" && !reduce && (
        <motion.span
          className={cn("absolute inline-flex size-full rounded-full", color)}
          initial={{ opacity: 0.5, scale: 1 }}
          animate={{ opacity: 0, scale: 2.4 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <span className={cn("relative inline-flex size-2.5 rounded-full", color)} />
    </span>
  );
}

function StatusBadge({ status }: { status: RunStatus }) {
  const reduce = useReducedMotion();
  const styles: Record<RunStatus, string> = {
    passed: "text-chart-1 bg-chart-1/10",
    running: "text-amber-500 bg-amber-500/10",
    queued: "text-muted-foreground bg-muted/60",
  };
  const label = status === "passed" ? "Passed" : status === "running" ? "Running" : "Queued";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.7rem] font-medium",
        styles[status],
      )}
    >
      {status === "passed" ? (
        <Check className="size-3" />
      ) : status === "running" ? (
        <motion.span
          className="block size-2.5 rounded-full border-2 border-amber-500/30 border-t-amber-500"
          animate={reduce ? undefined : { rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      ) : (
        <span className="border-muted-foreground/50 size-2.5 rounded-full border-2 border-dashed" />
      )}
      {label}
    </span>
  );
}

/** A live-updating m:ss duration for the in-flight run. */
function useTickingDuration(active: boolean, startSeconds = 71) {
  const reduce = useReducedMotion();
  const [seconds, setSeconds] = useState(startSeconds);

  useEffect(() => {
    if (!active || reduce) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [active, reduce]);

  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

export function RelayPipelinesDashboard({ className }: { className?: string }) {
  const reduce = useReducedMotion();

  // Second row starts running; after a beat the queued row also kicks off,
  // demonstrating live queue → running movement.
  const [thirdStatus, setThirdStatus] = useState<RunStatus>("queued");
  useEffect(() => {
    if (reduce) return;
    const id = setTimeout(() => setThirdStatus("running"), 3200);
    return () => clearTimeout(id);
  }, [reduce]);

  const runningDuration = useTickingDuration(true, 71);
  const thirdDuration = useTickingDuration(thirdStatus === "running", 3);

  return (
    <div
      className={cn(
        "bg-card ring-border/70 flex aspect-1440/905 w-full flex-col overflow-hidden rounded-xl border shadow-2xl ring-1",
        className,
      )}
    >
      {/* Title bar */}
      <div className="border-border/70 flex items-center gap-4 border-b px-3 py-2 sm:px-4 sm:py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="bg-destructive/60 size-2.5 rounded-full" />
          <span className="size-2.5 rounded-full bg-amber-500/60" />
          <span className="bg-chart-1/60 size-2.5 rounded-full" />
        </div>

        <div className="mx-auto flex items-center gap-2 text-xs">
          <div className="bg-muted/50 text-muted-foreground flex items-center gap-1.5 rounded-md border px-2 py-1">
            <Workflow className="size-3" />
            <span className="text-foreground/80 font-medium">relay/checkout-api</span>
          </div>
          <div className="bg-muted/50 text-muted-foreground flex items-center gap-1.5 rounded-md border px-2 py-1">
            <GitBranch className="size-3" />
            main
            <ChevronsUpDown className="size-3 opacity-60" />
          </div>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <div className="bg-muted/40 text-muted-foreground flex w-32 items-center gap-2 rounded-md border px-2 py-1 text-[0.7rem]">
            <Search className="size-3" />
            <span className="opacity-50">Search runs</span>
          </div>
          <span className="from-chart-1 to-chart-2 size-6 rounded-full bg-linear-to-br" />
        </div>
      </div>

      {/* Body */}
      <div className="flex min-h-0 flex-1">
        {/* Sidebar */}
        <div className="border-border/70 hidden w-40 shrink-0 flex-col justify-between border-r p-3 sm:flex lg:w-48">
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs",
                  item.active ? "bg-muted/70 text-foreground font-medium" : "text-muted-foreground",
                )}
              >
                <item.icon className="size-3.5" />
                {item.label}
              </div>
            ))}
          </nav>

          <div className="bg-muted/40 rounded-md border p-2.5">
            <div className="text-gradient text-[0.7rem] font-medium">Relay AI</div>
            <p className="text-muted-foreground mt-0.5 text-[0.65rem] leading-snug">2 flaky tests auto-retried today</p>
          </div>
        </div>

        {/* Main pane */}
        <div className="flex min-w-0 flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-5">
          {/* Metrics strip */}
          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            {METRICS.map((metric, i) => (
              <motion.div
                key={metric.label}
                className="bg-muted/30 rounded-lg border p-2.5"
                initial={reduce ? false : { opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.4, delay: i * 0.08, ease: "easeOut" }}
              >
                <div className="text-muted-foreground truncate text-[0.65rem]">{metric.label}</div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-foreground text-base font-semibold sm:text-lg">{metric.value}</span>
                  <span className="text-chart-1 text-[0.65rem] font-medium">{metric.delta}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Recent runs */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border">
            <div className="border-border/70 flex items-center justify-between border-b px-3 py-2">
              <span className="text-foreground text-xs font-medium">Recent pipeline runs</span>
              <span className="bg-muted/50 text-muted-foreground flex items-center gap-1 rounded-md border px-2 py-0.5 text-[0.65rem]">
                <Plus className="size-2.5" />
                New pipeline
              </span>
            </div>

            {/* Column header */}
            <div className="text-muted-foreground/70 grid grid-cols-[1.5fr_2.5fr_auto_auto] items-center gap-3 px-3 py-1.5 text-[0.65rem] tracking-wide uppercase">
              <span>Branch</span>
              <span className="hidden sm:block">Commit</span>
              <span className="justify-self-end">Status</span>
              <span className="w-16 justify-self-end text-right">Duration</span>
            </div>

            <div className="divide-border/60 min-h-0 flex-1 divide-y">
              {RUNS.map((run, i) => {
                const status = i === 2 ? thirdStatus : run.status;
                const duration =
                  status === "queued"
                    ? "—"
                    : status === "running"
                      ? i === 2
                        ? thirdDuration
                        : runningDuration
                      : run.duration;

                return (
                  <motion.div
                    key={run.hash}
                    className={cn(
                      "grid grid-cols-[1.5fr_2.5fr_auto_auto] items-center gap-3 px-3 py-2 text-xs",
                      status === "running" && "bg-muted/30",
                    )}
                    initial={reduce ? false : { opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.1 + i * 0.08,
                      ease: "easeOut",
                    }}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <StatusDot status={status} />
                      <span className="text-foreground/90 truncate font-medium">{run.branch}</span>
                    </div>
                    <div className="hidden min-w-0 items-center gap-2 sm:flex">
                      <span className="text-muted-foreground/70 font-mono text-[0.7rem]">{run.hash}</span>
                      <span className="text-muted-foreground truncate">{run.message}</span>
                    </div>
                    <div className="justify-self-end">
                      <StatusBadge status={status} />
                    </div>
                    <span className="text-muted-foreground/80 w-16 justify-self-end text-right font-mono text-[0.7rem]">
                      {duration}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
