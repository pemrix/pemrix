"use client";

import { ArrowRightIcon as ArrowRight, RocketIcon as Rocket } from "@phosphor-icons/react";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";

export default function BuiltForFuture() {
  return (
    <section className="section-padding relative overflow-hidden">
      <div className="container relative z-10">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0a122e] to-[#050714] p-8 md:p-14 lg:p-20">
          {/* glow accents */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-[#005fff]/20 blur-[100px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-24 size-80 rounded-full bg-[#ec4899]/15 blur-[100px]"
          />

          <div className="relative z-10 flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80">
                <Rocket className="size-4 text-[#00d4ff]" />
                <span>Mainnet is live</span>
              </div>
              <h2 className="text-4xl leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
                Built for the future of money and AI
              </h2>
              <p className="text-lg text-white/60">
                Whether you are a user, merchant, developer, or validator, PEMRIX gives you the infrastructure to
                participate in the open network for value.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5 }}
              className="flex shrink-0 flex-col gap-3 sm:flex-row"
            >
              <Button
                size="lg"
                className="h-14 gap-2 rounded-full bg-white px-8 text-base font-medium text-[#02030a] hover:bg-white/90"
              >
                Get PRX
                <ArrowRight className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 gap-2 rounded-full border-white/20 bg-white/5 px-8 text-base font-medium text-white hover:border-white/30 hover:bg-white/10"
              >
                Read the docs
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
