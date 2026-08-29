"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { blogTag, formatBlogDate, getBlogExcerpt } from "@/components/blog/blog-mdx";
import { Button } from "@/components/ui/button";
import type { BlogPost } from "@/lib/blog";
import { cn } from "@/lib/utils";

const INITIAL_COUNT = 3;
const PAGE_SIZE = 3;

type BlogTimelineProps = {
  posts: BlogPost[];
};

export function BlogTimeline({ posts }: BlogTimelineProps) {
  const [visibleCount, setVisibleCount] = useState(Math.min(INITIAL_COUNT, posts.length));
  const visiblePosts = posts.slice(0, visibleCount);
  const hasMore = visibleCount < posts.length;

  return (
    <div className="[--sidebar-width:150px]">
      <div className="relative flex flex-col gap-16">
        {visiblePosts.map((post, index) => {
          const tag = blogTag(post.tags[0] ?? "Update");
          const excerpt = getBlogExcerpt(post.content);

          return (
            <div key={post.slug} className="flex gap-5 md:gap-12">
              <div className="relative mt-0.5 shrink-0 md:mt-1.5 md:w-[var(--sidebar-width)]">
                <time className="text-muted-foreground hidden font-mono text-sm md:inline-block">
                  {formatBlogDate(post.date)}
                </time>
                <div className="bg-background border-input absolute top-0 right-0 z-10 grid size-5 translate-x-1/2 place-items-center rounded-full border">
                  <div className="bg-secondary size-2 rounded-full" />
                </div>
                <div className="absolute top-0 right-0 h-full w-0.25 bg-[repeating-linear-gradient(to_bottom,var(--input)_0px,var(--input)_8px,transparent_12px,transparent_20px)]" />
              </div>

              <div className="flex-1">
                <time className="text-muted-foreground mb-6 inline-block font-mono text-sm md:hidden">
                  {formatBlogDate(post.date)}
                </time>

                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", tag.className)}>
                    {tag.label}
                  </span>
                  {index === 0 && (
                    <span className="border-secondary/40 text-secondary rounded-full border px-2.5 py-1 text-xs font-medium">
                      Latest
                    </span>
                  )}
                </div>

                <h2 className="text-2xl leading-tight font-medium tracking-tight">
                  <Link href={`/blog/${post.slug}`} className="hover:text-secondary transition-colors">
                    {post.title}
                  </Link>
                </h2>

                <Link href={`/blog/${post.slug}`} className="group mt-4 block overflow-hidden rounded-xl">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    width={1200}
                    height={675}
                    className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </Link>

                <p className="text-muted-foreground mt-4 line-clamp-3 text-base leading-snug md:text-lg">
                  {excerpt || post.description}
                </p>

                <Link
                  href={`/blog/${post.slug}`}
                  className="text-secondary mt-4 inline-flex text-sm font-medium hover:underline"
                >
                  Read more
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {hasMore ? (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            className="mt-25 h-12 w-full rounded-full md:w-[calc(100%-var(--sidebar-width))]"
            onClick={() => setVisibleCount((count) => Math.min(count + PAGE_SIZE, posts.length))}
          >
            Load more
          </Button>
        </div>
      ) : null}
    </div>
  );
}
