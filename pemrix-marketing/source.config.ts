import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import { rehypeCodeDefaultOptions } from "fumadocs-core/mdx-plugins";

// Match attributes in code-block meta strings: key, key="value", key='value', or key=123.
const AttributeRegex = new RegExp(
  "(^|\\s)([a-zA-Z0-9_-]+)(?:=(?:\"([^\"]*)\"|'([^']*)'|(\\d+)))?",
  "g"
);

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
      data[k] = v === null || v === "" ? true : v;
      continue;
    }
    data[k] = v;
  }
  data.__raw = parsed.rest;
  return data;
}

export const pemrixDocs = defineDocs({ dir: "content/docs" });

export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      ...rehypeCodeDefaultOptions,
      parseMetaString,
    },
  },
});
