import { BellIcon as Bell } from "@phosphor-icons/react/ssr";
import type { Metadata } from "next";

import { BlogTimeline } from "@/components/blog/blog-timeline";
import { Button } from "@/components/ui/button";
import { getAllBlogs } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Product updates, engineering notes, and company news from the Relay team.",
};

export default function BlogPage() {
  const posts = getAllBlogs();

  return (
    <section className="section-padding container max-w-5xl space-y-24">
      <div className="flex flex-wrap items-center justify-between gap-10">
        <div className="space-y-3">
          <span className="text-secondary text-sm font-medium">From the team</span>
          <h1 className="text-4xxl leading-tight font-medium tracking-tight">Blog</h1>
          <p className="text-muted-foreground text-lg leading-snug">
            Product launches, pipeline notes, and company updates.
          </p>
        </div>
        <Button variant="secondary" className="bg-muted/40 h-12 gap-2 rounded-full px-4 text-base font-normal">
          Subscribe for updates
          <Bell className="size-4 shrink-0" />
        </Button>
      </div>

      <BlogTimeline posts={posts} />
    </section>
  );
}
