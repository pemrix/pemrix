import { Accordion, Accordions } from "fumadocs-ui/components/accordion";
import { Banner } from "fumadocs-ui/components/banner";
import { Callout } from "fumadocs-ui/components/callout";
import { File, Files, Folder } from "fumadocs-ui/components/files";
import { Step, Steps } from "fumadocs-ui/components/steps";
import {
  Tab as FumaTab,
  Tabs as FumaTabs,
} from "fumadocs-ui/components/tabs";
import { TypeTable } from "fumadocs-ui/components/type-table";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { Children, type ReactElement, type ReactNode, type TableHTMLAttributes, cloneElement, isValidElement } from "react";

import { CodeGroup } from "@/components/docs/code-group";
import { CollapsibleCodeBlock } from "@/components/docs/collapsible-code-block";
import { AccordionGroup, MintlifyAccordion } from "@/components/docs/mintlify-accordion";
import { MintlifyIcon } from "@/components/docs/mintlify-icon";
import { Template } from "@/components/docs/snippets/exports/Template";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Mintlify compatibility wrappers for OpenRouter docs content
function Note({ children, title }: { children?: ReactNode; title?: ReactNode }) {
  return <Callout type="info" title={title}>{children}</Callout>;
}

function Tip({ children, title }: { children?: ReactNode; title?: ReactNode }) {
  return <Callout type="success" title={title}>{children}</Callout>;
}

function Warning({ children, title }: { children?: ReactNode; title?: ReactNode }) {
  return <Callout type="warn" title={title}>{children}</Callout>;
}

function Info({ children, title }: { children?: ReactNode; title?: ReactNode }) {
  return <Callout type="info" title={title}>{children}</Callout>;
}

// Mintlify Frame wrapper for screenshots/media
function Frame({ children, caption }: { children?: ReactNode; caption?: ReactNode }) {
  return (
    <figure className="my-6 rounded-lg border bg-muted/30 p-2">
      <div className="overflow-hidden rounded-md">{children}</div>
      {caption && <figcaption className="mt-2 text-center text-sm text-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}

// Mintlify Markdown component includes external MDX snippets
function Markdown({ src }: { src?: string }) {
  return <div className="text-sm text-muted-foreground">[Included content: {src}]</div>;
}

// Mintlify CardGroup -> simple grid
function CardGroup({ children }: { children?: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

// Mintlify Expandable -> Fumadocs Accordion
function Expandable({ children, title }: { children?: ReactNode; title?: ReactNode }) {
  return (
    <Accordions type="single">
      <Accordion title={title ?? ''}>{children}</Accordion>
    </Accordions>
  );
}

// Mintlify Update -> changelog entry card
function Update({ children, label, tags }: { children?: ReactNode; label?: ReactNode; tags?: string[] }) {
  return (
    <div className="my-6 rounded-lg border p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="font-semibold">{label}</span>
        {tags?.map((tag) => (
          <Badge key={tag} variant="secondary">{tag}</Badge>
        ))}
      </div>
      <div>{children}</div>
    </div>
  );
}

// Mintlify Tabs/Tab API compatibility wrapper
function Tabs({ children }: { children?: ReactNode }) {
  const items: string[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement(child) && (child.props as { title?: string })?.title) {
      items.push((child.props as { title: string }).title);
    }
  });
  return (
    <FumaTabs items={items}>
      {Children.map(children, (child) => {
        if (!isValidElement(child)) return child;
        const props = child.props as { title?: string; children?: ReactNode };
        return <FumaTab value={props.title ?? ''}>{props.children}</FumaTab>;
      })}
    </FumaTabs>
  );
}

function Tab({ children, title }: { children?: ReactNode; title?: string }) {
  return <FumaTab value={title ?? ''}>{children}</FumaTab>;
}

// Wrap native tables so they scroll horizontally on narrow screens instead of stacking.
function Table({ children, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto">
      <table {...props}>{children}</table>
    </div>
  );
}

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    Accordion: MintlifyAccordion,
    Accordions,
    AccordionGroup,
    Banner,
    Callout,
    CodeGroup,
    Expandable,
    Files,
    File,
    Folder,
    Frame,
    Icon: MintlifyIcon,
    Info,
    Markdown,
    Note,
    Step,
    Steps,
    Tab,
    Tabs,
    table: Table,
    Template,
    Tip,
    TypeTable,
    Update,
    Warning,
    Badge,
    Card,
    CardContent,
    CardDescription,
    CardGroup,
    CardHeader,
    CardTitle,
    pre: ({ ref: _ref, ...props }) => {
      const { expandable, lines, ...rest } = props as {
        expandable?: boolean | string;
        lines?: number | string;
        [key: string]: unknown;
      };
      return (
        <CollapsibleCodeBlock expandable={expandable} lines={lines} {...rest}>
          {rest.children as ReactNode}
        </CollapsibleCodeBlock>
      );
    },
    ...components,
  } as MDXComponents;
}

export default getMDXComponents;
