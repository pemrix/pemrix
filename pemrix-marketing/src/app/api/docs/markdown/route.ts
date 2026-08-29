import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  const slugParam = request.nextUrl.searchParams.get("slug");
  if (!slugParam) {
    return new NextResponse("Missing slug", { status: 400 });
  }

  const slugs = slugParam.split(",").filter(Boolean);
  const contentDir = path.resolve(/*turbopackIgnore: true*/ process.cwd(), "content", "docs");
  const basePath = path.join(contentDir, ...slugs);

  // Prevent directory traversal
  if (!basePath.startsWith(contentDir)) {
    return new NextResponse("Invalid slug", { status: 400 });
  }

  const candidates = [`${basePath}.mdx`, `${basePath}.md`, path.join(basePath, "index.mdx"), path.join(basePath, "index.md")];

  for (const filePath of candidates) {
    try {
      const content = await fs.readFile(filePath, "utf-8");
      return new NextResponse(content, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    } catch {
      // try next candidate
    }
  }

  return new NextResponse("Not found", { status: 404 });
}
