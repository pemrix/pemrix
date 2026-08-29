import { BellIcon as Bell, CheckCircleIcon as CheckCircle } from "@phosphor-icons/react/ssr";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import {
  getOverallStatus,
  INCIDENT_STATUS_LABELS,
  type ServiceStatus,
  STATUS_INCIDENTS,
  STATUS_LABELS,
  STATUS_SERVICES,
} from "@/lib/status";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Status",
  description: "Live uptime and incident history for Relay Cloud, runners, cache, and related services.",
};

const STATUS_STYLES: Record<ServiceStatus, { dot: string; badge: string; banner: string }> = {
  operational: {
    dot: "bg-secondary",
    badge: "bg-secondary/15 text-secondary border-secondary/30",
    banner: "border-secondary/30 bg-secondary/5 text-secondary",
  },
  degraded: {
    dot: "bg-chart-3",
    badge: "bg-chart-3/20 text-chart-3 border-chart-3/30",
    banner: "border-chart-3/30 bg-chart-3/10 text-chart-3",
  },
  partial: {
    dot: "bg-chart-4",
    badge: "bg-chart-4/20 text-chart-4 border-chart-4/30",
    banner: "border-chart-4/30 bg-chart-4/10 text-chart-4",
  },
  outage: {
    dot: "bg-destructive",
    badge: "bg-destructive/10 text-destructive border-destructive/30",
    banner: "border-destructive/30 bg-destructive/10 text-destructive",
  },
};

const OVERALL_MESSAGES: Record<ServiceStatus, string> = {
  operational: "All systems operational",
  degraded: "Some systems are experiencing degraded performance",
  partial: "Partial service disruption",
  outage: "Major service disruption",
};

function StatusBadge({ status, label }: { status: ServiceStatus; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium",
        STATUS_STYLES[status].badge,
      )}
    >
      <span className={cn("size-2 rounded-full", STATUS_STYLES[status].dot)} />
      {label}
    </span>
  );
}

export default function StatusPage() {
  const overallStatus = getOverallStatus(STATUS_SERVICES);
  const overallStyles = STATUS_STYLES[overallStatus];

  return (
    <section className="section-padding container max-w-5xl space-y-16">
      <div className="flex flex-wrap items-center justify-between gap-10">
        <div className="space-y-3">
          <span className="text-secondary text-sm font-medium">System status</span>
          <h1 className="text-4xxl leading-tight font-medium tracking-tight">Relay uptime</h1>
          <p className="text-muted-foreground text-lg leading-snug">
            Current availability for Relay Cloud, runners, cache, and related platform services.
          </p>
        </div>
        <Button variant="secondary" className="bg-muted/40 h-12 gap-2 rounded-full px-4 text-base font-normal">
          Subscribe to updates
          <Bell className="size-4 shrink-0" />
        </Button>
      </div>

      <div className={cn("flex items-center gap-3 rounded-2xl border px-5 py-4 md:px-6 md:py-5", overallStyles.banner)}>
        <CheckCircle className="size-5 shrink-0" weight="fill" />
        <div>
          <p className="font-medium">{OVERALL_MESSAGES[overallStatus]}</p>
          <p className="text-sm opacity-80">
            Last updated{" "}
            {new Date().toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
              timeZoneName: "short",
            })}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-medium tracking-tight">Services</h2>
          <p className="text-muted-foreground text-sm">90-day uptime</p>
        </div>

        <div className="divide-border border-border divide-y rounded-2xl border">
          {STATUS_SERVICES.map((service) => (
            <div
              key={service.name}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6 md:py-5"
            >
              <div className="min-w-0 space-y-1">
                <p className="font-medium">{service.name}</p>
                <p className="text-muted-foreground text-sm">{service.description}</p>
              </div>
              <div className="flex shrink-0 items-center gap-4 sm:justify-end">
                <span className="text-muted-foreground font-mono text-sm">{service.uptime}</span>
                <StatusBadge status={service.status} label={STATUS_LABELS[service.status]} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-medium tracking-tight">Recent incidents</h2>

        <div className="space-y-4">
          {STATUS_INCIDENTS.map((incident) => (
            <article key={incident.id} className="border-border bg-card/40 rounded-2xl border p-5 md:p-6">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <StatusBadge status={incident.impact} label={STATUS_LABELS[incident.impact]} />
                <span className="text-muted-foreground rounded-full border px-2.5 py-1 text-xs">
                  {INCIDENT_STATUS_LABELS[incident.status]}
                </span>
                <time className="text-muted-foreground ml-auto font-mono text-sm">{incident.date}</time>
              </div>

              <h3 className="text-lg font-medium tracking-tight">{incident.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{incident.summary}</p>
              <p className="text-muted-foreground mt-3 text-xs">Duration: {incident.duration}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
