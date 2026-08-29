"use client";

import {
  BrainIcon as Brain,
  CodeIcon as Code,
  GlobeIcon as Globe,
  NetworkIcon as Network,
  ShoppingCartIcon as ShoppingCart,
  StorefrontIcon as Storefront,
  TrendUpIcon as TrendUp,
  UsersIcon as Users,
  WalletIcon as Wallet,
} from "@phosphor-icons/react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

const ECOSYSTEM = [
  {
    id: "network",
    name: "Network",
    description: "The blockchain foundation",
    icon: Network,
    href: "https://pemrix.com",
    color: "#005fff",
  },
  {
    id: "wallet",
    name: "Wallet",
    description: "Your money, your control",
    icon: Wallet,
    href: "https://wallet.pemrix.com",
    color: "#00c6ff",
  },
  {
    id: "pay",
    name: "Pay",
    description: "Payments for everyone",
    icon: ShoppingCart,
    href: "https://pay.pemrix.com",
    color: "#8b5cf6",
  },
  {
    id: "merchant",
    name: "Merchant",
    description: "Powering business payments",
    icon: Storefront,
    href: "https://merchant.pemrix.com",
    color: "#ec4899",
  },
  {
    id: "exchange",
    name: "Exchange",
    description: "Trade, earn, grow",
    icon: TrendUp,
    href: "https://exchange.pemrix.com",
    color: "#10b981",
  },
  {
    id: "developer",
    name: "Developer",
    description: "Build the future on PEMRIX",
    icon: Code,
    href: "/docs/pemrix/developers",
    color: "#6366f1",
  },
  {
    id: "ai",
    name: "AI",
    description: "Intelligent, autonomous future",
    icon: Brain,
    href: "https://ai.pemrix.com",
    color: "#f59e0b",
  },
  {
    id: "governance",
    name: "Governance",
    description: "By the community, for the future",
    icon: Users,
    href: "https://governance.pemrix.com",
    color: "#14b8a6",
  },
];

export default function Ecosystem() {
  return (
    <section className="section-padding relative overflow-hidden">
      <div className="container relative z-10">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-medium text-[#005fff]">Ecosystem</span>
          <h2 className="mt-3 text-4xl leading-tight tracking-tight md:text-5xl">
            Everything you need to use and build value
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From wallets and payments to exchange, AI agents, and governance — one integrated network.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ECOSYSTEM.map(({ name, description, icon: Icon, href, color }, i) => (
            <motion.a
              key={name}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className={cn(
                "group relative flex items-center gap-4 rounded-2xl border border-border/70 bg-card/40 p-5",
                "hover:border-[color:var(--hover-color)]/40 hover:bg-card/70 transition-all",
              )}
              style={{ "--hover-color": color } as React.CSSProperties}
            >
              <div
                className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10"
                style={{ color, boxShadow: `0 0 24px -8px ${color}60` }}
              >
                <Icon className="size-6" weight="fill" />
              </div>
              <div>
                <h3 className="text-base font-medium">{name}</h3>
                <p className="text-muted-foreground mt-0.5 text-sm">{description}</p>
              </div>
            </motion.a>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <Globe className="size-4 text-[#005fff]" />
            Explore the full network
          </span>
        </div>
      </div>
    </section>
  );
}
