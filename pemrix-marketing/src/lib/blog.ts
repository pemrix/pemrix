import fs from "fs";
import matter from "gray-matter";
import path from "path";

const BLOGS_PATH = path.join(process.cwd(), "content/blog");

export type BlogAuthor = {
  name: string;
  image: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: BlogAuthor;
  tags: string[];
  coverImage: string;
  content: string;
};

export function getBlogSlugs(): string[] {
  if (!fs.existsSync(BLOGS_PATH)) {
    return [];
  }

  return fs
    .readdirSync(BLOGS_PATH)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

export function getBlogBySlug(slug: string): BlogPost | null {
  const filePath = path.join(BLOGS_PATH, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    slug,
    title: data.title,
    description: data.description,
    date: data.date,
    author: data.author,
    tags: data.tags ?? [],
    coverImage: data.coverImage,
    content,
  };
}

export function getAllBlogs(limit?: number): BlogPost[] {
  const posts = getBlogSlugs()
    .map((slug) => getBlogBySlug(slug))
    .filter((post): post is BlogPost => post !== null)
    .sort((postA, postB) => new Date(postB.date).getTime() - new Date(postA.date).getTime());

  return limit ? posts.slice(0, limit) : posts;
}
