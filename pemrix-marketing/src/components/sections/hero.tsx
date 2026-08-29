"use client";
import {
  ArrowRightIcon as ArrowRight,
  ChartLineIcon as LineChart,
  GitBranchIcon as GitBranch,
  GridFourIcon as LayoutGrid,
  MagnifyingGlassIcon as Search,
  PasswordIcon as KeyRound,
  RocketIcon as Rocket,
  SquaresFourIcon as Boxes,
  TerminalIcon as Terminal,
  TreeStructureIcon as Workflow,
} from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";

import {
  type RunStatus,
  StatusChip,
  StatusGlyph,
  TrafficLights,
  usePipelineSequence,
} from "@/components/illustrations/relay-ui";
import { Button } from "@/components/ui/button";
import { ShaderBackground } from "@/components/ui/shader-background";
import { cn } from "@/lib/utils";

export default function Hero() {
  return (
    <section className="relative overflow-x-clip pt-15 pb-44 md:pt-20 md:pb-20 lg:pt-24 lg:pb-24">
      {/* Emerald orb — large, centered, and pushed down so it reads like a sun
          rising up from behind the hero dashboard. z-0 (NOT -z-10, which paints
          behind the page background); content is lifted to z-10. */}
      <div className="pointer-events-none absolute top-0 left-[55%] z-0 aspect-square w-[880px] max-w-[170vw] -translate-x-1/2 translate-y-[22%] scale-110 overflow-visible mask-[radial-gradient(ellipse_at_center,black_42%,transparent_76%)] md:w-[1240px] md:translate-y-[4%] lg:w-[1520px]">
        <ShaderBackground className="h-full w-full overflow-visible" />
      </div>

      <div className="relative z-10 container">
        <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-center">
          <div className="flex max-w-3xl flex-1 flex-col items-start gap-5">
            <div className="flex items-center rounded-full border p-1 text-xs">
              <span className="bg-muted rounded-full px-3 py-1">What&apos;s New?</span>
              <span className="px-3">Relay AI is here</span>
            </div>

            <h1 className="text-5xl leading-none tracking-tight text-balance md:text-6xl lg:text-7xl">
              From commit to production, <span className="text-gradient">without the wait</span>
            </h1>

            <p className="text-muted-foreground leading-snug md:text-lg lg:text-xl">
              Relay is a CI/CD platform with pipelines as code, remote build caching, and preview environments on every
              PR. Queue-to-start in ~15s — ship with confidence, not queue anxiety.
            </p>
          </div>

          {/* CTA Buttons — side by side at every size so the h-14.5 height
              override applies (in flex-col, flex-1 collapses the main-axis
              height, which shrank the buttons on mobile). */}
          <div className="space-y-3">
            <div className="flex flex-row gap-3">
              <Button className="group bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-secondary/25 h-14.5 flex-1 gap-2 rounded-full px-4 text-sm shadow-lg sm:gap-2.5 sm:px-6 sm:text-base md:min-w-48">
                Start building free
                <ArrowRight className="size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Button>
              <Button
                variant="outline"
                className="border-secondary/30 hover:border-secondary/50 hover:bg-secondary/5 h-14.5 flex-1 gap-2 rounded-full px-4 text-sm sm:gap-2.5 sm:px-6 sm:text-base md:min-w-48"
              >
                Read the docs
                <Terminal className="text-secondary size-4 shrink-0" />
              </Button>
            </div>
            <div className="text-muted-foreground text-center text-sm">12M+ builds/mo · 99.99% uptime</div>
          </div>
        </div>

        {/* Hero product illustration — code-built Relay dashboard */}
        <div className="ring-foreground/5 bg-card mt-10 aspect-4/5 w-full overflow-hidden rounded-xs shadow-2xl ring-6 sm:aspect-1440/905 md:mt-20 md:rounded-sm md:ring-16 lg:mt-30">
          <RelayDashboard />
        </div>
      </div>
    </section>
  );
}

// Relay dashboard mockup ------------------------------------------------------

const NAV_ITEMS = [
  { icon: Workflow, label: "Pipelines", active: true },
  { icon: LayoutGrid, label: "Runs" },
  { icon: Rocket, label: "Deployments" },
  { icon: LineChart, label: "Insights" },
  { icon: Boxes, label: "Runners" },
  { icon: KeyRound, label: "Secrets" },
];

const REPOS = [{ name: "acme/web", active: true }, { name: "acme/api" }, { name: "acme/mobile" }];

// Stages of a single pipeline run — each plays and completes in sequence.
const PIPELINE_JOBS = [
  { name: "Install dependencies", dur: "18s" },
  { name: "Lint & typecheck", dur: "9s" },
  { name: "Unit tests", dur: "42s" },
  { name: "Build", dur: "1m 04s" },
  { name: "Integration tests", dur: "55s" },
  { name: "E2E tests", dur: "38s" },
  { name: "Security scan", dur: "21s" },
  { name: "Deploy preview", dur: "27s" },
  { name: "Smoke tests", dur: "12s" },
];

function RelayDashboard() {
  const reduce = useReducedMotion();
  const statuses = usePipelineSequence({ count: PIPELINE_JOBS.length });

  const total = PIPELINE_JOBS.length;
  const completed = statuses.filter((s) => s === "success").length;
  const runningIdx = statuses.findIndex((s) => s === "running");
  const overall: RunStatus = completed === total ? "success" : "running";
  // Fills smoothly to 100%: full step per completed job, plus a partial nudge
  // while a job is in flight.
  const progress = Math.min(1, (completed + (runningIdx >= 0 ? 0.55 : 0)) / total);

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
  };
  const row = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="text-foreground flex h-full w-full flex-col text-[0.6rem] sm:text-xs">
      {/* Window title bar */}
      <div className="border-border bg-muted/30 flex items-center gap-3 border-b px-3 py-2 sm:px-4 sm:py-2.5">
        <TrafficLights />
        <div className="text-muted-foreground flex items-center gap-1.5 font-medium">
          <span className="bg-secondary/15 text-secondary flex size-4 items-center justify-center rounded-[3px] font-semibold sm:size-5">
            R
          </span>
          <span className="hidden sm:inline">relay</span>
          <span className="text-muted-foreground/40">/</span>
          <span>acme/web</span>
        </div>
        <div className="border-input/60 bg-background/50 text-muted-foreground/60 ml-auto hidden items-center gap-2 rounded-md border px-2 py-1 sm:flex">
          <Search className="size-3" />
          <span>Search runs…</span>
        </div>
      </div>

      {/* Body: sidebar + main pane */}
      <div className="flex min-h-0 flex-1">
        {/* Sidebar */}
        <div className="border-border bg-sidebar hidden w-40 shrink-0 flex-col gap-4 border-r p-3 sm:flex lg:w-52 lg:p-4">
          <div className="border-input/60 flex items-center justify-between rounded-md border px-2.5 py-2">
            <span className="flex items-center gap-1.5 font-medium">
              <GitBranch className="size-3" />
              acme/web
            </span>
            <span className="text-muted-foreground/50">⌄</span>
          </div>

          <div className="flex flex-col gap-0.5">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2.5 py-1.5",
                  item.active ? "bg-secondary/15 text-secondary font-medium" : "text-muted-foreground",
                )}
              >
                <item.icon className="size-3.5" />
                {item.label}
              </div>
            ))}
          </div>

          <div className="mt-auto flex flex-col gap-1">
            <span className="text-muted-foreground/60 px-2.5 pb-1 tracking-wide uppercase">Repositories</span>
            {REPOS.map((repo) => (
              <div
                key={repo.name}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2.5 py-1",
                  repo.active ? "text-foreground" : "text-muted-foreground/70",
                )}
              >
                <span className={cn("size-1.5 rounded-full", repo.active ? "bg-chart-1" : "bg-muted-foreground/40")} />
                {repo.name}
              </div>
            ))}
          </div>
        </div>

        {/* Main pane */}
        <div className="flex min-w-0 flex-1 flex-col gap-3 p-3 sm:p-4 lg:p-6">
          {/* Pane header */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold sm:text-base lg:text-lg">Pipeline · feat/preview-env</span>
              <span className="text-muted-foreground hidden sm:inline">Commit a1f9c2e · queue-to-start ~15s</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusChip status={overall} label={overall === "success" ? "Passed" : "Running"} />
              <span className="border-input/60 text-muted-foreground hidden rounded-md border px-2 py-1 font-mono sm:inline">
                #a1f9c2e
              </span>
            </div>
          </div>

          {/* Summary tiles */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Success rate", value: "96.8%" },
              { label: "Avg build", value: "2m 04s" },
              { label: "Cache hits", value: "78%" },
            ].map((tile) => (
              <div
                key={tile.label}
                className="border-border bg-muted/20 flex flex-col gap-0.5 rounded-md border p-2 lg:p-3"
              >
                <span className="text-muted-foreground/80">{tile.label}</span>
                <span className="text-sm font-semibold sm:text-base">{tile.value}</span>
              </div>
            ))}
          </div>

          {/* Run list */}
          <motion.div
            className="border-border bg-background/40 flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border"
            variants={container}
            initial={reduce ? "visible" : "hidden"}
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
          >
            <div className="text-muted-foreground/70 border-border flex items-center gap-3 border-b px-2.5 py-1.5 tracking-wide uppercase">
              <span className="w-4" />
              <span className="flex-1">stage</span>
              <span>status</span>
            </div>

            {/* Each stage plays queued → running → passed in sequence */}
            {PIPELINE_JOBS.map((job, i) => {
              const s = statuses[i] ?? "queued";
              return (
                <motion.div
                  key={job.name}
                  variants={row}
                  className={cn(
                    "border-border/40 flex items-center gap-3 border-b px-2.5 py-2 transition-colors last:border-b-0",
                    s === "running" && "bg-secondary/5",
                  )}
                >
                  <StatusGlyph status={s} />
                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate transition-colors",
                      s === "queued" ? "text-muted-foreground/60" : "text-foreground/90",
                    )}
                  >
                    {job.name}
                  </span>
                  {/* Fixed-height status cell so every state is the same
                      height — no row height shift between queued/running/done. */}
                  <span className="flex h-4 shrink-0 items-center justify-end">
                    {s === "success" ? (
                      <span className="text-chart-1 font-mono text-[0.65rem]">{job.dur}</span>
                    ) : s === "running" ? (
                      <StatusChip status="running" className="h-4" />
                    ) : (
                      <span className="text-muted-foreground/40 text-[0.65rem]">Queued</span>
                    )}
                  </span>
                </motion.div>
              );
            })}

            {/* Overall progress — fills to 100% as stages complete */}
            <div className="border-border mt-auto flex items-center gap-3 border-t px-2.5 py-2">
              <span className="text-muted-foreground max-w-[42%] shrink-0 truncate">
                {overall === "success" ? "Pipeline passed" : `Running: ${PIPELINE_JOBS[runningIdx]?.name ?? "…"}`}
              </span>
              <span className="bg-muted relative h-1.5 flex-1 overflow-hidden rounded-full">
                <motion.span
                  className="from-chart-1 to-chart-2 absolute inset-y-0 left-0 rounded-full bg-linear-to-r"
                  animate={{ width: `${progress * 100}%` }}
                  transition={{
                    duration: reduce ? 0 : 0.7,
                    ease: "easeOut",
                  }}
                />
              </span>
              <span className="text-muted-foreground/70 shrink-0 font-mono">
                {completed} / {total} jobs
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
