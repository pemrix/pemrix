"use client";

import {
  BrainIcon as Brain,
  CheckCircleIcon as CheckCircle,
  GlobeHemisphereWestIcon as Globe,
  LeafIcon as Leaf,
  LightningIcon as Lightning,
  LockKeyIcon as LockKey,
  NetworkIcon as Network,
  StackIcon as Stack,
} from "@phosphor-icons/react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: Lightning,
    title: "Fast",
    description: "Sub-second finality designed for real-world payments and instant settlement.",
    color: "#00d4ff",
  },
  {
    icon: LockKey,
    title: "Secure",
    description: "Post-quantum-ready cryptography and audited network infrastructure.",
    color: "#005fff",
  },
  {
    icon: Network,
    title: "Decentralized",
    description: "Community validators worldwide secure the network — no single point of control.",
    color: "#8b5cf6",
  },
  {
    icon: Stack,
    title: "Scalable",
    description: "Built for billions of transactions with high throughput and low fees.",
    color: "#ec4899",
  },
  {
    icon: Brain,
    title: "AI-Native",
    description: "Designed for the agentic future: autonomous payments, identity, and on-chain reasoning.",
    color: "#f59e0b",
  },
  {
    icon: Globe,
    title: "Interoperable",
    description: "Connects ecosystems and real-world assets across chains and rails.",
    color: "#14b8a6",
  },
  {
    icon: CheckCircle,
    title: "Compliant",
    description: "Built with global regulations in mind for businesses and institutions.",
    color: "#10b981",
  },
  {
    icon: Leaf,
    title: "Sustainable",
    description: "Efficient, green consensus that stays future-proof as the network grows.",
    color: "#84cc16",
  },
];

export default function FeatureGrid() {
  return (
    <section className="section-padding relative overflow-hidden bg-[#02030a]">
      {/* faint top glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#005fff]/50 to-transparent"
      />
      <div className="container relative z-10">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium text-[#00d4ff]">Built for scale</span>
          <h2 className="mt-3 text-4xl leading-tight tracking-tight text-white md:text-5xl">
            A network built for the future of value
          </h2>
          <p className="mt-4 text-lg text-white/60">
            Eight core themes define how PEMRIX delivers real-world blockchain infrastructure.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, description, color }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className={cn(
                "group relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm",
                "hover:bg-white/[0.06] transition-colors",
              )}
              style={{ boxShadow: `inset 0 1px 0 0 ${color}15` }}
            >
              <div
                className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10"
                style={{ color }}
              >
                <Icon className="size-6" weight="fill" />
              </div>
              <h3 className="text-lg font-medium text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
