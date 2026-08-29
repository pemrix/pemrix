import { ArrowRightIcon as ArrowRight } from "@phosphor-icons/react/ssr";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getAllBlogs } from "@/lib/blog";

export default function AboutNews() {
  const posts = getAllBlogs(4);

  return (
    <section className="section-padding bg-muted/40">
      <div className="container">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-4xxl leading-tight tracking-tight md:text-5xl">Blog</h2>
          <Link
            href="/blog"
            className="text-secondary inline-flex items-center gap-2 text-sm font-medium hover:underline"
          >
            View all posts
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {posts.map((post) => (
            <div key={post.slug} className="space-y-3">
              <Link href={`/blog/${post.slug}`} className="group block overflow-hidden rounded-xl">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  width={800}
                  height={450}
                  className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </Link>

              <p className="text-accent-foreground text-lg leading-snug">{post.description}</p>

              <Button
                variant="ghost"
                asChild
                className="group gap-3 !px-0 font-normal transition-opacity hover:!bg-transparent hover:opacity-95"
              >
                <Link href={`/blog/${post.slug}`}>
                  Read more
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
