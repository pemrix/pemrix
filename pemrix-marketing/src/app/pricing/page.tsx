"use client";

import {
  BrainIcon as Brain,
  BuildingsIcon as Building,
  CheckIcon as Check,
  MinusIcon as Minus,
  PulseIcon as Activity,
  ShieldIcon as Shield,
  TerminalIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type PlanType = "basic" | "business" | "enterprise";
type Billing = "monthly" | "annual";

interface Plan {
  name: string;
  type: PlanType;
  icon: React.ComponentType<{ className?: string }>;
  tagline: string;
  price: {
    monthly: number;
    yearly: number;
  };
  button: {
    text: string;
    href: string;
  };
  highlights: string[];
  features: {
    core: { name: string; value: string | boolean }[];
    automation: { name: string; value: string | boolean }[];
  };
}

const PLANS: Plan[] = [
  {
    name: "Free",
    type: "basic",
    icon: TerminalIcon,
    tagline: "For side projects and open-source repos",
    price: { monthly: 0, yearly: 0 },
    button: { text: "Get started free", href: "/signup" },
    highlights: ["400 build minutes / month", "1 concurrent job", "Linux cloud runners", "Remote caching"],
    features: {
      core: [
        { name: "Build minutes", value: "400 / month" },
        { name: "Concurrent jobs", value: "1" },
        { name: "Cloud runners", value: "Linux" },
        { name: "Remote caching", value: true },
        { name: "Preview environments", value: false },
        { name: "Pipelines as code", value: true },
        { name: "Matrix builds", value: false },
      ],
      automation: [
        { name: "Relay AI", value: false },
        { name: "Deploy gates & rollbacks", value: false },
        { name: "OIDC & secrets", value: false },
        { name: "Self-hosted runners", value: false },
        { name: "SSO / SAML", value: false },
        { name: "Audit logs", value: false },
        { name: "Support", value: "Community" },
      ],
    },
  },
  {
    name: "Pro",
    type: "business",
    icon: Shield,
    tagline: "For teams shipping to production every day",
    price: { monthly: 29, yearly: 290 },
    button: { text: "Start Pro trial", href: "/signup" },
    highlights: [
      "4,000 build minutes / month",
      "5 concurrent jobs",
      "Preview environments on every PR",
      "Relay AI + deploy gates",
    ],
    features: {
      core: [
        { name: "Build minutes", value: "4,000 / month" },
        { name: "Concurrent jobs", value: "5" },
        { name: "Cloud runners", value: "Linux, macOS, Windows" },
        { name: "Remote caching", value: true },
        { name: "Preview environments", value: true },
        { name: "Pipelines as code", value: true },
        { name: "Matrix builds", value: true },
      ],
      automation: [
        { name: "Relay AI", value: true },
        { name: "Deploy gates & rollbacks", value: true },
        { name: "OIDC & secrets", value: true },
        { name: "Self-hosted runners", value: false },
        { name: "SSO / SAML", value: false },
        { name: "Audit logs", value: false },
        { name: "Support", value: "Priority" },
      ],
    },
  },
  {
    name: "Enterprise",
    type: "enterprise",
    icon: Building,
    tagline: "Self-hosted runners and enterprise controls",
    price: { monthly: 0, yearly: 0 },
    button: { text: "Contact sales", href: "/contact" },
    highlights: ["Unlimited build minutes", "Self-hosted runners", "SSO / SAML + audit logs", "SLA-backed support"],
    features: {
      core: [
        { name: "Build minutes", value: "Unlimited" },
        { name: "Concurrent jobs", value: "Unlimited" },
        { name: "Cloud runners", value: "All platforms + ARM" },
        { name: "Remote caching", value: true },
        { name: "Preview environments", value: true },
        { name: "Pipelines as code", value: true },
        { name: "Matrix builds", value: true },
      ],
      automation: [
        { name: "Relay AI", value: true },
        { name: "Deploy gates & rollbacks", value: true },
        { name: "OIDC & secrets", value: true },
        { name: "Self-hosted runners", value: true },
        { name: "SSO / SAML", value: true },
        { name: "Audit logs", value: true },
        { name: "Support", value: "SLA" },
      ],
    },
  },
];

const CATEGORY_CONFIG = {
  core: { name: "Pipelines & Runners", icon: Activity },
  automation: { name: "Security & Support", icon: Brain },
};

function priceDisplay(plan: Plan, billing: Billing) {
  if (plan.type === "enterprise") return { big: "Custom", sub: "Talk to us" };
  if (plan.price.monthly === 0) return { big: "$0", sub: "Free forever" };
  if (billing === "monthly") return { big: `$${plan.price.monthly}`, sub: "per user / month" };
  const perMonth = Math.round(plan.price.yearly / 12);
  return {
    big: `$${perMonth}`,
    sub: `billed annually · $${plan.price.yearly}`,
  };
}

const PricingPage = () => {
  const [billing, setBilling] = useState<Billing>("monthly");
  const [selectedPlan, setSelectedPlan] = useState("1");

  return (
    <section className="section-padding relative container space-y-14 md:space-y-20">
      <div className="mx-auto max-w-3xl space-y-6 text-center">
        <h1 className="text-5xl leading-none tracking-tight text-balance md:text-6xl">
          Simple pricing for <span className="text-gradient">teams that ship</span>
        </h1>

        <p className="text-muted-foreground mx-auto max-w-2xl leading-snug md:text-lg">
          Start free with 400 build minutes per month. Upgrade when you need more concurrency, preview environments, and
          Relay AI — billed per user, not per minute overage.
        </p>

        {/* Billing toggle */}
        <div className="border-border bg-muted/40 mx-auto flex w-fit items-center gap-1 rounded-full border p-1">
          {(["monthly", "annual"] as const).map((option) => (
            <button
              key={option}
              onClick={() => setBilling(option)}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-full px-5 py-2 text-sm font-medium capitalize transition-colors",
                billing === option
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option}
              {option === "annual" && <span className="text-secondary text-xs font-semibold">−17%</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Plan cards */}
      <div className="mx-auto grid max-w-5xl items-start gap-6 md:grid-cols-3">
        {PLANS.map((plan) => (
          <PricingCard key={plan.name} plan={plan} billing={billing} />
        ))}
      </div>

      {/* Feature comparison */}
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-8 text-center text-2xl font-medium tracking-tight md:text-3xl">Compare every plan</h2>

        {/* Mobile */}
        <div className="lg:hidden">
          <FeatureComparison layout="mobile" selectedPlan={selectedPlan} onPlanChange={setSelectedPlan} />
        </div>

        {/* Desktop */}
        <div className="hidden lg:block">
          <FeatureComparison layout="desktop" />
        </div>
      </div>
    </section>
  );
};

const PricingCard = ({ plan, billing }: { plan: Plan; billing: Billing }) => {
  const isPro = plan.name === "Pro";
  const { big, sub } = priceDisplay(plan, billing);
  const Icon = plan.icon;

  return (
    <div
      className={cn(
        "bg-card relative flex h-full flex-col gap-6 rounded-2xl border p-6 transition-shadow lg:p-7",
        isPro ? "border-secondary/60 ring-secondary/40 shadow-lg ring-1 lg:-translate-y-2" : "border-border",
      )}
    >
      {isPro && (
        <span className="bg-secondary text-secondary-foreground absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-semibold">
          Most popular
        </span>
      )}

      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex size-10 items-center justify-center rounded-xl",
            isPro ? "bg-secondary/15 text-secondary" : "bg-muted text-muted-foreground",
          )}
        >
          <Icon className="size-5" />
        </span>
        <div>
          <h3 className="text-xl font-semibold tracking-tight">{plan.name}</h3>
        </div>
      </div>

      <p className="text-muted-foreground text-sm leading-snug">{plan.tagline}</p>

      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-1.5">
          <span
            className={cn(
              "text-4xl leading-none font-medium tracking-tight md:text-5xl",
              big.startsWith("$") ? "font-mono" : "font-sans",
            )}
          >
            {big}
          </span>
        </div>
        <span className="text-muted-foreground text-sm">{sub}</span>
      </div>

      <Button
        className={cn(
          "h-12 w-full rounded-full text-base",
          isPro
            ? "bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            : "border-secondary/30 hover:border-secondary/50 hover:bg-secondary/5 border bg-transparent",
        )}
        variant={isPro ? "default" : "outline"}
        asChild
      >
        <Link href={plan.button.href}>{plan.button.text}</Link>
      </Button>

      <ul className="border-border space-y-3 border-t pt-5">
        {plan.highlights.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm">
            <Check className="text-secondary mt-0.5 size-4 shrink-0" />
            <span className="text-foreground/90">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const FeatureValue = ({ value }: { value: string | boolean }) => {
  if (typeof value === "boolean") {
    return (
      <div
        className={cn(
          "flex size-5.5 items-center justify-center rounded-full",
          value ? "bg-secondary/15 text-secondary" : "bg-muted text-muted-foreground/50",
        )}
      >
        {value ? <Check className="size-3.5" /> : <Minus className="size-3.5" />}
      </div>
    );
  }

  return <span className="text-foreground text-sm font-medium">{value}</span>;
};

const FeatureComparison = ({
  layout = "mobile",
  selectedPlan,
  onPlanChange,
}: {
  layout?: "mobile" | "desktop";
  selectedPlan?: string;
  onPlanChange?: (planIndex: string) => void;
}) => {
  if (layout === "mobile") {
    const selectedPlanIndex = parseInt(selectedPlan || "0");
    const plan = PLANS[selectedPlanIndex];

    return (
      <div className="border-border overflow-hidden rounded-2xl border">
        <div className="border-border flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-medium">Showing plan</span>
          <Select value={selectedPlan} onValueChange={onPlanChange}>
            <SelectTrigger className="w-32">{PLANS[selectedPlanIndex].name}</SelectTrigger>
            <SelectContent>
              {PLANS.map((planItem, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {planItem.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {Object.entries(plan.features).map(([category, features]) => {
          const categoryInfo = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG];
          return (
            <div key={category}>
              <div className="bg-muted/40 flex items-center gap-2 px-4 py-2.5">
                <categoryInfo.icon className="text-secondary size-4" />
                <h3 className="text-sm font-semibold">{categoryInfo.name}</h3>
              </div>
              {features.map((feature, featureIndex) => (
                <div
                  key={featureIndex}
                  className="border-border/60 flex items-center justify-between border-b px-4 py-3 last:border-b-0"
                >
                  <span className="text-muted-foreground text-sm">{feature.name}</span>
                  <FeatureValue value={feature.value} />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  }

  // Desktop layout — a proper bordered comparison table
  return (
    <div className="border-border overflow-hidden rounded-2xl border">
      {/* Plan header row */}
      <div className="bg-muted/30 border-border grid grid-cols-[1.6fr_1fr_1fr_1fr] border-b">
        <div className="px-6 py-4 text-sm font-medium">Features</div>
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={cn("px-4 py-4 text-center text-sm font-semibold", plan.name === "Pro" && "text-secondary")}
          >
            {plan.name}
          </div>
        ))}
      </div>

      {Object.entries(CATEGORY_CONFIG).map(([categoryKey, categoryInfo]) => {
        const categoryKeyTyped = categoryKey as keyof typeof CATEGORY_CONFIG;
        return (
          <div key={categoryKey}>
            <div className="bg-muted/50 flex items-center gap-2 px-6 py-2.5">
              <categoryInfo.icon className="text-secondary size-4" />
              <h3 className="text-sm font-semibold">{categoryInfo.name}</h3>
            </div>
            {PLANS[0].features[categoryKeyTyped].map((feature, featureIndex) => (
              <div
                key={featureIndex}
                className="border-border/60 odd:bg-muted/10 grid grid-cols-[1.6fr_1fr_1fr_1fr] items-center border-b last:border-b-0"
              >
                <span className="px-6 py-3.5 text-sm font-medium">{feature.name}</span>
                {PLANS.map((plan, planIndex) => (
                  <div key={planIndex} className="flex items-center justify-center px-4 py-3.5">
                    <FeatureValue value={plan.features[categoryKeyTyped][featureIndex].value} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default PricingPage;
