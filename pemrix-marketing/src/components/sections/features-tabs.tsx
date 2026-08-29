"use client";

import {
  ArrowCounterClockwiseIcon as RotateCcw,
  ArrowRightIcon as ArrowRight,
  CheckIcon as Check,
  GitPullRequestIcon as GitPullRequest,
  GlobeIcon as Globe,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { useState } from "react";

import {
  ProgressBar,
  type RunStatus,
  StatusChip,
  StatusGlyph,
  useRunLifecycle,
} from "@/components/illustrations/relay-ui";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type TabId = "pipelines" | "previews" | "gates";

const TABS_DATA: {
  id: TabId;
  title: string;
  width: number;
  className: string;
}[] = [
  {
    id: "pipelines",
    title: "Pipelines as code",
    width: 550,
    className: "self-end justify-self-end justify-end items-end flex md:mt-16 md:ps-16 mt-10 ps-10 w-full",
  },
  {
    id: "previews",
    title: "Preview environments",
    width: 380,
    className: "w-full h-full flex justify-center items-center p-14 lg:p-0",
  },
  {
    id: "gates",
    title: "Deploy gates & rollbacks",
    width: 550,
    className: "self-end justify-self-end justify-end items-end flex md:mt-15 md:ps-15 mt-10 ps-10 w-full",
  },
];

const FeaturesTabsSection = () => {
  const [activeTab, setActiveTab] = useState<TabId>("pipelines");

  return (
    <section className="section-padding container grid max-w-screen-xl lg:grid-cols-2 lg:gap-18">
      {/* Left: Text & Tabs — markup copied from plasma-nextjs-template */}
      <div className="flex flex-col justify-between gap-3">
        <div className="space-y-6 text-balance lg:max-w-lg">
          <h2 className="text-4xxl leading-tight tracking-tight md:text-5xl">
            Define, preview, and release <br className="hidden lg:block" />
            with confidence
          </h2>
          <span className="text-xl leading-7 font-bold">Pipelines as code</span>
          <p className="text-muted-foreground mt-3 text-lg leading-snug">
            Keep CI/CD beside your application in relay.yaml. Review pipeline changes in pull requests — same workflow,
            same audit trail.
          </p>
        </div>

        <div>
          <TabsPrimitive.Root
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as TabId)}
            className="flex flex-col gap-2"
          >
            <TabsPrimitive.List className="relative h-auto w-full flex-col bg-transparent p-0">
              {TABS_DATA.map((tab) => (
                <TabsPrimitive.Trigger
                  key={tab.id}
                  value={tab.id}
                  className={cn(
                    "border-border text-foreground dark:text-muted-foreground data-[state=active]:text-foreground relative inline-flex w-full cursor-pointer flex-col items-start rounded-none border-0 border-b bg-transparent px-0 py-6 text-left transition-all hover:opacity-80 focus-visible:outline-none",
                    activeTab === tab.id && "pb-4",
                  )}
                >
                  <div className="flex w-full items-center justify-between gap-3">
                    <span
                      className={cn(
                        "text-muted-foreground text-lg transition-colors",
                        activeTab === tab.id && "text-accent-foreground",
                      )}
                    >
                      {tab.title}
                    </span>
                    <AnimatePresence>
                      {activeTab === tab.id && (
                        <motion.div
                          key="arrow"
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -8 }}
                          transition={{
                            duration: 0.3,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                        >
                          <ArrowRight className="size-5" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <AnimatePresence>
                    {activeTab === tab.id && (
                      <motion.div
                        key="underline"
                        initial={{ opacity: 0, scaleX: 0 }}
                        whileInView={{ opacity: 1, scaleX: 1 }}
                        exit={{ opacity: 0, scaleX: 0 }}
                        transition={{
                          duration: 0.4,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        viewport={{ once: true, amount: 1 }}
                        className="from-chart-1 via-chart-2 to-chart-3 absolute bottom-0 left-0 h-0.5 w-1/2 origin-left translate-y-1/2 rounded-full bg-gradient-to-r"
                      />
                    )}
                  </AnimatePresence>

                  {activeTab === tab.id && (
                    <Card className="to-muted/30 via-muted/20 mt-3 h-96 w-full overflow-hidden rounded-sm bg-gradient-to-t from-transparent p-0 sm:h-132 lg:hidden">
                      <CardContent className="flex h-full w-full items-center justify-center p-6">
                        <motion.div
                          key={tab.id}
                          initial={{ opacity: 0, scale: 0.97 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{
                            duration: 0.5,
                            ease: [0.22, 1, 0.36, 1],
                            opacity: { duration: 0.35 },
                            scale: { duration: 0.5 },
                          }}
                          className="w-full max-w-md"
                        >
                          <motion.div
                            initial={{ filter: "blur(8px)" }}
                            animate={{ filter: "blur(0px)" }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                          >
                            <TabVisual id={tab.id} />
                          </motion.div>
                        </motion.div>
                      </CardContent>
                    </Card>
                  )}
                </TabsPrimitive.Trigger>
              ))}
            </TabsPrimitive.List>
          </TabsPrimitive.Root>
        </div>
      </div>

      {/* Right: Visual on Gradient - Desktop Only */}
      <Card className="to-muted/30 via-muted/20 hidden h-142 flex-1 overflow-hidden rounded-xl bg-gradient-to-t from-transparent p-0 lg:flex lg:max-xl:justify-end">
        <CardContent className="relative h-full w-full p-0">
          <AnimatePresence mode="sync">
            {TABS_DATA.filter((tab) => tab.id === activeTab).map((tab) => (
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, scale: 0.97, filter: "blur(8px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                  opacity: { duration: 0.35 },
                  scale: { duration: 0.5 },
                }}
                className={cn(tab.className, "shrink-0")}
              >
                <TabVisualSlot id={tab.id} width={tab.width} />
              </motion.div>
            ))}
          </AnimatePresence>
        </CardContent>
      </Card>
    </section>
  );
};

export default FeaturesTabsSection;

function TabVisualSlot({ id, width }: { id: TabId; width: number }) {
  return (
    <div className="max-w-full shrink-0" style={{ width }}>
      <TabVisual id={id} />
    </div>
  );
}

function TabVisual({ id }: { id: TabId }) {
  switch (id) {
    case "pipelines":
      return <PipelinesPanel />;
    case "previews":
      return <PreviewsPanel />;
    case "gates":
      return <GatesPanel />;
  }
}

const panelStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};

const panelItem = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function WindowFrame({
  title,
  children,
  browser,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  browser?: boolean;
}) {
  return (
    <div className="border-border bg-card overflow-hidden rounded-lg border shadow-xl">
      <div className="border-border bg-muted/30 flex items-center gap-2 border-b px-3 py-2.5">
        <span className="bg-destructive/50 size-2.5 rounded-full" />
        <span className="size-2.5 rounded-full bg-amber-500/50" />
        <span className="bg-chart-1/50 size-2.5 rounded-full" />
        <div
          className={cn(
            "text-muted-foreground ml-2 flex items-center gap-1.5 truncate text-xs",
            browser && "border-input/60 bg-background/50 flex-1 rounded-md border px-2.5 py-1 font-mono",
          )}
        >
          {browser && <Globe className="size-3 shrink-0" />}
          {title}
        </div>
      </div>
      {children}
    </div>
  );
}

function PipelinesPanel() {
  const lines: { seg: { t: string; c: string }[] }[] = [
    { seg: [{ t: "# ci/cd, versioned with your app", c: "text-muted-foreground/50" }] },
    {
      seg: [
        { t: "pipeline", c: "text-chart-2" },
        { t: ": ", c: "text-muted-foreground/60" },
        { t: "web", c: "text-chart-1" },
      ],
    },
    {
      seg: [
        { t: "on", c: "text-chart-2" },
        { t: ": [", c: "text-muted-foreground/60" },
        { t: "push, pull_request", c: "text-chart-1" },
        { t: "]", c: "text-muted-foreground/60" },
      ],
    },
    { seg: [{ t: "", c: "" }] },
    {
      seg: [
        { t: "jobs", c: "text-chart-2" },
        { t: ":", c: "text-muted-foreground/60" },
      ],
    },
    {
      seg: [
        { t: "  install", c: "text-chart-2" },
        { t: ":", c: "text-muted-foreground/60" },
      ],
    },
    {
      seg: [
        { t: "    cache", c: "text-chart-2" },
        { t: ": ", c: "text-muted-foreground/60" },
        { t: "true", c: "text-chart-3" },
      ],
    },
    {
      seg: [
        { t: "    run", c: "text-chart-2" },
        { t: ": ", c: "text-muted-foreground/60" },
        { t: "pnpm install --frozen", c: "text-chart-1" },
      ],
    },
    {
      seg: [
        { t: "  test", c: "text-chart-2" },
        { t: ":", c: "text-muted-foreground/60" },
      ],
    },
    {
      seg: [
        { t: "    needs", c: "text-chart-2" },
        { t: ": [", c: "text-muted-foreground/60" },
        { t: "install", c: "text-chart-1" },
        { t: "]", c: "text-muted-foreground/60" },
      ],
    },
    {
      seg: [
        { t: "    matrix", c: "text-chart-2" },
        { t: ": { ", c: "text-muted-foreground/60" },
        { t: "node", c: "text-chart-2" },
        { t: ": [", c: "text-muted-foreground/60" },
        { t: "18, 20, 22", c: "text-chart-3" },
        { t: "] }", c: "text-muted-foreground/60" },
      ],
    },
    {
      seg: [
        { t: "  deploy", c: "text-chart-2" },
        { t: ":", c: "text-muted-foreground/60" },
      ],
    },
    {
      seg: [
        { t: "    gate", c: "text-chart-2" },
        { t: ": ", c: "text-muted-foreground/60" },
        { t: "production", c: "text-chart-1" },
      ],
    },
  ];

  return (
    <WindowFrame title={<span className="font-mono">relay.yaml — acme/web</span>}>
      <motion.pre
        className="overflow-x-auto px-4 py-4 font-mono text-xs leading-6 sm:text-sm"
        variants={panelStagger}
        initial="hidden"
        animate="visible"
      >
        {lines.map((line, i) => (
          <motion.div key={i} variants={panelItem} className="flex gap-3">
            <span className="text-muted-foreground/30 w-4 shrink-0 text-right select-none">
              {line.seg[0].t === "" && line.seg.length === 1 ? "" : i + 1}
            </span>
            <span className="whitespace-pre">
              {line.seg.map((seg, j) => (
                <span key={j} className={seg.c}>
                  {seg.t}
                </span>
              ))}
              {i === lines.length - 1 && (
                <motion.span
                  className="bg-chart-1 ml-0.5 inline-block h-3.5 w-[2px] align-middle sm:h-4"
                  animate={{ opacity: [1, 0] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                />
              )}
            </span>
          </motion.div>
        ))}
      </motion.pre>
    </WindowFrame>
  );
}

function PreviewsPanel() {
  const checks: { label: string; status: RunStatus; meta: string }[] = [
    { label: "build", status: "success", meta: "1m 58s" },
    { label: "test (matrix)", status: "success", meta: "2m 12s" },
    { label: "deploy-preview", status: "success", meta: "18s" },
  ];

  return (
    <WindowFrame browser title={<span>pr-1842.relay.dev</span>}>
      <motion.div className="flex flex-col gap-4 p-4 sm:p-5" variants={panelStagger} initial="hidden" animate="visible">
        <motion.div variants={panelItem} className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-2 text-sm font-semibold sm:text-base">
              <GitPullRequest className="text-chart-1 size-4" />
              Add per-PR preview deployments
            </span>
            <span className="text-muted-foreground font-mono text-xs">#1842 · feat/preview-env → main</span>
          </div>
          <StatusChip status="success" label="Ready" />
        </motion.div>

        <motion.div
          variants={panelItem}
          className="border-border bg-muted/20 flex flex-col gap-2 rounded-md border p-3"
        >
          {checks.map((c) => (
            <div key={c.label} className="flex items-center gap-2.5 text-xs">
              <StatusGlyph status={c.status} />
              <span className="font-mono">{c.label}</span>
              <span className="text-muted-foreground/60 ml-auto font-mono">{c.meta}</span>
            </div>
          ))}
        </motion.div>

        <motion.div
          variants={panelItem}
          className="border-border bg-background/40 flex items-center justify-between gap-3 rounded-md border p-3"
        >
          <div className="flex min-w-0 flex-col">
            <span className="text-muted-foreground text-[0.625rem] tracking-wide uppercase">Preview URL</span>
            <span className="text-chart-1 truncate font-mono text-xs">https://pr-1842.relay.dev</span>
          </div>
          <span className="bg-secondary/15 text-secondary flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium">
            Visit preview
            <ArrowRight className="size-3" />
          </span>
        </motion.div>
      </motion.div>
    </WindowFrame>
  );
}

function GatesPanel() {
  const gate = useRunLifecycle({ queued: 2400, running: 3400, hold: 3000 });
  const approvers = [
    { initials: "AK", name: "Ava Kim", approved: true },
    { initials: "RS", name: "Rob Shaw", approved: true },
  ];

  return (
    <WindowFrame title={<span>Deploy · acme/web</span>}>
      <motion.div className="flex flex-col gap-4 p-4 sm:p-5" variants={panelStagger} initial="hidden" animate="visible">
        <motion.div variants={panelItem} className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold sm:text-base">Release v2.8.0 → production</span>
            <span className="text-muted-foreground font-mono text-xs">from staging · commit f28c5d0</span>
          </div>
          <StatusChip status={gate} label={gate === "success" ? "Approved" : "Awaiting"} />
        </motion.div>

        <motion.div
          variants={panelItem}
          className="border-border bg-muted/20 flex flex-col gap-3 rounded-md border p-3"
        >
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Required approvals</span>
            <ProgressBar from={0.5} to={1} duration={5} className="flex-1" />
            <span className="text-chart-1 font-mono">2 / 2</span>
          </div>
          {approvers.map((a) => (
            <div key={a.initials} className="flex items-center gap-2.5 text-xs">
              <span className="bg-secondary/15 text-secondary flex size-6 items-center justify-center rounded-full text-[0.625rem] font-semibold">
                {a.initials}
              </span>
              <span>{a.name}</span>
              <span className="text-chart-1 ml-auto flex items-center gap-1 font-medium">
                <Check className="size-3" />
                approved
              </span>
            </div>
          ))}
        </motion.div>

        <motion.div variants={panelItem} className="flex items-center gap-2.5">
          <span className="bg-chart-1/15 text-chart-1 flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-medium">
            <Check className="size-3.5" />
            Approve deploy
          </span>
          <span className="border-border text-muted-foreground flex items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-xs">
            <RotateCcw className="size-3.5" />
            Roll back to v2.7.4
          </span>
        </motion.div>
      </motion.div>
    </WindowFrame>
  );
}
