"use client";

import { ArrowRightIcon as ArrowRight, CodeIcon as Code } from "@phosphor-icons/react";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Hero() {
  return (
    <section className="relative isolate flex min-h-[calc(100vh-var(--header-height))] items-center overflow-hidden pt-10 pb-20 md:pt-16 md:pb-28">
      {/* Deep space gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f1b4d] via-[#050714] to-[#02030a]" />

      {/* Animated aurora / mesh gradient blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-80"
        style={{
          background:
            "radial-gradient(circle at 20% 35%, rgba(0,95,255,0.22) 0%, transparent 45%)," +
            "radial-gradient(circle at 80% 20%, rgba(0,212,255,0.18) 0%, transparent 40%)," +
            "radial-gradient(circle at 60% 80%, rgba(124,58,237,0.20) 0%, transparent 45%)," +
            "radial-gradient(circle at 30% 75%, rgba(236,72,153,0.14) 0%, transparent 40%)",
        }}
      />

      {/* Subtle grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="container relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8"
        >
          <img
            src="/logos/pemrix-white.svg"
            alt="PEMRIX"
            className="mx-auto h-16 w-auto md:h-24 lg:h-32"
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          className="max-w-5xl text-5xl leading-[1.05] font-semibold tracking-tight text-balance text-white md:text-7xl lg:text-8xl"
        >
          The Open Network for{" "}
          <span className="bg-gradient-to-r from-[#00d4ff] via-[#005fff] to-[#c084fc] bg-clip-text text-transparent">
            Value
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70 md:text-xl"
        >
          PEMRIX is a fast, secure, and decentralized blockchain built for global payments, AI-native apps, and the
          next generation of digital commerce.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          className="mt-10 flex flex-col gap-3 sm:flex-row"
        >
          <Button
            size="lg"
            className={cn(
              "h-14 gap-2 rounded-full bg-white px-8 text-base font-medium text-[#02030a] hover:bg-white/90",
              "shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]",
            )}
          >
            Get PRX
            <ArrowRight className="size-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-14 gap-2 rounded-full border-white/20 bg-white/5 px-8 text-base font-medium text-white backdrop-blur-sm hover:border-white/30 hover:bg-white/10"
          >
            Start building
            <Code className="size-4" />
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-white/50"
        >
          <span className="flex items-center gap-2">
            <span className="inline-block size-2 rounded-full bg-emerald-400" />
            Mainnet live
          </span>
          <span>Sub-second finality</span>
          <span>Community owned</span>
          <span>Post-quantum ready</span>
        </motion.div>
      </div>
    </section>
  );
}
