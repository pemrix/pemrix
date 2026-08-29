"use client";

import { GlobeIcon as Globe, LockIcon as Lock, PasswordIcon as KeyRound } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";

import {
  ProgressBar,
  type RunStatus,
  StatusChip,
  StatusDot,
  StatusGlyph,
  useRunLifecycle,
} from "@/components/illustrations/relay-ui";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

type FeatureId = "cache" | "matrix" | "previews" | "runners" | "secrets" | "insights" | "yaml" | "gates";

const ITEMS: { id: FeatureId; title: string; desc: string }[] = [
  {
    id: "cache",
    title: "Remote Build Caching",
    desc: "Reuse layers across branches and runners. Builds finish 3.2x faster on average.",
  },
  {
    id: "matrix",
    title: "Matrix Builds",
    desc: "Test across OS, runtime, and dependency versions in a single pipeline definition.",
  },
  {
    id: "previews",
    title: "Preview Environments",
    desc: "Spin up an isolated preview URL for every pull request — review before merge.",
  },
  {
    id: "runners",
    title: "Cloud & Self-Hosted Runners",
    desc: "Run on managed Linux, macOS, Windows, and ARM — or bring your own hardware.",
  },
  {
    id: "secrets",
    title: "Secrets & OIDC",
    desc: "Scoped secrets, short-lived tokens, and OIDC federation — no long-lived keys in CI.",
  },
  {
    id: "insights",
    title: "Pipeline Insights",
    desc: "Track build duration, queue time, and success rate across every team and repo.",
  },
  {
    id: "yaml",
    title: "Pipelines as Code",
    desc: "Define stages, jobs, and gates in relay.yaml — versioned beside your application.",
  },
  {
    id: "gates",
    title: "Deploy Gates & Rollbacks",
    desc: "Require approvals before production, then roll back to the last good deploy in one click.",
  },
];

const Features = ({ className }: { className?: string }) => {
  return (
    <section className={cn("py-10 md:py-20", className)}>
      <Carousel>
        <div className="container flex flex-col justify-between gap-10 md:flex-row md:items-center">
          <div className="max-w-3xl space-y-3">
            <h2 className="text-4xxl leading-tight tracking-tight md:text-5xl">Built for teams who ship every day</h2>
            <p className="text-muted-foreground max-w-xl text-lg leading-snug">
              Caching, matrix builds, preview environments, and deploy gates — everything you need from push to
              production in one platform.
            </p>
          </div>
          <div className="hidden gap-3 md:flex">
            <CarouselPrevious className="via-muted/20 border-border to-muted/50 relative top-0 left-0 translate-y-0 rounded-md bg-gradient-to-br from-transparent" />
            <CarouselNext className="via-muted/20 border-border to-muted/50 relative top-0 left-0 translate-y-0 rounded-md bg-gradient-to-br from-transparent" />
          </div>
        </div>

        <CarouselContent className="mx-auto mt-10 max-w-[3000px] cursor-grab">
          {ITEMS.map((card) => (
            <CarouselItem key={card.id} className="min-w-70 basis-[16%] pl-6">
              <div className="flex h-full flex-col">
                <Card className="dark:via-muted/20 dark:to-muted/50 to-background via-card from-card h-43 overflow-hidden bg-gradient-to-br dark:from-transparent">
                  <CardContent className="flex h-full items-center justify-center">
                    <FeatureVisual id={card.id} />
                  </CardContent>
                </Card>

                {/* Text block outside of card */}
                <h3 className="text-accent-foreground mt-3 mb-2 text-lg font-bold">{card.title}</h3>
                <p className="text-muted-foreground">{card.desc}</p>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="container mt-10 flex justify-center gap-3 md:hidden">
          <CarouselPrevious className="dark:via-muted/20 border-border dark:to-muted/50 to-background via-card from-card relative top-0 left-0 translate-y-0 rounded-md bg-gradient-to-br dark:from-transparent" />
          <CarouselNext className="dark:via-muted/20 border-border dark:to-muted/50 to-background via-card from-card relative top-0 left-0 translate-y-0 rounded-md bg-gradient-to-br dark:from-transparent" />
        </div>
      </Carousel>
    </section>
  );
};

export default Features;

// Per-card illustrations -------------------------------------------------------

function FeatureVisual({ id }: { id: FeatureId }) {
  switch (id) {
    case "cache":
      return <CacheViz />;
    case "matrix":
      return <MatrixViz />;
    case "previews":
      return <PreviewViz />;
    case "runners":
      return <RunnersViz />;
    case "secrets":
      return <SecretsViz />;
    case "insights":
      return <InsightsViz />;
    case "yaml":
      return <YamlViz />;
    case "gates":
      return <GatesViz />;
  }
}

/** Shared fade-in for list-style illustration rows. */
const rowStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const rowItem = {
  hidden: { opacity: 0, x: -6 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35 } },
};

function VizFrame({ children }: { children: React.ReactNode }) {
  return <div className="text-foreground w-full text-[0.625rem] leading-tight">{children}</div>;
}

// 1. Remote build caching — hit-rate bar + cached layers.
function CacheViz() {
  const layers: { name: string; cached: boolean }[] = [
    { name: "deps", cached: true },
    { name: "node_modules", cached: true },
    { name: "build", cached: false },
  ];
  return (
    <VizFrame>
      <div className="mb-2 flex items-end justify-between">
        <span className="text-muted-foreground">Cache hit rate</span>
        <span className="text-chart-1 text-base font-semibold">78%</span>
      </div>
      <ProgressBar from={0.1} to={0.78} duration={5} className="mb-3 h-1.5" />
      <motion.div
        className="flex flex-col gap-1"
        variants={rowStagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.6 }}
      >
        {layers.map((layer) => (
          <motion.div
            key={layer.name}
            variants={rowItem}
            className="border-border/60 bg-muted/20 flex items-center justify-between rounded-[4px] border px-2 py-1"
          >
            <span className="font-mono">{layer.name}</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 font-medium",
                layer.cached ? "bg-chart-1/15 text-chart-1" : "bg-amber-500/15 text-amber-500",
              )}
            >
              {layer.cached ? "cached" : "rebuilt"}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </VizFrame>
  );
}

// 2. Matrix builds — OS × Node version grid with status ticks.
function MatrixViz() {
  const lastCell = useRunLifecycle({ queued: 1800, running: 2600, hold: 2600 });
  const nodes = ["18", "20", "22"];
  const os = ["ubuntu", "macos", "windows"];
  // grid[row][col]; final cell animates through its lifecycle.
  const grid: RunStatus[][] = [
    ["success", "success", "success"],
    ["success", "running", "success"],
    ["success", "success", lastCell],
  ];
  return (
    <VizFrame>
      <div className="grid grid-cols-[auto_repeat(3,1fr)] gap-x-2 gap-y-1.5">
        <span />
        {nodes.map((n) => (
          <span key={n} className="text-muted-foreground text-center font-mono">
            node {n}
          </span>
        ))}
        {os.map((osName, r) => (
          <FragmentRow key={osName} label={osName} statuses={grid[r]} />
        ))}
      </div>
    </VizFrame>
  );
}

function FragmentRow({ label, statuses }: { label: string; statuses: RunStatus[] }) {
  return (
    <>
      <span className="text-muted-foreground flex items-center font-mono">{label}</span>
      {statuses.map((s, i) => (
        <motion.span
          key={i}
          className="flex justify-center"
          initial={{ opacity: 0, scale: 0.6 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.3, delay: i * 0.08 }}
        >
          <StatusGlyph status={s} />
        </motion.span>
      ))}
    </>
  );
}

// 3. Preview environments — browser URL card for a PR preview.
function PreviewViz() {
  return (
    <VizFrame>
      <div className="border-border bg-background/50 overflow-hidden rounded-md border">
        <div className="border-border bg-muted/30 flex items-center gap-1.5 border-b px-2 py-1.5">
          <span className="bg-destructive/50 size-1.5 rounded-full" />
          <span className="size-1.5 rounded-full bg-amber-500/50" />
          <span className="bg-chart-1/50 size-1.5 rounded-full" />
          <span className="text-muted-foreground ml-1 flex flex-1 items-center gap-1 truncate font-mono">
            <Globe className="size-2.5 shrink-0" />
            pr-1842.relay.dev
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 px-2.5 py-2.5">
          <div className="flex flex-col gap-0.5">
            <span className="font-medium">PR #1842</span>
            <span className="text-muted-foreground">feat/preview-env</span>
          </div>
          <StatusChip status="success" label="Ready" />
        </div>
      </div>
      <div className="text-muted-foreground mt-2 flex items-center justify-between font-mono">
        <span>deployed 12s ago</span>
        <span className="text-chart-1">● live</span>
      </div>
    </VizFrame>
  );
}

// 4. Cloud & self-hosted runners — fleet list with online dots.
function RunnersViz() {
  const runners: { name: string; status: RunStatus; jobs: string }[] = [
    { name: "linux-x64", status: "running", jobs: "3 jobs" },
    { name: "macos-arm", status: "running", jobs: "1 job" },
    { name: "windows", status: "success", jobs: "idle" },
    { name: "self-hosted", status: "success", jobs: "idle" },
  ];
  return (
    <VizFrame>
      <motion.div
        className="flex flex-col gap-1"
        variants={rowStagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
      >
        {runners.map((r) => (
          <motion.div
            key={r.name}
            variants={rowItem}
            className="border-border/60 bg-muted/20 flex items-center gap-2 rounded-[4px] border px-2 py-1"
          >
            <StatusDot status={r.status} />
            <span className="flex-1 font-mono">{r.name}</span>
            <span className="text-muted-foreground/70">{r.jobs}</span>
          </motion.div>
        ))}
      </motion.div>
    </VizFrame>
  );
}

// 5. Secrets & OIDC — masked vault rows.
function SecretsViz() {
  const secrets = ["DATABASE_URL", "STRIPE_KEY", "OIDC_TOKEN"];
  return (
    <VizFrame>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-muted-foreground flex items-center gap-1">
          <Lock className="size-2.5" />
          Vault
        </span>
        <span className="bg-secondary/15 text-secondary rounded-full px-1.5 py-0.5 font-medium">OIDC</span>
      </div>
      <motion.div
        className="flex flex-col gap-1"
        variants={rowStagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.6 }}
      >
        {secrets.map((name) => (
          <motion.div
            key={name}
            variants={rowItem}
            className="border-border/60 bg-muted/20 flex items-center gap-2 rounded-[4px] border px-2 py-1"
          >
            <KeyRound className="text-muted-foreground/70 size-2.5 shrink-0" />
            <span className="flex-1 font-mono">{name}</span>
            <span className="text-muted-foreground/50 tracking-widest">••••••</span>
          </motion.div>
        ))}
      </motion.div>
    </VizFrame>
  );
}

// 6. Pipeline insights — sparkline + headline metric.
function InsightsViz() {
  return (
    <VizFrame>
      <div className="mb-1 flex items-end justify-between">
        <div className="flex flex-col">
          <span className="text-muted-foreground">Avg build time</span>
          <span className="text-base font-semibold">2m 04s</span>
        </div>
        <span className="bg-chart-1/15 text-chart-1 rounded-full px-1.5 py-0.5 font-medium">−18%</span>
      </div>
      <Sparkline />
    </VizFrame>
  );
}

function Sparkline() {
  const reduce = useReducedMotion();
  // A gently descending trend line (build time going down).
  const d = "M2 26 L20 22 L38 24 L56 16 L74 18 L92 10 L110 12 L128 6";
  return (
    <svg viewBox="0 0 130 32" className="mt-1 h-10 w-full" fill="none">
      <defs>
        <linearGradient id="rl-spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={`${d} L128 32 L2 32 Z`}
        fill="url(#rl-spark)"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.4 }}
      />
      <motion.path
        d={d}
        stroke="var(--chart-1)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: "easeInOut" }}
      />
    </svg>
  );
}

// 7. Pipelines as code — mini relay.yaml snippet.
function YamlViz() {
  const lines = [
    [
      { t: "pipeline", c: "text-chart-2" },
      { t: ": ", c: "text-muted-foreground/60" },
      { t: "web", c: "text-chart-1" },
    ],
    [
      { t: "on", c: "text-chart-2" },
      { t: ": [", c: "text-muted-foreground/60" },
      { t: "push, pr", c: "text-chart-1" },
      { t: "]", c: "text-muted-foreground/60" },
    ],
    [
      { t: "jobs", c: "text-chart-2" },
      { t: ":", c: "text-muted-foreground/60" },
    ],
    [
      { t: "  build", c: "text-chart-2" },
      { t: ":", c: "text-muted-foreground/60" },
    ],
    [
      { t: "    cache", c: "text-chart-2" },
      { t: ": ", c: "text-muted-foreground/60" },
      { t: "true", c: "text-chart-3" },
    ],
    [
      { t: "    run", c: "text-chart-2" },
      { t: ": ", c: "text-muted-foreground/60" },
      { t: "pnpm build", c: "text-chart-1" },
    ],
  ];
  return (
    <VizFrame>
      <div className="border-border bg-background/50 overflow-hidden rounded-md border">
        <div className="border-border text-muted-foreground border-b px-2.5 py-1 font-mono">relay.yaml</div>
        <motion.pre
          className="px-2.5 py-2 font-mono leading-relaxed"
          variants={rowStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          {lines.map((line, i) => (
            <motion.div key={i} variants={rowItem}>
              {line.map((seg, j) => (
                <span key={j} className={seg.c}>
                  {seg.t}
                </span>
              ))}
            </motion.div>
          ))}
        </motion.pre>
      </div>
    </VizFrame>
  );
}

// 8. Deploy gates & rollbacks — approval UI.
function GatesViz() {
  return (
    <VizFrame>
      <div className="border-border bg-background/50 flex flex-col gap-2 rounded-md border p-2.5">
        <div className="flex items-center justify-between">
          <span className="font-medium">Deploy to production</span>
          <StatusChip status="queued" label="Gated" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">Approvals</span>
          <ProgressBar from={0.5} to={1} duration={4.5} className="flex-1" />
          <span className="text-chart-1 font-mono">2/2</span>
        </div>
        <div className="flex gap-1.5">
          <span className="bg-chart-1/15 text-chart-1 flex-1 rounded-[4px] py-1 text-center font-medium">Approve</span>
          <span className="border-border text-muted-foreground flex-1 rounded-[4px] border py-1 text-center">
            Rollback
          </span>
        </div>
      </div>
    </VizFrame>
  );
}
