import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import { rehypeCodeDefaultOptions } from "fumadocs-core/mdx-plugins";

const AttributeRegex = /(^|\s)([a-zA-Z0-9_-]+)(?:=(?:"([^"]*)"|'([^']*)'|(\d+)))?/g;

function parseCodeBlockAttributes(
  meta: string,
  allowedNames: string[]
): { rest: string; attributes: Record<string, string | number | null> } {
  const attributes: Record<string, string | number | null> = {};
  const rest = meta.replaceAll(AttributeRegex, (match, leadingSpace, name, v1, v2, v3) => {
    if (!allowedNames.includes(name)) return match;
    if (typeof v3 === "string") attributes[name] = Number(v3);
    else attributes[name] = v1 ?? v2 ?? null;
    return leadingSpace ?? "";
  });
  return { rest, attributes };
}

function parseMetaString(meta: string) {
  const parsed = parseCodeBlockAttributes(meta, [
    "title",
    "tab",
    "noCopy",
    "lineNumbers",
    "expandable",
    "lines",
  ]);

  const data: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(parsed.attributes)) {
    if (k === "noCopy") {
      data.allowCopy = "false";
      continue;
    }
    if (k === "lineNumbers") {
      data["data-line-numbers"] = true;
      if (typeof v === "number") data["data-line-numbers-start"] = v;
      continue;
    }
    if (k === "expandable" || k === "lines") {
      // Attributes written without a value (e.g. `expandable lines`) are parsed as `null`.
      // Treat their presence as `true` so collapsing is enabled.
      data[k] = v === null || v === "" ? true : v;
      continue;
    }
    data[k] = v;
  }
  data.__raw = parsed.rest;
  return data;
}

// One Fumadocs source per product so each product can grow independently.
export const quanvioDocs = defineDocs({ dir: "content/docs/products/quanvio" });
export const qoraDocs = defineDocs({ dir: "content/docs/products/qora" });
export const qprintDocs = defineDocs({ dir: "content/docs/products/qprint" });
export const quanposDocs = defineDocs({ dir: "content/docs/products/quanpos" });
export const qorviaDocs = defineDocs({ dir: "content/docs/products/qorvia" });
export const pegusDocs = defineDocs({ dir: "content/docs/products/pegus" });

// Backwards-compatible alias for any code still importing `docs`.
export const docs = quanvioDocs;

export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      ...rehypeCodeDefaultOptions,
      parseMetaString,
    },
  },
});
