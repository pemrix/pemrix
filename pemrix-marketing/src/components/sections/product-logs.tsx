"use client";

import { ArrowRightIcon as ArrowRight, MagnifyingGlassIcon as Search } from "@phosphor-icons/react";
import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Terminal } from "@/components/ui/terminal";

import { Separator } from "../ui/separator";

export default function ProductLogs() {
  return (
    <section className="section-padding container grid max-w-screen-xl gap-8 lg:grid-cols-2">
      {/* Left: Text & Description */}
      <div className="flex flex-col justify-between gap-3">
        <div className="space-y-6">
          <h2 className="text-4xxl leading-none tracking-tight text-balance md:text-6xl lg:max-w-xs">
            Full pipeline <br className="hidden lg:block" />
            <span className="text-gradient">
              build logs <br className="hidden lg:block" />
            </span>
          </h2>
          <span className="text-accent-foreground text-xl font-bold">From clone to deploy preview</span>
          <p className="text-muted-foreground mt-3 max-w-lg text-lg leading-snug">
            Every step streams live — install, lint, test, build, and deploy. Relay AI flags flaky tests, retries them,
            and keeps the run green.
          </p>
          <div>
            <Button
              variant="ghost"
              asChild
              className="group mt-6 h-12 gap-3 !px-0 font-normal transition-opacity hover:!bg-transparent hover:opacity-95 md:mt-12"
            >
              <Link href="/feature">
                Explore build insights
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Card className="to-muted/30 via-muted/20 flex h-96 flex-1 overflow-hidden rounded-xl bg-gradient-to-t from-transparent p-0 sm:h-132">
        <CardContent className="relative flex items-center justify-center p-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 20, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
              opacity: { duration: 0.35 },
              scale: { duration: 0.5 },
            }}
            className="w-full origin-bottom-right pt-10 pl-20"
          >
            <TerminalWithHeader />
          </motion.div>
        </CardContent>
      </Card>
    </section>
  );
}

function TerminalWithHeader() {
  const [activeTab, setActiveTab] = useState("build");

  return (
    <div className="relative w-full">
      {/* Background card - shows partially from the left */}
      <Card className="bg-accent absolute top-5 -left-5 h-full w-full overflow-hidden"></Card>

      {/* Main card */}
      <Card className="bg-accent relative z-10 gap-0 overflow-hidden rounded-e-none border-r-0 shadow-xl">
        <CardHeader className="border-border gap-3 border-b">
          <h3 className="text-foreground font-medium">
            Build #1842 — feat/preview-env
            <br />
            relay.yaml
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Passed</Badge>
            <span className="text-muted-foreground text-[0.625rem]">Finished: Jul 7, 2026 — 14:32:08 · 2m 14s</span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-10">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
              <TabsList className="bg-input/20 h-7 rounded-md">
                <TabsTrigger
                  value="build"
                  className="dark:data-[state=active]:bg-accent cursor-pointer rounded-sm border-none text-[0.625rem]"
                >
                  Build
                </TabsTrigger>
                <TabsTrigger
                  value="test"
                  disabled
                  className="dark:data-[state=active]:bg-accent cursor-pointer rounded-sm border-none text-[0.625rem]"
                >
                  Test
                </TabsTrigger>
                <Separator orientation="vertical" className="bg-input mx-2 !h-5" />
                <TabsTrigger
                  value="deploy"
                  disabled
                  className="dark:data-[state=active]:bg-accent cursor-pointer rounded-sm border-none text-[0.625rem]"
                >
                  Deploy
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative w-40">
              <Search className="text-muted-foreground absolute top-1/2 left-3 size-3 -translate-y-1/2" />
              <Input
                placeholder="Filter steps"
                className="!bg-background/20 border-input/60 h-7 rounded-sm ps-7 !text-[0.625rem] placeholder:opacity-40"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs value={activeTab} className="w-full">
            <TabsContent value="build" className="m-0">
              <Terminal className="w-full rounded-none border-none" />
            </TabsContent>
            <TabsContent value="test" className="m-0">
              <div className="flex h-80 items-start justify-start p-4">
                <div className="text-muted-foreground text-sm">✓ 412 passed · 2 retried · 38.2s</div>
              </div>
            </TabsContent>
            <TabsContent value="deploy" className="m-0">
              <div className="flex h-80 items-start justify-start p-4">
                <div className="text-muted-foreground text-sm">✓ Preview deployed to pr-1842.relay.dev</div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
