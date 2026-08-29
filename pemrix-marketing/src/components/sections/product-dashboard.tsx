"use client";

import {
  ArrowRightIcon as ArrowRight,
  GitBranchIcon as GitBranch,
  PulseIcon as Activity,
  ShieldCheckIcon as ShieldCheck,
  TimerIcon as Timer,
} from "@phosphor-icons/react";
import Link from "next/link";

import { RelayPipelinesDashboard } from "@/components/illustrations/relay-pipelines-dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const FEATURE_CARDS = [
  {
    title: "Step-Level Build Logs",
    description: "See duration, cache status, and retry counts for every job — from install to deploy.",
    icon: Timer,
    cta: "Read more",
    href: "/feature",
  },
  {
    title: "Live Pipeline Activity",
    description: "Watch runs start, pass, fail, and redeploy in real time — no page refresh required.",
    icon: Activity,
    cta: "Read more",
    href: "/feature",
  },
  {
    title: "Job-Level Debugging",
    description: "Open any step to inspect stdout, artifacts, env vars, and matrix shard output.",
    icon: GitBranch,
    cta: "Read more",
    href: "/docs/api-reference",
  },
  {
    title: "Deploy Gates & Rollbacks",
    description: "Require approvals before production, then roll back to the last green deploy in one click.",
    icon: ShieldCheck,
    cta: "Read more",
    href: "/docs/api-reference",
  },
];

export default function ProductDashboard() {
  return (
    <section className="section-padding relative container">
      {/* Header */}
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <h2 className="text-4xl leading-none tracking-tight text-balance md:text-5xl lg:text-6xl">
          AI Build Pipelines
        </h2>
      </div>

      {/* Main Dashboard — code-built mockup */}
      <div className="mx-auto mt-10 max-w-6xl mask-b-from-50% mask-b-to-95% md:mt-16">
        <RelayPipelinesDashboard />
      </div>

      {/* Tagline */}
      <h3 className="text-muted-foreground mt-4 text-center uppercase">
        QUEUE TIME, BUILD DURATION, SUCCESS RATE — ALL IN ONE PLACE
      </h3>

      {/* Feature Cards */}
      <div className="mx-auto mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {FEATURE_CARDS.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <Card key={index} className="group bg-accent/80 gap-4 border-none shadow-none">
              <CardHeader className="gap-2.5">
                <div className="bg-card/50 flex size-10 items-center justify-center rounded-md border">
                  <IconComponent className="size-4.5 opacity-70" />
                </div>
                <CardTitle className="text-lg">{card.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <CardDescription className="text-muted-foreground flex-1 text-sm">{card.description}</CardDescription>
                <div>
                  <Button
                    variant="ghost"
                    asChild
                    className="group mt-6 h-12 gap-3 !px-0 font-normal transition-opacity hover:!bg-transparent hover:opacity-95"
                  >
                    <Link href={card.href}>
                      Read more
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
