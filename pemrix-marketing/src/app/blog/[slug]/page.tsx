import { ArrowLeftIcon as ArrowLeft } from "@phosphor-icons/react/ssr";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

import { blogMdxComponents, blogTag, formatBlogDate } from "@/components/blog/blog-mdx";
import { getBlogBySlug, getBlogSlugs } from "@/lib/blog";
import { cn } from "@/lib/utils";

export async function generateStaticParams() {
  return getBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogBySlug(slug);

  if (!post) {
    return { title: "Post not found" };
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      images: [{ url: post.coverImage, alt: post.title }],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogBySlug(slug);

  if (!post) {
    notFound();
  }

  const tag = blogTag(post.tags[0] ?? "Update");

  return (
    <section className="section-padding container max-w-5xl">
      <Link
        href="/blog"
        className="text-muted-foreground hover:text-foreground mb-12 inline-flex items-center gap-2 text-sm font-medium transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to blog
      </Link>

      <div className="flex gap-5 md:gap-12">
        <div className="relative mt-0.5 shrink-0 md:mt-1.5 md:w-[150px]">
          <time className="text-muted-foreground hidden font-mono text-sm md:inline-block">
            {formatBlogDate(post.date)}
          </time>
          <div className="bg-background border-input absolute top-0 right-0 z-10 grid size-5 translate-x-1/2 place-items-center rounded-full border">
            <div className="bg-secondary size-2 rounded-full" />
          </div>
        </div>

        <article className="min-w-0 flex-1">
          <time className="text-muted-foreground mb-6 inline-block font-mono text-sm md:hidden">
            {formatBlogDate(post.date)}
          </time>

          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", tag.className)}>{tag.label}</span>
          </div>

          <h1 className="text-4xxl leading-tight font-medium tracking-tight md:text-5xl">{post.title}</h1>

          <p className="text-muted-foreground mt-4 text-lg leading-snug">{post.description}</p>

          <div className="mt-8 flex items-center gap-3">
            <Image
              src={post.author.image}
              alt={post.author.name}
              width={40}
              height={40}
              className="size-10 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-medium">{post.author.name}</p>
              <p className="text-muted-foreground text-sm">Relay Team</p>
            </div>
          </div>

          <div className="relative mt-10 aspect-video overflow-hidden rounded-2xl">
            <Image src={post.coverImage} alt={post.title} fill priority className="object-cover" />
          </div>

          <div className="mt-8 space-y-4">
            <MDXRemote
              source={post.content}
              components={blogMdxComponents}
              options={{
                mdxOptions: { remarkPlugins: [remarkGfm] },
              }}
            />
          </div>
        </article>
      </div>
    </section>
  );
}
