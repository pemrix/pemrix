export type ProductCategory = "product" | "platform" | "resource";
export type ProductStatus = "live" | "beta" | "new";

export interface PemrixProduct {
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

export const pemrixProducts: PemrixProduct[] = [
  {
    id: "pemrix",
    name: "PEMRIX",
    tagline: "Network",
    description: "The open blockchain network that settles value in seconds with community validators.",
    href: "https://pemrix.com",
    color: "#005fff",
    gradient: ["#005fff", "#00d4ff"],
    textColor: "#ffffff",
    category: "platform",
    status: "beta",
    logo: { light: "/logos/pemrix-black.svg", dark: "/logos/pemrix-white.svg" },
  },
  {
    id: "wallet",
    name: "PEMRIX Wallet",
    tagline: "Wallet",
    description: "Self-custody wallet for PRX, identity, and everyday payments.",
    href: "https://wallet.pemrix.com",
    color: "#00c6ff",
    gradient: ["#00c6ff", "#0072ff"],
    textColor: "#ffffff",
    category: "product",
    status: "beta",
  },
  {
    id: "pay",
    name: "PEMRIX Pay",
    tagline: "Pay",
    description: "QR-based checkout and instant merchant settlement on the PEMRIX network.",
    href: "https://pay.pemrix.com",
    color: "#7c3aed",
    gradient: ["#8b5cf6", "#6d28d9"],
    textColor: "#ffffff",
    category: "product",
    status: "beta",
  },
  {
    id: "merchant",
    name: "PEMRIX Merchant",
    tagline: "Merchant",
    description: "Invoicing, point-of-sale, and business dashboards for global commerce.",
    href: "https://merchant.pemrix.com",
    color: "#ec4899",
    gradient: ["#f472b6", "#db2777"],
    textColor: "#ffffff",
    category: "product",
    status: "beta",
  },
  {
    id: "exchange",
    name: "PEMRIX Exchange",
    tagline: "Exchange",
    description: "Trade, earn, and grow with PEMRIX-native markets and cross-chain liquidity.",
    href: "https://exchange.pemrix.com",
    color: "#10b981",
    gradient: ["#34d399", "#059669"],
    textColor: "#ffffff",
    category: "product",
    status: "beta",
  },
  {
    id: "developer",
    name: "PEMRIX Developer",
    tagline: "Developer",
    description: "Build the future on PEMRIX with SDKs, RPC APIs, and validator tooling.",
    href: "/docs/pemrix/developers",
    color: "#6366f1",
    gradient: ["#818cf8", "#4f46e5"],
    textColor: "#ffffff",
    category: "resource",
    status: "live",
  },
  {
    id: "ai",
    name: "PEMRIX AI",
    tagline: "AI",
    description: "Intelligent agents, autonomous payments, and on-chain reasoning for the agentic future.",
    href: "https://ai.pemrix.com",
    color: "#f59e0b",
    gradient: ["#fbbf24", "#d97706"],
    textColor: "#ffffff",
    category: "product",
    status: "new",
  },
  {
    id: "governance",
    name: "PEMRIX Governance",
    tagline: "Governance",
    description: "Shape the protocol. Vote on upgrades, treasury, and network parameters.",
    href: "https://governance.pemrix.com",
    color: "#14b8a6",
    gradient: ["#2dd4bf", "#0f766e"],
    textColor: "#ffffff",
    category: "product",
    status: "beta",
  },
  {
    id: "docs",
    name: "Docs",
    tagline: "Documentation",
    description: "Learn how PEMRIX works, run a validator, build apps, and use the API.",
    href: "/docs/pemrix",
    color: "#525252",
    gradient: ["#737373", "#404040"],
    textColor: "#ffffff",
    category: "resource",
    status: "live",
  },
];
