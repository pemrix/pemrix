"use client";

import {
  GlobeIcon as Globe,
  HandCoinsIcon as HandCoins,
  LockKeyIcon as LockKey,
  ScrollIcon as Scroll,
} from "@phosphor-icons/react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

const PRINCIPLES = [
  {
    icon: HandCoins,
    title: "Direct ownership",
    description:
      "Your keys, your coins, your identity. PEMRIX removes middlemen so users control their assets directly.",
  },
  {
    icon: Scroll,
    title: "Public rules",
    description:
      "Protocol logic, fees, and upgrades are transparent and auditable on-chain. No hidden terms.",
  },
  {
    icon: Globe,
    title: "Global access",
    description:
      "Anyone with an internet connection can send, receive, and build on PEMRIX — no bank required.",
  },
  {
    icon: LockKey,
    title: "No single owner",
    description:
      "Distributed validators and on-chain governance keep the network resilient and censorship-resistant.",
  },
];

export default function Principles() {
  return (
    <section className="section-padding relative overflow-hidden">
      <div className="container relative z-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl leading-tight tracking-tight md:text-5xl">
            What makes PEMRIX different
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            The principles that make open networks the foundation of a better financial internet.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PRINCIPLES.map(({ icon: Icon, title, description }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-border/70 bg-card/50 p-6 backdrop-blur-sm",
                "hover:border-[#005fff]/40 transition-colors",
              )}
            >
              <div className="mb-5 inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#005fff]/20 to-[#00d4ff]/10 text-[#00d4ff] ring-1 ring-[#005fff]/20">
                <Icon className="size-6" />
              </div>
              <h3 className="text-xl font-medium tracking-tight">{title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
