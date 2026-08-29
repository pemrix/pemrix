"use client";

import {
  CheckCircleIcon,
  CloudIcon,
  CubeIcon,
  DownloadSimpleIcon as Download,
  GitBranchIcon,
  GithubLogoIcon,
  GitlabLogoIcon,
  type Icon,
  LightningIcon,
  MagicWandIcon,
  SlackLogoIcon,
  TriangleIcon,
} from "@phosphor-icons/react";
import { motion, useInView } from "motion/react";
import { useRef } from "react";

import { NumberTicker } from "@/components/magicui/number-ticker";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Feature card data. Each card's visual is a bespoke code-built illustration
// rendered by renderCardContent (Card1–Card5) — no raster screenshots.
const FEATURE_CARDS = [
  {
    title: "Step-by-Step Pipeline Debugging",
    description: "Trace every job in a run — install, lint, test, build, deploy",
  },
  {
    title: "Export Run Data",
    description: "Download logs, artifacts, and metrics as CSV, JSON, or XLS",
  },
  {
    title: "Pipeline performance",
    description: "Track median time-to-green, queue time, and cache hit rate over time",
  },
  {
    title: "Connect your stack",
    description: "Git hosts, registries, clouds, and chat — wired into every run",
  },
  {
    title: "Relay AI insights",
    description: "Flaky-test detection, auto-retry, and failure triage built in",
  },
];

export default function ProductFeatures() {
  return (
    <section className="section-padding container max-w-screen-xl">
      {/* Header */}
      <div className="mx-auto max-w-4xl">
        <h2 className="text-4xxl leading-tight tracking-tight md:text-5xl">Every step visible. Nothing buried.</h2>
        <p className="text-muted-foreground mt-3 text-lg leading-snug">
          Most CI tools surface pass or fail. Relay shows queue time, cache hits, step logs, and deploy status — exactly
          when you need them.
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div className="mt-10 grid grid-cols-1 gap-6 md:mt-16 lg:grid-cols-6">
        {FEATURE_CARDS.map((card, index) => (
          <FeatureCard
            key={card.title}
            title={card.title}
            description={card.description}
            className={cn(
              "lg:col-span-2",
              (index === 4 || index === 3) &&
                `!h-auto flex-col-reverse justify-between gap-6 lg:col-span-3 lg:flex-row-reverse lg:items-center [&>*]:lg:flex-1`,
            )}
          >
            {renderCardContent(index)}
          </FeatureCard>
        ))}
      </div>
    </section>
  );
}

// Render content for each card based on index
function renderCardContent(index: number) {
  switch (index) {
    case 0:
      return <PipelineTimelineCard />;
    case 1:
      return <ExportCard />;
    case 2:
      return <PerformanceCard />;
    case 3:
      return <NetworkCard />;
    case 4:
      return <AiInsightCard />;
    default:
      return null;
  }
}

// Feature Card Component
function FeatureCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "to-muted/10 via-muted/5 relative justify-between gap-2 overflow-hidden rounded-xl bg-gradient-to-b from-transparent p-8 md:h-[400px]",
        className,
      )}
    >
      <CardContent className="relative flex flex-1 items-center justify-center p-0">{children}</CardContent>
      <CardHeader className="card-header p-0">
        <h3 className="text-accent-foreground text-xl font-bold">{title}</h3>
        <p className="text-muted-foreground text-lg leading-snug">{description}</p>
      </CardHeader>
    </Card>
  );
}

// Card 1 — Vertical run timeline. Stage dots pop in sequence while a gradient
// connector line draws down between them. Distinct from the horizontal bars in
// the source template.
function PipelineTimelineCard() {
  const stages = [
    { label: "Clone", time: "1.2s" },
    { label: "Install", time: "12s" },
    { label: "Lint", time: "4.1s" },
    { label: "Test", time: "28s" },
    { label: "Deploy", time: "9.3s" },
  ];

  return (
    <div className="bg-card/40 w-full overflow-hidden rounded-xl border-t p-5 shadow-lg">
      <div className="text-muted-foreground mb-4 flex items-center justify-between text-[0.625rem]">
        <span className="flex items-center gap-1.5 font-mono">
          <GitBranchIcon className="size-3" />
          feat/preview-env · #1842
        </span>
        <span className="rounded-full bg-green-600/10 px-2 py-0.5 font-medium text-green-600">passed</span>
      </div>

      <div className="space-y-0">
        {stages.map((stage, index) => {
          const isLast = index === stages.length - 1;
          return (
            <div key={stage.label} className="flex items-stretch gap-3">
              {/* Rail: dot + connecting segment */}
              <div className="flex flex-col items-center">
                <motion.span
                  className="from-chart-1 to-chart-3 ring-background relative z-10 mt-1 size-2.5 rounded-full bg-gradient-to-br ring-2"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{
                    duration: 0.3,
                    delay: 0.2 + index * 0.18,
                    type: "spring",
                    stiffness: 320,
                    damping: 18,
                  }}
                />
                {!isLast && (
                  <motion.span
                    className="from-chart-1/70 to-chart-3/40 my-1 w-px flex-1 origin-top bg-gradient-to-b"
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{
                      duration: 0.25,
                      delay: 0.3 + index * 0.18,
                      ease: "easeInOut",
                    }}
                  />
                )}
              </div>

              {/* Stage row */}
              <motion.div
                className="flex flex-1 items-center justify-between pb-4"
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{
                  duration: 0.35,
                  delay: 0.25 + index * 0.18,
                  ease: "easeOut",
                }}
              >
                <span className="text-foreground text-xs font-medium">{stage.label}</span>
                <span className="text-muted-foreground font-mono text-[0.625rem]">{stage.time}</span>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Card 2 — Export panel. A circular progress ring sweeps around a download
// glyph, then format chips light up in turn. Replaces the source's dropdown
// reveal + line chart.
function ExportCard() {
  const formats = ["CSV", "JSON", "XLS"];
  const size = 120;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex w-full flex-col items-center gap-6 px-5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth={stroke}
            opacity={0.4}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#exportRing)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            whileInView={{ strokeDashoffset: circumference * 0.12 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1.1, ease: "easeInOut", delay: 0.2 }}
          />
          <defs>
            <linearGradient id="exportRing" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" />
              <stop offset="100%" stopColor="var(--chart-3)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Download className="text-chart-2 size-6" />
          <span className="text-foreground mt-1 font-mono text-sm font-medium">
            <NumberTicker startValue={0} value={88} delay={0.2} />%
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {formats.map((format, index) => (
          <motion.span
            key={format}
            className="bg-muted/40 text-muted-foreground rounded-md border px-3 py-1 font-mono text-[0.625rem] font-medium"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{
              opacity: 1,
              y: 0,
              borderColor: "color-mix(in oklch, var(--chart-2) 60%, transparent)",
            }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.3, delay: 0.7 + index * 0.15 }}
          >
            .{format.toLowerCase()}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

// Card 3 — Performance sparkline. An SVG trend line draws itself via
// stroke-dashoffset with a settling end dot, framed by two stat chips.
// Replaces the source's recharts area chart.
function PerformanceCard() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });
  const linePath = "M2,14 L34,20 L66,17 L98,26 L130,30 L162,38 L198,44";

  return (
    <div ref={ref} className="w-full space-y-5 px-1">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-muted-foreground text-[0.7rem]">Median time-to-green</p>
          <div className="flex items-baseline gap-2">
            {isInView && <NumberTicker startValue={44} value={40} className="text-4xxl text-foreground font-bold" />}
            <span className="text-muted-foreground text-sm">min</span>
            <span className="rounded-full bg-green-600/10 px-2 py-0.5 text-xs font-medium text-green-600">−9%</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <svg viewBox="0 0 200 52" className="h-24 w-full overflow-visible">
          {[13, 26, 39].map((y) => (
            <line key={y} x1="0" y1={y} x2="200" y2={y} stroke="var(--border)" strokeWidth={0.5} opacity={0.4} />
          ))}
          <motion.path
            d={linePath}
            fill="none"
            stroke="url(#perfLine)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1.2, ease: "easeInOut", delay: 0.2 }}
          />
          <motion.circle
            cx={198}
            cy={44}
            r={3.5}
            fill="var(--chart-3)"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.3, delay: 1.3, type: "spring" }}
          />
          <defs>
            <linearGradient id="perfLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--chart-1)" />
              <stop offset="100%" stopColor="var(--chart-3)" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Queue time", value: "3.1s" },
          { label: "Cache hits", value: "78%" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            className="bg-muted/30 rounded-lg border p-3"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.35, delay: 0.5 + index * 0.15 }}
          >
            <p className="text-muted-foreground text-[0.625rem]">{stat.label}</p>
            <p className="text-foreground mt-0.5 font-mono text-sm font-medium">{stat.value}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Card 4 — Integration hub. A central Relay node with connector lines that
// draw outward to a ring of providers. Replaces the source's uniform logo grid.
function NetworkCard() {
  const nodes: { icon: Icon; left: string; top: string; color: string }[] = [
    { icon: GithubLogoIcon, left: "50%", top: "4%", color: "#8b95a1" },
    { icon: GitlabLogoIcon, left: "90%", top: "30%", color: "#fc6d26" },
    { icon: CloudIcon, left: "86%", top: "78%", color: "#ff9900" },
    { icon: TriangleIcon, left: "50%", top: "96%", color: "currentColor" },
    { icon: CubeIcon, left: "14%", top: "78%", color: "#2496ed" },
    { icon: SlackLogoIcon, left: "10%", top: "30%", color: "#4a154b" },
  ];

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[240px]">
      {/* Connector lines */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
        {nodes.map((node, index) => {
          const x = parseFloat(node.left);
          const y = parseFloat(node.top);
          return (
            <motion.line
              key={index}
              x1="50"
              y1="50"
              x2={x}
              y2={y}
              stroke="url(#netLine)"
              strokeWidth={0.6}
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{
                duration: 0.5,
                delay: 0.3 + index * 0.12,
                ease: "easeOut",
              }}
            />
          );
        })}
        <defs>
          <linearGradient id="netLine" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.7} />
            <stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0.2} />
          </linearGradient>
        </defs>
      </svg>

      {/* Provider nodes */}
      {nodes.map((node, index) => (
        <motion.div
          key={index}
          className="bg-card absolute flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg border shadow-sm"
          style={{ left: node.left, top: node.top }}
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{
            duration: 0.3,
            delay: 0.6 + index * 0.12,
            type: "spring",
            stiffness: 300,
            damping: 18,
          }}
        >
          <node.icon className="size-4" color={node.color} weight="fill" />
        </motion.div>
      ))}

      {/* Central hub */}
      <motion.div
        className="from-chart-1 to-chart-3 absolute top-1/2 left-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg"
        initial={{ opacity: 0, scale: 0.6 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.4, type: "spring", stiffness: 260 }}
      >
        <LightningIcon className="size-6 text-white" weight="fill" />
      </motion.div>
    </div>
  );
}

// Card 5 — AI flaky-test detector. A scan line sweeps the test list, flags a
// flaky test, then resolves it to green after auto-retry. Replaces the source's
// gradient-border notification + sliding stat card.
function AiInsightCard() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });

  const tests = [
    { name: "auth.spec.ts", flaky: false },
    { name: "checkout.spec.ts", flaky: true },
    { name: "search.spec.ts", flaky: false },
  ];

  return (
    <div ref={ref} className="w-full space-y-3">
      <div className="bg-card/40 relative overflow-hidden rounded-xl border p-3">
        {/* Sweeping scan line */}
        <motion.div
          className="via-chart-2/25 pointer-events-none absolute inset-x-0 h-10 bg-gradient-to-b from-transparent to-transparent"
          initial={{ y: "-120%" }}
          whileInView={{ y: "320%" }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.3, ease: "easeInOut", delay: 0.3 }}
        />

        <div className="relative space-y-2">
          {tests.map((test, index) => (
            <motion.div
              key={test.name}
              className="flex items-center justify-between gap-2 text-[0.7rem]"
              initial={{ opacity: 0, x: -6 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.3, delay: 0.2 + index * 0.12 }}
            >
              <span className="text-muted-foreground font-mono">{test.name}</span>
              {test.flaky ? (
                <span className="relative flex h-4 w-24 items-center justify-end">
                  {/* flaky → retried crossfade */}
                  <motion.span
                    className="absolute rounded-full bg-amber-500/15 px-2 py-0.5 font-medium text-amber-500"
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: [0, 1, 1, 0] } : { opacity: 0 }}
                    transition={{
                      duration: 1.6,
                      times: [0, 0.3, 0.75, 1],
                      delay: 0.6,
                    }}
                  >
                    flaky
                  </motion.span>
                  <motion.span
                    className="absolute flex items-center gap-1 rounded-full bg-green-600/10 px-2 py-0.5 font-medium text-green-600"
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.3, delay: 2.2 }}
                  >
                    <CheckCircleIcon className="size-3" weight="fill" />
                    retried
                  </motion.span>
                </span>
              ) : (
                <CheckCircleIcon className="size-3.5 text-green-600" weight="fill" />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <motion.p
        className="text-muted-foreground flex items-center gap-1.5 text-[0.7rem]"
        initial={{ opacity: 0, y: 6 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <MagicWandIcon className="text-chart-2 size-3.5" />
        <span>
          Relay AI: <span className="text-gradient font-medium">auto-retried on isolated runner</span>
        </span>
      </motion.p>
    </div>
  );
}
