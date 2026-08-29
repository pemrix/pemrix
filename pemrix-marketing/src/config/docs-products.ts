import type { LucideIcon } from "lucide-react";
import { BookOpen, Code2, Box, Bot, GraduationCap, Wallet, ShoppingCart, Users } from "lucide-react";

export type DocsProductId = "pemrix";

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

export const docsProductsConfig: Record<DocsProductId, DocsProductConfig> = {
  pemrix: {
    id: "pemrix",
    name: "PEMRIX",
    shortName: "PEMRIX",
    logo: { light: "/logos/pemrix-black.svg", dark: "/logos/pemrix-white.svg", alt: "PEMRIX" },
    brandColor: "#005fff",
    description: "The open network for value.",
    sections: [
      { id: "learn", title: "Learn", href: "/docs/pemrix/learn", icon: GraduationCap },
      { id: "use", title: "Use", href: "/docs/pemrix/use", icon: Wallet },
      { id: "developers", title: "Developers", href: "/docs/pemrix/developers", icon: Code2 },
      { id: "community", title: "Community", href: "/docs/pemrix/community", icon: Users },
      { id: "docs", title: "Docs", href: "/docs/pemrix", icon: BookOpen },
      { id: "client-sdks", title: "Client SDKs", href: "/docs/pemrix/developers/sdks", icon: Box },
      { id: "validators", title: "Validators", href: "/docs/pemrix/developers/validator", icon: Bot },
    ],
  },
};

export const docsProductIds: DocsProductId[] = ["pemrix"];
export const defaultProduct: DocsProductId = "pemrix";

export function isDocsProduct(value: string): value is DocsProductId {
  return docsProductIds.includes(value as DocsProductId);
}

export function getDocsProductConfig(product: DocsProductId): DocsProductConfig {
  return docsProductsConfig[product];
}

export function fillProductHref(href: string, product: DocsProductId): string {
  return href.replaceAll("{product}", product);
}
