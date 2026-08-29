import {
  GaugeIcon as Gauge,
  GitBranchIcon as GitBranch,
  GitPullRequestIcon as GitPullRequest,
  RocketIcon as Rocket,
  ShieldCheckIcon as ShieldCheck,
  StackIcon as Layers,
} from "@phosphor-icons/react/ssr";

const FEATURES = [
  {
    icon: GitBranch,
    title: "Pipelines as code",
    description: "Define stages, jobs, and gates in relay.yaml — versioned right beside your application.",
  },
  {
    icon: Layers,
    title: "Remote build cache",
    description: "Reuse layers across branches and runners so builds finish in a fraction of the time.",
  },
  {
    icon: GitPullRequest,
    title: "Preview environments",
    description: "Spin up an isolated, shareable URL for every pull request — automatically.",
  },
  {
    icon: Gauge,
    title: "Matrix builds",
    description: "Fan out across OS, runtime, and dependency versions from a single definition.",
  },
  {
    icon: ShieldCheck,
    title: "Secrets & OIDC",
    description: "Scoped secrets and short-lived tokens — no long-lived keys living in CI.",
  },
  {
    icon: Rocket,
    title: "Deploy gates & rollbacks",
    description: "Require approvals before production, then roll back to the last good deploy in one click.",
  },
];

const FeatureCards = () => {
  return (
    <section className="section-padding relative overflow-hidden">
      {/* Very subtle chart-color wash so the translucent cards get a glass
          lift (blurred through their backdrop), like the footer CTA box. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(48% 45% at 32% 28%, oklch(0.72 0.14 160 / 0.10), transparent 70%)," +
            "radial-gradient(45% 45% at 72% 38%, oklch(0.75 0.12 185 / 0.09), transparent 70%)," +
            "radial-gradient(48% 46% at 54% 64%, oklch(0.85 0.15 130 / 0.07), transparent 66%)",
          maskImage: "linear-gradient(to bottom, transparent 0%, black 14%, black 80%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 14%, black 80%, transparent 100%)",
        }}
      />
      <div className="relative z-10 container space-y-10 lg:space-y-14">
        {/* Header */}
        <div className="max-w-2xl space-y-4 lg:mx-auto lg:text-center">
          <span className="text-secondary text-sm font-medium">Everything in one platform</span>
          <h2 className="text-4xxl leading-none tracking-tight text-balance md:text-5xl lg:text-6xl">
            The building blocks of a fast pipeline
          </h2>
          <p className="text-muted-foreground leading-snug lg:text-lg">
            From first commit to production deploy — the essentials, without the glue code.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="bg-muted/40 hover:border-secondary/40 border-border/70 dark:bg-card/40 rounded-2xl border p-6 transition-colors"
            >
              <div className="border-border bg-background/60 text-secondary flex size-11 items-center justify-center rounded-xl border">
                <Icon className="size-5" />
              </div>
              <h3 className="mt-5 text-lg font-medium tracking-tight">{title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
