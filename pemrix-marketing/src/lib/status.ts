export type ServiceStatus = "operational" | "degraded" | "partial" | "outage";

export type StatusService = {
  name: string;
  description: string;
  status: ServiceStatus;
  uptime: string;
};

export type StatusIncident = {
  id: string;
  title: string;
  status: "resolved" | "monitoring" | "investigating";
  impact: ServiceStatus;
  date: string;
  duration: string;
  summary: string;
};

export const STATUS_SERVICES: StatusService[] = [
  {
    name: "Relay Cloud API",
    description: "REST API, webhooks, and pipeline triggers",
    status: "operational",
    uptime: "99.99%",
  },
  {
    name: "Pipeline execution",
    description: "Job scheduling, queues, and orchestration",
    status: "operational",
    uptime: "99.98%",
  },
  {
    name: "Cloud runners",
    description: "Linux, macOS, and Windows managed runners",
    status: "operational",
    uptime: "99.97%",
  },
  {
    name: "Self-hosted runners",
    description: "Agent registration and job routing",
    status: "operational",
    uptime: "99.96%",
  },
  {
    name: "Remote cache",
    description: "Cross-branch artifact and dependency caching",
    status: "operational",
    uptime: "99.95%",
  },
  {
    name: "Preview environments",
    description: "PR preview deploys and teardown",
    status: "operational",
    uptime: "99.94%",
  },
  {
    name: "Dashboard & CLI auth",
    description: "Sign-in, SSO, and token issuance",
    status: "operational",
    uptime: "99.99%",
  },
  {
    name: "Relay AI",
    description: "Flaky test detection and pipeline insights",
    status: "operational",
    uptime: "99.93%",
  },
];

export const STATUS_INCIDENTS: StatusIncident[] = [
  {
    id: "inc-2025-03-18",
    title: "Elevated cache restore latency in us-east-1",
    status: "resolved",
    impact: "degraded",
    date: "Mar 18, 2025",
    duration: "47 minutes",
    summary:
      "A misconfigured cache shard caused slower restores for large monorepo jobs in us-east-1. Traffic was shifted to healthy nodes and latency returned to baseline.",
  },
  {
    id: "inc-2025-02-04",
    title: "Delayed macOS runner queue times",
    status: "resolved",
    impact: "partial",
    date: "Feb 4, 2025",
    duration: "1 hour 12 minutes",
    summary:
      "A surge in matrix builds increased macOS queue depth. Additional runner capacity was provisioned and queue times normalized.",
  },
  {
    id: "inc-2025-01-09",
    title: "Brief webhook delivery delays",
    status: "resolved",
    impact: "degraded",
    date: "Jan 9, 2025",
    duration: "23 minutes",
    summary:
      "Webhook workers fell behind during a traffic spike. Backlog was cleared and retry policies prevented duplicate deliveries.",
  },
];

export function getOverallStatus(services: StatusService[]): ServiceStatus {
  if (services.some((service) => service.status === "outage")) return "outage";
  if (services.some((service) => service.status === "partial")) return "partial";
  if (services.some((service) => service.status === "degraded")) {
    return "degraded";
  }
  return "operational";
}

export const STATUS_LABELS: Record<ServiceStatus, string> = {
  operational: "Operational",
  degraded: "Degraded performance",
  partial: "Partial outage",
  outage: "Major outage",
};

export const INCIDENT_STATUS_LABELS: Record<StatusIncident["status"], string> = {
  resolved: "Resolved",
  monitoring: "Monitoring",
  investigating: "Investigating",
};
