import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Bot,
  Box,
  Code2,
  type IconNode,
} from "lucide-react";

export type DocsProductId =
  | "quanvio"
  | "qora"
  | "qprint"
  | "quanpos"
  | "qorvia"
  | "pegus";

export interface DocsProductSection {
  id: string;
  title: string;
  href: string;
  icon: LucideIcon;
}

export interface DocsProductLogo {
  light: string;
  dark?: string;
  alt: string;
}

export interface DocsProductConfig {
  id: DocsProductId;
  name: string;
  shortName: string;
  logo: DocsProductLogo;
  brandColor: string;
  description: string;
  sections: DocsProductSection[];
}

const commonSections: DocsProductSection[] = [
  { id: "docs", title: "Docs", href: "/docs/{product}", icon: BookOpen },
  { id: "api-reference", title: "API Reference", href: "/docs/{product}/api-reference", icon: Code2 },
  { id: "client-sdks", title: "Client SDKs", href: "/docs/{product}/client-sdks", icon: Box },
];

export const docsProductsConfig: Record<DocsProductId, DocsProductConfig> = {
  quanvio: {
    id: "quanvio",
    name: "Quanvio",
    shortName: "Quanvio",
    logo: { light: "/logos/quanvio-light.svg", dark: "/logos/quanvio-dark.svg", alt: "Quanvio" },
    brandColor: "#ea580c",
    description: "Business operations & analytics platform documentation.",
    sections: [
      ...commonSections,
      { id: "agent-sdk", title: "Agent SDK", href: "/docs/{product}/agent-sdk", icon: Bot },
      { id: "cookbook", title: "Cookbook", href: "/docs/{product}/cookbook", icon: BookOpen },
    ],
  },
  qora: {
    id: "qora",
    name: "Qora",
    shortName: "Qora",
    logo: { light: "/logos/qora-light.svg", dark: "/logos/qora-dark.svg", alt: "Qora" },
    brandColor: "#333333",
    description: "Developer platform & API reference guides.",
    sections: commonSections,
  },
  qprint: {
    id: "qprint",
    name: "Qprint",
    shortName: "Qprint",
    logo: { light: "/logos/qprint-light.svg", dark: "/logos/qprint-dark.svg", alt: "Qprint" },
    brandColor: "#2563eb",
    description: "Print management & document automation docs.",
    sections: commonSections,
  },
  quanpos: {
    id: "quanpos",
    name: "Quanpos",
    shortName: "Quanpos",
    logo: { light: "/logos/quanpos-light.svg", dark: "/logos/quanpos-dark.svg", alt: "Quanpos" },
    brandColor: "#059669",
    description: "Point of sale & retail management docs.",
    sections: commonSections,
  },
  qorvia: {
    id: "qorvia",
    name: "Qorvia",
    shortName: "Qorvia",
    logo: { light: "/logos/qorvia.png", alt: "Qorvia" },
    brandColor: "#7c3aed",
    description: "Customer support & helpdesk platform docs.",
    sections: commonSections,
  },
  pegus: {
    id: "pegus",
    name: "Pegus",
    shortName: "Pegus",
    logo: { light: "/logos/pegus-light.svg", dark: "/logos/pegus-dark.svg", alt: "Pegus" },
    brandColor: "#dc2626",
    description: "Data storage & infrastructure documentation.",
    sections: commonSections,
  },
};

export const docsProductIds = Object.keys(docsProductsConfig) as DocsProductId[];

export function getDocsProductConfig(product: string): DocsProductConfig | null {
  return docsProductsConfig[product as DocsProductId] ?? null;
}

export function fillProductHref(href: string, product: DocsProductId): string {
  return href.replace(/{product}/g, product);
}
