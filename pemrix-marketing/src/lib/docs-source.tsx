import { loader } from "fumadocs-core/source";

import {
  quanvioDocs,
  qoraDocs,
  qprintDocs,
  quanposDocs,
  qorviaDocs,
  pegusDocs,
} from "@/.source/server";
import { DocsSidebarIcon } from "@/components/docs/docs-icons";

export const docsProducts = [
  "quanvio",
  "qora",
  "qprint",
  "quanpos",
  "qorvia",
  "pegus",
] as const;

export type DocsProduct = (typeof docsProducts)[number];

const sourceMap = {
  quanvio: quanvioDocs,
  qora: qoraDocs,
  qprint: qprintDocs,
  quanpos: quanposDocs,
  qorvia: qorviaDocs,
  pegus: pegusDocs,
};

export function isDocsProduct(value: string): value is DocsProduct {
  return docsProducts.includes(value as DocsProduct);
}

export function getDocsSource(product: DocsProduct) {
  const source = sourceMap[product];
  if (!source) {
    throw new Error(`Unknown docs product: ${product}`);
  }

  return loader({
    baseUrl: `/docs/${product}`,
    source: source.toFumadocsSource(),
    icon: (icon) => (icon ? <DocsSidebarIcon icon={icon} /> : null),
  });
}
