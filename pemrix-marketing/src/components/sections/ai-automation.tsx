"use client";

import {
  ArrowClockwiseIcon as RotateCw,
  GitBranchIcon as GitBranch,
  MagnifyingGlassIcon as Search,
  SparkleIcon as Sparkles,
  WarningIcon as AlertTriangle,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useRef } from "react";

import { AnimatedBeam } from "@/components/magicui/animated-beam";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { cn } from "@/lib/utils";

const stats = [
  {
    value: 12,
    suffix: "M+",
    label: "Builds per month",
  },
  {
    value: 40,
    suffix: "s",
    label: "Median time to green",
  },
  {
    value: 99.9,
    suffix: "%",
    label: "Uptime",
  },
];

const cards = [
  {
    id: "flaky",
    title: "Flaky test detection",
    subtitle: "Flag intermittent failures across recent runs",
    icon: AlertTriangle,
    iconColor: "text-amber-500",
    position: "absolute top-0 left-0",
    isGenerating: false,
  },
  {
    id: "triage",
    title: "Failure triage",
    subtitle: "Summarize root cause from logs and traces",
    icon: Search,
    iconColor: "text-blue-500",
    position: "absolute top-32 left-0",
    isGenerating: false,
  },
  {
    id: "generating",
    title: "Routing auto-retry",
    subtitle: "",
    icon: null,
    iconColor: "",
    position: "absolute top-18 right-0",
    isGenerating: true,
  },

  {
    id: "watcher",
    title: "CI result watcher",
    subtitle: "Retry failed jobs on merge to main?",
    icon: GitBranch,
    iconColor: "text-emerald-600",
    position: "absolute right-0 bottom-0",
    isGenerating: false,
  },
];

export default function AIAutomation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const connectorRef = useRef<HTMLDivElement>(null);

  // Create dynamic refs for each card
  const rightCard1Ref = useRef<HTMLDivElement>(null);
  const rightCard2Ref = useRef<HTMLDivElement>(null);
  const rightCard3Ref = useRef<HTMLDivElement>(null);
  const rightCard4Ref = useRef<HTMLDivElement>(null);

  const cardRefs = [rightCard1Ref, rightCard2Ref, rightCard3Ref, rightCard4Ref];

  return (
    <section className="section-padding container">
      <div ref={containerRef} className="relative grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-0">
        {/* Left Content */}
        <div className="relative z-1 flex flex-col gap-4">
          <motion.div
            ref={connectorRef}
            className="after:bg-accent relative mt-10 w-fit rounded-full after:absolute after:inset-[2px] after:rounded-full max-lg:order-3 lg:mt-0"
            initial={{ opacity: 0.8 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Animated gradient border */}
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--chart-1)] via-[var(--chart-2)] to-[var(--chart-3)] blur-xs"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 1 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            />
            <motion.div
              className="from-chart-2 to-chart-3 absolute inset-0 top-0 bg-gradient-to-r blur-3xl will-change-transform"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.2 }}
              viewport={{ once: true, amount: 1 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--chart-1)] via-[var(--chart-2)] to-[var(--chart-3)]"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            />
            <div className="relative z-10 flex items-center gap-2 px-5 py-4 text-xs lg:text-sm">
              <Sparkles className="fill-foreground size-3.5 shrink-0" />
              <div>
                <span className="text-muted-foreground">Ask Relay AI:</span>{" "}
                <span className="text-accent-foreground">Why did auth-service#482 fail three times this week?</span>
              </div>
            </div>
          </motion.div>
          <h2 className="text-4xxl leading-tight tracking-normal md:text-5xl">
            Relay AI handles the failures <br className="hidden md:block" />
            <span className="text-gradient">you&apos;d rather skip</span>
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl text-lg leading-snug">
            Flaky test detection, auto-retry routing, and failure triage — built into every pipeline. Spend less time in
            logs, more time shipping.
          </p>
        </div>

        {/* Right Workflow */}
        <div className="relative h-full min-h-[300px]">
          {cards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <div
                key={card.id}
                ref={cardRefs[index]}
                className={cn(
                  "z-10 w-fit space-y-2 px-3 py-2.5",
                  card.position,
                  card.isGenerating
                    ? "after:bg-accent rounded-full before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r before:from-[var(--chart-1)] before:via-[var(--chart-2)] before:to-[var(--chart-3)] after:absolute after:inset-[1px] after:rounded-full"
                    : "bg-accent rounded-md shadow-xl",
                )}
              >
                {card.isGenerating ? (
                  <div className="relative z-10 flex items-center gap-1.5">
                    <Sparkles className="fill-foreground size-3" />

                    <h3 className="text-accent-foreground text-[0.625rem] font-semibold lg:text-sm">{card.title}</h3>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      {IconComponent && <IconComponent className={`size-3 lg:size-3.5 ${card.iconColor}`} />}
                      <h3 className="text-xs font-bold lg:text-sm">{card.title}</h3>
                    </div>
                    {card.subtitle && (
                      <div className="flex items-center gap-2">
                        <RotateCw className="size-3 text-emerald-600 lg:size-3.5" />
                        <p className="text-muted-foreground text-[0.625rem] lg:text-xs">{card.subtitle}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Animated Beams */}
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={connectorRef}
          toRef={rightCard1Ref}
          gradientStartColor="var(--chart-3)"
          gradientStopColor="var(--chart-1)"
          duration={30}
          curvature={0}
        />

        <AnimatedBeam
          containerRef={containerRef}
          fromRef={connectorRef}
          toRef={rightCard2Ref}
          gradientStartColor="var(--chart-3)"
          gradientStopColor="var(--chart-1)"
          duration={30}
          curvature={0}
          className="hidden lg:block"
        />

        <AnimatedBeam
          containerRef={containerRef}
          fromRef={rightCard1Ref}
          toRef={rightCard3Ref}
          gradientStartColor="var(--chart-3)"
          gradientStopColor="var(--chart-1)"
          duration={25}
          curvature={70}
          startYOffset={20}
          endXOffset={30}
        />

        <AnimatedBeam
          containerRef={containerRef}
          fromRef={rightCard2Ref}
          toRef={rightCard3Ref}
          gradientStartColor="var(--chart-3)"
          gradientStopColor="var(--chart-1)"
          duration={20}
          curvature={0}
          className="hidden lg:block"
        />

        <AnimatedBeam
          containerRef={containerRef}
          fromRef={rightCard3Ref}
          toRef={rightCard4Ref}
          gradientStartColor="var(--chart-3)"
          gradientStopColor="var(--chart-1)"
          duration={35}
          curvature={20}
          endXOffset={40}
        />

        <AnimatedBeam
          containerRef={containerRef}
          fromRef={rightCard4Ref}
          toRef={rightCard2Ref}
          gradientStartColor="var(--chart-3)"
          gradientStopColor="var(--chart-1)"
          duration={48}
          curvature={0}
        />
      </div>

      {/* Statistics */}
      <div className="mx-auto max-w-3xl pt-12 text-center">
        <p className="text-muted-foreground">Trusted at scale:</p>
        <div className="mt-6 grid grid-cols-3 justify-between gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="space-y-1">
              <div className="text-2xl font-bold md:text-3xl">
                <NumberTicker value={stat.value} decimalPlaces={stat.value % 1 !== 0 ? 1 : 0} />
                {stat.suffix}
              </div>
              <p className="text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
