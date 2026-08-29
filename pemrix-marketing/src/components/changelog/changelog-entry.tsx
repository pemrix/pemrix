import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

import { blogMdxComponents } from "@/components/blog/blog-mdx";
import type { ChangelogEntry } from "@/lib/changelog";
import { cn } from "@/lib/utils";

function releaseTag(title: string): { label: string; className: string } {
  if (/\bAI\b|flaky/i.test(title)) return { label: "AI", className: "bg-secondary/15 text-secondary" };
  if (/runner|cache|faster|performance|speed/i.test(title))
    return { label: "Performance", className: "bg-chart-2/15 text-chart-2" };
  if (/1\.0|launch|\bGA\b|introduc|preview environments/i.test(title))
    return { label: "Release", className: "bg-chart-3/20 text-chart-3" };
  return { label: "Update", className: "bg-muted text-muted-foreground" };
}

type ChangelogEntryItemProps = {
  entry: ChangelogEntry;
  showLatest?: boolean;
};

export function ChangelogEntryItem({ entry, showLatest = false }: ChangelogEntryItemProps) {
  const tag = releaseTag(entry.title);

  return (
    <div className="flex gap-5 md:gap-12">
      <div className="relative mt-0.5 shrink-0 md:mt-1.5 md:w-[var(--sidebar-width)]">
        <time className="text-muted-foreground hidden font-mono text-sm md:inline-block">{entry.date}</time>
        <div className="bg-background border-input absolute top-0 right-0 z-10 grid size-5 translate-x-1/2 place-items-center rounded-full border">
          <div className="bg-secondary size-2 rounded-full" />
        </div>
        <div className="absolute top-0 right-0 h-full w-0.25 bg-[repeating-linear-gradient(to_bottom,var(--input)_0px,var(--input)_8px,transparent_12px,transparent_20px)]" />
      </div>

      <div className="flex-1">
        <time className="text-muted-foreground mb-6 inline-block font-mono text-sm md:hidden">{entry.date}</time>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", tag.className)}>{tag.label}</span>
          {showLatest ? (
            <span className="border-secondary/40 text-secondary rounded-full border px-2.5 py-1 text-xs font-medium">
              Latest
            </span>
          ) : null}
        </div>

        <h2 className="text-2xl leading-tight font-medium tracking-tight">{entry.title}</h2>

        <div className="mt-4 space-y-4">
          <MDXRemote
            source={entry.content}
            components={blogMdxComponents}
            options={{
              mdxOptions: { remarkPlugins: [remarkGfm] },
            }}
          />
        </div>
      </div>
    </div>
  );
}
