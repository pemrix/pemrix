export type ProductCategory = "product" | "platform" | "resource";
export type ProductStatus = "live" | "beta" | "new";

export interface QuanvioProduct {
  id: string;
  name: string;
  tagline: string;
  description: string;
  href: string;
  color: string;
  gradient?: [string, string];
  textColor?: string;
  category: ProductCategory;
  status?: ProductStatus;
  logo?: {
    light: string;
    dark?: string;
  };
}

export const quanvioProducts: QuanvioProduct[] = [
  {
    id: "qora",
    name: "Qora",
    tagline: "AI Editor & Agent",
    description: "Native-fast AI editor and terminal agent for shipping code with frontier models.",
    href: "https://qora.quanvio.com",
    color: "#333333",
    gradient: ["#333333", "#525252"],
    textColor: "#ffffff",
    category: "product",
    status: "live",
    logo: { light: "/logos/qora-light.svg", dark: "/logos/qora-dark.svg" },
  },
  {
    id: "qprint",
    name: "Qprint",
    tagline: "Print Management",
    description: "Cloud print management for teams, queues, and secure release printing.",
    href: "https://qprint.quanvio.com",
    color: "#2563eb",
    gradient: ["#3b82f6", "#1d4ed8"],
    textColor: "#ffffff",
    category: "product",
    status: "live",
    logo: { light: "/logos/qprint-light.svg", dark: "/logos/qprint-dark.svg" },
  },
  {
    id: "quanpos",
    name: "Quanpos",
    tagline: "POS System",
    description: "Modern point-of-sale for retail and restaurants with real-time inventory.",
    href: "https://quanpos.quanvio.com",
    color: "#059669",
    gradient: ["#10b981", "#047857"],
    textColor: "#ffffff",
    category: "product",
    status: "live",
    logo: { light: "/logos/quanpos-light.svg", dark: "/logos/quanpos-dark.svg" },
  },
  {
    id: "qorvia",
    name: "Qorvia",
    tagline: "Support Platform",
    description: "Customer support, ticketing, and helpdesk built for scale.",
    href: "https://qorvia.quanvio.com",
    color: "#7c3aed",
    gradient: ["#8b5cf6", "#6d28d9"],
    textColor: "#ffffff",
    category: "product",
    status: "beta",
    logo: { light: "/logos/qorvia.png" },
  },
  {
    id: "pegus",
    name: "Pegus",
    tagline: "Database",
    description: "Managed database platform with backups, scaling, and observability.",
    href: "https://pegus.quanvio.com",
    color: "#dc2626",
    gradient: ["#ef4444", "#b91c1c"],
    textColor: "#ffffff",
    category: "product",
    status: "new",
    logo: { light: "/logos/pegus-light.svg", dark: "/logos/pegus-dark.svg" },
  },
  {
    id: "quanvio",
    name: "Quanvio",
    tagline: "Admin Console",
    description: "Central admin console for tenants, billing, licenses, and platform management.",
    href: "https://admin.quanvio.com",
    color: "#ea580c",
    gradient: ["#f97316", "#c2410c"],
    textColor: "#ffffff",
    category: "platform",
    status: "live",
  },
  {
    id: "docs",
    name: "Docs",
    tagline: "Documentation",
    description: "Product documentation, guides, and API references for all Quanvio products.",
    href: "https://docs.quanvio.com",
    color: "#0891b2",
    gradient: ["#06b6d4", "#0e7490"],
    textColor: "#ffffff",
    category: "resource",
    status: "live",
  },
  {
    id: "home",
    name: "Quanvio",
    tagline: "Home",
    description: "Quanvio home — explore the full product suite and company updates.",
    href: "https://quanvio.com",
    color: "#4b5563",
    gradient: ["#6b7280", "#374151"],
    textColor: "#ffffff",
    category: "resource",
    status: "live",
  },
];

export const productById = Object.fromEntries(
  quanvioProducts.map((p) => [p.id, p]),
);
